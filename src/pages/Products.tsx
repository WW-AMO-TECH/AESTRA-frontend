import { useState, useMemo, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  Search,
  SlidersHorizontal,
  Zap,
  Loader2,
  Heart,
  ChevronLeft,
  ChevronRight,
  X,
  ChevronDown,
  Grid2X2,
  List,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import { formatPrice } from "@/lib/utils";

const API = "https://aestra.onrender.com/api";

/* =========================================================
   TYPES
========================================================= */

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

  stock?: number;
  rating?: number | null;
  reviews_count?: number;

  category?: {
    id: number;
    name: string;
  };

  brand?: {
    id: number;
    name: string;
  };

  images?: {
    id: number;
    image_url: string;
  }[];

  created_at?: string;
};

/* =========================================================
   IMAGE URL
========================================================= */

const getImageUrl = (product?: Product) => {
  const image = product?.images?.[0]?.image_url;

  if (!image) return "/placeholder.png";

  if (image.startsWith("http")) return image;

  return `https://aestra.onrender.com${image}`;
};

/* =========================================================
   FLASH DEALS
========================================================= */

const FlashDeals = ({ products }: { products: Product[] }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: products.length > 5,
      align: "start",
      skipSnaps: false,
    },
    [
      Autoplay({
        delay: 4500,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  if (!products.length) return null;

  return (
    <section className="relative mb-7 overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/10 via-white to-primary/10 p-4 sm:p-5">
      {/* HEADER */}

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
            <Zap className="h-4 w-4 fill-current" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                Flash Deals
              </h2>

              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[8px] font-bold text-red-500">
                LIMITED TIME
              </span>
            </div>

            <p className="text-[10px] text-slate-500">
              Grab these amazing deals before they disappear.
            </p>
          </div>
        </div>

        {/* COUNTDOWN */}

        <div className="hidden items-center gap-1.5 sm:flex">
          {[
            ["02", "Days"],
            ["15", "Hrs"],
            ["47", "Min"],
            ["32", "Sec"],
          ].map(([value, label]) => (
            <div key={label} className="text-center">
              <div className="flex h-8 min-w-[32px] items-center justify-center rounded-md bg-white px-1.5 text-xs font-bold text-primary shadow-sm">
                {value}
              </div>

              <span className="mt-0.5 block text-[7px] text-slate-400">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CAROUSEL */}

      <div className="relative">
        <button
          type="button"
          onClick={scrollPrev}
          className="absolute left-0 top-1/2 z-20 hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md lg:flex"
        >
          <ChevronLeft className="h-4 w-4 text-slate-600" />
        </button>

        <button
          type="button"
          onClick={scrollNext}
          className="absolute right-0 top-1/2 z-20 hidden h-8 w-8 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md lg:flex"
        >
          <ChevronRight className="h-4 w-4 text-slate-600" />
        </button>

        <div ref={emblaRef} className="overflow-hidden">
          <div className="-ml-2 flex">
            {products.map((product) => {
              const discount = product.discount_percentage || 0;

              return (
                <div
                  key={product.id}
                  className="min-w-0 flex-[0_0_78%] pl-2 sm:flex-[0_0_40%] md:flex-[0_0_33.333%] lg:flex-[0_0_25%] xl:flex-[0_0_20%]"
                >
                  <Link
                    to={`/products/${product.id}`}
                    className="group block overflow-hidden rounded-xl border border-slate-100 bg-white p-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
                  >
                    <div className="relative mb-2 flex h-28 items-center justify-center overflow-hidden rounded-lg bg-slate-50">
                      {discount > 0 && (
                        <span className="absolute left-1.5 top-1.5 z-10 rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-bold text-white">
                          -{discount}%
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="absolute right-1.5 top-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm transition hover:bg-primary/10"
                      >
                        <Heart className="h-3.5 w-3.5 text-slate-500" />
                      </button>

                      <img
                        src={getImageUrl(product)}
                        alt={product.name}
                        className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-105"
                      />
                    </div>

                    <h3 className="line-clamp-1 text-[11px] font-semibold text-slate-800">
                      {product.name}
                    </h3>

                    <div className="mt-1 flex items-center gap-1">
                      <span className="text-[9px] text-yellow-500">★</span>

                      <span className="text-[9px] text-slate-400">
                        {product.rating
                          ? Number(product.rating).toFixed(1)
                          : "New"}{" "}
                        ({product.reviews_count || 0})
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-xs font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>

                      {product.original_price > product.price && (
                        <span className="text-[9px] text-slate-400 line-through">
                          {formatPrice(product.original_price)}
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* DOTS */}

      {products.length > 1 && (
        <div className="mt-3 flex justify-center gap-1">
          {products.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => emblaApi?.scrollTo(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === selectedIndex
                  ? "w-5 bg-primary"
                  : "w-1.5 bg-slate-300"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

// FILTER

type FilterSidebarProps = {
  categories: any[];
  brands: any[];

  category: string;
  brand: string;
  grade: string;
  condition: string;

  minPrice: string;
  maxPrice: string;

  setCategory: (value: string) => void;
  setBrand: (value: string) => void;
  setGrade: (value: string) => void;
  setCondition: (value: string) => void;

  setMinPrice: (value: string) => void;
  setMaxPrice: (value: string) => void;

  onReset: () => void;
};

const FilterSidebar = ({
  categories,
  brands,
  category,
  brand,
  grade,
  condition,
  minPrice,
  maxPrice,
  setCategory,
  setBrand,
  setGrade,
  setCondition,
  setMinPrice,
  setMaxPrice,
  onReset,
}: FilterSidebarProps) => {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* HEADER */}

      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
        <h2 className="text-sm font-bold text-slate-900">Filter</h2>

        <button
          type="button"
          onClick={onReset}
          className="text-[10px] font-semibold text-primary hover:opacity-80"
        >
          Clear All
        </button>
      </div>

      {/* CATEGORY */}

      <div className="border-b border-slate-100 p-4">
        <h3 className="mb-3 text-[11px] font-bold text-slate-800">
          Category
        </h3>

        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2 text-[11px] text-slate-600">
            <input
              type="radio"
              name="category"
              checked={!category}
              onChange={() => setCategory("")}
              className="accent-primary"
            />

            All Categories
          </label>

          {categories.slice(0, 8).map((item) => (
            <label
              key={item.id}
              className="flex cursor-pointer items-center gap-2 text-[11px] text-slate-600"
            >
              <input
                type="radio"
                name="category"
                checked={category === String(item.id)}
                onChange={() => setCategory(String(item.id))}
                className="accent-primary"
              />

              <span>{item.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* BRAND */}

      <div className="border-b border-slate-100 p-4">
        <h3 className="mb-3 text-[11px] font-bold text-slate-800">
          Brand
        </h3>

        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-slate-400" />

          <input
            placeholder="Search brand..."
            className="h-8 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-2 text-[10px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>

        <div className="max-h-32 space-y-2 overflow-y-auto">
          {brands.map((item) => (
            <label
              key={item.id}
              className="flex cursor-pointer items-center gap-2 text-[11px] text-slate-600"
            >
              <input
                type="radio"
                name="brand"
                checked={brand === String(item.id)}
                onChange={() => setBrand(String(item.id))}
                className="accent-primary"
              />

              {item.name}
            </label>
          ))}
        </div>
      </div>

      {/* PRICE */}

      <div className="border-b border-slate-100 p-4">
        <h3 className="mb-3 text-[11px] font-bold text-slate-800">
          Price Range
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
            className="h-8 rounded-lg border border-slate-200 px-2 text-[10px] outline-none focus:border-primary"
          />

          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
            className="h-8 rounded-lg border border-slate-200 px-2 text-[10px] outline-none focus:border-primary"
          />
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {[
            ["₦50k–₦100k", "50000", "100000"],
            ["₦100k–₦500k", "100000", "500000"],
            ["₦500k–₦1M", "500000", "1000000"],
            ["₦1M+", "1000000", ""],
          ].map(([label, min, max]) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setMinPrice(min);
                setMaxPrice(max);
              }}
              className="rounded-md border border-slate-200 px-1.5 py-1 text-[8px] text-slate-500 transition hover:border-primary hover:bg-primary/5 hover:text-primary"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* GRADE */}

      <div className="border-b border-slate-100 p-4">
        <h3 className="mb-3 text-[11px] font-bold text-slate-800">
          Grade
        </h3>

        <select
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-[10px] outline-none focus:border-primary"
        >
          <option value="">All Grades</option>
          <option value="New">New</option>
          <option value="A">Grade A</option>
          <option value="B">Grade B</option>
          <option value="C">Grade C</option>
        </select>
      </div>

      {/* CONDITION */}

      <div className="p-4">
        <h3 className="mb-3 text-[11px] font-bold text-slate-800">
          Condition
        </h3>

        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-[10px] outline-none focus:border-primary"
        >
          <option value="">All Conditions</option>
          <option value="Original">Original</option>
          <option value="Refurbished">Refurbished</option>
        </select>
      </div>
    </aside>
  );
};

/* =========================================================
   MAIN PRODUCTS PAGE
========================================================= */

const Products = () => {
  const [params] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [flashDeals, setFlashDeals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [flashLoading, setFlashLoading] = useState(true);

  /* FILTERS */

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState(
    params.get("category") || ""
  );

  const [brand, setBrand] = useState("");
  const [grade, setGrade] = useState("");
  const [condition, setCondition] = useState("");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  /* UI */

  const [sortBy, setSortBy] = useState("newest");

  const [viewMode, setViewMode] =
    useState<"grid" | "list">("grid");

  const [mobileFilters, setMobileFilters] =
    useState(false);

  const [page, setPage] = useState(1);

  const perPage = 10;

  /* =========================================================
     FETCH PRODUCTS
  ========================================================= */

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API}/products`, {
        params: {
          search: search || undefined,
          category: category || undefined,
          brand: brand || undefined,
          grade: grade || undefined,
          condition: condition || undefined,
        },
      });

      setProducts(res.data.data ?? res.data ?? []);
    } catch (error) {
      console.error("PRODUCT API ERROR:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [
    search,
    category,
    brand,
    grade,
    condition,
  ]);

  /* =========================================================
     FETCH FLASH DEALS
  ========================================================= */

  const fetchFlashDeals = useCallback(async () => {
    try {
      setFlashLoading(true);

      const res = await axios.get(`${API}/products`, {
        params: {
          is_flash_deal: 1,
        },
      });

      const data = res.data.data ?? res.data ?? [];

      const deals = data.filter(
        (product: Product) =>
          product.is_flash_deal === true ||
          product.is_flash_deal === 1 ||
          product.is_flash_deal === "1"
      );

      setFlashDeals(deals);
    } catch (error) {
      console.error("FLASH DEAL API ERROR:", error);
      setFlashDeals([]);
    } finally {
      setFlashLoading(false);
    }
  }, []);

  /* =========================================================
     FETCH CATEGORIES + BRANDS
  ========================================================= */

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [categoryRes, brandRes] =
          await Promise.all([
            axios.get(`${API}/categories`),
            axios.get(`${API}/brands`),
          ]);

        setCategories(
          categoryRes.data.data ??
            categoryRes.data ??
            []
        );

        setBrands(
          brandRes.data.data ??
            brandRes.data ??
            []
        );
      } catch (error) {
        console.error("FILTER API ERROR:", error);
      }
    };

    loadFilters();
  }, []);

  /* =========================================================
     INITIAL FLASH DEALS
  ========================================================= */

  useEffect(() => {
    fetchFlashDeals();
  }, [fetchFlashDeals]);

  /* =========================================================
     PRODUCTS SEARCH / FILTER
  ========================================================= */

  useEffect(() => {
    const timer = setTimeout(
      () => {
        fetchProducts();
      },
      search ? 400 : 0
    );

    return () => clearTimeout(timer);
  }, [fetchProducts, search]);

  /* =========================================================
     FILTER + SORT
  ========================================================= */

  const filtered = useMemo(() => {
    let result = [...products];

    if (minPrice) {
      result = result.filter(
        (product) =>
          Number(product.price) >= Number(minPrice)
      );
    }

    if (maxPrice) {
      result = result.filter(
        (product) =>
          Number(product.price) <= Number(maxPrice)
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;

        case "price-high":
          return b.price - a.price;

        case "discount":
          return (
            (b.discount_percentage || 0) -
            (a.discount_percentage || 0)
          );

        case "rating":
          return (
            (b.rating || 0) -
            (a.rating || 0)
          );

        case "newest":
        default:
          return (
            new Date(
              b.created_at || 0
            ).getTime() -
            new Date(
              a.created_at || 0
            ).getTime()
          );
      }
    });

    return result;
  }, [
    products,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages = Math.ceil(
    filtered.length / perPage
  );

  const visibleProducts = filtered.slice(
    (page - 1) * perPage,
    page * perPage
  );

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setBrand("");
    setGrade("");
    setCondition("");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  };

  /* RESET PAGE WHEN FILTER CHANGES */

  useEffect(() => {
    setPage(1);
  }, [
    search,
    category,
    brand,
    grade,
    condition,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  return (
    <div className="min-h-screen bg-[#f8fafb]">
      <Navbar />

      <main className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">

        {/* HERO */}

        <section className="relative mb-5 min-h-[190px] overflow-hidden rounded-2xl bg-gradient-to-r from-primary/15 via-primary/5 to-primary/15 px-5 py-6 sm:px-8 sm:py-8">

          <div className="relative z-10 max-w-[390px]">
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-primary">
              AESTRA DEALS
            </span>

            <h1 className="mt-1 text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
              Top Deals on
              <br />
              Your Favorite Gadgets
            </h1>

            <p className="mt-2 max-w-[330px] text-[10px] leading-5 text-slate-500 sm:text-[11px]">
              Get the best prices on phones, laptops,
              smartwatches and more. Shop now and save big.
            </p>

            <Link
              to="/products"
              className="mt-4 inline-flex items-center rounded-lg bg-primary px-4 py-2.5 text-[10px] font-bold text-white shadow-sm transition hover:opacity-90"
            >
              Shop Now
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>

          {/* HERO IMAGE */}

          <div className="absolute right-0 top-0 hidden h-full w-[62%] lg:block">
            <img
              src="/hero-gadgets.png"
              alt="Gadgets"
              className="h-full w-full object-contain object-right"
            />
          </div>
        </section>

        <div className="mb-6 flex gap-5 overflow-x-auto pb-1 scrollbar-hide">
          {[
            ["📱", "Phones", "phones"],
            ["💻", "Laptops", "laptops"],
            ["🎧", "Headphones", "headphones"],
            ["⌚", "Smart Watches", "smart-watches"],
            ["🔌", "Accessories", "accessories"],
            ["🔊", "Speakers", "speakers"],
            ["📷", "Cameras", "cameras"],
            ["📺", "TV & Home", "tv"],
            ["🎮", "Gaming", "gaming"],
          ].map(([icon, name, slug]) => (
            <Link
              key={name}
              to={`/products?category=${slug}`}
              className="group flex min-w-[68px] flex-col items-center gap-1.5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg shadow-sm transition-all group-hover:border-primary/40 group-hover:bg-primary/5 group-hover:shadow-md">
                {icon}
              </div>

              <span className="whitespace-nowrap text-[9px] font-medium text-slate-600 group-hover:text-primary">
                {name}
              </span>
            </Link>
          ))}
        </div>

        {/* ===================================================
            FLASH DEALS
        =================================================== */}

        {!flashLoading && (
          <FlashDeals products={flashDeals} />
        )}

        {/* ===================================================
            SHOP AREA
        =================================================== */}

        <div className="grid gap-6 lg:grid-cols-[210px_1fr]">

          {/* DESKTOP FILTER */}

          <div className="hidden lg:block">
            <FilterSidebar
              categories={categories}
              brands={brands}
              category={category}
              brand={brand}
              grade={grade}
              condition={condition}
              minPrice={minPrice}
              maxPrice={maxPrice}
              setCategory={setCategory}
              setBrand={setBrand}
              setGrade={setGrade}
              setCondition={setCondition}
              setMinPrice={setMinPrice}
              setMaxPrice={setMaxPrice}
              onReset={resetFilters}
            />
          </div>

          {/* PRODUCTS */}

          <section className="min-w-0">

            {/* PRODUCT HEADER */}

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  All Products
                </h2>

                <p className="text-[10px] text-slate-400">
                  Showing{" "}
                  <span className="font-medium text-slate-500">
                    {visibleProducts.length}
                  </span>{" "}
                  of {filtered.length} products
                </p>
              </div>

              <div className="flex items-center gap-2">

                {/* MOBILE FILTER */}

                <button
                  type="button"
                  onClick={() =>
                    setMobileFilters(true)
                  }
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-600 shadow-sm lg:hidden"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filter
                </button>

                {/* SORT */}

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value)
                    }
                    className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-[10px] font-medium text-slate-600 shadow-sm outline-none focus:border-primary"
                  >
                    <option value="newest">
                      Newest
                    </option>

                    <option value="price-low">
                      Price: Low to High
                    </option>

                    <option value="price-high">
                      Price: High to Low
                    </option>

                    <option value="discount">
                      Biggest Discount
                    </option>

                    <option value="rating">
                      Highest Rated
                    </option>
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
                </div>

                {/* VIEW MODE */}

                <div className="hidden rounded-lg border border-slate-200 bg-white p-1 shadow-sm sm:flex">
                  <button
                    type="button"
                    onClick={() =>
                      setViewMode("grid")
                    }
                    className={`rounded-md p-1.5 ${
                      viewMode === "grid"
                        ? "bg-primary text-white"
                        : "text-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    <Grid2X2 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setViewMode("list")
                    }
                    className={`rounded-md p-1.5 ${
                      viewMode === "list"
                        ? "bg-primary text-white"
                        : "text-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (
              <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
                <div className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />

                  <p className="mt-3 text-xs text-slate-400">
                    Loading products...
                  </p>
                </div>
              </div>
            ) : visibleProducts.length ? (

              /* =================================================
                 PRODUCT GRID
              ================================================= */

              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                    : "grid grid-cols-1 gap-4"
                }
              >
                {visibleProducts.map(
                  (product, index) => (
                    <ProductCard
                      key={product.id}
                      product={{
                        id: product.id,
                        condition: product.condition,
                        grade: product.grade,
                        discount_percentage:
                          product.discount_percentage,
                        brand: product.brand,
                        name: product.name,
                        price: product.price,
                        rating: product.rating,
                        reviews_count:
                          product.reviews_count,
                        image: getImageUrl(product),
                      }}
                      index={index}
                    />
                  )
                )}
              </div>

            ) : (

              /* =================================================
                 EMPTY STATE
              ================================================= */

              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Search className="h-6 w-6 text-primary" />
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-900">
                  No products found
                </h3>

                <p className="mt-1 max-w-sm text-xs text-slate-400">
                  We couldn't find products matching
                  your current search or filters.
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 rounded-lg bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:opacity-90"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* =================================================
                PAGINATION
            ================================================= */}

            {totalPages > 1 && (
              <div className="mt-7 flex items-center justify-center gap-1.5">

                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() =>
                    setPage((p) => p - 1)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, i) => i + 1
                )
                  .slice(0, 7)
                  .map((number) => (
                    <button
                      key={number}
                      type="button"
                      onClick={() =>
                        setPage(number)
                      }
                      className={`h-8 min-w-8 rounded-lg px-2 text-[10px] font-semibold transition ${
                        page === number
                          ? "bg-primary text-white shadow-sm"
                          : "border border-slate-200 bg-white text-slate-500 hover:border-primary hover:text-primary"
                      }`}
                    >
                      {number}
                    </button>
                  ))}

                <button
                  type="button"
                  disabled={
                    page === totalPages
                  }
                  onClick={() =>
                    setPage((p) => p + 1)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* =====================================================
          MOBILE FILTER DRAWER
      ===================================================== */}

      {mobileFilters && (
        <div className="fixed inset-0 z-[100] lg:hidden">

          {/* BACKDROP */}

          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() =>
              setMobileFilters(false)
            }
          />

          {/* DRAWER */}

          <div className="absolute right-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto bg-slate-50 p-4 shadow-2xl">

            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900">
                  Filters
                </h2>

                <p className="text-[10px] text-slate-400">
                  Refine your products
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMobileFilters(false)
                }
                className="rounded-full bg-white p-2 shadow-sm"
              >
                <X className="h-4 w-4 text-slate-600" />
              </button>
            </div>

            <FilterSidebar
              categories={categories}
              brands={brands}
              category={category}
              brand={brand}
              grade={grade}
              condition={condition}
              minPrice={minPrice}
              maxPrice={maxPrice}
              setCategory={setCategory}
              setBrand={setBrand}
              setGrade={setGrade}
              setCondition={setCondition}
              setMinPrice={setMinPrice}
              setMaxPrice={setMaxPrice}
              onReset={resetFilters}
            />

            <button
              type="button"
              onClick={() =>
                setMobileFilters(false)
              }
              className="mt-3 w-full rounded-xl bg-primary py-3 text-xs font-bold text-white shadow-sm transition hover:opacity-90"
            >
              Show Products
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;