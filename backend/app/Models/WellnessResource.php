<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WellnessResource extends Model
{
    use HasFactory;

    public const CATEGORY_STRESS = 'stress';
    public const CATEGORY_SELF_CARE = 'self-care';
    public const CATEGORY_BALANCE = 'balance';
    public const CATEGORY_SUPPORT = 'support';

    protected $fillable = [
        'title',
        'content',
        'category',
        'author',
        'is_published',
        'image_url',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
        ];
    }
}