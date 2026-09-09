<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CounselingRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointment_id',
        'counselor_id',
        'student_id',
        'session_notes',
        'follow_up_notes',
        'follow_up_date',
        'is_confidential',
    ];

    protected function casts(): array
    {
        return [
            'follow_up_date' => 'date',
            'is_confidential' => 'boolean',
        ];
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function counselor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'counselor_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}