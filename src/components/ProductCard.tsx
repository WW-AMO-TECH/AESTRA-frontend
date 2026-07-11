import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  rating?: number;
  condition?: "Original" | "Refurbished";
  grade?: "New" | "A" | "B" | "C"
  discount_percentage?: number;
};

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({
  product,
  index = 0,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const { user, addToCart } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  
  
  const toggleWishlist = async (productId: number) => {
    try {
      if (wishlistIds.includes(productId)) {
        await axios.delete(`/wishlist/${productId}`);

        setWishlistIds((prev) =>
          prev.filter((id) => id !== productId)
        );

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
    try {
      const response = await axios.get("/wishlist");

      const data = response?.data;

      const wishlist = Array.isArray(data)
        ? data
        : data?.wishlist ?? [];

      // extract only product IDs
      const ids = wishlist.map((item: any) => item.product_id);

      setWishlistIds(ids);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load wishlist");
    }
  };

  useEffect(() => {
    fetchWishlistIds();
  }, []);

  // PREVENT CRASH
  if (!product) return null;

  const conditionColor =
    product.condition === "Refurbished"
      ? "bg-orange-500"
      : "bg-green-500";

  const addToWishlist = async (productId: number) => {
    try {
      await axios.post(`/wishlist/${productId}`);

      toast.success("Added to wishlist");
    } catch (error) {
      toast.error("Failed to add");
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please login first. Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

      return;
    }

    addToCart(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="
        bg-white rounded-2xl overflow-hidden
        shadow-sm hover:shadow-xl
        transition-all duration-300
        border border-black/20
        group
        w-full
      "
    >
      {/* IMAGE */}
      <div className="relative overflow-hidden">
        <Link to={`/products/${product.id}`}>
          <img
            src={product.image || "/placeholder.png"}
            alt={product.name || "Product"}
            className="
              w-full h-52 sm:h-60 md:h-64
              object-cover
              group-hover:scale-110
              transition-transform duration-500
            "
          />
        </Link>

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />

        {/* CONDITION */}
        {product.condition && (
          <span
            className={`
              absolute top-2 lg:top-3 left-2 lg:left-3
              text-[11px] px-2 rounded-full
              text-white font-medium shadow-md
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
              absolute top-2 lg:top-3 right-2 lg:right-3
              text-[11px] px-2 rounded-full
              bg-green-500 text-white
              font-semibold shadow-md
            "
          >
            -{product.discount_percentage}%
          </span>
        )}

        {/* GRADE */}
        {product.grade && (
          <span
            className="
              absolute top-7 lg:top-8 right-2 lg:right-3
              text-[11px] px-2 rounded-full
              bg-primary text-white
              font-medium shadow-md
            "
          >
            {product.grade}
          </span>
        )}
      </div>

      {/* CONTENT */}
      <div className="px-1.5 lg:px-3 py-1 lg:py-1.5 flex justify-between gap-1 lg:gap-3">
        {/* LEFT */}
        <div className="flex-1 min-w-0">
          {/* BRAND */}
          {product.brand?.name && (
            <div className="flex items-center gap-1 pt-1">
              {product.brand?.logo_url && (
                <img
                  src={product.brand.logo_url}
                  alt={product.brand.name}
                  className="w-5 h-5 rounded-full object-cover border"
                />
              )}

              <p className="text-[10px] md:text-sm text-gray-500 font-medium truncate">
                {product.brand.name}
              </p>
            </div>
          )}

          {/* NAME */}
          <Link to={`/products/${product.id}`}>
            <h3
              className="
                text-[12px]
                lg:text-[15px]
                font-semibold text-gray-900
                hover:text-primary
                transition-colors
              "
            >
              {product.name}
            </h3>
          </Link>

          {/* RATING */}
          <p className="text-[10px] md:text-sm text-yellow-500 font-medium mb-2 md:mb-0">
            ⭐ {product.rating ?? 0}
          </p>

          {/* PRICE */}
          <p className="text-[14px] md:text-[16px] font-bold text-gray-900 md:mt-1">
            {formatPrice(product.price)}
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col items-center justify-center gap-2">
          {/* HEART */}
          <button
            className={`w-11 h-8 pt-3 flex items-center justify-center transition-all duration-200 ${
              wishlistIds.includes(product.id)
                ? "text-red-500"
                : "text-muted-foreground hover:text-red-500"
            }`}
            onClick={() => toggleWishlist(product.id)}
          >
            <Heart
              size={18}
              className={
                wishlistIds.includes(product.id)
                  ? "fill-red-500"
                  : ""
              }
            />
          </button>

          {/* CART */}
          <button
            onClick={handleAddToCart}
            className="
              w-7 lg:w-11 h-7 lg:h-11 rounded-md lg:rounded-xl
              bg-white text-primary/80 border border-black/20
              hover:bg-secondary hover:text-primary mt-2
              transition-all duration-200
              flex items-center justify-center
            "
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;