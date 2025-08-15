<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('damage_statuses', function (Blueprint $table) {
            $table->tinyIncrements('id');
            $table->string('name', 50);
            $table->string('color', 50);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('damage_statuses');
    }
};


