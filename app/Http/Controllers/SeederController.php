<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\CustomersType;
use App\Models\DamageStatus;
use App\Models\PaymentOption;
use App\Models\PaymentStatus;
use App\Models\PurchaseOrderStatus;
use App\Models\ReturnsOption;
use App\Models\ReturnsType;
use App\Models\SalesStatus;
use App\Models\ServicesStatus;
use App\Models\User;
use App\Models\UsersRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class SeederController extends Controller
{
    public function index()
    {
        $statuses = [
            'Users' => $this->users(),
            'Customer' => $this->customer(),
            'Types of Customer' => $this->customerType(),
            'Damage Statuses' => $this->damageStatuses(),
            'Payment Options' => $this->paymentOptions(),
            'Payment Statuses' => $this->paymentStatuses(),
            'Purchase Order Statuses' => $this->purchaseOrderStatuses(),
            'Return Options' => $this->returnOptions(),
            'Return Types' => $this->returnTypes(),
            'Sale Statuses' => $this->saleStatuses(),
            'Service Statuses' => $this->serviceStatuses(),
            'User Roles' => $this->userRoles(),
        ];

        $x = 0;
        $failedMessages = [];

        foreach ($statuses as $name => $result) {
            if ($result === 'failed') {
                $x++;
                $failedMessages[] = "-$name-";
            }
        }

        $result = $x === 0 ? 'success' : 'failed';
        $message = $x === 0 ? 'All entities were created successfully.' : 'Failed to Create ' . implode(' ', $failedMessages);

        return response()->json([
            'result' => $result,
            'message' => $message
        ]);
    }

    private function users()
    {
        $admin = $this->safeFirstOrCreate(User::class, ['username' => 'admin'], [
            'name' => 'Admin',
            'password' => Hash::make('adm1n@CDEV'),
            'user_role_id' => 1
        ]);

        $cashier = $this->safeFirstOrCreate(User::class, ['username' => 'cashier'], [
            'name' => 'Cashier',
            'password' => Hash::make('cashier@CDEV'),
            'user_role_id' => 2
        ]);

        return ($admin === 'success' && $cashier === 'success') ? 'success' : 'failed';
    }

    private function customer()
    {
        return $this->safeFirstOrCreate(Customer::class, [
            'customer_type_id' => 1,
            'name' => 'Default'
        ], [
            'updated_by' => 1,
            'created_by' => 1
        ]);
    }

    private function customerType()
    {
        $member = $this->safeFirstOrCreate(CustomersType::class, ['name' => 'Member']);
        $vip = $this->safeFirstOrCreate(CustomersType::class, ['name' => 'VIP']);

        return ($member === 'success' && $vip === 'success') ? 'success' : 'failed';
    }

    private function damageStatuses()
    {
        $statuses = [
            ['name' => 'Returned by Customer', 'color' => 'blue'],
            ['name' => 'Returned to Supplier', 'color' => 'amber'],
            ['name' => 'Disposed', 'color' => 'red'],
        ];

        $results = collect($statuses)->map(function ($status) {
            return $this->safeFirstOrCreate(DamageStatus::class, ['name' => $status['name']], ['color' => $status['color']]);
        });

        return $results->contains('failed') ? 'failed' : 'success';
    }

    private function paymentOptions()
    {
        $entries = [
            ['name' => 'Cash', 'font_color' => 'text-blue-600'],
            ['name' => 'Gcash/Maya', 'font_color' => 'text-blue-800'],
            ['name' => 'Debit/Credit', 'font_color' => 'text-blue-900'],
            ['name' => 'Debt', 'font_color' => 'text-red-600'],
            ['name' => 'Cheque', 'font_color' => 'text-blue-700'],
            ['name' => 'Others', 'font_color' => 'text-blue-400'],
        ];

        $results = collect($entries)->map(function ($item) {
            return $this->safeFirstOrCreate(PaymentOption::class, ['name' => $item['name']], [
                'font_color' => $item['font_color'],
                'updated_by' => 1,
                'created_by' => 1
            ]);
        });

        return $results->contains('failed') ? 'failed' : 'success';
    }

    private function paymentStatuses()
    {
        $entries = [
            ['name' => 'None Payment', 'color' => 'red'],
            ['name' => 'Partial Payment', 'color' => 'yellow'],
            ['name' => 'Fully Paid', 'color' => 'green'],
        ];

        $results = collect($entries)->map(function ($item) {
            return $this->safeFirstOrCreate(PaymentStatus::class, ['name' => $item['name']], [
                'color' => $item['color']
            ]);
        });

        return $results->contains('failed') ? 'failed' : 'success';
    }

    private function purchaseOrderStatuses()
    {
        $entries = [
            ['name' => 'Ordered', 'color' => 'blue', 'icon' => 'PackageCheck'],
            ['name' => 'Received', 'color' => 'green', 'icon' => 'PackagePlus'],
            ['name' => 'Cancelled', 'color' => 'red', 'icon' => 'XCircle'],
            ['name' => 'Returned', 'color' => 'yellow', 'icon' => 'RotateCcw'],
        ];

        $results = collect($entries)->map(function ($item) {
            return $this->safeFirstOrCreate(PurchaseOrderStatus::class, ['name' => $item['name']], [
                'color' => $item['color'],
                'icon' => $item['icon']
            ]);
        });

        return $results->contains('failed') ? 'failed' : 'success';
    }

    private function returnOptions()
    {
        $entries = [
            ['name' => 'Change of Item'],
            ['name' => 'Damaged'],
            ['name' => 'Refund'],
            ['name' => 'Wrong Item'],
        ];

        $results = collect($entries)->map(function ($item) {
            return $this->safeFirstOrCreate(ReturnsOption::class, ['name' => $item['name']], [
                'updated_by' => 1,
                'created_by' => 1
            ]);
        });

        return $results->contains('failed') ? 'failed' : 'success';
    }

    private function returnTypes()
    {
        $entries = [
            ['name' => 'By Customer'],
            ['name' => 'To Supplier'],
        ];

        $results = collect($entries)->map(function ($item) {
            return $this->safeFirstOrCreate(ReturnsType::class, ['name' => $item['name']]);
        });

        return $results->contains('failed') ? 'failed' : 'success';
    }

    private function saleStatuses()
    {
        $entries = [
            ['name' => 'For Payment'],
            ['name' => 'Paid'],
            ['name' => 'Transaction On-hold'],
            ['name' => 'Cancelled'],
            ['name' => 'Returned'],
        ];

        $results = collect($entries)->map(function ($item) {
            return $this->safeFirstOrCreate(SalesStatus::class, ['name' => $item['name']]);
        });

        return $results->contains('failed') ? 'failed' : 'success';
    }

    private function serviceStatuses()
    {
        $entries = [
            ['name' => 'Ongoing', 'color' => 'blue'],
            ['name' => 'Done', 'color' => 'green'],
            ['name' => 'Cancelled', 'color' => 'red'],
            ['name' => 'On-hold', 'color' => 'yellow'],
            ['name' => 'Returned', 'color' => 'orange'],
        ];

        $results = collect($entries)->map(function ($item) {
            return $this->safeFirstOrCreate(ServicesStatus::class, ['name' => $item['name']], [
                'color' => $item['color'],
                'updated_by' => 1,
                'created_by' => 1
            ]);
        });

        return $results->contains('failed') ? 'failed' : 'success';
    }

    private function userRoles()
    {
        $roles = [
            ['name' => 'Admin'],
            ['name' => 'Cashier'],
        ];

        $results = collect($roles)->map(function ($role) {
            return $this->safeFirstOrCreate(UsersRole::class, ['name' => $role['name']]);
        });

        return $results->contains('failed') ? 'failed' : 'success';
    }

    private function safeFirstOrCreate($model, array $attributes, array $values = [])
    {
        try {
            $instance = $model::firstOrCreate($attributes, $values);
            return $instance ? 'success' : 'failed';
        } catch (\Exception $e) {
            return 'failed';
        }
    }

}