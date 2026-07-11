import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "@/api/axios";

import {ShoppingCart, Heart, ChevronLeft, ChevronRight, Loader2, Shield, AlertTriangle, Zap, Cpu } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

const API_URL =
  import.meta.env.VITE_API_URL ||
  // "http://127.0.0.1:8000/api";
  "https://excess-macaw-sassy.ngrok-free.dev/api";

const BASE_URL = API_URL.replace("/api", "");

type Product = {
  id: number;
  name: string;
  description: string;

  price: number;
  original_price?: number;

  stock: number;

  condition?: string;
  warranty?: string;

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
  const [product, setProduct] =
    useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const location = useLocation();
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  
  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id, location.pathname]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/products/${id}`
      );
      setProduct(response.data.data);

    } catch (error) {
      console.error(error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };  

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

  // LOADING
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

  // NOT FOUND
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

  /* ---------------- IMAGES ---------------- */

  const imgs =
    product.images
      ?.filter(
        (img) =>
          img?.image_url || img?.image
      )
      .map((img) => {

        if (img.image_url) {
          return img.image_url;
        }

        return `${BASE_URL}/storage/${img.image}`;
      }) || [];

  const displayImages =
    imgs.length > 0
      ? imgs
      : ["/placeholder.png"];

  const lowStock =
    product.stock > 0 &&
    product.stock <= 5;

  const conditionColor =
    product.condition === "Original"
      ? "bg-emerald-500"
      : "bg-amber-500";
    
  const conditionColors =
    product.condition === "Original"
      ? "bg-emerald-100"
      : "bg-amber-500";

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
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-4">

        {/* BACK */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary font-semibold mb-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >

            <div className="relative aspect-[calc(4*3+1)/9] rounded-md border border-black/20 overflow-hidden bg-secondary/30">

              <img
                src={displayImages[imgIdx]}
                alt={product.name}
                className="w-full h-full object-cover
                group-hover:scale-110
                transition-transform duration-500"
              />

              {/* ARROWS */}
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setImgIdx(
                        (prev) =>
                          (prev -
                            1 +
                            displayImages.length) %
                          displayImages.length
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white w-10 h-10 rounded-full flex items-center justify-center"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() =>
                      setImgIdx(
                        (prev) =>
                          (prev + 1) %
                          displayImages.length
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white w-10 h-10 rounded-full flex items-center justify-center"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* CONDITION */}
              {product.condition && (
                <span className={`absolute top-3 left-3 ${conditionColor} text-white text-xs px-3 py-1 rounded-full`}>
                  {product.condition}
                </span>
              )}

              {/* LOW STOCK */}
              {lowStock && (
                <div className="absolute bottom-3 left-3 bg-red-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Only {product.stock} left
                </div>
              )}
            </div>

            {/* THUMBNAILS */}
            {displayImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">

                {displayImages.map((img, index) => (

                  <button
                    key={index}
                    onClick={() =>
                      setImgIdx(index)
                    }
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 ${
                      imgIdx === index
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>

                ))}
              </div>
            )}
          </motion.div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >

            {/* TITLE */}
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                {product.brand?.name}
              </p>

              <h1 className="font-display text-2xl md:text-3xl font-bold mt-1">
                {product.name}
              </h1>
            </div>

            {/* RATINGS  */}
            <div></div>

            {/* PRICE */}
            <div className="flex items-baseline gap-3">
              <span className="font-display text-3xl font-bold">
                {formatPrice(product.price)}
              </span>

              {product.original_price && (
                <span className="text-base text-muted-foreground line-through">
                  {formatPrice(
                    product.original_price
                  )}
                </span>
              )}
            </div>

            {/* DESCRIPTION */}
            <p className="text-muted-foreground text-sm leading-relaxed">
              {product.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {/* WARRANTY */}
              {product.warranty && (
                <div className="flex items-center gap-2 border border-primary bg-secondary/40 px-4 py-2 rounded-xl w-fit">
                  <Shield className="w-4 h-4 text-primary" />

                  <span className="text-sm">
                    <span className="font-semibold">{product.warranty}</span>{' '}Warranty
                  </span>
                </div>
              )}
              
              {/* CONDITION */}
              {product.condition && (
                <span className={`${conditionColors} flex items-center gap-2 px-4 py-2 text-primary rounded-xl w-fit`}>
                  <Zap className="w-4 h-4" />
                  {product.condition}
                </span>
              )}
            </div>


            {/* STOCK */}
            <div className="text-sm">
              {product.stock > 0 ? (
                <span className="text-emerald-600 font-medium">
                  In Stock ({product.stock})
                </span>
              ) : (
                <span className="text-red-500 font-medium">
                  Out of Stock
                </span>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-3">

              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 bg-primary/90 text-white rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-primary"
              >
                <ShoppingCart className="w-4 h-4 hover:opacity-50" />

                {product.stock > 0
                  ? "Add to Cart"
                  : "Out of Stock"}
              </button>

              <button
                className={`w-14 rounded-xl border flex items-center justify-center transition ${
                  wishlistIds.includes(product.id)
                    ? "bg-white"
                    : "bg-transparent"
                }`}
                onClick={() => toggleWishlist(product.id)}
              >
                <Heart
                  className={`w-7 h-7 ${
                    wishlistIds.includes(product.id)
                      ? "text-white fill-red-500"
                      : ""
                  }`}
                />
              </button>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-10 py-1">

          {/* SPECS */}
          <div>
            <span className="flex items-center px-2 py-3 gap-2 rounded-xl w-fit">
              <Cpu className="w-4 h-4 text-blue-700" />
              Technical Specifications
            </span>
            <div className="border border-primary rounded-md overflow-hidden">

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>

                    {product.ram && (
                      <tr className="border-b bg-primary/10">
                        <td className="px-5 py-4 font-semibold text-muted-foreground w-40">
                          RAM
                        </td>
                        <td className="px-5 py-4 font-medium">
                          {product.ram}
                        </td>
                      </tr>
                    )}
                    <tr className="border-b py-2"></tr>

                    {product.battery && (
                      <tr className="border-b bg-primary/10">
                        <td className="px-5 py-4 font-semibold text-muted-foreground">
                          Battery
                        </td>
                        <td className="px-5 py-4 font-medium">
                          {product.battery}
                        </td>
                      </tr>
                    )}
                    <tr className="border-b py-2"></tr>

                    {product.storage && (
                      <tr className="border-b bg-primary/10">
                        <td className="px-5 py-4 font-semibold text-muted-foreground">
                          Storage
                        </td>
                        <td className="px-5 py-4 font-medium">
                          {product.storage}
                        </td>
                      </tr>
                    )}
                    <tr className="border-b py-2"></tr>

                    {product.camera && (
                      <tr className="border-b bg-primary/10">
                        <td className="px-5 py-4 font-semibold text-muted-foreground">
                          Camera
                        </td>
                        <td className="px-5 py-4 font-medium">
                          {product.camera}
                        </td>
                      </tr>
                    )}
                    <tr className="border-b py-2"></tr>

                    {product.cpu && (
                      <tr className="border-b bg-primary/10">
                        <td className="px-5 py-4 font-semibold text-muted-foreground">
                          CPU
                        </td>
                        <td className="px-5 py-4 font-medium">
                          {product.cpu}
                        </td>
                      </tr>
                    )}
                    <tr className="border-b py-2"></tr>

                    {product.gpu && (
                      <tr className="border-b bg-primary/10">
                        <td className="px-5 py-4 font-semibold text-muted-foreground">
                          GPU
                        </td>
                        <td className="px-5 py-4 font-medium">
                          {product.gpu}
                        </td>
                      </tr>
                    )}
                    <tr className="border-b py-2"></tr>

                    {product.display && (
                      <tr className="border-b bg-primary/10">
                        <td className="px-5 py-4 font-semibold text-muted-foreground">
                          Display
                        </td>
                        <td className="px-5 py-4 font-medium">
                          {product.display}
                        </td>
                      </tr>
                    )}
                    <tr className="border-b py-2"></tr>

                    {product.os && (
                      <tr className="border-b bg-primary/10">
                        <td className="px-5 py-4 font-semibold text-muted-foreground">
                          OS
                        </td>
                        <td className="px-5 py-4 font-medium">
                          {product.os}
                        </td>
                      </tr>
                    )}
                    <tr className="border-b py-2"></tr>

                    {product.connectivity && (
                      <tr className="border-b bg-primary/10">
                        <td className="px-5 py-4 font-semibold text-muted-foreground">
                          Connectivity
                        </td>
                        <td className="px-5 py-4 font-medium">
                          {product.connectivity}
                        </td>
                      </tr>
                    )}

                  </tbody>
                </table>
              </div>

            </div>
          </div>

          {/* SPECS */}
          {/* <div>
            <span className="flex items-center px-2 py-3 gap-2 rounded-xl w-fit">
              <Cpu className="w-4 h-4 text-blue-700" />
              Features
            </span>
            <div className="border border-primary rounded-2xl overflow-hidden">

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>

                    {product.ram && (
                      <tr className="border-b bg-primary/20">
                        <td className="px-5 py-4 font-semibold text-muted-foreground w-40">
                          RAM
                        </td>
                        <td className="px-5 py-4 font-medium">
                          {product.ram}
                        </td>
                      </tr>
                    )}

                    {product.battery && (
                      <tr className="border-b bg-primary/20">
                        <td className="px-5 py-4 font-semibold text-muted-foreground">
                          Battery
                        </td>
                        <td className="px-5 py-4 font-medium">
                          {product.battery}
                        </td>
                      </tr>
                    )}

                    {product.storage && (
                      <tr className="border-b bg-primary/20">
                        <td className="px-5 py-4 font-semibold text-muted-foreground">
                          Storage
                        </td>
                        <td className="px-5 py-4 font-medium">
                          {product.storage}
                        </td>
                      </tr>
                    )}

                    {product.camera && (
                      <tr className="border-b bg-primary/20">
                        <td className="px-5 py-4 font-semibold text-muted-foreground">
                          Camera
                        </td>
                        <td className="px-5 py-4 font-medium">
                          {product.camera}
                        </td>
                      </tr>
                    )}

                    {product.cpu && (
                      <tr className="border-b bg-primary/20">
                        <td className="px-5 py-4 font-semibold text-muted-foreground">
                          CPU
                        </td>
                        <td className="px-5 py-4 font-medium">
                          {product.cpu}
                        </td>
                      </tr>
                    )}

                    {product.gpu && (
                      <tr className="border-b bg-primary/20">
                        <td className="px-5 py-4 font-semibold text-muted-foreground">
                          GPU
                        </td>
                        <td className="px-5 py-4 font-medium">
                          {product.gpu}
                        </td>
                      </tr>
                    )}

                    {product.display && (
                      <tr className="border-b bg-primary/20">
                        <td className="px-5 py-4 font-semibold text-muted-foreground">
                          Display
                        </td>
                        <td className="px-5 py-4 font-medium">
                          {product.display}
                        </td>
                      </tr>
                    )}

                    {product.os && (
                      <tr className="border-b bg-primary/20">
                        <td className="px-5 py-4 font-semibold text-muted-foreground">
                          OS
                        </td>
                        <td className="px-5 py-4 font-medium">
                          {product.os}
                        </td>
                      </tr>
                    )}

                    {product.connectivity && (
                      <tr className="border-b bg-primary/20">
                        <td className="px-5 py-4 font-semibold text-muted-foreground">
                          Connectivity
                        </td>
                        <td className="px-5 py-4 font-medium">
                          {product.connectivity}
                        </td>
                      </tr>
                    )}

                  </tbody>
                </table>
              </div>

            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

const Spec = ({
  label,
  value,
}: {
  label: string;
  value?: string;
}) => {

  if (!value) return null;

  return (
    <div className="border rounded-xl p-3">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="font-medium mt-1">
        {value}
      </p>
    </div>
  );
};

export default ProductDetail;