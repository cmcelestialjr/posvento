<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('returns', function (Blueprint $table) {
            $table->increments('id');

            $table->string('code', 100);
            $table->unsignedInteger('sales_id');
            $table->string('sales_code', 50);

            $table->unsignedInteger('sales_of_return_id')->nullable();
            $table->string('sales_of_return_code', 50)->nullable();

            $table->unsignedTinyInteger('return_option_id')->nullable();
            $table->decimal('refund_amount', 10, 2)->default(0.00);
            $table->decimal('total_amount', 10, 2)->default(0.00);

            $table->string('remarks', 255)->nullable();
            $table->timestamp('date_time_returned')->nullable();

            $table->unsignedBigInteger('cashier_id')->nullable();
            $table->string('cashier_name', 200)->nullable();

            $table->unsignedTinyInteger('return_type_id')->nullable();

            $table->unsignedBigInteger('updated_by');
            $table->unsignedBigInteger('created_by');

            $table->timestamps();

            // Indexes
            $table->index('sales_id');
            $table->index('date_time_returned');
            $table->index(['sales_code', 'refund_amount']);
            $table->index('return_option_id');
            $table->index('sales_of_return_id');
            $table->index('sales_of_return_code');
            $table->index('cashier_id');
            $table->index('code');
            $table->index('total_amount');
            $table->index('return_type_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('returns');
    }
};