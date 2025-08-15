<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('supplier_contacts', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('supplier_id');
            $table->string('contact_no', 50);

            $table->unsignedBigInteger('updated_by');
            $table->unsignedBigInteger('created_by');

            $table->timestamps();

            // Index
            $table->index('supplier_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supplier_contacts');
    }
};
