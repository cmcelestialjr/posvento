<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->increments('id');
            $table->string('code', 50);
            $table->unsignedInteger('supplier_id');

            $table->timestamp('date_time_ordered');
            $table->timestamp('date_time_received')->nullable();

            $table->unsignedTinyInteger('status_id');
            $table->unsignedTinyInteger('payment_status_id');

            $table->string('remarks', 255)->nullable();
            $table->text('src');

            $table->unsignedBigInteger('updated_by');
            $table->unsignedBigInteger('created_by');

            $table->timestamps();

            // Indexes
            $table->index('supplier_id');
            $table->index('code');
            $table->index('status_id');
            $table->index('date_time_ordered');
            $table->index('date_time_received');
            $table->index('payment_status_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};