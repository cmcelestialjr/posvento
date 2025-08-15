<?php

namespace App\Http\Controllers;

use App\Imports\ProductImport;
use App\Models\Product;
use App\Models\ProductsCategory;
use App\Models\ProductsPrice;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Facades\Excel;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('pricingList.supplier','pricingListAvailable.supplier','productCategory')
            ->where('id','>',0);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name_variant', 'LIKE', "%{$search}%")
                ->orWhere('code', 'LIKE', "%{$search}%");
            });
        }

        if ($request->has('filter')) {
            $filter = $request->filter;
            switch ($filter) {
                case 'available':
                    $query->where('qty', '>', 0);
                    $query->where('product_status', 'Available');
                    break;
            
                case 'out-of-stock':
                    $query->where('qty', '=', 0);
                    $query->where('product_status', 'Available');
                    break;
            
                case 'low-stock':
                    $query->whereBetween('qty', [1, 4]);
                    $query->where('product_status', 'Available');
                    break;

                case 'phaseout':
                    $query->where('product_status', 'Phaseout');
                    break;

                case 'damaged':
                    $query->whereHas('sales.returnInfo.returnInfo', function ($q) {
                        $q->where('return_option_id', 2);
                    });
                    break;
            }
        }

        if ($request->has('filterCategory')) {
            $filterCategory = $request->filterCategory;
            $query->where('product_category_id', $filterCategory);
        }

        if ($request->has('suppliers')) {
            $suppliers = $request->suppliers;
            $query->whereHas('pricingList', function ($q) use ($suppliers) {
                $q->whereIn('supplier_id', $suppliers);
            });
        }

        if ($request->has('sort_column') && $request->has('sort_order')) {
            $sortColumn = $request->sort_column;
            $sortOrder = $request->sort_order;
    
            if (in_array($sortColumn, ['code', 'name', 'variant', 'cost', 'price', 'qty', 'product_category_id'])) {
                $query->orderBy($sortColumn, $sortOrder);
            }
        }

        $products = $query->paginate(10);

        $products->getCollection()->transform(function ($product) {
            $product->img = $product->img ? asset("storage/$product->img") : asset('images/no-image-icon.png');
            return $product;
        });

        return response()->json([
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'prev' => $products->previousPageUrl(),
                'next' => $products->nextPageUrl(),
            ]
        ]);
    }

    public function summary()
    {
        $summary = Product::selectRaw("
            COUNT(*) as total,
            SUM(CASE WHEN qty > 0 AND product_status = 'Available' THEN 1 ELSE 0 END) as available,
            SUM(CASE WHEN qty = 0 AND product_status = 'Available' THEN 1 ELSE 0 END) as out_of_stock,
            SUM(CASE WHEN qty BETWEEN 1 AND 4 AND product_status = 'Available' THEN 1 ELSE 0 END) as low_stock,
            SUM(CASE WHEN product_status = 'Phaseout' THEN 1 ELSE 0 END) as phaseout
        ")->first();

        // $damaged = Product::whereHas('sales.returnInfo.returnInfo', function ($q) {
        //         $q->where('return_option_id', 2);
        //     })->count();

        return response()->json([
            'total' => $summary->total,
            'available' => $summary->available,
            'out_of_stock' => $summary->out_of_stock,
            'low_stock' => $summary->low_stock,
            'phaseout' => $summary->phaseout,
            'damaged' => 0
        ]);
    }

    public function categoriesCount(Request $request)
    {
        // $query = Product::selectRaw("
        //     SUM(CASE WHEN product_category_id = 1 THEN 1 ELSE 0 END) as main,
        //     SUM(CASE WHEN product_category_id = 2 THEN 1 ELSE 0 END) as accessories,
        //     SUM(CASE WHEN product_category_id = 3 THEN 1 ELSE 0 END) as boltsNscrews
        // ");

        $query = Product::query();

        if ($request->has('filter')) {
            $filter = $request->filter;
            switch ($filter) {
                case 'available':
                    $query->where('qty', '>', 0);
                    $query->where('product_status', 'Available');
                    break;
            
                case 'out-of-stock':
                    $query->where('qty', '=', 0);
                    $query->where('product_status', 'Available');
                    break;
            
                case 'low-stock':
                    $query->whereBetween('qty', [1, 4]);
                    $query->where('product_status', 'Available');
                    break;

                case 'phaseout':
                    $query->where('product_status', 'Phaseout');
                    break;

                case 'damaged':
                    $query->whereHas('sales.returnInfo.returnInfo', function ($q) {
                        $q->where('return_option_id', 2);
                    });
                    break;
            }
        }

        $categoryCounts = $query->select('product_category_id')
            ->groupBy('product_category_id')
            ->selectRaw('product_category_id, COUNT(*) as count_products')
            ->get();

        return response()->json($categoryCounts);

        // $summary = $query->first();
        
        // return response()->json([
        //     'main' => $summary->main>0 ? $summary->main : 0,
        //     'accessories' => $summary->accessories>0 ? $summary->accessories : 0,
        //     'boltsNscrews' => $summary->boltsNscrews>0 ? $summary->boltsNscrews : 0,
        // ]);
    }

    public function categories()
    {
        $categories = ProductsCategory::withCount(['products as count_products'])->get();

        return response()->json($categories);
    }

    public function print(Request $request)
    {
        $query = Product::with('pricingList','pricingListAvailable.supplier','productCategory')
            ->where('id','>',0);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name_variant', 'LIKE', "%{$search}%")
                    ->orWhere('code', 'LIKE', "%{$search}%");
            });
        }

        if ($request->has('filter')) {
            $filter = $request->filter;
            switch ($filter) {
                case 'available':
                    $query->where('qty', '>', 0);
                    $query->where('product_status', 'Available');
                    break;
            
                case 'out-of-stock':
                    $query->where('qty', '=', 0);
                    $query->where('product_status', 'Available');
                    break;
            
                case 'low-stock':
                    $query->whereBetween('qty', [1, 4]);
                    $query->where('product_status', 'Available');
                    break;

                case 'phaseout':
                    $query->where('product_status', 'Phaseout');
                    break;
                
                case 'damaged':
                    $query->whereHas('sales.returnInfo.returnInfo', function ($q) {
                        $q->where('return_option_id', 2);
                    });
                    break;
            }
        }

        if ($request->has('filterCategory')) {
            $filterCategory = $request->filterCategory;
            $query->where('product_category_id', $filterCategory);
        }

        $products = $query->get();

        $products->transform(function ($product) {
            $product->img = $product->img ? asset("storage/$product->img") : asset('images/no-image-icon.png');
            return $product;
        });

        return response()->json([
            'data' => $products
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|regex:/^[\w\d]+$/|unique:products',
            'name' => 'required|string',
            'variant' => 'required|string',
            'cost' => 'required|numeric',
            'productCategoryId' => 'required|integer|exists:products_categories,id',
            'price' => 'required|numeric',
            'qty' => 'required|numeric',
            'effective_date' => 'required|date',
            'productParentId' => 'nullable|integer|exists:products,id',
            'conversionQuantity' => 'nullable|numeric|min:0',
            'track' => 'required|in:Y,N'
        ]);

        $name_variant = "$request->name-$request->variant";

        $checkProductCodeAndName = Product::where('code',$request->code)
            ->orWhere('name_variant',$name_variant)
            ->select('id')
            ->first();

        if($checkProductCodeAndName){
            return response()->json(['message' => 'Code or Name Variant already exists!'], 201);
        }

        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $user_id = $user->id;

        $insert = new Product;
        $insert->code = $request->code;
        $insert->name = $request->name;
        $insert->variant = $request->variant;
        $insert->name_variant = $name_variant;
        $insert->cost = $request->cost;
        $insert->price = $request->price;
        $insert->qty = $request->qty;
        $insert->restock_date = date('Y-m-d');
        $insert->product_status = 'Available';
        $insert->product_category_id = $request->productCategoryId;     
        $insert->track = $request->track;
        $insert->parent_id = $request->productParentId;
        $insert->conversion_quantity = $request->conversionQuantity;
        $insert->updated_by = $user_id;
        $insert->created_by = $user_id;
        $insert->save();
        $product_id = $insert->id;

        $this->productPrice($user_id,$product_id,$request);
        

        return response()->json(['message' => 'success'], 201);

    }

    public function update(Request $request, $id)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $user_id = $user->id;

        $product = Product::where('id', $id)->first();

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $request->validate([
            'code' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'variant' => 'required|string|max:255',
            'productCategoryId' => 'required|integer|exists:products_categories,id',
            'product_status' => 'required|in:Available,Phaseout',
            'track' => 'required|in:Y,N',
            'productParentId' => 'nullable|integer|exists:products,id',
            'conversionQuantity' => 'nullable|numeric|min:0',
        ]);

        $name_variant = "$request->name-$request->variant";

        $checkProductCodeAndName = Product::where('id','<>',$id)
            ->where(function ($query) use ($request, $name_variant) {
                $query->where('code', $request->code)
                ->orWhere('name_variant', $name_variant);
            })        
            ->select('id')
            ->first();

        if($checkProductCodeAndName){
            return response()->json(['message' => 'Code or Name Variant already exists!'], 201);
        }

        $product->update([
            'code' => $request->code,
            'name' => $request->name,
            'variant' => $request->variant,
            'name_variant' => $name_variant,
            'product_category_id' => $request->productCategoryId,
            'product_status' => $request->product_status,
            'track' => $request->track,
            'parent_id' => $request->productParentId,
            'conversion_quantity' => $request->conversionQuantity,
        ]);

        // $this->productPrice($user_id,$id,$request);

        return response()->json(['message' => 'Product updated successfully', 'product' => $product]);
    }

    public function storePricing(Request $request)
    {
        $request->validate([
            'cost' => 'required|numeric',
            'price' => 'required|numeric',
            'qty' => 'required|numeric',
            'effective_date' => 'required|date',
            'supplierId' => 'nullable|integer|exists:suppliers,id',
        ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }        

        $checkProductPrice = ProductsPrice::where('product_id',$request->product_id)
            ->where('price',$request->price)
            ->where('cost',$request->cost)
            ->where('supplier_id',$request->supplierId)
            ->first();
        if ($checkProductPrice) {
            return response()->json([
                'message' => 'Price and Cost already exists.']);
        }

        $user_id = $user->id;

        $this->productPrice($user_id,$request->product_id,$request);
        $this->updateLatestPrice($request->product_id);

        $productPrices = $this->fetchProductPrices($request->product_id);

        return response()->json(['message' => 'success',
            'product' => $productPrices]);
    }

    public function updatePricing(Request $request, $id)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $user_id = $user->id;

        $productPrice = ProductsPrice::find($id);

        if (!$productPrice) {
            return response()->json(['message' => 'Product Pricing not found'], 404);
        }

        $product = Product::find($productPrice->product_id);

        $request->validate([
            'cost' => 'required|numeric',
            'price' => 'required|numeric',
            'qty' => 'required|numeric',
            'effective_date' => 'required|date',
            'supplierId' => 'nullable|integer|exists:suppliers,id',
        ]);

        if($product->track=='N'){
            $cost = 0;
            $qty = 0;
        }else{
            $cost = $request->cost;
            $qty = $request->qty;
        }

        $productPrice->update([
            'cost' => $cost,
            'price' => $request->price,
            'qty' => $qty,
            'supplier_id' => $request->supplierId,
            'effective_date' => Carbon::parse($request->effective_date)->format('Y/m/d'),
            'updated_by' => $user_id
        ]);

        $productPrice->refresh();

        $this->updateLatestPrice($productPrice->product_id);

        $productPrices = $this->fetchProductPrices($productPrice->product_id);

        return response()->json(['message' => 'success',
            'product' => $productPrices]);
    }

    public function fetch(Request $request)
    {
        $query = Product::with('pricingListAvailable.supplier', 'pricingList','parent');

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                ->orWhere('code', 'LIKE', "%{$search}%")
                ->orWhere('name_variant', 'LIKE', "%{$search}%");
            });
        }
        
        $products = $query->limit(15)->get();

        $products->transform(function ($product) {
            $product->img = $product->img ? asset("storage/$product->img") : asset('images/no-image-icon.png');
            return $product;
        });

        return response()->json($products);
    }

    public function posFetch(Request $request)
    {
        $query = Product::with('pricingListAvailable.supplier', 'pricingList', 'parent');

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                ->orWhere('code', 'LIKE', "%{$search}%")
                ->orWhere('name_variant', 'LIKE', "%{$search}%");
            });
        }

        if ($request->has('category')) {
            $category = $request->category;
            if($category>0){
                $query->where('product_category_id', $category);
            }
        }

        $products = $query->get();

        $products->transform(function ($product) {
            $product->img = $product->img ? asset("storage/$product->img") : asset('images/no-image-icon.png');
            return $product;
        });

        return response()->json($products);
    }

    public function pricingDestroy(Request $request)
    {
        $validatedData = $request->validate([
            'id' => 'required|numeric|min:0|exists:products_prices,id',
        ]);
        try{
            $id = $validatedData['id'];

            $check = ProductsPrice::where('id',$id)->first();

            if($check->qty>0){
                return response()->json(['message' => 'Cannot remove product price because it still have quantity.'], 200);
            }

            $count = ProductsPrice::where('product_id',$check->product_id)->get()->count();

            if($count<=1){
                return response()->json(['message' => 'Cannot remove the product price because it is the last one.'], 200);
            }

            ProductsPrice::where('id',$id)->delete();

            return response()->json(['message' => 'Price removed successfully.'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function sales(Request $request)
    {
        $query = Product::with('productCategory','sales.saleInfo')->select(
                    'products.*',
                    DB::raw('SUM(sales_products.qty) AS total_qty'),
                    DB::raw('SUM(sales_products.total_cost) AS total_costs'),
                    DB::raw('SUM(sales_products.amount) AS total_amount'),
                    DB::raw('MAX(sales.date_time_of_sale) AS last_sale_at')
                )
                ->join('sales_products', 'sales_products.product_id', '=', 'products.id')
                ->join('sales', 'sales.id', '=', 'sales_products.sale_id');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('products.name_variant', 'LIKE', "%{$search}%")
                ->orWhere('products.code', 'LIKE', "%{$search}%");
            });
        }
        
        if ($request->has('start_date') && $request->has('end_date')) {
            $startDate = $request->start_date;
            $endDate = $request->end_date;

            if ($startDate && $endDate) {
                $query->whereBetween(DB::raw('DATE(sales.date_time_of_sale)'), [$startDate, $endDate]);
            }
        }

        if ($request->has('sort_column') && $request->has('sort_order')) {
            $sortColumn = $request->sort_column;
            $sortOrder = $request->sort_order;
    
            if (in_array($sortColumn, ['products.code', 'name_variant', 'product_category_id', 'total_qty', 'total_costs', 'total_amount'])) {
                $query->orderBy($sortColumn, $sortOrder);
            }
        }

        $query->groupBy('products.id')
            ->orderByDesc('last_sale_at')
            ->orderByDesc('total_qty');

        $sales = $query->paginate(10);

        $sales->getCollection()->transform(function ($product) {
            $product->img = $product->img ? asset("storage/$product->img") : asset('images/no-image-icon.png');
            return $product;
        });

        return response()->json([
            'data' => $sales->items(),
            'meta' => [
                'current_page' => $sales->currentPage(),
                'last_page' => $sales->lastPage(),
                'prev' => $sales->previousPageUrl(),
                'next' => $sales->nextPageUrl(),
            ]
        ]);
    }

    private function productPrice($user_id,$product_id,$request)
    {
        $product = Product::find($product_id);

        $track = $product->track;
        
        $checkProductPrice = ProductsPrice::where('product_id',$product_id);
        if($track=='N'){

        }else{
            $checkProductPrice->where('price',$request->price)
                ->where('cost',$request->cost)
                ->where('supplier_id',$request->supplierId);
        }
        $checkProductPrice = $checkProductPrice->first();

        if($checkProductPrice){                                                                                                                  
            $insert = ProductsPrice::find($checkProductPrice->id);
        }else{
            $insert = new ProductsPrice;
            $insert->product_id = $product_id;
        }
        $insert->supplier_id = $request->supplierId;
        if($track=='N'){
            $insert->cost = 0;
            $insert->qty = 0;
        }else{
            $insert->cost = $request->cost;        
            $insert->qty = $request->qty;
        }
        $insert->price = $request->price;
        $insert->effective_date = Carbon::parse($request->effective_date)->format('Y/m/d');
        $insert->updated_by = $user_id;
        $insert->created_by = $user_id;
        $insert->save();
    }
    private function updateLatestPrice($product_id)
    {
        $productPrice = ProductsPrice::where('product_id',$product_id)
            ->orderBy('effective_date','DESC')
            ->orderBy('id','DESC')
            ->first();
        if($productPrice){
            $qty = ProductsPrice::where('product_id',$product_id)->sum('qty');
            $update = Product::find($product_id);
            $update->cost = $productPrice->cost;
            $update->price = $productPrice->price;
            $update->qty = $qty;
            $update->save();
        }
    }
    public function categoryCode(Request $request)
    {
        $request->validate([
            'id' => 'required|numeric|exists:products_categories,id',
        ]);

        $productCategory = ProductsCategory::where('id', $request->id)->first();

        if (!$productCategory) {
            return response()->json(['message' => 'Product Category not found'], 404);
        }

        if($productCategory->increment=="Y"){
            $getCode = Product::where('product_category_id',$productCategory->id)->orderBy('code','DESC')->first();
            $code = $getCode ? $getCode->code + 1 : $productCategory->code_start;
        }else{
            $code = "";
        }

        return response()->json([
            'message' => 'success',
            'increment' => $productCategory->increment,
            'code' => $code
        ], 200);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv',
        ]);

        $file = $request->file('file');

        $filePath = $file->storeAs('temp/', $file->getClientOriginalName());        
        $filePath = storage_path( 'app/private/temp/'.$file->getClientOriginalName());

        Excel::import(new ProductImport($filePath), $file);
        $count = Product::count(); // Or count records inserted by the import
        return response()->json(['message' => "Products imported successfully! Total records: $count"]);       
    }

    public function updateImage(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'image' => 'required|image|max:2048',
        ]);

        $product = Product::find($request->product_id);

        if ($product->img) {
            Storage::delete($product->img);
        }

        $path = $request->file('image')->store('product_images','public');
        $product->img = $path;
        $product->save();
        
        return response()->json([
            'success' => true,
            'image_url' => asset("storage/$product->img"),
        ]);
    }
    private function fetchProductPrices($productId)
    {
        return ProductsPrice::with('supplier')
            ->where('product_id',$productId)
            ->orderBy('effective_date','DESC')
            ->orderBy('id','DESC')
            ->get();
    }
}