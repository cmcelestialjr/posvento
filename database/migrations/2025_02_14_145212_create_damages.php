<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('damages', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('return_product_id')->nullable();
            $table->unsignedInteger('product_id');
            $table->unsignedTinyInteger('status_id');
            $table->decimal('price', 10, 2);
            $table->decimal('cost', 10, 2);
            $table->decimal('qty', 10, 2);
            $table->decimal('amount', 10, 2);
            $table->string('remarks', 255)->nullable();
            $table->unsignedBigInteger('updated_by');
            $table->unsignedBigInteger('created_by');
            $table->timestamps();

            // Indexes
            $table->index('product_id');
            $table->index('updated_by');
            $table->index('created_by');
            $table->index('status_id');
            $table->index('return_product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('damages');
    }
};


