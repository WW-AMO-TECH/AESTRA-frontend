import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import axios from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  brand?: {
    name?: string;
    logo_url?: string;
  };
  rating?: number | null;
  reviews_count?: number;
  condition?: "Original" | "Refurbished";
  grade?: "New" | "A" | "B" | "C";
  discount_percentage?: number;
};

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const navigate = useNavigate();
  const { user, addToCart } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);

  const toggleWishlist = async (productId: number) => {
    if (!user) {
      toast.error("Please login first");
      return;
    }

    try {
      if (wishlistIds.includes(productId)) {
        await axios.delete(`/wishlist/${productId}`);
        setWishlistIds((prev) => prev.filter((id) => id !== productId));
        toast.success("Removed from wishlist");
      } else {
        await axios.post(`/wishlist/${productId}`);
        setWishlistIds((prev) => [...prev, productId]);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  const fetchWishlistIds = async () => {
    if (!user) {
      setWishlistIds([]);
      return;
    }

    try {
      const response = await axios.get("/wishlist");
      const data = response?.data;
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

  useEffect(() => {
    fetchWishlistIds();
  }, [user]);

  if (!product) return null;

  const conditionColor =
    product.condition === "Refurbished"
      ? "bg-orange-500"
      : "bg-green-500";

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please login first. Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

      return;
    }

    addToCart(product);
    toast.success("Added to cart");
  };

  const isWishlisted = wishlistIds.includes(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="
        group w-full overflow-hidden rounded-xl sm:rounded-2xl
        border border-black/10 bg-white shadow-sm
        transition-all duration-300
        hover:shadow-lg
      "
    >
      {/* PRODUCT IMAGE */}
      <div className="relative overflow-hidden">
        <Link to={`/products/${product.id}`}>
          <img
            src={product.image || "/placeholder.png"}
            alt={product.name || "Product"}
            className="
              aspect-square w-full object-cover
              transition-transform duration-500
              group-hover:scale-105
            "
          />
        </Link>

        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

        {/* WISHLIST */}
        <button
          onClick={() => toggleWishlist(product.id)}
          aria-label={
            user ? "Toggle wishlist" : "Login to use wishlist"
          }
          className="
            absolute bottom-2 right-2
            flex h-7 w-7 items-center justify-center
            rounded-full bg-white/95 shadow-sm
            backdrop-blur-sm
            transition-all duration-200
            hover:scale-105
            hover:bg-red-50
          "
        >
          <Heart
            size={15}
            className={`
              transition-colors duration-200
              ${
                isWishlisted
                  ? "fill-red-500 text-red-500"
                  : "text-slate-500 hover:text-red-500"
              }
            `}
          />
        </button>

        {/* CONDITION */}
        {product.condition && (
          <span
            className={`
              absolute left-2 top-2
              rounded-full px-1.5 py-0.4
              text-[8px] font-semibold text-white
              shadow-sm sm:px-2 sm:text-[10px]
              ${conditionColor}
            `}
          >
            {product.condition}
          </span>
        )}

        {/* DISCOUNT */}
        {!!product.discount_percentage && (
          <span
            className="
              absolute left-2 top-6
              rounded-full bg-green-500
              px-1.5 py-0.3
              text-[8px] font-semibold text-white
              shadow-sm sm:text-[10px]
            "
          >
            -{product.discount_percentage}%
          </span>
        )}

        {/* GRADE */}
        {product.grade && (
          <span
            className="
              absolute right-2 top-2
              rounded-full bg-primary
              px-1.5 py-0.5
              text-[8px] font-semibold text-white
              shadow-sm sm:text-[10px]
            "
          >
            {product.grade}
          </span>
        )}
      </div>

      {/* PRODUCT INFO */}
      <div className="p-2">
        {/* BRAND */}
        {product.brand?.name && (
          <div className="mb-1 flex items-center gap-1">
            {product.brand.logo_url && (
              <img
                src={product.brand.logo_url}
                alt={product.brand.name}
                className="
                  h-4 w-4 rounded-full
                  border object-cover
                  sm:h-5 sm:w-5
                "
              />
            )}

            <span
              className="
                truncate text-[9px] font-medium
                text-slate-500 sm:text-[11px]
              "
            >
              {product.brand.name}
            </span>
          </div>
        )}

        {/* PRODUCT NAME */}
        <Link to={`/products/${product.id}`}>
          <h3
            className="
              line-clamp-2
              min-h-[20px]
              text-[11px] font-semibold
              leading-4 text-slate-900
              transition-colors
              hover:text-primary
              sm:min-h-[18px]
              sm:text-[13px]
              sm:leading-4
            "
          >
            {product.name}
          </h3>
        </Link>

        {/* RATING */}
        {product.rating !== null &&
        product.rating !== undefined &&
        product.reviews_count &&
        product.reviews_count > 0 ? (
          <div className="flex items-center gap-1">
            <div className="flex">
              {Array.from({
                length: Math.round(product.rating),
              }).map((_, i) => (
                <span
                  key={i}
                  className="text-[9px] leading-none text-yellow-400 sm:text-[11px]"
                >
                  ★
                </span>
              ))}
            </div>

            <span className="text-[8px] text-slate-400 sm:text-[10px]">
              ({product.reviews_count})
            </span>
          </div>
        ) : (
          <p className="mt-1 text-[8px] text-slate-400 sm:text-[10px]">
            No ratings
          </p>
        )}

        {/* PRICE */}
        <p
          className="
            mt-1.5 text-[13px] font-bold
            text-slate-900
            sm:text-[15px]
          "
        >
          {formatPrice(product.price)}
        </p>

      {/* ADD TO CART */}
      <button
        onClick={handleAddToCart}
        className="
          group/cart
          mt-2 flex h-8 w-full
          items-center justify-center gap-1.5
          rounded-lg
          bg-primary
          px-2
          text-[10px] font-semibold
          text-white
          transition-all duration-200
          hover:bg-primary/90
          hover:scale-[1.02]
          active:scale-[0.98]
          sm:h-9
          sm:text-[11px]
        "
      >
        <ShoppingCart
          size={13}
          className="
            transition-transform duration-200
            group-hover/cart:animate-[wiggle_0.35s_ease-in-out]
          "
        />
        Add to Cart
      </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;