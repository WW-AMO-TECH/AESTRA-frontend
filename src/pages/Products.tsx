import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { Search, SlidersHorizontal, Zap, Loader2 } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { formatPrice } from "@/lib/utils";

const API = "http://127.0.0.1:8000/api";

type Product = {
  id: number;
  name: string;
  price: number;
  original_price: number;
  discount_percentage: number;
  category_id: string;
  brand_id: string;
  grade?: "New" | "A" | "B" | "C";
  condition?: "Original" | "Refurbished";
  is_flash_deal?: boolean | number | string;
  category?: { id: number; name: string };
  brand?: { id: number; name: string };
  images?: { id: number; image_url: string }[];
  created_at?: string;
};

/* ---------------- FLASH DEALS ---------------- */
const ProductsFlashDeals = ({ products }: { products: Product[] }) => {
  const flashDealProducts = products.filter(
    (p) => p.is_flash_deal === true || p.is_flash_deal === 1 || p.is_flash_deal === "1"
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 3100, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  if (!flashDealProducts.length) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-amber-500" />
        <h2 className="font-bold text-lg">Flash Deals</h2>
      </div>

      <div ref={emblaRef} className="overflow-hidden rounded-2xl">
        <div className="flex">
          {flashDealProducts.map((p) => (
            <div
              key={p.id}
              className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-2 pr-3"
            >
              <Link
                to={`/products/${p.id}`}
                className="flex gap-3 p-3 border-2 rounded-xl bg-primary"
              >
                <img
                  src={
                    p.images?.[0]?.image_url
                      ? `http://127.0.0.1:8000${p.images[0].image_url}`
                      : "/placeholder.png"
                  }
                  className="w-16 h-16 object-cover rounded"
                />

                <div>
                  <span className="text-[10px] px-1 py-1 rounded-xl bg-green-600 text-white">
                    {p.discount_percentage ? `-${p.discount_percentage}%` : "Flash Deal"}
                  </span>
                  <p className="text-sm mt-1 font-semibold">{p.name}</p>
                  <p className="flex items-center gap-2 text-secondary text-xs font-bold">
                    {formatPrice(p.price)} <span className="text-muted-foreground text-[10px] line-through">
                      {formatPrice(p.original_price)}
                    </span>
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-1 mt-3">
        {flashDealProducts.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`w-2 h-2 rounded-full ${
              i === selectedIndex ? "bg-primary w-4" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

/* ---------------- MAIN PAGE ---------------- */
const Products = () => {
  const [params] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(params.get("category") || "");
  const [brand, setBrand] = useState("");
  const [grade, setGrade] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  /* ---------------- FETCH ---------------- */
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API}/products`, {
        params: { search, category, brand, grade },
      });
      setProducts(res.data.data ?? res.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("API ERROR:", {
          status: err.response?.status,
          data: err.response?.data,
          url: err.config?.url,
        });
      } else {
        console.error(err);
      }
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await axios.get(`${API}/brands`);
      setBrands(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  /* INIT LOAD */
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  /* REFETCH WHEN FILTERS CHANGE */
  useEffect(() => {
    fetchProducts();
  }, [search, category, brand, grade]);

  /* ---------------- FILTER (SAFE fallback only) ---------------- */
  const filtered = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products;
  }, [products]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-6">
        <ProductsFlashDeals products={products} />

        {/* SEARCH */}
        <div className="flex gap-3 mb-6 focus:border-primary">
          <div className="relative flex-1">
            <Search className="absolute text-primary left-3 top-3 w-4 h-4" />
            <input
              className="w-full pl-10 outline-none border border-primary focus:border-2 focus:border-primary rounded-s-lg p-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="border border-primary rounded-e-lg px-3 rounded"
          >
            <SlidersHorizontal className="w-4 h-4 text-primary" />
          </button>
        </div>

        {/* FILTERS */}
        {showFilters && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select value={brand} onChange={(e) => setBrand(e.target.value)}>
              <option value="">Brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            <select value={grade} onChange={(e) => setGrade(e.target.value)}>
              <option value="">Grade</option>
              <option value="New">New</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
        )}

        {/* PRODUCTS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filtered.map((p, i) => (
            <ProductCard
              key={p.id}
              product={{
                id: p.id,
                condition: p.condition,
                grade: p.grade,
                discount_percentage: p.discount_percentage,
                brand: p.brand,
                name: p.name,
                price: p.price,
                image: p.images?.[0]?.image_url
                  ? `http://127.0.0.1:8000${p.images[0].image_url}`
                  : "/placeholder.png",
              }}
              index={i}
            />
          ))}
        </div>

        {!filtered.length && (
          <div className="flex items-center justify-center py-40">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;