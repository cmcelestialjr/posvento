<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('returns_sales_products', function (Blueprint $table) {
            $table->increments('id');

            $table->unsignedInteger('return_id');
            $table->unsignedInteger('sales_products_id');

            $table->decimal('qty', 10, 2)->default(0.00);
            $table->decimal('cost', 10, 2)->default(0.00);
            $table->decimal('price', 10, 2)->default(0.00);
            $table->decimal('amount', 10, 2)->default(0.00);

            $table->unsignedBigInteger('updated_by');
            $table->unsignedBigInteger('created_by');

            $table->timestamps();

            // Indexes
            $table->index('return_id');
            $table->index('sales_products_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('returns_sales_products');
    }
};