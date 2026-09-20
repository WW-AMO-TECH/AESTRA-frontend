import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "@/api/axios";
import {
  ShoppingCart,
  Heart,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShieldCheck,
  Truck,
  RotateCcw,
  LockKeyhole,
  Zap,
  Check,
  Star,
  Info,
  Minus,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import ProductReviews from "@/components/ProductReviews";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const BASE_URL = API_URL.replace(/\/api\/?$/, "");

type ImageItem = {
  id?: number;
  image?: string | null;
  image_url?: string | null;
  url?: string | null;
  path?: string | null;
  is_primary?: boolean;
  sort_order?: number;
};

type Variant = {
  id?: number;
  sku?: string;
  name?: string;
  color?: string;
  storage?: string;
  ram?: string;
  original_price?: number | string | null;
  discount_percentage?: number | string | null;
  price?: number | string | null;
  stock?: number | string;
  weight?: number | string | null;
  status?: boolean;
  images?: ImageItem[];
};

type Brand = {
  id: number;
  name: string;
  logo?: string | null;
  logo_url?: string | null;
  image?: string | null;
  image_url?: string | null;
};

type Product = {
  id: number;
  name: string;
  description: string;
  price: number | string;
  original_price?: number | string | null;
  discount_percentage?: number | string | null;
  stock: number | string;
  grade?: string;
  condition?: string;
  warranty?: string;
  tag?: string;
  average_rating?: number | null;
  rating?: number | null;
  reviews_count?: number;
  brand?: Brand;
  category?: {
    id: number;
    name: string;
  };
  images?: ImageItem[];
  variants?: Variant[];
  ram?: string;
  battery?: string;
  storage?: string;
  camera?: string;
  cpu?: string;
  gpu?: string;
  display?: string;
  os?: string;
  connectivity?: string;
  color?: string;
  model?: string;
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, addToCart } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedStorage, setSelectedStorage] = useState("");
  const touchStartX = useRef(0);

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  useEffect(() => {
    if (user) fetchWishlist();
  }, [user]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/products/${id}`);
      const data = response.data?.data || response.data;
      setProduct(data);

      const variants: Variant[] = Array.isArray(data?.variants)
        ? data.variants
        : [];

      const activeVariants = variants.filter(
        (v) => v.status !== false
      );

      if (activeVariants.length) {
        setSelectedColor(activeVariants[0]?.color || "");
        setSelectedStorage(activeVariants[0]?.storage || "");
      } else {
        setSelectedColor(data?.color || "");
        setSelectedStorage(data?.storage || "");
      }

      setImageIndex(0);
      setQuantity(1);
    } catch (error) {
      console.error(error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await axios.get("/wishlist");
      const data = response?.data;
      const wishlist = Array.isArray(data)
        ? data
        : data?.wishlist ?? [];

      setWishlistIds(
        wishlist.map((item: any) => Number(item.product_id))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const toggleWishlist = async () => {
    if (!product) return;

    if (!user) {
      toast.error("Please login to use your wishlist.");
      navigate("/login");
      return;
    }

    if (wishlistLoading) return;

    try {
      setWishlistLoading(true);

      if (wishlistIds.includes(product.id)) {
        await axios.delete(`/wishlist/${product.id}`);
        setWishlistIds((prev) =>
          prev.filter((wishlistId) => wishlistId !== product.id)
        );
        toast.success("Removed from wishlist");
      } else {
        await axios.post(`/wishlist/${product.id}`);
        setWishlistIds((prev) => [...prev, product.id]);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setWishlistLoading(false);
    }
  };

  const activeVariants = useMemo(() => {
    if (!product?.variants) return [];
    return product.variants.filter((variant) => variant.status !== false);
  }, [product]);

  const colors = useMemo(() => {
    return Array.from(
      new Set(
        activeVariants
          .map((variant) => variant.color?.trim())
          .filter(Boolean)
      )
    ) as string[];
  }, [activeVariants]);

  const storages = useMemo(() => {
    return Array.from(
      new Set(
        activeVariants
          .map((variant) => variant.storage?.trim())
          .filter(Boolean)
      )
    ) as string[];
  }, [activeVariants]);

  const selectedVariant = useMemo(() => {
    if (!activeVariants.length) return null;

    let match = activeVariants.find(
      (variant) =>
        (!selectedColor || variant.color === selectedColor) &&
        (!selectedStorage || variant.storage === selectedStorage)
    );

    if (match) return match;

    if (selectedColor) {
      match = activeVariants.find(
        (variant) => variant.color === selectedColor
      );
      if (match) return match;
    }

    if (selectedStorage) {
      match = activeVariants.find(
        (variant) => variant.storage === selectedStorage
      );
      if (match) return match;
    }

    return activeVariants[0];
  }, [
    activeVariants,
    selectedColor,
    selectedStorage,
  ]);

  const getImageUrl = (image: ImageItem | string | null | undefined) => {
    if (!image) return "";

    if (typeof image === "string") {
      if (
        image.startsWith("http") ||
        image.startsWith("blob:")
      ) {
        return image;
      }

      return `${BASE_URL}/${image.replace(/^\/+/, "")}`;
    }

    const raw =
      image.image_url ||
      image.url ||
      image.path ||
      image.image ||
      "";

    if (!raw) return "";

    if (
      raw.startsWith("http") ||
      raw.startsWith("blob:")
    ) {
      return raw;
    }

    return `${BASE_URL}/${raw.replace(/^\/+/, "")}`;
  };

  const productImages = useMemo(() => {
    const images = (product?.images || [])
      .map(getImageUrl)
      .filter(Boolean);

    return images.length ? images : ["/placeholder.png"];
  }, [product]);

  const variantImages = useMemo(() => {
    const images = (selectedVariant?.images || [])
      .map(getImageUrl)
      .filter(Boolean);

    return images;
  }, [selectedVariant]);

  const displayImages = useMemo(() => {
    if (variantImages.length) return variantImages;
    return productImages;
  }, [variantImages, productImages]);

  useEffect(() => {
    setImageIndex(0);
  }, [selectedVariant?.id]);

  const currentPrice = useMemo(() => {
    if (selectedVariant?.price !== undefined && selectedVariant?.price !== null) {
      return Number(selectedVariant.price);
    }

    const original = Number(
      selectedVariant?.original_price ??
        product?.original_price ??
        product?.price ??
        0
    );

    const discount = Number(
      selectedVariant?.discount_percentage ??
        product?.discount_percentage ??
        0
    );

    if (original > 0 && discount > 0) {
      return Math.round(original - original * (discount / 100));
    }

    return Number(product?.price ?? 0);
  }, [selectedVariant, product]);

  const originalPrice = useMemo(() => {
    const value =
      selectedVariant?.original_price ??
      product?.original_price;

    return value ? Number(value) : 0;
  }, [selectedVariant, product]);

  const discount = useMemo(() => {
    const variantDiscount = Number(
      selectedVariant?.discount_percentage ?? 0
    );

    if (variantDiscount > 0) {
      return variantDiscount;
    }

    if (originalPrice > currentPrice && originalPrice > 0) {
      return Math.round(
        ((originalPrice - currentPrice) / originalPrice) * 100
      );
    }

    const productDiscount = Number(
      product?.discount_percentage ?? 0
    );

    return productDiscount;
  }, [
    selectedVariant,
    product,
    originalPrice,
    currentPrice,
  ]);

  const currentStock = Number(
    selectedVariant?.stock ?? product?.stock ?? 0
  );

  const rating = Number(
    product?.average_rating ??
      product?.rating ??
      0
  );

  const reviewsCount = Number(
    product?.reviews_count ?? 0
  );

  const brandLogo = useMemo(() => {
    const brand = product?.brand;
    if (!brand) return "";

    return getImageUrl(
      brand.logo_url ||
        brand.logo ||
        brand.image_url ||
        brand.image ||
        ""
    );
  }, [product]);

  const selectColor = (color: string) => {
    setSelectedColor(color);

    const matchingVariant = activeVariants.find(
      (variant) =>
        variant.color === color &&
        (!selectedStorage ||
          variant.storage === selectedStorage)
    );

    if (matchingVariant?.storage) {
      setSelectedStorage(matchingVariant.storage);
    } else {
      const firstColorVariant = activeVariants.find(
        (variant) => variant.color === color
      );

      if (firstColorVariant?.storage) {
        setSelectedStorage(firstColorVariant.storage);
      }
    }

    setQuantity(1);
  };

  const selectStorage = (storage: string) => {
    setSelectedStorage(storage);

    const matchingVariant = activeVariants.find(
      (variant) =>
        variant.storage === storage &&
        (!selectedColor ||
          variant.color === selectedColor)
    );

    if (matchingVariant?.color) {
      setSelectedColor(matchingVariant.color);
    }

    setQuantity(1);
  };

  const nextImage = () => {
    if (displayImages.length <= 1) return;

    setImageIndex(
      (prev) =>
        (prev + 1) % displayImages.length
    );
  };

  const previousImage = () => {
    if (displayImages.length <= 1) return;

    setImageIndex(
      (prev) =>
        (prev - 1 + displayImages.length) %
        displayImages.length
    );
  };

  const handleTouchStart = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    touchStartX.current =
      event.changedTouches[0].clientX;
  };

  const handleTouchEnd = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    const endX =
      event.changedTouches[0].clientX;

    const difference =
      touchStartX.current - endX;

    if (Math.abs(difference) < 50) return;

    if (difference > 0) {
      nextImage();
    } else {
      previousImage();
    }
  };

  const getCartProduct = (): Product => {
    if (!product) {
      throw new Error("Product not available");
    }

    if (!selectedVariant) {
      return product;
    }

    return {
      ...product,
      price: currentPrice,
      original_price:
        originalPrice || product.original_price,
      discount_percentage: discount,
      stock: currentStock,
      color:
        selectedVariant.color || product.color,
      storage:
        selectedVariant.storage || product.storage,
      ram:
        selectedVariant.ram || product.ram,
      variant_id: selectedVariant.id,
    } as Product & { variant_id?: number };
  };

  const requireLogin = () => {
    if (user) return true;

    toast.error("Please login first.");

    setTimeout(() => {
      navigate("/login");
    }, 1000);

    return false;
  };

  const handleAddToCart = () => {
    if (!product || !requireLogin()) return;

    if (currentStock <= 0) {
      toast.error("This variant is out of stock.");
      return;
    }

    addToCart(getCartProduct());
    toast.success("Product added to cart");
  };

  const handleBuyNow = () => {
    if (!product || !requireLogin()) return;

    if (currentStock <= 0) {
      toast.error("This variant is out of stock.");
      return;
    }

    addToCart(getCartProduct());
    navigate("/cart");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-40">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center py-40">
          <h2 className="text-xl font-bold">
            Product not found
          </h2>
          <Link
            to="/products"
            className="text-primary mt-4 inline-block"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const lowStock =
    currentStock > 0 && currentStock <= 5;

  const features = [
    product.display &&
      `${product.display} display`,
    product.cpu &&
      `${product.cpu} processor`,
    product.camera &&
      `${product.camera} camera`,
    product.battery &&
      `${product.battery} battery`,
    (selectedVariant?.ram || product.ram) &&
      `${selectedVariant?.ram || product.ram} RAM`,
  ].filter(Boolean) as string[];

  const specifications = [
    ["Display", product.display],
    ["Processor", product.cpu],
    [
      "RAM",
      selectedVariant?.ram || product.ram,
    ],
    [
      "Storage",
      selectedVariant?.storage ||
        product.storage,
    ],
    ["Camera", product.camera],
    ["Battery", product.battery],
    ["GPU", product.gpu],
    ["Operating System", product.os],
    ["Connectivity", product.connectivity],
    [
      "Color",
      selectedVariant?.color ||
        product.color,
    ],
  ].filter(([, value]) => value);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />

      <main className="container mx-auto px-4 py-5 md:py-7">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 overflow-x-auto whitespace-nowrap">
          <Link
            to="/"
            className="hover:text-primary transition"
          >
            Home
          </Link>

          <ChevronRight className="w-4 h-4 shrink-0" />

          <Link
            to="/products"
            className="hover:text-primary transition"
          >
            Products
          </Link>

          {product.category && (
            <>
              <ChevronRight className="w-4 h-4 shrink-0" />
              <span>{product.category.name}</span>
            </>
          )}

          <ChevronRight className="w-4 h-4 shrink-0" />

          <span className="text-foreground font-medium truncate">
            {product.name}
          </span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_390px] gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(360px,48%)_1fr] gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div
                className="relative rounded-2xl border bg-white overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {discount > 0 && (
                  <span className="absolute top-5 left-5 z-10 bg-green-600 text-white font-semibold text-sm px-3 py-1.5 rounded-full">
                    -{discount}%
                  </span>
                )}

                <button
                  onClick={toggleWishlist}
                  className="absolute top-5 right-5 z-10 w-11 h-11 rounded-full bg-white border shadow-sm flex items-center justify-center hover:bg-gray-50 transition"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      wishlistIds.includes(product.id)
                        ? "text-red-500 fill-red-500"
                        : "text-gray-600"
                    }`}
                  />
                </button>

                <div className="aspect-square p-6 md:p-10 flex items-center justify-center bg-white">
                  <img
                    src={
                      displayImages[imageIndex] ||
                      "/placeholder.png"
                    }
                    alt={product.name}
                    className="w-full h-full object-contain select-none"
                    draggable={false}
                  />
                </div>

                {displayImages.length > 1 && (
                  <>
                    <button
                      onClick={previousImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border shadow-sm flex items-center justify-center hover:bg-gray-50"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border shadow-sm flex items-center justify-center hover:bg-gray-50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {displayImages.length > 1 && (
                  <div className="px-5 pb-5">
                    <div className="flex gap-3 overflow-x-auto">
                      {displayImages.map(
                        (image, index) => (
                          <button
                            key={`${image}-${index}`}
                            onClick={() =>
                              setImageIndex(index)
                            }
                            className={`w-[78px] h-[78px] rounded-xl shrink-0 overflow-hidden border-2 bg-white p-1 transition ${
                              imageIndex === index
                                ? "border-primary"
                                : "border-gray-200"
                            }`}
                          >
                            <img
                              src={image}
                              alt=""
                              className="w-full h-full object-contain rounded-lg"
                            />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                {variantImages.length > 0 && (
                  <div className="px-5 pb-4">
                    <p className="text-xs text-gray-400 text-center">
                      Images for{" "}
                      {selectedVariant?.color ||
                        "selected variant"}
                      {selectedVariant?.storage
                        ? ` · ${selectedVariant.storage}`
                        : ""}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <div className="flex items-center gap-3 mb-3">
                {brandLogo && (
                  <div className="w-10 h-10 rounded-lg border bg-white flex items-center justify-center p-1.5">
                    <img
                      src={brandLogo}
                      alt={
                        product.brand?.name ||
                        "Brand"
                      }
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {currentStock > 0 && (
                    <span className="bg-green-50 text-green-700 border border-green-100 text-xs font-semibold px-3 py-1.5 rounded-md">
                      In Stock
                    </span>
                  )}

                  {product.tag && (
                    <span className="bg-green-50 text-green-700 border border-green-100 text-xs font-semibold px-3 py-1.5 rounded-md">
                      {product.tag}
                    </span>
                  )}
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl xl:text-[32px] font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mt-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    )
                  )}
                </div>

                <span className="font-semibold text-gray-700">
                  {rating > 0
                    ? rating.toFixed(1)
                    : "No rating"}
                </span>

                <span className="text-gray-300">|</span>

                <span className="text-sm text-gray-500">
                  {reviewsCount}{" "}
                  {reviewsCount === 1
                    ? "review"
                    : "reviews"}
                </span>

                <a
                  href="#reviews"
                  className="text-primary text-sm font-medium hover:underline"
                >
                  Add a review
                </a>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-sm text-gray-500">
                {product.brand && (
                  <span>
                    Brand:{" "}
                    <strong className="text-gray-800">
                      {product.brand.name}
                    </strong>
                  </span>
                )}

                {product.category && (
                  <span>
                    Category:{" "}
                    <strong className="text-gray-800">
                      {product.category.name}
                    </strong>
                  </span>
                )}

                {product.model && (
                  <span>
                    Model:{" "}
                    <strong className="text-gray-800">
                      {product.model}
                    </strong>
                  </span>
                )}
              </div>

              <div className="border-t my-5" />

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-3xl md:text-4xl font-bold text-primary">
                  {formatPrice(currentPrice)}
                </span>

                {originalPrice > currentPrice && (
                  <span className="text-base text-gray-400 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}

                {discount > 0 && (
                  <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md text-sm font-semibold">
                    -{discount}%
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-1">
                Inclusive of all taxes
              </p>

              {colors.length > 0 && (
                <div className="mt-7">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      Color
                    </h3>

                    <span className="text-sm text-gray-500">
                      {selectedColor ||
                        "Select a color"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => {
                      const variant =
                        activeVariants.find(
                          (v) => v.color === color
                        );

                      const hasStock =
                        Number(
                          variant?.stock ?? 0
                        ) > 0;

                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() =>
                            selectColor(color)
                          }
                          className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition ${
                            selectedColor === color
                              ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                              : "border-gray-200 bg-white text-gray-700 hover:border-primary/50"
                          } ${
                            !hasStock
                              ? "opacity-50"
                              : ""
                          }`}
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {storages.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      Storage
                    </h3>

                    <span className="text-sm text-gray-500">
                      {selectedStorage ||
                        "Select storage"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {storages.map((storage) => {
                      const variant =
                        activeVariants.find(
                          (v) =>
                            v.storage === storage &&
                            (!selectedColor ||
                              v.color === selectedColor)
                        );

                      const fallbackVariant =
                        activeVariants.find(
                          (v) =>
                            v.storage === storage
                        );

                      const stockVariant =
                        variant ||
                        fallbackVariant;

                      const hasStock =
                        Number(
                          stockVariant?.stock ?? 0
                        ) > 0;

                      return (
                        <button
                          key={storage}
                          type="button"
                          onClick={() =>
                            selectStorage(storage)
                          }
                          className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${
                            selectedStorage === storage
                              ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                              : "border-gray-200 bg-white text-gray-700 hover:border-primary/50"
                          } ${
                            !hasStock
                              ? "opacity-50"
                              : ""
                          }`}
                        >
                          {storage}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedVariant && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedVariant.ram && (
                    <span className="px-3 py-1.5 rounded-lg bg-gray-50 border text-xs text-gray-600">
                      {selectedVariant.ram} RAM
                    </span>
                  )}

                  {selectedVariant.color && (
                    <span className="px-3 py-1.5 rounded-lg bg-gray-50 border text-xs text-gray-600">
                      {selectedVariant.color}
                    </span>
                  )}

                  {selectedVariant.storage && (
                    <span className="px-3 py-1.5 rounded-lg bg-gray-50 border text-xs text-gray-600">
                      {selectedVariant.storage}
                    </span>
                  )}
                </div>
              )}

              {features.length > 0 && (
                <div className="mt-7">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Key Features
                  </h3>

                  <div className="space-y-2">
                    {features
                      .slice(0, 5)
                      .map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 text-sm text-gray-600"
                        >
                          <Check className="w-4 h-4 mt-0.5 shrink-0 text-green-600" />
                          <span>{feature}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3 mt-6">
                {product.condition && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-100">
                    <Zap className="w-4 h-4 text-green-600" />
                    <span className="text-sm">
                      <strong>
                        {product.condition}
                      </strong>
                    </span>
                  </div>
                )}

                {product.warranty && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-100">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    <span className="text-sm">
                      <strong>
                        {product.warranty}
                      </strong>{" "}
                      Warranty
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border bg-white overflow-hidden h-fit xl:sticky xl:top-5"
          >
            <div className="p-5">
              {product.grade && (
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      Grade
                    </span>
                    <Info className="w-4 h-4 text-gray-400" />
                  </div>

                  <span className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm font-semibold">
                    {product.grade}
                  </span>
                </div>
              )}

              {product.condition && (
                <div className="flex items-center justify-between mb-5">
                  <span className="font-semibold">
                    Condition
                  </span>

                  <span className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm font-semibold">
                    {product.condition}
                  </span>
                </div>
              )}

              {selectedVariant?.color && (
                <div className="flex items-center justify-between mb-5">
                  <span className="font-semibold">
                    Color
                  </span>

                  <span className="px-3 py-1.5 rounded-lg bg-gray-50 border text-sm font-medium">
                    {selectedVariant.color}
                  </span>
                </div>
              )}

              {selectedVariant?.storage && (
                <div className="flex items-center justify-between mb-5">
                  <span className="font-semibold">
                    Storage
                  </span>

                  <span className="px-3 py-1.5 rounded-lg bg-gray-50 border text-sm font-medium">
                    {selectedVariant.storage}
                  </span>
                </div>
              )}

              <div className="mb-5">
                <span className="font-semibold block mb-3">
                  Quantity
                </span>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center border rounded-xl overflow-hidden">
                    <button
                      onClick={() =>
                        setQuantity(
                          Math.max(
                            1,
                            quantity - 1
                          )
                        )
                      }
                      className="w-11 h-11 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <div className="w-14 h-11 border-x flex items-center justify-center font-medium">
                      {quantity}
                    </div>

                    <button
                      onClick={() =>
                        setQuantity(
                          Math.min(
                            currentStock,
                            quantity + 1
                          )
                        )
                      }
                      disabled={
                        quantity >= currentStock
                      }
                      className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {currentStock > 0 && (
                    <span
                      className={`text-sm ${
                        lowStock
                          ? "text-orange-600"
                          : "text-green-600"
                      }`}
                    >
                      Only{" "}
                      <strong>
                        {currentStock}
                      </strong>{" "}
                      left in stock!
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className="w-full h-12 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                {currentStock > 0
                  ? "Add to Cart"
                  : "Out of Stock"}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={currentStock <= 0}
                className="w-full h-12 mt-3 rounded-xl border border-green-200 bg-green-50 text-green-700 font-semibold flex items-center justify-center gap-2 hover:bg-green-100 transition disabled:opacity-50"
              >
                <Zap className="w-5 h-5" />
                Buy Now
              </button>

              <div className="mt-4 rounded-xl border p-4">
                <div className="flex items-start gap-3">
                  <LockKeyhole className="w-5 h-5 text-green-600 shrink-0" />

                  <div>
                    <p className="font-semibold text-sm">
                      Secure Checkout
                    </p>

                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Your data is protected with
                      industry-standard encryption.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t grid grid-cols-3 divide-x">
              <div className="p-4 text-center">
                <RotateCcw className="w-5 h-5 mx-auto mb-2 text-gray-700" />
                <p className="text-xs font-semibold">
                  7 Days Return
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Easy Returns
                </p>
              </div>

              <div className="p-4 text-center">
                <ShieldCheck className="w-5 h-5 mx-auto mb-2 text-gray-700" />
                <p className="text-xs font-semibold">
                  {product.warranty
                    ? `${product.warranty} Warranty`
                    : "Warranty"}
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Official Warranty
                </p>
              </div>

              <div className="p-4 text-center">
                <Truck className="w-5 h-5 mx-auto mb-2 text-gray-700" />
                <p className="text-xs font-semibold">
                  Fast Delivery
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Nationwide
                </p>
              </div>
            </div>
          </motion.aside>
        </div>

        <section className="mt-8 rounded-2xl border bg-white overflow-hidden">
          <div className="border-b flex overflow-x-auto">
            <a
              href="#description"
              className="px-5 md:px-7 py-4 text-sm font-semibold text-primary border-b-2 border-primary whitespace-nowrap"
            >
              Description
            </a>

            <a
              href="#specifications"
              className="px-5 md:px-7 py-4 text-sm text-gray-600 hover:text-primary whitespace-nowrap"
            >
              Specifications
            </a>

            <a
              href="#reviews"
              className="px-5 md:px-7 py-4 text-sm text-gray-600 hover:text-primary whitespace-nowrap"
            >
              Reviews
              {reviewsCount > 0 &&
                ` (${reviewsCount})`}
            </a>

            <a
              href="#shipping"
              className="px-5 md:px-7 py-4 text-sm text-gray-600 hover:text-primary whitespace-nowrap"
            >
              Shipping & Returns
            </a>
          </div>

          <div className="p-5 md:p-7">
            <div
              id="description"
              className="scroll-mt-24"
            >
              <h2 className="text-xl font-bold mb-3">
                Description
              </h2>

              <p className="text-sm md:text-base text-gray-600 leading-7 max-w-4xl">
                {product.description}
              </p>
            </div>

            <div
              id="specifications"
              className="mt-8 scroll-mt-24"
            >
              <h2 className="text-xl font-bold mb-5">
                Specifications
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border rounded-xl overflow-hidden">
                {specifications.map(
                  ([label, value], index) => (
                    <div
                      key={String(label)}
                      className={`p-4 border-b border-r ${
                        index % 2 === 0
                          ? "bg-gray-50"
                          : "bg-white"
                      }`}
                    >
                      <p className="text-xs text-gray-500 mb-1">
                        {label}
                      </p>

                      <p className="text-sm font-semibold text-gray-800">
                        {value}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            <div
              id="shipping"
              className="mt-8 scroll-mt-24"
            >
              <h2 className="text-xl font-bold mb-4">
                Shipping & Returns
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-xl p-4">
                  <Truck className="w-5 h-5 text-primary mb-2" />
                  <h3 className="font-semibold">
                    Fast Delivery
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Delivery available nationwide.
                  </p>
                </div>

                <div className="border rounded-xl p-4">
                  <RotateCcw className="w-5 h-5 text-primary mb-2" />
                  <h3 className="font-semibold">
                    Easy Returns
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Eligible products can be returned
                    within the return period.
                  </p>
                </div>

                <div className="border rounded-xl p-4">
                  <ShieldCheck className="w-5 h-5 text-primary mb-2" />
                  <h3 className="font-semibold">
                    Warranty
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {product.warranty
                      ? `${product.warranty} warranty included.`
                      : "Warranty information available on request."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div
        id="reviews"
        className="scroll-mt-24"
      >
        <ProductReviews productId={product.id} />
      </div>
    </div>
  );
};

export default ProductDetail;