<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sales_products', function (Blueprint $table) {
            $table->increments('id');

            $table->unsignedInteger('sale_id');
            $table->string('sale_code', 50);
            $table->unsignedInteger('product_id');

            $table->decimal('total_cost', 10, 2)->default(0.00);
            $table->decimal('cost', 10, 2)->default(0.00);
            $table->decimal('price', 10, 2)->default(0.00);
            $table->decimal('discount_amount', 10, 2)->default(0.00);
            $table->decimal('discount_percentage', 10, 2)->default(0.00);
            $table->decimal('qty', 10, 2)->default(0.00);
            $table->decimal('amount', 10, 2)->default(0.00);
            // $table->decimal('parent_qty', 10, 2)->nullable();
            $table->unsignedTinyInteger('update_qty')->default(0);

            $table->unsignedBigInteger('updated_by');
            $table->unsignedBigInteger('created_by');

            $table->timestamps();

            // Indexes
            $table->index('sale_id');
            $table->index('sale_code');
            $table->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_products');
    }
};