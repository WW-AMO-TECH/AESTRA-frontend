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










I replaced all 
http://127.0.0.1:8000
with
https://aestra-backend-production-426b.up.railway.app
ProductDetail.tsx and axios.ts too