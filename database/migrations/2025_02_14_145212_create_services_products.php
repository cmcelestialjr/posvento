<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('services_products', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('service_id');
            $table->unsignedBigInteger('product_id');
            $table->decimal('qty', 10, 2);
            $table->unsignedBigInteger('updated_by');
            $table->unsignedBigInteger('created_by');
            $table->timestamps();

            // Indexes
            $table->index('service_id');
            $table->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services_products');
    }
};
