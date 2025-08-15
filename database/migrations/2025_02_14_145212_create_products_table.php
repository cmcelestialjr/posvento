<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->increments('id');
            $table->string('code', 100)->unique();
            $table->string('name', 255);
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->integer('conversion_quantity')->nullable();
            $table->string('variant', 100)->nullable();
            $table->string('name_variant', 255);
            $table->tinyInteger('unit_id')->nullable();
            $table->decimal('cost', 10, 2)->default(0.00);
            $table->decimal('price', 10, 2)->default(0.00);
            $table->decimal('qty', 10, 2)->default(0.00);
            $table->date('restock_date')->nullable();

            $table->string('product_status', 20)->nullable();
            $table->integer('product_category_id')->nullable();
            $table->string('track', 1)->nullable();

            $table->string('img', 300)->nullable();
            $table->unsignedBigInteger('updated_by');
            $table->unsignedBigInteger('created_by');
            $table->timestamps();

            // Indexes
            $table->index('unit_id');
            $table->index('qty');
            $table->index('restock_date');
            $table->index('product_category_id');
            $table->index('product_status');
            $table->index('track');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
