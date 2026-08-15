import { useEffect, useState } from "react";
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

import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import ProductReviews from "@/components/ProductReviews";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://aestra.onrender.com/api";

const BASE_URL = API_URL.replace("/api", "");

type Product = {
  id: number;
  name: string;
  description: string;
  sku?: string;

  price: number;
  original_price?: number;
  discount_percentage?: number;

  stock: number;

  grade?: string;
  condition?: string;
  warranty?: string;
  tag?: string;

  rating?: number | null;
  reviews_count?: number;

  brand?: {
    id: number;
    name: string;
  };

  category?: {
    id: number;
    name: string;
  };

  images?: {
    id: number;
    image: string | null;
    image_url: string | null;
  }[];

  ram?: string;
  battery?: string;
  storage?: string;
  camera?: string;
  cpu?: string;
  gpu?: string;
  display?: string;
  os?: string;
  connectivity?: string;
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

  /* ---------------- PRODUCT ---------------- */

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`/products/${id}`);

      setProduct(response.data.data);
    } catch (error) {
      console.error(error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- WISHLIST ---------------- */

  useEffect(() => {
    if (user) fetchWishlist();
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const response = await axios.get("/wishlist");

      const data = response.data;

      const wishlist = Array.isArray(data)
        ? data
        : data?.wishlist ?? [];

      setWishlistIds(
        wishlist.map((item: any) => item.product_id)
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

    try {
      if (wishlistIds.includes(product.id)) {
        await axios.delete(`/wishlist/${product.id}`);

        setWishlistIds((prev) =>
          prev.filter((id) => id !== product.id)
        );

        toast.success("Removed from wishlist");
      } else {
        await axios.post(`/wishlist/${product.id}`);

        setWishlistIds((prev) => [
          ...prev,
          product.id,
        ]);

        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  /* ---------------- CART ---------------- */

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

    addToCart(product);
    toast.success("Added to cart");
  };

  const handleBuyNow = () => {
    if (!product || !requireLogin()) return;

    addToCart(product);
    navigate("/cart");
  };

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="flex justify-center items-center py-40">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  /* ---------------- NOT FOUND ---------------- */

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
            className="inline-block mt-4 text-primary"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  /* ---------------- PRODUCT DATA ---------------- */

  const images =
    product.images
      ?.filter(
        (image) =>
          image.image_url || image.image
      )
      .map((image) =>
        image.image_url
          ? image.image_url
          : `${BASE_URL}/storage/${image.image}`
      ) ?? [];

  const displayImages =
    images.length > 0
      ? images
      : ["/placeholder.png"];

  const discount =
    product.discount_percentage ??
    (product.original_price &&
    product.original_price > product.price
      ? Math.round(
          ((product.original_price -
            product.price) /
            product.original_price) *
            100
        )
      : 0);

  const rating = product.rating ?? 0;
  const reviewsCount = product.reviews_count ?? 0;

  const features = [
    product.display && `${product.display} display`,
    product.cpu && `${product.cpu} processor`,
    product.camera && `${product.camera} camera`,
    product.battery && `${product.battery} battery`,
    product.ram && `${product.ram} RAM`,
  ].filter(Boolean) as string[];

  const specifications = [
    ["Display", product.display],
    ["Processor", product.cpu],
    ["RAM", product.ram],
    ["Storage", product.storage],
    ["Camera", product.camera],
    ["Battery", product.battery],
    ["GPU", product.gpu],
    ["Operating System", product.os],
    ["Connectivity", product.connectivity],
  ].filter((item) => item[1]);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />

      <main className="container mx-auto px-4 py-6">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>

          <ChevronRight className="w-4 h-4" />

          <Link
            to="/products"
            className="hover:text-primary"
          >
            Products
          </Link>

          {product.category && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span>{product.category.name}</span>
            </>
          )}

          {product.brand && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span>{product.brand.name}</span>
            </>
          )}

          <ChevronRight className="w-4 h-4" />

          <span className="font-medium text-gray-800 truncate">
            {product.name}
          </span>
        </div>

        {/* MAIN PRODUCT */}

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_390px] gap-6">

          {/* LEFT SIDE */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* GALLERY */}

            <div className="relative rounded-2xl border bg-white overflow-hidden">

              {discount > 0 && (
                <span className="absolute top-5 left-5 z-10 bg-green-600 text-white text-sm font-semibold px-3 py-1.5 rounded-full">
                  -{discount}%
                </span>
              )}

              <button
                onClick={toggleWishlist}
                className="absolute top-5 right-5 z-10 w-11 h-11 rounded-full border bg-white flex items-center justify-center shadow-sm"
              >
                <Heart
                  className={`w-5 h-5 ${
                    wishlistIds.includes(product.id)
                      ? "text-red-500 fill-red-500"
                      : "text-gray-600"
                  }`}
                />
              </button>

              {/* IMAGE */}

              <div className="aspect-square p-8 md:p-12 flex items-center justify-center">
                <img
                  src={displayImages[imageIndex]}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* IMAGE ARROWS */}

              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setImageIndex(
                        (prev) =>
                          (prev -
                            1 +
                            displayImages.length) %
                          displayImages.length
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border shadow-sm flex items-center justify-center"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() =>
                      setImageIndex(
                        (prev) =>
                          (prev + 1) %
                          displayImages.length
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border shadow-sm flex items-center justify-center"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* THUMBNAILS */}

              {displayImages.length > 1 && (
                <div className="px-5 pb-5 flex gap-3 overflow-x-auto">
                  {displayImages.map(
                    (image, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          setImageIndex(index)
                        }
                        className={`w-20 h-20 shrink-0 rounded-xl border-2 p-1 ${
                          imageIndex === index
                            ? "border-primary"
                            : "border-gray-200"
                        }`}
                      >
                        <img
                          src={image}
                          alt=""
                          className="w-full h-full object-contain"
                        />
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* PRODUCT INFO */}

            <div>

              {/* BADGES */}

              <div className="flex gap-2 mb-3">
                {product.stock > 0 && (
                  <span className="px-3 py-1.5 rounded-md bg-green-50 text-green-700 border border-green-100 text-xs font-semibold">
                    In Stock
                  </span>
                )}

                <span className="px-3 py-1.5 rounded-md bg-green-50 text-green-700 border border-green-100 text-xs font-semibold">
                  {product.tag || "Best Seller"}
                </span>
              </div>

              {/* NAME */}

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {product.name}
              </h1>

              {/* RATING */}

              <div className="flex flex-wrap items-center gap-2 mt-3">

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

                  </div>
                ) : (
                  <p className="mb-2 text-[10px] font-medium text-slate-400 md:mb-0">
                    No ratings
                  </p>
                )}

                <span className="text-gray-300">
                  |
                </span>

                <span className="text-sm text-gray-500">
                  {reviewsCount} reviews
                </span>

                <a
                  href="#reviews"
                  className="text-sm text-primary font-medium"
                >
                  Add a review
                </a>
              </div>

              {/* META */}

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                {product.brand && (
                  <span>
                    Brand:{" "}
                    <b className="text-gray-800">
                      {product.brand.name}
                    </b>
                  </span>
                )}

                {product.category && (
                  <span>
                    Category:{" "}
                    <b className="text-gray-800">
                      {product.category.name}
                    </b>
                  </span>
                )}

                {product.sku && (
                  <span>
                    SKU:{" "}
                    <b className="text-gray-800">
                      {product.sku}
                    </b>
                  </span>
                )}
              </div>

              <div className="border-t my-5" />

              {/* PRICE */}

              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>

                {product.original_price &&
                  product.original_price >
                    product.price && (
                    <span className="text-gray-400 line-through">
                      {formatPrice(
                        product.original_price
                      )}
                    </span>
                  )}

                {discount > 0 && (
                  <span className="px-2 py-1 rounded-md bg-green-50 text-green-700 text-sm font-semibold">
                    -{discount}%
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-1">
                Inclusive of all taxes
              </p>

              {/* FEATURES */}

              {features.length > 0 && (
                <div className="mt-7">
                  <h3 className="font-semibold mb-3">
                    Key Features
                  </h3>

                  <div className="space-y-2">
                    {features.map(
                      (feature, index) => (
                        <div
                          key={index}
                          className="flex gap-2 text-sm text-gray-600"
                        >
                          <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                          {feature}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PURCHASE CARD */}

          <aside className="bg-white border rounded-2xl overflow-hidden h-fit xl:sticky xl:top-5">

            <div className="p-5">

              {/* GRADE */}

              {product.grade && (
                <div className="flex justify-between items-center mb-5">
                  <div className="flex gap-2 items-center font-semibold">
                    Grade
                    <Info className="w-4 h-4 text-gray-400" />
                  </div>

                  <span className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm font-semibold">
                    {product.grade}
                  </span>
                </div>
              )}

              {/* CONDITION */}

              {product.condition && (
                <div className="flex justify-between items-center mb-5">
                  <span className="font-semibold">
                    Condition
                  </span>

                  <span className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm font-semibold">
                    {product.condition}
                  </span>
                </div>
              )}

              {/* QUANTITY */}

              <div className="mb-5">
                <span className="font-semibold block mb-3">
                  Quantity
                </span>

                <div className="flex items-center justify-between gap-3">

                  <div className="flex border rounded-xl overflow-hidden">
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

                    <span className="w-14 border-x flex items-center justify-center">
                      {quantity}
                    </span>

                    <button
                      onClick={() =>
                        setQuantity(
                          Math.min(
                            product.stock,
                            quantity + 1
                          )
                        )
                      }
                      disabled={
                        quantity >=
                        product.stock
                      }
                      className="w-11 h-11 flex items-center justify-center disabled:opacity-30"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {product.stock > 0 && (
                    <span className="text-sm text-green-600">
                      Only{" "}
                      <b>{product.stock}</b> left
                      in stock!
                    </span>
                  )}
                </div>
              </div>

              {/* CART */}

              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="w-full h-12 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
              >
                <ShoppingCart className="w-5 h-5" />
                {product.stock > 0
                  ? "Add to Cart"
                  : "Out of Stock"}
              </button>

              {/* BUY NOW */}

              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="w-full h-12 mt-3 rounded-xl bg-green-50 text-green-700 border border-green-200 font-semibold flex items-center justify-center gap-2 hover:bg-green-100 disabled:opacity-50"
              >
                <Zap className="w-5 h-5" />
                Buy Now
              </button>

              {/* SECURE CHECKOUT */}

              <div className="mt-4 border rounded-xl p-4 flex gap-3">
                <LockKeyhole className="w-5 h-5 text-green-600 shrink-0" />

                <div>
                  <p className="font-semibold text-sm">
                    Secure Checkout
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Your data is protected with
                    industry-standard encryption.
                  </p>
                </div>
              </div>
            </div>

            {/* SERVICE INFO */}

            <div className="border-t grid grid-cols-3 divide-x">

              <Service
                icon={<RotateCcw />}
                title="7 Days Return"
                subtitle="Easy Returns"
              />

              <Service
                icon={<ShieldCheck />}
                title="1 Year Warranty"
                subtitle="Official Warranty"
              />

              <Service
                icon={<Truck />}
                title="Fast Delivery"
                subtitle="Nationwide"
              />

            </div>
          </aside>
        </div>

        {/* PRODUCT DETAILS */}

        <section className="mt-8 bg-white border rounded-2xl overflow-hidden">

          {/* TABS */}

          <div className="border-b flex overflow-x-auto">
            <a
              href="#description"
              className="px-6 py-4 text-sm font-semibold text-primary border-b-2 border-primary whitespace-nowrap"
            >
              Description
            </a>

            <a
              href="#specifications"
              className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap"
            >
              Specifications
            </a>

            <a
              href="#reviews"
              className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap"
            >
              Reviews
              {reviewsCount > 0 &&
                ` (${reviewsCount})`}
            </a>

            <a
              href="#shipping"
              className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap"
            >
              Shipping & Returns
            </a>
          </div>

          <div className="p-6">

            {/* DESCRIPTION */}

            <div id="description">
              <h2 className="text-xl font-bold mb-3">
                Description
              </h2>

              <p className="text-gray-600 leading-7 max-w-4xl">
                {product.description}
              </p>
            </div>

            {/* SPECIFICATIONS */}

            <div
              id="specifications"
              className="mt-8"
            >
              <h2 className="text-xl font-bold mb-5">
                Specifications
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border rounded-xl overflow-hidden">
                {specifications.map(
                  ([label, value], index) => (
                    <div
                      key={label}
                      className={`p-4 border-b border-r ${
                        index % 2 === 0
                          ? "bg-gray-50"
                          : "bg-white"
                      }`}
                    >
                      <p className="text-xs text-gray-500">
                        {label}
                      </p>

                      <p className="text-sm font-semibold mt-1">
                        {value}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* SHIPPING */}

            <div
              id="shipping"
              className="mt-8"
            >
              <h2 className="text-xl font-bold mb-4">
                Shipping & Returns
              </h2>

              <div className="grid md:grid-cols-3 gap-4">

                <ServiceBox
                  icon={<Truck />}
                  title="Fast Delivery"
                  text="Delivery available nationwide."
                />

                <ServiceBox
                  icon={<RotateCcw />}
                  title="Easy Returns"
                  text="Eligible products can be returned within the return period."
                />

                <ServiceBox
                  icon={<ShieldCheck />}
                  title="Warranty"
                  text={
                    product.warranty
                      ? `${product.warranty} warranty included.`
                      : "Warranty information available on request."
                  }
                />

              </div>
            </div>
          </div>
        </section>
      </main>

      {/* REVIEWS */}

      <div id="reviews">
        <ProductReviews
          productId={product.id}
        />
      </div>
    </div>
  );
};

/* ---------------- SMALL COMPONENTS ---------------- */

const Service = ({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) => (
  <div className="p-4 text-center">
    <div className="w-5 h-5 mx-auto mb-2 text-gray-700">
      {icon}
    </div>

    <p className="text-xs font-semibold">
      {title}
    </p>

    <p className="text-[11px] text-gray-500 mt-1">
      {subtitle}
    </p>
  </div>
);

const ServiceBox = ({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) => (
  <div className="border rounded-xl p-4">
    <div className="w-5 h-5 text-primary mb-2">
      {icon}
    </div>

    <h3 className="font-semibold">
      {title}
    </h3>

    <p className="text-sm text-gray-500 mt-1">
      {text}
    </p>
  </div>
);

export default ProductDetail;