<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('purchase_order_products', function (Blueprint $table) {
            $table->increments('id');

            $table->unsignedInteger('purchase_order_id');
            $table->unsignedInteger('product_id');

            $table->decimal('cost', 10, 2);
            $table->decimal('qty', 10, 2);
            $table->decimal('total', 10, 2);

            $table->decimal('cost_received', 10, 2)->nullable();
            $table->decimal('qty_received', 10, 2)->nullable();
            $table->decimal('total_received', 10, 2)->nullable();

            $table->unsignedTinyInteger('status_id');

            $table->unsignedBigInteger('updated_by');
            $table->unsignedBigInteger('created_by');

            $table->timestamps();

            // Indexes
            $table->index('purchase_order_id');
            $table->index('product_id');
            $table->index('status_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_order_products');
    }
};



