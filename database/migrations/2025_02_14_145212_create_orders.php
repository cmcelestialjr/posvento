<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->increments('id'); // Auto-incrementing primary key
            $table->integer('supplier_id');
            $table->string('description');
            $table->timestamp('order_date');
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('updated_by');
            $table->timestamps();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->index('supplier_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};

