<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed the application's users.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@mindwell.test'],
            [
                'name' => 'MindWell Admin',
                'password' => Hash::make('password'),
                'role' => User::ROLE_ADMIN,
                'phone' => '123-555-0100',
                'avatar' => null,
                'is_active' => true,
            ]
        );

        $counselors = [
            [
                'name' => 'Dr. Sarah Johnson',
                'email' => 'sarah.johnson@mindwell.test',
                'phone' => '123-555-0101',
            ],
            [
                'name' => 'Dr. Michael Chen',
                'email' => 'michael.chen@mindwell.test',
                'phone' => '123-555-0102',
            ],
            [
                'name' => 'Dr. Emily Rodriguez',
                'email' => 'emily.rodriguez@mindwell.test',
                'phone' => '123-555-0103',
            ],
        ];

        foreach ($counselors as $counselor) {
            User::updateOrCreate(
                ['email' => $counselor['email']],
                [
                    'name' => $counselor['name'],
                    'password' => Hash::make('password'),
                    'role' => User::ROLE_COUNSELOR,
                    'phone' => $counselor['phone'],
                    'avatar' => null,
                    'is_active' => true,
                ]
            );
        }

        $students = [
            [
                'name' => 'Alex Martinez',
                'email' => 'alex.martinez@mindwell.test',
                'phone' => '123-555-0201',
            ],
            [
                'name' => 'Jamie Lee',
                'email' => 'jamie.lee@mindwell.test',
                'phone' => '123-555-0202',
            ],
            [
                'name' => 'Taylor Brooks',
                'email' => 'taylor.brooks@mindwell.test',
                'phone' => '123-555-0203',
            ],
            [
                'name' => 'Jordan Smith',
                'email' => 'jordan.smith@mindwell.test',
                'phone' => '123-555-0204',
            ],
            [
                'name' => 'Morgan Davis',
                'email' => 'morgan.davis@mindwell.test',
                'phone' => '123-555-0205',
            ],
        ];

        foreach ($students as $student) {
            User::updateOrCreate(
                ['email' => $student['email']],
                [
                    'name' => $student['name'],
                    'password' => Hash::make('password'),
                    'role' => User::ROLE_STUDENT,
                    'phone' => $student['phone'],
                    'avatar' => null,
                    'is_active' => true,
                ]
            );
        }
    }
}