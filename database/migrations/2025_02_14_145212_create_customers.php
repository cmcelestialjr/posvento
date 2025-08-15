<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->tinyInteger('customer_type_id');
            $table->string('name', 255);
            $table->string('lastname', 100)->nullable();
            $table->string('firstname', 100)->nullable();
            $table->string('middlename', 100)->nullable();
            $table->string('extname', 20)->nullable();
            $table->string('contact_no', 20)->nullable();
            $table->string('email', 50)->nullable();
            $table->string('address', 255)->nullable();
            $table->bigInteger('updated_by');
            $table->bigInteger('created_by');
            $table->timestamps();
            $table->index('customer_type_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};

