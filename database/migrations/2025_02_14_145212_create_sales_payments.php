<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sales_payments', function (Blueprint $table) {
            $table->increments('id');

            $table->unsignedBigInteger('sale_id');
            $table->unsignedTinyInteger('payment_option_id')->nullable();
            $table->string('payment_option_name', 50)->nullable();

            $table->decimal('amount', 10, 2)->default(0.00);
            $table->decimal('amount_paid', 10, 2)->default(0.00);
            $table->decimal('amount_change', 10, 2)->default(0.00);
            $table->decimal('total_amount', 10, 2)->default(0.00);

            $table->string('payment_status', 10)->nullable();

            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();

            $table->timestamps();

            // Indexes
            $table->index('payment_option_id');
            $table->index('sale_id');
            $table->index('payment_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_payments');
    }
};