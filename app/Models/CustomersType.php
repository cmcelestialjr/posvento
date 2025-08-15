<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CustomersType extends Model
{
    use HasFactory;

    protected $table = 'customers_type';

    protected $fillable = [
        'name'
    ];

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class, 'customer_type_id', 'id');
    }
}