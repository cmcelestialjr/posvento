<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();

            $table->unsignedInteger('category_id');
            $table->unsignedInteger('sub_category_id')->nullable();
            $table->string('code', 50);
            $table->string('expense_name', 100)->nullable();
            $table->unsignedInteger('product_id')->nullable();
            $table->string('tin', 100)->nullable();
            $table->string('or', 100)->nullable();

            $table->decimal('amount', 10, 2)->default(0.00);
            $table->decimal('qty', 10, 2)->default(0.00);
            $table->decimal('cost', 10, 2)->default(0.00);

            $table->timestamp('date_time_of_expense');

            $table->unsignedBigInteger('updated_by');
            $table->unsignedBigInteger('created_by');

            $table->timestamps();

            // Indexes
            $table->index('date_time_of_expense');
            $table->index('code');
            $table->index('amount');
            $table->index('expense_name');
            $table->index('category_id');
            $table->index('sub_category_id');
            $table->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};


