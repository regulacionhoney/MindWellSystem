<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class OAuthController extends Controller
{
    private const SUPPORTED_PROVIDERS = ['google'];

    /**
     * Redirect the user to the given OAuth provider.
     *
     * @param  string  $provider
     */
    public function redirect(Request $request, string $provider): RedirectResponse
    {
        $this->assertSupported($provider);

        $frontendUrl = rtrim((string) config('app.oauth_frontend_url', 'http://localhost:5173'), '/');

        if (! config("services.$provider.client_id")) {
            return redirect($frontendUrl.'/oauth-callback?error=not_configured&provider='.$provider);
        }

        return Socialite::driver($provider)->stateless()->with(['prompt' => 'select_account'])->redirect();
    }

    /**
     * Handle the provider callback, find or create a user, and send the
     * session back to the SPA via an OAuth callback URL.
     *
     * @param  string  $provider
     */
    public function callback(Request $request, string $provider): RedirectResponse
    {
        $frontendUrl = rtrim((string) config('app.oauth_frontend_url', 'http://localhost:5173'), '/');

        try {
            $this->assertSupported($provider);
            $socialUser = Socialite::driver($provider)->stateless()->user();
        } catch (Throwable $e) {
            return redirect($frontendUrl.'/oauth-callback?error=1');
        }

        if (! $socialUser->getEmail() || ! $socialUser->getName()) {
            return redirect($frontendUrl.'/oauth-callback?error=1');
        }

        $user = User::firstOrCreate(
            ['email' => $socialUser->getEmail()],
            [
                'name' => $socialUser->getName(),
                'password' => Hash::make(Str::random(40)),
                'role' => User::ROLE_STUDENT,
                'avatar' => $socialUser->getAvatar(),
                'is_active' => true,
            ],
        );

        if (! $user->is_active) {
            return redirect($frontendUrl.'/oauth-callback?error=deactivated');
        }

        return redirect(
            $frontendUrl.'/oauth-callback?token='.urlencode($user->createToken('social_token')->plainTextToken).
            '&user='.urlencode($user->toJson()),
        );
    }

    private function assertSupported(string $provider): void
    {
        abort_unless(in_array($provider, self::SUPPORTED_PROVIDERS, true), 404);
    }
}