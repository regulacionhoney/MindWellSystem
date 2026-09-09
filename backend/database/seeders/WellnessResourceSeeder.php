<?php

namespace Database\Seeders;

use App\Models\WellnessResource;
use Illuminate\Database\Seeder;

class WellnessResourceSeeder extends Seeder
{
    /**
     * Seed sample wellness resources across all four categories.
     */
    public function run(): void
    {
        $resources = [
            // Stress management
            [
                'title' => 'Understanding and Managing Exam Stress',
                'content' => 'Exam stress is a natural reaction to pressure, but it can be managed. Start by breaking your revision into small, achievable chunks and taking regular breaks. Practice deep breathing exercises - inhale for four counts, hold for four, and exhale for six. Stay hydrated and get at least seven hours of sleep before the big day. If stress feels overwhelming, remember that asking for help is a sign of strength, not weakness.',
                'category' => 'stress',
                'author' => 'Dr. Sarah Johnson',
                'is_published' => true,
                'image_url' => null,
            ],
            [
                'title' => 'The 4-7-8 Breathing Technique for Instant Calm',
                'content' => 'The 4-7-8 breathing technique is a simple exercise that can help you calm your nervous system. Place the tip of your tongue against the ridge of tissue just behind your upper front teeth. Empty your lungs completely, then breathe in quietly through your nose for a count of four. Hold your breath for a count of seven. Exhale completely through your mouth, making a whoosh sound, for a count of eight. Repeat this cycle three to four times.',
                'category' => 'stress',
                'author' => 'MindWell Wellness Team',
                'is_published' => true,
                'image_url' => null,
            ],
            [
                'title' => 'Recognizing the Signs of Chronic Stress',
                'content' => 'Chronic stress can manifest in subtle ways: trouble sleeping, changes in appetite, irritability, fatigue, and difficulty concentrating. If you notice these signs persisting for several weeks, it may be time to take action. Consider talking to a counselor, adjusting your daily routine, and prioritizing restorative activities. You are not alone - many students experience these challenges.',
                'category' => 'stress',
                'author' => 'Dr. Michael Chen',
                'is_published' => true,
                'image_url' => null,
            ],

            // Self-care
            [
                'title' => 'Building a Sustainable Self-Care Routine',
                'content' => 'Self-care is not selfish; it is essential. A sustainable routine includes physical care (sleep, nutrition, movement), emotional care (journaling, talking to friends), and mental care (setting boundaries, limiting screen time). Start small - pick one habit and practice it daily for two weeks before adding another. Track how you feel and adjust as needed.',
                'category' => 'self-care',
                'author' => 'Dr. Emily Rodriguez',
                'is_published' => true,
                'image_url' => null,
            ],
            [
                'title' => 'Morning Journaling Prompts for a Positive Day',
                'content' => 'Journaling is a powerful self-care practice. Each morning, try answering: What am I grateful for today? What is one thing I can control today? What kind of person do I want to be today? Three sentences are enough. Over time, this practice rewires your brain to notice the positive and reduces anxiety about the uncontrollable.',
                'category' => 'self-care',
                'author' => 'MindWell Wellness Team',
                'is_published' => true,
                'image_url' => null,
            ],
            [
                'title' => 'The Power of Saying No: Setting Healthy Boundaries',
                'content' => 'Boundaries protect your energy and time. Learn to say no without guilt: "I am not available right now," or "I need to prioritize my studies today." Notice where you feel drained and set a boundary there. Respecting your own limits is a form of self-respect, and it teaches others how to treat you.',
                'category' => 'self-care',
                'author' => 'Dr. Sarah Johnson',
                'is_published' => true,
                'image_url' => null,
            ],

            // Study-life balance
            [
                'title' => 'Finding Balance Between Studies and Life',
                'content' => 'Balance does not mean dividing your time equally; it means investing time in what matters most to you. Use time-blocking to schedule both study and rest. Aim for a consistent sleep schedule, schedule breaks like you schedule classes, and protect at least one hour a day for activities you genuinely enjoy. Balance is a practice, not a destination.',
                'category' => 'balance',
                'author' => 'Dr. Michael Chen',
                'is_published' => true,
                'image_url' => null,
            ],
            [
                'title' => 'Time Blocking: A Simple Method to Own Your Day',
                'content' => 'Time blocking turns your to-do list into a schedule. Divide your day into focused blocks: 50 minutes of deep work, 10 minutes of rest. Group similar tasks together - answering emails, reading, writing. Leave buffer blocks for unexpected tasks. At the end of the day, review what worked and adjust tomorrow. This reduces decision fatigue and procrastination.',
                'category' => 'balance',
                'author' => 'MindWell Wellness Team',
                'is_published' => true,
                'image_url' => null,
            ],
            [
                'title' => 'Digital Detox: Reclaiming Your Attention',
                'content' => 'Constant notifications fragment your attention and raise your stress baseline. Try a weekly digital detox: two to four hours without screens. Replace scrolling with walking, cooking, or calling a friend. Set app limits and turn off non-essential notifications. Your brain needs uninterrupted time to rest and process.',
                'category' => 'balance',
                'author' => 'Dr. Emily Rodriguez',
                'is_published' => true,
                'image_url' => null,
            ],

            // Seeking support
            [
                'title' => 'What to Expect in Counseling Sessions',
                'content' => 'Your first counseling session is a chance to share your story in a confidential, judgment-free space. The counselor will ask about what brought you in, your goals, and your history. You can ask questions too - it is your session. Sessions typically last 50-60 minutes, and you control how much you share. Building trust takes time; be patient with yourself.',
                'category' => 'support',
                'author' => 'Dr. Sarah Johnson',
                'is_published' => true,
                'image_url' => null,
            ],
            [
                'title' => 'How to Ask for Help When You Need It',
                'content' => 'Asking for help is a skill. Start by naming what you need: "I am having a hard time and could use an ear," or "I need help finding a counselor." Reach out to someone you trust, whether a friend, family member, or professional. Remember that counselors are trained to listen without judgment, and seeking support early makes challenges easier to navigate.',
                'category' => 'support',
                'author' => 'MindWell Wellness Team',
                'is_published' => true,
                'image_url' => null,
            ],
            [
                'title' => 'Supporting a Friend Who Is Struggling',
                'content' => 'If a friend is struggling, show up with empathy and patience. Listen without trying to fix everything, validate their feelings, and gently encourage professional help when appropriate. Ask directly, "Are you okay?" - it opens the door. Take care of your own well-being too; supporting others is easier when you are supported.',
                'category' => 'support',
                'author' => 'Dr. Michael Chen',
                'is_published' => true,
                'image_url' => null,
            ],
        ];

        foreach ($resources as $resource) {
            WellnessResource::updateOrCreate(
                ['title' => $resource['title']],
                $resource
            );
        }
    }
}