Product.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Review;

class Product extends Model
{
    protected $fillable = [
        'sku',
        'slug',
        'name',
        'original_price',
        'discount_percentage',
        'price',
        'category_id',
        'brand_id',
        'model',
        'grade',
        'condition',
        'stock',
        'color',
        'weight',
        'ram',
        'battery',
        'storage',
        'camera',
        'cpu',
        'gpu',
        'display',
        'os',
        'connectivity',
        'warranty',
        'tag',
        'is_flash_deal',
        'status',
        'description',
    ];

    /* TYPE CASTING */
    protected $casts = [
        'price' => 'decimal:2',
        'original_price' => 'decimal:2',
        'weight' => 'decimal:2',
        'discount_percentage' => 'integer',
        'stock' => 'integer',
        'is_flash_deal' => 'boolean',
        'status' => 'boolean',
    ];

    // Brand
    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    // Category
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // Product Images (Gallery)
    public function images()
    {
        return $this->hasMany(ProductImage::class)
            ->orderBy('sort_order');
    }

    // Variants
    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    /* ACCESSORS (OPTIONAL BUT VERY USEFUL) */

    // Final price after discount
    public function getFinalPriceAttribute()
    {
        $price = (float) $this->price;
        $discount = (int) $this->discount_percentage;

        if ($discount <= 0) {
            return $price;
        }

        return $price - ($price * $discount / 100);
    }

    /* Check if product is active. */
    public function getIsActiveAttribute()
    {
        return (bool) $this->status;
    }

    // Stock status
    public function getInStockAttribute()
    {
        return $this->stock > 0;
    }

    // Wishlist relationship
    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }

    // Reviews relationship
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}

ProductVariant.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    protected $fillable = [
        'product_id',
        'sku',
        'name',
        'storage',
        'color',
        'ram',
        'original_price',
        'discount_percentage',
        'price',
        'stock',
        'weight',
        'status',
    ];

    protected $casts = [
        'original_price' => 'decimal:2',
        'price' => 'decimal:2',
        'weight' => 'decimal:2',
        'discount_percentage' => 'integer',
        'stock' => 'integer',
        'status' => 'boolean',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class, 'variant_id')
            ->orderBy('sort_order');
    }

    /* Get final variant price after discount */
    public function getFinalPriceAttribute()
    {
        $price = (float) $this->price;
        $discount = (int) $this->discount_percentage;

        if ($discount <= 0) {
            return $price;
        }

        return $price - ($price * $discount / 100);
    }

    /* Check whether this variant is in stock */
    public function getInStockAttribute()
    {
        return $this->stock > 0;
    }

    /* Check whether this variant is active */
    public function getIsActiveAttribute()
    {
        return (bool) $this->status;
    }
}

ProductImage.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    protected $fillable = [
        'product_id',
        'variant_id',
        'image_url',
        'is_primary',
        'sort_order',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class);
    }
}


