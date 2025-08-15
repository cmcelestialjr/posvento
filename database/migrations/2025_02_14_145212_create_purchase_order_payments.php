<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('purchase_order_payments', function (Blueprint $table) {
            $table->bigIncrements('id');

            $table->unsignedInteger('purchase_order_id');
            $table->unsignedTinyInteger('payment_option_id');
            $table->string('payment_option_name', 255);

            $table->decimal('amount', 10, 2)->default(0.00);
            $table->timestamp('payment_date');

            $table->string('remarks', 255)->nullable();

            $table->unsignedBigInteger('updated_by');
            $table->unsignedBigInteger('created_by');

            $table->timestamps();

            // Indexes
            $table->index('payment_option_id');
            $table->index('purchase_order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_order_payments');
    }
};



