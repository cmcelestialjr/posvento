<?php

namespace App\Http\Controllers;

use App\Models\PaymentOption;
use App\Models\PaymentStatus;
use Illuminate\Http\Request;

class PaymentOptionController extends Controller
{
    public function fetch()
    {
        try {
            $paymentOptions = PaymentOption::select('id', 'name')->orderBy('id','ASC')->get();

            return response()->json([
                'success' => true,
                'data' => $paymentOptions
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch payment options',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function fetchStatuses()
    {
        try {
            $paymentOptions = PaymentStatus::select('id', 'name')->orderBy('id','ASC')->get();

            return response()->json([
                'success' => true,
                'data' => $paymentOptions
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch payment statuses',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}