<?php
namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class SaleServices
{
    public function users()
    {
        User::firstOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'Admin',
                'password' => Hash::make('adm1n@CDEV'),
                'user_role_id' => 1
            ]
        );

        User::firstOrCreate(
            ['username' => 'cashier'],
            [
                'name' => 'Cashier',
                'password' => Hash::make('cashier@CDEV'),
                'user_role_id' => 1
            ]
        );
    }
}