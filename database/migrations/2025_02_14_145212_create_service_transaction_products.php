<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('service_transaction_products', function (Blueprint $table) {
            $table->id(); // bigint AUTO_INCREMENT

            $table->unsignedBigInteger('service_transaction_id');
            $table->unsignedInteger('product_id');

            $table->decimal('qty', 10, 2)->default(0.00);
            $table->decimal('cost', 10, 2)->default(0.00);
            $table->decimal('total', 10, 2)->default(0.00);
            $table->decimal('qty_returned', 10, 2)->default(0.00);

            $table->unsignedBigInteger('updated_by');
            $table->unsignedBigInteger('created_by');

            $table->timestamps();

            // Indexes
            $table->index('service_transaction_id');
            $table->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_transaction_products');
    }
};