<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWellnessResourceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->isCounselor() || $this->user()->isAdmin();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'content' => ['sometimes', 'string'],
            'category' => ['sometimes', 'in:stress,self-care,balance,support'],
            'author' => ['nullable', 'string', 'max:255'],
            'is_published' => ['sometimes', 'boolean'],
            'image_url' => ['nullable', 'string', 'max:255'],
        ];
    }
}