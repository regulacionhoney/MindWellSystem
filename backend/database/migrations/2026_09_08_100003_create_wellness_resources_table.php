<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('wellness_resources', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->longText('content');
            $table->enum('category', ['stress', 'self-care', 'balance', 'support'])->default('self-care');
            $table->string('author')->nullable();
            $table->boolean('is_published')->default(true);
            $table->string('image_url')->nullable();
            $table->timestamps();

            $table->index(['category', 'is_published']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wellness_resources');
    }
};