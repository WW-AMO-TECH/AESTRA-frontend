src/components/ProductCard.tsx — bumped text from text-[8px]/text-[9px] to text-[10px]/text-[11px]/text-[13px], icons from w-2.5/w-3 to w-3.5/w-4, cart button padding from p-1 to p-1.5, and card padding from p-2 to p-3.

src/index.css — added font-size: 16px to the body rule, which sets the base text size for the entire app.

Global text size — set base font to 16px across the entire app
Card expiry — auto-inserts / between MM and YY as you type
Features page — created at /features listing every feature (Home, Products, Admin panels, Auth, etc.) with a clean card grid layout, added to navbar and footer.

To create  categories and brands in the db
php artisan:tinker
\App\Models\Category::create(['name' => 'Phones']);
\App\Models\Category::create(['name' => 'Laptops']);
Wi-FI, cords, etc is part of accessories

\App\Models\Brand::create(['name' => 'Apple']);
\App\Models\Brand::create(['name' => 'Samsung']);


<input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for products..."
                className="flex-1 bg-transparent px-4 py-2 outline-none text-sm placeholder:text-muted-foreground"
              />

              <button
                type="submit"
                className="flex items-center justify-center rounded-xl active:scale-95 transition-all"
              >
                <Search className="h-4 w-4 mx-3" />
              </button>



\App\Models\Brand::create(['name' => 'Apple']);
\App\Models\Brand::create(['name' => 'Samsung']);
\App\Models\Brand::create(['name' => 'Infinix']);
\App\Models\Brand::create(['name' => 'Google']);
\App\Models\Brand::create(['name' => 'Tecno']);
\App\Models\Brand::create(['name' => 'Dell']);
\App\Models\Brand::create(['name' => 'Lenovo']);
\App\Models\Brand::create(['name' => 'JBL']);
\App\Models\Brand::create(['name' => 'Sony']);


For an e-commerce site, we can later make the system smarter by adding "Verified Purchase" to reviews. That would mean only someone who actually purchased the product can get a Verified Purchase badge.
I want sellers to only be able to view; products that they add, orders & order tracking for the product they added, view reviews & ratings on their products, and add pickup locations.
I want admin to be able to create brands and categories from their dashbooard which can be selected while trying to add or edit a product.


I replaced all 
http://127.0.0.1:8000
with
https://aestra.onrender.com
ProductDetail.tsx and axios.ts too