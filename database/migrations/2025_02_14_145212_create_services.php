<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->decimal('price', 10, 2)->default(0.00);
            $table->decimal('labor_cost', 10, 2)->default(0.00);
            $table->decimal('discount', 10, 2)->default(0.00);
            $table->string('estimate_duration', 100);
            $table->string('remarks', 255)->nullable();
            $table->string('service_status')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->timestamp('created_at')->nullable();

            // Indexes
            $table->index('service_status');
            $table->index(['price', 'estimate_duration']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
