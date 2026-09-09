<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAppointmentRequest extends FormRequest
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
            'request_id' => ['nullable', 'exists:counseling_requests,id'],
            'student_id' => ['sometimes', 'exists:users,id'],
            'scheduled_at' => ['sometimes', 'date'],
            'duration_minutes' => ['sometimes', 'integer', 'min:15', 'max:240'],
            'status' => ['sometimes', 'in:pending,confirmed,completed,cancelled'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}