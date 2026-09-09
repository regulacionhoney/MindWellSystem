<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCounselingRecordRequest extends FormRequest
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
            'appointment_id' => ['required', 'exists:appointments,id'],
            'student_id' => ['required', 'exists:users,id'],
            'session_notes' => ['required', 'string'],
            'follow_up_notes' => ['nullable', 'string'],
            'follow_up_date' => ['nullable', 'date'],
            'is_confidential' => ['sometimes', 'boolean'],
        ];
    }
}