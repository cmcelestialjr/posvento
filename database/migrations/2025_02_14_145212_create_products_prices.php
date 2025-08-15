<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('products_prices', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('product_id');
            $table->unsignedInteger('supplier_id')->nullable();

            $table->decimal('cost', 10, 2)->default(0.00);
            $table->decimal('price', 10, 2)->default(0.00);
            $table->decimal('qty', 10, 2)->default(0.00);
            $table->decimal('discount', 10, 2)->default(0.00);
            $table->decimal('discount_percentage', 10, 2)->default(0.00);

            $table->date('effective_date');
            $table->date('restock_date')->nullable();

            $table->unsignedBigInteger('updated_by');
            $table->unsignedBigInteger('created_by');

            $table->timestamps();

            // Indexes
            $table->index('product_id');
            $table->index('supplier_id');
            $table->index('price');
            $table->index('effective_date');
            $table->index('qty');
            $table->index('restock_date');
        });
    }

    public function down()
    {
        Schema::dropIfExists('products_prices');
    }
};

