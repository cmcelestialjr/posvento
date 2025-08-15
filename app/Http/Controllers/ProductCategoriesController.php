<?php

namespace App\Http\Controllers;

use App\Models\ProductsCategory;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ProductCategoriesController extends Controller
{
    public function index(Request $request)
    {
        $query = ProductsCategory::query();
    
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%");
            });
        }

        $categories = $query->orderBy('id')->paginate(10);

        return response()->json([
            'data' => $categories->items(),
            'meta' => [
                'current_page' => $categories->currentPage(),
                'last_page' => $categories->lastPage(),
                'prev' => $categories->previousPageUrl(),
                'next' => $categories->nextPageUrl(),
            ]
        ]);
    }

    public function fetch(Request $request)
    {
        $query = ProductsCategory::query();

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%");
            });
        }

        $categories = $query->orderBy('name')->limit(10)->get();

        return response()->json($categories);
    }

    public function fetchAll(Request $request)
    {
        $categories = ProductsCategory::orderBy('name')->get();

        return response()->json($categories);
    }
    

    public function manage(Request $request)
    {
        $validatedData = $request->validate([
            'id' => 'nullable|numeric|exists:products_categories,id',
            'name' => 'required|string|max:100',
            'increment' => 'required|in:Y,N',
            'code_start' => 'nullable|string|max:50',
        ]);

        return $validatedData['id'] ? $this->update($validatedData) : $this->store($validatedData);
    }
    public function store($validatedData)
    {
        DB::beginTransaction();
        try{
            $user = Auth::user();
            $cashier_id = $user->id;

            ProductsCategory::create([
                'name' => $validatedData['name'],
                'increment' => $validatedData['increment']=='N' ? 'N' : 'Y',
                'code_start' => $validatedData['code_start'] ? $validatedData['code_start'] : '',
            ]);

            DB::commit();
            return response()->json(['message' => 'Successful! New category saved..'], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function update($validatedData)
    {
        DB::beginTransaction();
        try{
            $user = Auth::user();
            $cashier_id = $user->id;

            $update = ProductsCategory::findOrFail($validatedData['id']);
            $update->name = $validatedData['name'];
            $update->increment = $validatedData['increment'];
            $update->code_start = $validatedData['code_start'] ? $validatedData['code_start'] : '';
            $update->save();

            DB::commit();
            return response()->json(['message' => 'Successful! Update category saved..'], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }
}