<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id(); 

            $table->string('name', 255)->unique();
            $table->string('company_name', 255)->nullable();
            $table->string('address', 255)->nullable();
            $table->string('contact_person', 255)->nullable();
            $table->string('contact_no', 50)->nullable();
            $table->string('email_address', 50)->nullable();

            $table->string('supplier_status', 20)->nullable();

            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();

            $table->timestamp('updated_at')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index('supplier_status', 'supplier_status_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};
