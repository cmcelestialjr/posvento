<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('service_transactions', function (Blueprint $table) {
            $table->id();

            $table->string('code', 50)->default('0')->unique();

            $table->unsignedBigInteger('service_id');
            $table->string('service_name', 100)->default('');

            $table->unsignedBigInteger('customer_id');
            $table->string('customer_name', 100)->default('');

            $table->unsignedTinyInteger('service_status_id');
            $table->unsignedTinyInteger('payment_status_id');

            $table->decimal('price', 10, 2)->default(0.00);
            $table->decimal('discount', 10, 2)->default(0.00);
            $table->decimal('amount', 10, 2)->default(0.00);
            $table->decimal('product_cost', 10, 2)->default(0.00);
            $table->decimal('labor_cost', 10, 2)->default(0.00);
            $table->decimal('total_cost', 10, 2)->default(0.00);
            $table->decimal('income', 10, 2)->default(0.00);
            $table->decimal('paid', 10, 2)->default(0.00);
            $table->decimal('remaining', 10, 2)->default(0.00);

            $table->date('date_started')->nullable();
            $table->date('date_finished')->nullable();
            $table->date('day_out')->nullable();

            $table->string('remarks', 255)->nullable();

            $table->unsignedBigInteger('updated_by');
            $table->unsignedBigInteger('created_by');

            $table->timestamps();

            // Indexes
            $table->index('service_id');
            $table->index('customer_id');
            $table->index('payment_status_id');
            $table->index('service_status_id');
            $table->index('date_started');
            $table->index('date_finished');
            $table->index('day_out');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_transactions');
    }
};