AdminProductController.php
<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminProductController extends Controller
{
    /* GET ALL PRODUCTS */
    public function index(Request $request)
    {
        $query = Product::with([
            'category',
            'brand',

            'images' => function ($query) {
                $query
                    ->whereNull('variant_id')
                    ->orderBy('sort_order');
            },

            'variants' => function ($query) {
                $query->orderBy('id');
            },

            'variants.images' => function ($query) {
                $query->orderBy('sort_order');
            },
        ]);

        /* SEARCH */
        if ($request->filled('search')) {
            $search = trim($request->search);

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        /* CATEGORY */
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        /* BRAND */
        if ($request->filled('brand_id')) {
            $query->where('brand_id', $request->brand_id);
        }

        /* GRADE */
        if ($request->filled('grade')) {
            $query->where('grade', $request->grade);
        }

        /* CONDITION */
        if ($request->filled('condition')) {
            $query->where('condition', $request->condition);
        }

        /* STATUS */
        if ($request->has('status')) {
            $query->where(
                'status',
                $request->boolean('status')
            );
        }

        /* PRICE RANGE */
        if ($request->filled('min_price')) {
            $query->where(
                'price',
                '>=',
                $request->min_price
            );
        }

        if ($request->filled('max_price')) {
            $query->where(
                'price',
                '<=',
                $request->max_price
            );
        }

        /* SORTING */
        switch ($request->get('sort')) {

            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;

            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;

            case 'newest':
                $query->latest();
                break;

            default:
                $query->latest();
                break;
        }

        /* PAGINATION */
        $perPage = min(
            max(
                (int) $request->get('per_page', 10),
                1
            ),
            50
        );

        $products = $query->paginate($perPage);

        return response()->json([
            'data' => $products->items(),

            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }


    /**
     * GET SINGLE PRODUCT
     *
     * GET /api/admin/products/{id}
     */
    public function show($id)
    {
        $product = Product::with([
            'category',
            'brand',

            'images' => function ($query) {
                $query
                    ->whereNull('variant_id')
                    ->orderBy('sort_order');
            },

            'variants' => function ($query) {
                $query->orderBy('id');
            },

            'variants.images' => function ($query) {
                $query->orderBy('sort_order');
            },

        ])->findOrFail($id);

        return response()->json([
            'data' => $product
        ]);
    }


    /**
     * CREATE PRODUCT
     *
     * Supports:
     * - Product information
     * - Multiple variants
     * - Variant color
     * - Variant storage
     * - Variant RAM
     * - Main product images
     */
    public function store(Request $request)
    {
        $validated = $request->validate([

            /* PRODUCT */

            'sku' => [
                'nullable',
                'string',
                'max:255',
                'unique:products,sku',
            ],

            'slug' => [
                'nullable',
                'string',
                'max:255',
                'unique:products,slug',
            ],

            'name' => [
                'required',
                'string',
                'max:255'
            ],

            'category_id' => [
                'required',
                'exists:categories,id'
            ],

            'brand_id' => [
                'required',
                'exists:brands,id'
            ],

            'price' => [
                'required',
                'numeric',
                'min:0'
            ],

            'original_price' => [
                'nullable',
                'numeric',
                'min:0'
            ],

            'discount_percentage' => [
                'nullable',
                'integer',
                'min:0',
                'max:100'
            ],

            'stock' => [
                'required',
                'integer',
                'min:0'
            ],

            'model' => [
                'nullable',
                'string',
                'max:255'
            ],

            'grade' => [
                'nullable',
                'string',
                'max:255'
            ],

            'condition' => [
                'required',
                Rule::in([
                    'Original',
                    'Refurbished'
                ])
            ],

            'color' => [
                'nullable',
                'string',
                'max:255'
            ],

            'weight' => [
                'nullable',
                'numeric',
                'min:0'
            ],

            'ram' => [
                'nullable',
                'string',
                'max:255'
            ],

            'battery' => [
                'nullable',
                'string',
                'max:255'
            ],

            'storage' => [
                'nullable',
                'string',
                'max:255'
            ],

            'camera' => [
                'nullable',
                'string',
                'max:255'
            ],

            'cpu' => [
                'nullable',
                'string',
                'max:255'
            ],

            'gpu' => [
                'nullable',
                'string',
                'max:255'
            ],

            'display' => [
                'nullable',
                'string',
                'max:255'
            ],

            'os' => [
                'nullable',
                'string',
                'max:255'
            ],

            'connectivity' => [
                'nullable',
                'string',
                'max:255'
            ],

            'warranty' => [
                'nullable',
                'string',
                'max:255'
            ],

            'tag' => [
                'nullable',
                'string',
                'max:255'
            ],

            'is_flash_deal' => [
                'nullable',
                'boolean'
            ],

            'status' => [
                'nullable',
                'boolean'
            ],

            'description' => [
                'nullable',
                'string'
            ],

            /* PRODUCT IMAGES */

            'images' => [
                'nullable',
                'array'
            ],

            'images.*' => [
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048'
            ],

            /* VARIANTS */

            'variants' => [
                'nullable',
                'array'
            ],

            'variants.*.sku' => [
                'required',
                'string',
                'max:255',
                'distinct',
                'unique:product_variants,sku'
            ],

            'variants.*.name' => [
                'nullable',
                'string',
                'max:255'
            ],

            'variants.*.color' => [
                'nullable',
                'string',
                'max:255'
            ],

            'variants.*.storage' => [
                'nullable',
                'string',
                'max:255'
            ],

            'variants.*.ram' => [
                'nullable',
                'string',
                'max:255'
            ],

            'variants.*.original_price' => [
                'nullable',
                'numeric',
                'min:0'
            ],

            'variants.*.discount_percentage' => [
                'nullable',
                'integer',
                'min:0',
                'max:100'
            ],

            'variants.*.price' => [
                'required',
                'numeric',
                'min:0'
            ],

            'variants.*.stock' => [
                'required',
                'integer',
                'min:0'
            ],

            'variants.*.weight' => [
                'nullable',
                'numeric',
                'min:0'
            ],

            'variants.*.status' => [
                'nullable',
                'boolean'
            ],
        ]);

        DB::beginTransaction();

        try {

            /*
             * CREATE PRODUCT
             */

            $slug = $validated['slug']
                ?? Str::slug($validated['name']);

            /*
             * Make sure automatically generated slug
             * is unique.
             */

            $originalSlug = $slug;
            $counter = 1;

            while (
                Product::where('slug', $slug)->exists()
            ) {
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }

            $product = Product::create([

                'sku' => $validated['sku'] ?? null,

                'slug' => $slug,

                'name' => $validated['name'],

                'original_price' =>
                    $validated['original_price'] ?? null,

                'discount_percentage' =>
                    $validated['discount_percentage'] ?? 0,

                'price' =>
                    $validated['price'],

                'category_id' =>
                    $validated['category_id'],

                'brand_id' =>
                    $validated['brand_id'],

                'model' =>
                    $validated['model'] ?? null,

                'grade' =>
                    $validated['grade'] ?? null,

                'condition' =>
                    $validated['condition'],

                'stock' =>
                    $validated['stock'],

                'color' =>
                    $validated['color'] ?? null,

                'weight' =>
                    $validated['weight'] ?? null,

                'ram' =>
                    $validated['ram'] ?? null,

                'battery' =>
                    $validated['battery'] ?? null,

                'storage' =>
                    $validated['storage'] ?? null,

                'camera' =>
                    $validated['camera'] ?? null,

                'cpu' =>
                    $validated['cpu'] ?? null,

                'gpu' =>
                    $validated['gpu'] ?? null,

                'display' =>
                    $validated['display'] ?? null,

                'os' =>
                    $validated['os'] ?? null,

                'connectivity' =>
                    $validated['connectivity'] ?? null,

                'warranty' =>
                    $validated['warranty'] ?? null,

                'tag' =>
                    $validated['tag'] ?? null,

                'is_flash_deal' =>
                    $request->boolean('is_flash_deal'),

                'status' =>
                    $request->has('status')
                        ? $request->boolean('status')
                        : true,

                'description' =>
                    $validated['description'] ?? null,
            ]);


            /*
             * CREATE VARIANTS
             */

            if (
                !empty($validated['variants'])
            ) {

                foreach (
                    $validated['variants']
                    as $variantData
                ) {

                    $product->variants()->create([

                        'sku' =>
                            $variantData['sku'],

                        'name' =>
                            $variantData['name'] ?? null,

                        'color' =>
                            $variantData['color'] ?? null,

                        'storage' =>
                            $variantData['storage'] ?? null,

                        'ram' =>
                            $variantData['ram'] ?? null,

                        'original_price' =>
                            $variantData['original_price'] ?? null,

                        'discount_percentage' =>
                            $variantData['discount_percentage'] ?? 0,

                        'price' =>
                            $variantData['price'],

                        'stock' =>
                            $variantData['stock'],

                        'weight' =>
                            $variantData['weight'] ?? null,

                        'status' =>
                            isset($variantData['status'])
                                ? (bool) $variantData['status']
                                : true,
                    ]);
                }
            }


            /*
             * UPLOAD MAIN PRODUCT IMAGES
             */

            if ($request->hasFile('images')) {

                foreach (
                    $request->file('images')
                    as $index => $file
                ) {

                    $path = $file->store(
                        'products',
                        'public'
                    );

                    $product->images()->create([

                        'variant_id' => null,

                        'image_url' =>
                            '/storage/' . $path,

                        'is_primary' =>
                            $index === 0,

                        'sort_order' =>
                            $index,
                    ]);
                }
            }

            DB::commit();

            /*
             * RETURN COMPLETE PRODUCT
             */

            return response()->json([

                'message' =>
                    'Product created successfully',

                'data' =>
                    $product->load([
                        'category',
                        'brand',

                        'images' => function ($query) {
                            $query->whereNull('variant_id')
                                ->orderBy('sort_order');
                        },

                        'variants',

                        'variants.images' => function ($query) {
                            $query->orderBy('sort_order');
                        },
                    ]),

            ], 201);

        } catch (\Throwable $e) {

            DB::rollBack();

            return response()->json([

                'message' =>
                    'Failed to create product',

                'error' =>
                    $e->getMessage(),

            ], 500);
        }
    }


    /**
     * UPDATE PRODUCT
     *
     * PUT /api/admin/products/{id}
     */
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([

            'sku' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique(
                    'products',
                    'sku'
                )->ignore($product->id),
            ],

            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique(
                    'products',
                    'slug'
                )->ignore($product->id),
            ],

            'name' =>
                'sometimes|string|max:255',

            'category_id' =>
                'sometimes|exists:categories,id',

            'brand_id' =>
                'sometimes|exists:brands,id',

            'price' =>
                'sometimes|numeric|min:0',

            'original_price' =>
                'nullable|numeric|min:0',

            'discount_percentage' =>
                'nullable|integer|min:0|max:100',

            'stock' =>
                'sometimes|integer|min:0',

            'condition' => [
                'nullable',
                Rule::in([
                    'Original',
                    'Refurbished'
                ])
            ],

            'grade' =>
                'nullable|string|max:255',

            'model' =>
                'nullable|string|max:255',

            'color' =>
                'nullable|string|max:255',

            'weight' =>
                'nullable|numeric|min:0',

            'warranty' =>
                'nullable|string|max:255',

            'tag' =>
                'nullable|string|max:255',

            'is_flash_deal' =>
                'nullable|boolean',

            'status' =>
                'nullable|boolean',

            'ram' =>
                'nullable|string|max:255',

            'battery' =>
                'nullable|string|max:255',

            'storage' =>
                'nullable|string|max:255',

            'camera' =>
                'nullable|string|max:255',

            'cpu' =>
                'nullable|string|max:255',

            'gpu' =>
                'nullable|string|max:255',

            'display' =>
                'nullable|string|max:255',

            'os' =>
                'nullable|string|max:255',

            'connectivity' =>
                'nullable|string|max:255',

            'description' =>
                'nullable|string',
        ]);

        $data = $request->only([
            'sku',
            'slug',
            'name',
            'original_price',
            'discount_percentage',
            'price',
            'category_id',
            'brand_id',
            'model',
            'grade',
            'condition',
            'stock',
            'color',
            'weight',
            'ram',
            'battery',
            'storage',
            'camera',
            'cpu',
            'gpu',
            'display',
            'os',
            'connectivity',
            'warranty',
            'tag',
            'description',
        ]);

        if ($request->has('is_flash_deal')) {
            $data['is_flash_deal'] =
                $request->boolean('is_flash_deal');
        }

        if ($request->has('status')) {
            $data['status'] =
                $request->boolean('status');
        }

        $product->update($data);

        return response()->json([

            'message' =>
                'Product updated successfully',

            'data' =>
                $product->load([
                    'category',
                    'brand',

                    'images' => function ($query) {
                        $query->whereNull('variant_id')
                            ->orderBy('sort_order');
                    },

                    'variants',

                    'variants.images' => function ($query) {
                        $query->orderBy('sort_order');
                    },
                ]),

        ]);
    }


    /**
     * DELETE PRODUCT
     *
     * DELETE /api/admin/products/{id}
     */
    public function destroy($id)
    {
        $product = Product::with([
            'images',
            'variants.images',
        ])->findOrFail($id);

        DB::beginTransaction();

        try {

            /*
             * DELETE MAIN PRODUCT IMAGES
             */

            foreach (
                $product->images
                as $image
            ) {

                $this->deleteStoredImage(
                    $image->image_url
                );

                $image->delete();
            }


            /*
             * DELETE VARIANT IMAGES
             */

            foreach (
                $product->variants
                as $variant
            ) {

                foreach (
                    $variant->images
                    as $image
                ) {

                    $this->deleteStoredImage(
                        $image->image_url
                    );

                    $image->delete();
                }

                $variant->delete();
            }


            /*
             * DELETE PRODUCT
             */

            $product->delete();

            DB::commit();

            return response()->json([
                'message' =>
                    'Product deleted successfully'
            ]);

        } catch (\Throwable $e) {

            DB::rollBack();

            return response()->json([

                'message' =>
                    'Failed to delete product',

                'error' =>
                    $e->getMessage(),

            ], 500);
        }
    }


    /**
     * CREATE VARIANT
     *
     * POST /api/admin/products/{product}/variants
     */
    public function storeVariant(
        Request $request,
        $productId
    ) {

        $product =
            Product::findOrFail($productId);

        $validated = $request->validate([

            'sku' => [
                'required',
                'string',
                'max:255',
                'unique:product_variants,sku',
            ],

            'name' =>
                'nullable|string|max:255',

            'color' =>
                'nullable|string|max:255',

            'storage' =>
                'nullable|string|max:255',

            'ram' =>
                'nullable|string|max:255',

            'original_price' =>
                'nullable|numeric|min:0',

            'discount_percentage' =>
                'nullable|integer|min:0|max:100',

            'price' =>
                'required|numeric|min:0',

            'stock' =>
                'required|integer|min:0',

            'weight' =>
                'nullable|numeric|min:0',

            'status' =>
                'nullable|boolean',
        ]);

        $variant =
            $product->variants()->create([

                'sku' =>
                    $validated['sku'],

                'name' =>
                    $validated['name'] ?? null,

                'color' =>
                    $validated['color'] ?? null,

                'storage' =>
                    $validated['storage'] ?? null,

                'ram' =>
                    $validated['ram'] ?? null,

                'original_price' =>
                    $validated['original_price'] ?? null,

                'discount_percentage' =>
                    $validated['discount_percentage'] ?? 0,

                'price' =>
                    $validated['price'],

                'stock' =>
                    $validated['stock'],

                'weight' =>
                    $validated['weight'] ?? null,

                'status' =>
                    $request->has('status')
                        ? $request->boolean('status')
                        : true,
            ]);

        return response()->json([

            'message' =>
                'Variant created successfully',

            'data' =>
                $variant->load([
                    'images' => function ($query) {
                        $query->orderBy('sort_order');
                    }
                ]),

        ], 201);
    }


    /**
     * UPDATE VARIANT
     *
     * PUT /api/admin/products/{product}/variants/{variant}
     */
    public function updateVariant(
        Request $request,
        $productId,
        $variantId
    ) {

        $product =
            Product::findOrFail($productId);

        $variant =
            $product->variants()
                ->where('id', $variantId)
                ->firstOrFail();

        $request->validate([

            'sku' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique(
                    'product_variants',
                    'sku'
                )->ignore($variant->id),
            ],

            'name' =>
                'nullable|string|max:255',

            'color' =>
                'nullable|string|max:255',

            'storage' =>
                'nullable|string|max:255',

            'ram' =>
                'nullable|string|max:255',

            'original_price' =>
                'nullable|numeric|min:0',

            'discount_percentage' =>
                'nullable|integer|min:0|max:100',

            'price' =>
                'sometimes|numeric|min:0',

            'stock' =>
                'sometimes|integer|min:0',

            'weight' =>
                'nullable|numeric|min:0',

            'status' =>
                'nullable|boolean',
        ]);

        $data = $request->only([
            'sku',
            'name',
            'color',
            'storage',
            'ram',
            'original_price',
            'discount_percentage',
            'price',
            'stock',
            'weight',
        ]);

        if ($request->has('status')) {
            $data['status'] =
                $request->boolean('status');
        }

        $variant->update($data);

        return response()->json([

            'message' =>
                'Variant updated successfully',

            'data' =>
                $variant->load([
                    'images' => function ($query) {
                        $query->orderBy('sort_order');
                    }
                ]),

        ]);
    }


    /**
     * DELETE VARIANT
     *
     * DELETE /api/admin/products/{product}/variants/{variant}
     */
    public function destroyVariant(
        $productId,
        $variantId
    ) {

        $product =
            Product::findOrFail($productId);

        $variant =
            $product->variants()
                ->with('images')
                ->where('id', $variantId)
                ->firstOrFail();

        DB::beginTransaction();

        try {

            foreach (
                $variant->images
                as $image
            ) {

                $this->deleteStoredImage(
                    $image->image_url
                );

                $image->delete();
            }

            $variant->delete();

            DB::commit();

            return response()->json([
                'message' =>
                    'Variant deleted successfully'
            ]);

        } catch (\Throwable $e) {

            DB::rollBack();

            return response()->json([

                'message' =>
                    'Failed to delete variant',

                'error' =>
                    $e->getMessage(),

            ], 500);
        }
    }


    /**
     * UPLOAD MAIN PRODUCT IMAGES
     *
     * POST /api/admin/products/{id}/images
     */
    public function uploadImages(
        Request $request,
        $productId
    ) {

        $request->validate([

            'images' => [
                'required',
                'array'
            ],

            'images.*' => [
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048'
            ],

            'primary_index' =>
                'nullable|integer|min:0',

            'sort_order' => [
                'nullable',
                'array'
            ],

            'sort_order.*' =>
                'nullable|integer|min:0',
        ]);

        $product =
            Product::findOrFail($productId);

        $uploadedImages = [];

        $primaryIndex =
            $request->input('primary_index');

        foreach (
            $request->file('images')
            as $index => $image
        ) {

            $path =
                $image->store(
                    'products',
                    'public'
                );

            $sortOrder =
                $request->input(
                    "sort_order.$index",
                    $index
                );

            $uploadedImage =
                ProductImage::create([

                    'product_id' =>
                        $product->id,

                    'variant_id' =>
                        null,

                    'image_url' =>
                        '/storage/' . $path,

                    'is_primary' =>
                        $primaryIndex !== null
                            ? (int) $primaryIndex === $index
                            : $index === 0,

                    'sort_order' =>
                        $sortOrder,
                ]);

            $uploadedImages[] =
                $uploadedImage;
        }

        return response()->json([

            'message' =>
                'Product images uploaded successfully',

            'data' =>
                $uploadedImages,

        ], 201);
    }


    /**
     * UPLOAD VARIANT IMAGES
     *
     * POST /api/admin/products/{product}/variants/{variant}/images
     */
    public function uploadVariantImages(
        Request $request,
        $productId,
        $variantId
    ) {

        $request->validate([

            'images' => [
                'required',
                'array'
            ],

            'images.*' => [
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048'
            ],

            'primary_index' =>
                'nullable|integer|min:0',

            'sort_order' => [
                'nullable',
                'array'
            ],

            'sort_order.*' =>
                'nullable|integer|min:0',
        ]);

        $product =
            Product::findOrFail($productId);

        $variant =
            $product->variants()
                ->where('id', $variantId)
                ->firstOrFail();

        $uploadedImages = [];

        $primaryIndex =
            $request->input('primary_index');

        foreach (
            $request->file('images')
            as $index => $image
        ) {

            $path =
                $image->store(
                    'products/variants',
                    'public'
                );

            $sortOrder =
                $request->input(
                    "sort_order.$index",
                    $index
                );

            $uploadedImage =
                ProductImage::create([

                    'product_id' =>
                        $product->id,

                    'variant_id' =>
                        $variant->id,

                    'image_url' =>
                        '/storage/' . $path,

                    'is_primary' =>
                        $primaryIndex !== null
                            ? (int) $primaryIndex === $index
                            : $index === 0,

                    'sort_order' =>
                        $sortOrder,
                ]);

            $uploadedImages[] =
                $uploadedImage;
        }

        return response()->json([

            'message' =>
                'Variant images uploaded successfully',

            'data' =>
                $uploadedImages,

        ], 201);
    }


    /**
     * DELETE IMAGE
     *
     * DELETE /api/admin/products/images/{image}
     */
    public function destroyImage($imageId)
    {
        $image =
            ProductImage::findOrFail($imageId);

        $this->deleteStoredImage(
            $image->image_url
        );

        $image->delete();

        return response()->json([
            'message' =>
                'Image deleted successfully'
        ]);
    }


    /**
     * SET PRIMARY IMAGE
     *
     * POST /api/admin/products/images/{image}/primary
     */
    public function setPrimaryImage($imageId)
    {
        $image =
            ProductImage::findOrFail($imageId);

        /*
         * VARIANT IMAGE
         */

        if ($image->variant_id) {

            ProductImage::where(
                'variant_id',
                $image->variant_id
            )->update([
                'is_primary' => false
            ]);

        } else {

            /*
             * MAIN PRODUCT IMAGE
             */

            ProductImage::where(
                'product_id',
                $image->product_id
            )
                ->whereNull('variant_id')
                ->update([
                    'is_primary' => false
                ]);
        }

        $image->update([
            'is_primary' => true
        ]);

        return response()->json([

            'message' =>
                'Primary image updated successfully',

            'data' =>
                $image,

        ]);
    }


    /**
     * UPDATE IMAGE ORDER
     *
     * PUT /api/admin/products/images/{image}/order
     */
    public function updateImageOrder(
        Request $request,
        $imageId
    ) {

        $request->validate([
            'sort_order' =>
                'required|integer|min:0',
        ]);

        $image =
            ProductImage::findOrFail($imageId);

        $image->update([
            'sort_order' =>
                $request->sort_order
        ]);

        return response()->json([

            'message' =>
                'Image order updated successfully',

            'data' =>
                $image,

        ]);
    }


    /**
     * DELETE STORED IMAGE
     */
    private function deleteStoredImage($imageUrl)
    {
        if (!$imageUrl) {
            return;
        }$path = str_replace(
            '/storage/',
            '',
            $imageUrl
        );

        Storage::disk('public')->delete($path);
    }
}