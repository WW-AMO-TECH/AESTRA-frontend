import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import {
  Search,
  SlidersHorizontal,
  Zap,
  Loader2,
  ShieldCheck,
  LockKeyhole,
  RotateCcw,
  Truck,
  Heart,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Star,
  Grid2X2,
  List,
  X,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
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
   IMAGE URL HELPER
========================================================= */

const getImageUrl = (product?: Product) => {
  const image = product?.images?.[0]?.image_url;

  if (!image) {
    return "/placeholder.png";
  }

  if (image.startsWith("http")) {
    return image;
  }

  return `https://aestra.onrender.com${image}`;
};

/* =========================================================
   FLASH DEALS
   IMPORTANT:
   This receives flashDeals separately from normal products.
   Search/filter will NOT affect this section.
========================================================= */

const ProductsFlashDeals = ({
  products,
}: {
  products: Product[];
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: products.length > 4,
      align: "start",
      skipSnaps: false,
    },
    [
      Autoplay({
        delay: 4000,
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

  const onSelect = useCallback(() => {
    if (!emblaApi) return;

    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on("select", onSelect);

    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!products.length) {
    return null;
  }

  return (
    <section className="relative mb-8 overflow-hidden rounded-3xl border border-green-100 bg-gradient-to-br from-primary/30 via-green-100 to-primary/30 p-5 shadow-sm md:p-6">

      {/* =====================================================
          FLASH DEAL HEADER
      ===================================================== */}

      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-300 shadow-lg shadow-green-200">
            <Zap className="h-5 w-5 fill-white text-white" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                Flash Deals
              </h2>
              <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-500">
                LIMITED TIME
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Grab these amazing deals before they disappear.
            </p>
          </div>

        </div>

        {/* COUNTDOWN */}

        <div className="flex items-center gap-2">
          <span className="hidden text-xs font-medium text-slate-500 sm:block">
            Ends in
          </span>

          {[
            ["02", "Days"],
            ["15", "Hrs"],
            ["47", "Min"],
            ["32", "Sec"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="text-center"
            >
              <div className="flex h-9 min-w-[38px] items-center justify-center rounded-lg bg-white px-2 text-sm font-bold text-green-600 shadow-sm">
                {value}
              </div>
              <span className="mt-1 block text-[8px] text-slate-400">
                {label}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* =====================================================
          CAROUSEL
      ===================================================== */}

      <div className="relative">

        {/* PREVIOUS */}

        <button
          type="button"
          onClick={scrollPrev}
          className="absolute left-0 top-1/2 z-20 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg transition hover:scale-105 hover:bg-slate-50 lg:flex"
        >
          <ChevronLeft className="h-5 w-5 text-slate-700" />
        </button>

        {/* NEXT */}

        <button
          type="button"
          onClick={scrollNext}
          className="absolute right-0 top-1/2 z-20 hidden h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg transition hover:scale-105 hover:bg-slate-50 lg:flex"
        >
          <ChevronRight className="h-5 w-5 text-slate-700" />
        </button>

        <div
          ref={emblaRef}
          className="overflow-hidden"
        >
          <div className="-ml-3 flex">

            {products.map((product) => {

              const discount =
                product.discount_percentage || 0;

              const stock =
                product.stock ?? 20;

              return (
                <div
                  key={product.id}
                  className="min-w-0 flex-[0_0_88%] pl-3 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%]"
                >

                  <Link
                    to={`/products/${product.id}`}
                    className="group block overflow-hidden rounded-2xl border border-slate-200 bg-primary/20 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-green-100 hover:shadow-xl"
                  >

                    {/* IMAGE */}

                    <div className="relative mb-3 flex h-40 items-center justify-center overflow-hidden rounded-xl bg-slate-50">

                      {discount > 0 && (
                        <span className="absolute left-2 top-2 z-10 rounded-full bg-green-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                          -{discount}%
                        </span>
                      )}

                      {/* WISHLIST */}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition hover:bg-green-50"
                      >
                        <Heart className="h-4 w-4 text-slate-500" />
                      </button>

                      <img
                        src={getImageUrl(product)}
                        alt={product.name}
                        className="h-full w-full object-contain p-5 transition duration-500 group-hover:scale-110"
                      />

                    </div>

                    {/* PRODUCT NAME */}

                    <h3 className="line-clamp-2 min-h-[40px] text-sm font-semibold text-slate-800">
                      {product.name}
                    </h3>

                    {/* RATING */}
                    {product.rating !== null &&
                      product.rating !== undefined &&
                      product.reviews_count &&
                      product.reviews_count > 0 ? (
                        <div className="mb-2 flex items-center gap-1 md:mb-0">

                          <div className="flex items-center">
                            {Array.from({
                              length: Math.round(product.rating),
                            }).map((_, index) => (
                              <span
                                key={index}
                                className="text-[11px] leading-none text-yellow-400 md:text-sm"
                              >
                                ★
                              </span>
                            ))}
                          </div>

                          <span className="text-[10px] font-medium text-slate-500 md:text-xs">
                            ({product.reviews_count})
                          </span>

                        </div>
                      ) : (
                        <p className="mb-2 text-[10px] font-medium text-slate-400 md:mb-0">
                          No ratings
                        </p>
                      )}

                    {/* PRICE */}

                    <div className="mt-2 flex items-center gap-2">

                      <span className="text-base font-bold text-green-600">
                        {formatPrice(product.price)}
                      </span>

                      {product.original_price >
                        product.price && (
                        <span className="text-[11px] text-slate-400 line-through">
                          {formatPrice(
                            product.original_price
                          )}
                        </span>
                      )}

                    </div>

                    {/* STOCK */}

                    <div className="mt-3">

                      <div className="flex items-center justify-between text-[10px] text-slate-400">

                        <span>
                          Limited stock
                        </span>

                        <span className="font-medium text-slate-600">
                          {stock} left
                        </span>

                      </div>

                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">

                        <div
                          className="h-full rounded-full bg-green-500 transition-all"
                          style={{
                            width: `${Math.min(
                              Math.max(
                                100 - stock,
                                10
                              ),
                              90
                            )}%`,
                          }}
                        />

                      </div>

                    </div>

                  </Link>

                </div>
              );
            })}

          </div>

        </div>
      </div>

      {/* =====================================================
          DOTS
      ===================================================== */}

      {products.length > 1 && (
        <div className="mt-5 flex justify-center gap-1.5">

          {products.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() =>
                emblaApi?.scrollTo(index)
              }
              className={`h-1.5 rounded-full transition-all ${
                index === selectedIndex
                  ? "w-6 bg-green-600"
                  : "w-1.5 bg-slate-300"
              }`}
            />
          ))}

        </div>
      )}

    </section>
  );
};

/* =========================================================
   SERVICE BENEFITS
========================================================= */

const ServiceBenefits = () => {

  const benefits = [
    {
      icon: ShieldCheck,
      title: "100% Original",
      description: "Genuine products",
    },
    {
      icon: LockKeyhole,
      title: "Secure Payment",
      description: "100% secure checkout",
    },
    {
      icon: RotateCcw,
      title: "7 Days Return",
      description: "Easy return policy",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Nationwide delivery",
    },
  ];
};

/* =========================================================
   FILTER SIDEBAR
========================================================= */

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
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

      {/* HEADER */}

      <div className="mb-5 flex items-center justify-between">

        <h2 className="font-bold text-slate-900">
          Filters
        </h2>

        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-green-600 hover:text-green-700"
        >
          Clear All
        </button>

      </div>

      {/* =====================================================
          CATEGORIES
      ===================================================== */}

      <div className="border-b border-slate-100 pb-5">

        <h3 className="mb-3 text-xs font-bold text-slate-800">
          Categories
        </h3>

        <div className="space-y-1">

          <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-green-50 px-2 py-2">

            <input
              type="radio"
              name="category"
              checked={!category}
              onChange={() =>
                setCategory("")
              }
              className="accent-green-600"
            />

            <span className="text-xs font-semibold text-green-700">
              All Categories
            </span>

          </label>

          {categories.map((item) => (

            <label
              key={item.id}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-slate-50"
            >

              <input
                type="radio"
                name="category"
                value={item.id}
                checked={
                  category ===
                  String(item.id)
                }
                onChange={() =>
                  setCategory(
                    String(item.id)
                  )
                }
                className="accent-green-600"
              />

              <span className="text-xs text-slate-600">
                {item.name}
              </span>

            </label>

          ))}

        </div>

      </div>

      {/* =====================================================
          BRAND
      ===================================================== */}

      <div className="border-b border-slate-100 py-5">

        <h3 className="mb-3 text-xs font-bold text-slate-800">
          Brand
        </h3>

        <div className="relative mb-3">

          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />

          <input
            placeholder="Search brand..."
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-xs outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
          />

        </div>

        <div className="max-h-40 space-y-1 overflow-y-auto">

          {brands.map((item) => (

            <label
              key={item.id}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-1 py-1.5 hover:bg-slate-50"
            >

              <input
                type="radio"
                name="brand"
                value={item.id}
                checked={
                  brand ===
                  String(item.id)
                }
                onChange={() =>
                  setBrand(
                    String(item.id)
                  )
                }
                className="accent-green-600"
              />

              <span className="text-xs text-slate-600">
                {item.name}
              </span>

            </label>

          ))}

        </div>

      </div>

      {/* =====================================================
          PRICE
      ===================================================== */}

      <div className="border-b border-slate-100 py-5">

        <h3 className="mb-3 text-xs font-bold text-slate-800">
          Price Range
        </h3>

        <div className="grid grid-cols-2 gap-2">

          <input
            type="number"
            value={minPrice}
            onChange={(e) =>
              setMinPrice(e.target.value)
            }
            placeholder="Min price"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-green-500"
          />

          <input
            type="number"
            value={maxPrice}
            onChange={(e) =>
              setMaxPrice(e.target.value)
            }
            placeholder="Max price"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-green-500"
          />

        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">

          {[
            ["₦50k - ₦100k", "50000", "100000"],
            ["₦100k - ₦500k", "100000", "500000"],
            ["₦500k - ₦1M", "500000", "1000000"],
            ["₦1M+", "1000000", ""],
          ].map(([label, min, max]) => (

            <button
              key={label}
              type="button"
              onClick={() => {
                setMinPrice(min);
                setMaxPrice(max);
              }}
              className="rounded-md border border-slate-200 px-2 py-1 text-[10px] text-slate-600 transition hover:border-green-500 hover:bg-green-50 hover:text-green-700"
            >
              {label}
            </button>

          ))}

        </div>

      </div>

      {/* =====================================================
          GRADE
      ===================================================== */}

      <div className="border-b border-slate-100 py-5">

        <h3 className="mb-3 text-xs font-bold text-slate-800">
          Grade
        </h3>

        <select
          value={grade}
          onChange={(e) =>
            setGrade(e.target.value)
          }
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-green-500"
        >

          <option value="">
            All Grades
          </option>

          <option value="New">
            New
          </option>

          <option value="A">
            Grade A
          </option>

          <option value="B">
            Grade B
          </option>

          <option value="C">
            Grade C
          </option>

        </select>

      </div>

      {/* =====================================================
          CONDITION
      ===================================================== */}

      <div className="py-5">

        <h3 className="mb-3 text-xs font-bold text-slate-800">
          Condition
        </h3>

        <select
          value={condition}
          onChange={(e) =>
            setCondition(e.target.value)
          }
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-green-500"
        >

          <option value="">
            All Conditions
          </option>

          <option value="Original">
            Original
          </option>

          <option value="Refurbished">
            Refurbished
          </option>

        </select>

      </div>

      {/* APPLY */}

      <button
        type="button"
        className="w-full rounded-lg bg-green-600 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-green-700 hover:shadow-md"
      >
        Apply Filters
      </button>

    </aside>
  );
};

/* =========================================================
   MAIN PRODUCTS PAGE
========================================================= */

const Products = () => {

  const [params] = useSearchParams();

  /* =====================================================
     PRODUCT DATA
  ===================================================== */

  const [products, setProducts] =
    useState<Product[]>([]);

  /*
   * IMPORTANT:
   * Flash deals are stored separately.
   * Search/filter NEVER modifies this array.
   */
  const [flashDeals, setFlashDeals] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<any[]>([]);

  const [brands, setBrands] =
    useState<any[]>([]);

  /* =====================================================
     LOADING
  ===================================================== */

  const [loading, setLoading] =
    useState(true);

  const [flashDealsLoading, setFlashDealsLoading] =
    useState(true);

  /* =====================================================
     FILTER STATES
  ===================================================== */

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState(
      params.get("category") || ""
    );

  const [brand, setBrand] =
    useState("");

  const [grade, setGrade] =
    useState("");

  const [condition, setCondition] =
    useState("");

  const [minPrice, setMinPrice] =
    useState("");

  const [maxPrice, setMaxPrice] =
    useState("");

  /* =====================================================
     UI STATES
  ===================================================== */

  const [showMobileFilters, setShowMobileFilters] =
    useState(false);

  const [sortBy, setSortBy] =
    useState("newest");

  const [viewMode, setViewMode] =
    useState<"grid" | "list">("grid");

  /* =====================================================
     FETCH NORMAL PRODUCTS
  ===================================================== */

  const fetchProducts = useCallback(async () => {

    try {

      setLoading(true);

      const res = await axios.get(
        `${API}/products`,
        {
          params: {
            search:
              search || undefined,

            category:
              category || undefined,

            brand:
              brand || undefined,

            grade:
              grade || undefined,

            condition:
              condition || undefined,
          },
        }
      );

      setProducts(
        res.data.data ??
          res.data ??
          []
      );

    } catch (err) {

      if (axios.isAxiosError(err)) {

        console.error(
          "PRODUCT API ERROR:",
          {
            status:
              err.response?.status,

            data:
              err.response?.data,

            url:
              err.config?.url,
          }
        );

      } else {

        console.error(err);

      }

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

  /* =====================================================
     FETCH FLASH DEALS
     
     THIS REQUEST IS COMPLETELY SEPARATE FROM SEARCH.
  ===================================================== */

  const fetchFlashDeals = useCallback(async () => {

    try {

      setFlashDealsLoading(true);

      const res = await axios.get(
        `${API}/products`,
        {
          params: {
            is_flash_deal: 1,
          },
        }
      );

      const data =
        res.data.data ??
        res.data ??
        [];

      const deals = data.filter(
        (product: Product) =>
          product.is_flash_deal === true ||
          product.is_flash_deal === 1 ||
          product.is_flash_deal === "1"
      );

      setFlashDeals(deals);

    } catch (err) {

      if (axios.isAxiosError(err)) {

        console.error(
          "FLASH DEAL API ERROR:",
          {
            status:
              err.response?.status,

            data:
              err.response?.data,

            url:
              err.config?.url,
          }
        );

      } else {

        console.error(err);

      }

      setFlashDeals([]);

    } finally {

      setFlashDealsLoading(false);

    }

  }, []);

  /* =====================================================
     FETCH CATEGORIES & BRANDS
  ===================================================== */

  useEffect(() => {

    const loadFilters =
      async () => {

        try {

          const [
            categoryRes,
            brandRes,
          ] = await Promise.all([
            axios.get(
              `${API}/categories`
            ),

            axios.get(
              `${API}/brands`
            ),
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

          console.error(
            "FILTER API ERROR:",
            error
          );

        }

      };

    loadFilters();

  }, []);

  /* =====================================================
     FETCH FLASH DEALS ONCE
     
     It does NOT depend on search.
  ===================================================== */

  useEffect(() => {

    fetchFlashDeals();

  }, [fetchFlashDeals]);

  /* =====================================================
     FETCH PRODUCTS WHEN SEARCH/FILTERS CHANGE
  ===================================================== */

  useEffect(() => {

    const timer =
      setTimeout(
        () => {
          fetchProducts();
        },
        search ? 400 : 0
      );

    return () =>
      clearTimeout(timer);

  }, [
    fetchProducts,
    search,
  ]);

  /* =====================================================
     PRICE FILTER + SORT
  ===================================================== */

  const filtered = useMemo(() => {

    let result = [
      ...products,
    ];

    const min =
      Number(minPrice);

    const max =
      Number(maxPrice);

    if (minPrice) {

      result =
        result.filter(
          (product) =>
            Number(product.price) >=
            min
        );

    }

    if (maxPrice) {

      result =
        result.filter(
          (product) =>
            Number(product.price) <=
            max
        );

    }

    switch (sortBy) {

      case "price-low":

        result.sort(
          (a, b) =>
            a.price - b.price
        );

        break;

      case "price-high":

        result.sort(
          (a, b) =>
            b.price - a.price
        );

        break;

      case "discount":

        result.sort(
          (a, b) =>
            (b.discount_percentage || 0) -
            (a.discount_percentage || 0)
        );

        break;

      case "rating":

        result.sort(
          (a, b) =>
            (b.rating || 0) -
            (a.rating || 0)
        );

        break;

      case "newest":

      default:

        result.sort(
          (a, b) => {

            const dateA =
              new Date(
                a.created_at || 0
              ).getTime();

            const dateB =
              new Date(
                b.created_at || 0
              ).getTime();

            return dateB - dateA;
          }
        );

        break;

    }

    return result;

  }, [
    products,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  /* =====================================================
     RESET FILTERS
  ===================================================== */

  const resetFilters = () => {

    setSearch("");

    setCategory("");

    setBrand("");

    setGrade("");

    setCondition("");

    setMinPrice("");

    setMaxPrice("");

  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="min-h-screen bg-slate-50">

      <Navbar />

      <main className="container mx-auto px-4 py-6">

        {/* TITLE + MOBILE SEARCH */}

        <div className="mb-6">

          {/* MOBILE SEARCH + FILTER BUTTON */}

          <div className="flex items-center gap-2 md:hidden">
            {/* SEARCH */}

            <div className="relative min-w-0 flex-1">

              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-600" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search products..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-slate-400 transition hover:text-slate-600" />
                </button>
              )}
            </div>

            {/* FILTER BUTTON */}
            <button
              type="button"
              onClick={() =>
                setShowMobileFilters(true)
              }
              className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-green-600 bg-white px-4 text-sm font-semibold text-green-600 transition hover:bg-green-50">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden xs:inline">
                Filters
              </span>
            </button>
          </div>
        </div>

        {/* =================================================
            FLASH DEALS
             
            NOTICE:
            This uses flashDeals.
            It does NOT use products.
        ================================================= */}

        {!flashDealsLoading && (
          <ProductsFlashDeals
            products={flashDeals}
          />
        )}

        {/* =================================================
            SHOP CONTENT
        ================================================= */}

        <div className="grid gap-5 lg:grid-cols-[250px_1fr]">

          {/* =================================================
              DESKTOP FILTER
          ================================================= */}

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

          {/* =================================================
              PRODUCTS
          ================================================= */}

          <section className="min-w-0">

            {/* PRODUCT TOOLBAR */}

            <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">

              <p className="text-xs text-slate-500">

                Showing{" "}

                <span className="font-semibold text-slate-800">
                  {filtered.length}
                </span>{" "}

                products

              </p>

              <div className="flex items-center justify-between gap-3 sm:justify-end">

                {/* SORT */}

                <div className="flex items-center gap-2">

                  <span className="hidden text-xs text-slate-500 sm:block">
                    Sort by:
                  </span>

                  <div className="relative">

                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(
                          e.target.value
                        )
                      }
                      className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-slate-700 outline-none focus:border-green-500"
                    >

                      <option value="newest">
                        Newest First
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

                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                  </div>

                </div>

                {/* VIEW MODE */}

                <div className="hidden items-center rounded-lg border border-slate-200 p-1 sm:flex">

                  <button
                    type="button"
                    onClick={() =>
                      setViewMode("grid")
                    }
                    className={`rounded-md p-1.5 ${
                      viewMode === "grid"
                        ? "bg-green-600 text-white"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <Grid2X2 className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setViewMode("list")
                    }
                    className={`rounded-md p-1.5 ${
                      viewMode === "list"
                        ? "bg-green-600 text-white"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>

                </div>

              </div>

            </div>

            {/* =================================================
                PRODUCT GRID
            ================================================= */}

            {loading ? (

              <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white">

                <div className="text-center">

                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-green-600" />

                  <p className="mt-3 text-sm text-slate-500">
                    Loading products...
                  </p>

                </div>

              </div>

            ) : filtered.length ? (

              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4"
                    : "grid grid-cols-1 gap-4"
                }
              >

                {filtered.map(
                  (
                    product,
                    index
                  ) => (

                    <ProductCard
                      key={
                        product.id
                      }
                      product={{
                        id:
                          product.id,

                        condition:
                          product.condition,

                        grade:
                          product.grade,

                        discount_percentage:
                          product.discount_percentage,

                        brand:
                          product.brand,

                        name:
                          product.name,

                        price:
                          product.price,

                        rating:
                          product.rating,

                        reviews_count:
                          product.reviews_count,

                        image:
                          getImageUrl(
                            product
                          ),
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

                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">

                  <Search className="h-6 w-6 text-green-600" />

                </div>

                <h3 className="font-bold text-slate-900">
                  No products found
                </h3>

                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  We couldn't find any products
                  matching your current search
                  or filters.
                </p>

                <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                  className="mt-5 rounded-lg bg-green-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-green-700"
                >
                  Clear Filters
                </button>

              </div>

            )}

          </section>

        </div>

      </main>

      {/* =====================================================
          MOBILE FILTER DRAWER
      ===================================================== */}

      {showMobileFilters && (

        <div className="fixed inset-0 z-[100] lg:hidden">

          {/* BACKDROP */}

          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() =>
              setShowMobileFilters(
                false
              )
            }
          />

          {/* DRAWER */}

          <div className="absolute right-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto bg-slate-50 p-4 shadow-2xl">

            <div className="mb-4 flex items-center justify-between">

              <div>

                <h2 className="font-bold text-slate-900">
                  Filters
                </h2>

                <p className="text-xs text-slate-500">
                  Refine your products
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowMobileFilters(
                    false
                  )
                }
                className="rounded-full bg-white p-2 shadow-sm"
              >
                <X className="h-4 w-4" />
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
              setCondition={
                setCondition
              }
              setMinPrice={
                setMinPrice
              }
              setMaxPrice={
                setMaxPrice
              }
              onReset={
                resetFilters
              }
            />

            <button
              type="button"
              onClick={() =>
                setShowMobileFilters(
                  false
                )
              }
              className="mt-4 w-full rounded-xl bg-green-600 py-3 text-sm font-bold text-white shadow-lg shadow-green-100 transition hover:bg-green-700"
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