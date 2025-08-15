<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->bigIncrements('id');

            $table->unsignedBigInteger('customer_id');
            $table->string('customer_name', 255);
            $table->string('code', 50)->unique();

            $table->decimal('total_cost', 10, 2)->default(0.00);
            $table->decimal('total_price', 10, 2)->default(0.00);
            $table->decimal('total_discount', 10, 2)->default(0.00);
            $table->decimal('total_qty', 10, 2)->default(0.00);
            $table->decimal('total_amount', 10, 2)->default(0.00);
            $table->decimal('amount_paid', 10, 2)->default(0.00);
            $table->decimal('amount_change', 10, 2)->default(0.00);

            $table->unsignedBigInteger('cashier_id');
            $table->string('cashier_name', 255);

            $table->unsignedTinyInteger('sales_status_id');

            $table->unsignedBigInteger('updated_by');
            $table->unsignedBigInteger('created_by');

            $table->timestamp('date_time_of_sale');
            $table->timestamps();

            // Indexes
            $table->index('created_by');
            $table->index('cashier_id');
            $table->index('date_time_of_sale');
            $table->index('customer_id');
            $table->index(['customer_name', 'cashier_name']);
            $table->index('amount_paid');
            $table->index('total_amount');
            $table->index('total_cost');
            $table->index('sales_status_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};