import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { formatPrice } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

const API_IMAGE = "https://aestra.onrender.com";

const Cart = () => {
  const {
    cart = [],
    fetchCart,
    removeFromCart,
    updateQuantity,
  } = useAuth();

  const safeCart = Array.isArray(cart) ? cart : [];
  const [localCart, setLocalCart] = useState<any[]>(safeCart);

  /* Keep local cart synced with AuthContext */
  useEffect(() => {
    setLocalCart(safeCart);
  }, [cart]);

  /* Fetch once when Cart opens */
  useEffect(() => {
    fetchCart();
  }, []);

  const subtotal = useMemo(
    () =>
      localCart.reduce(
        (sum, item) =>
          sum +
          Number(
            item?.product?.final_price ??
              item?.product?.price ??
              0
          ) *
            item.quantity,
        0
      ),
    [localCart]
  );

  const changeQuantity = async (
    itemId: number,
    currentQuantity: number,
    change: number
  ) => {
    const newQuantity = Math.max(1, currentQuantity + change);

    /* UPDATE UI IMMEDIATELY */
    setLocalCart((items) =>
      items.map((item) =>
        item.id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );

    /* UPDATE BACKEND IN BACKGROUND */
    try {
      await updateQuantity(itemId, newQuantity);
    } catch {
      /* Restore if backend update fails */
      setLocalCart(safeCart);
    }
  };

  const removeItem = async (itemId: number) => {
    /* Remove immediately from UI */
    setLocalCart((items) =>
      items.filter((item) => item.id !== itemId)
    );

    try {
      await removeFromCart(itemId);
    } catch {
      setLocalCart(safeCart);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-3 lg:px-4 py-5 lg:py-8">

        {localCart.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <ShoppingBag className="w-14 h-14 text-muted mx-auto mb-4" />

            <p className="text-muted-foreground mb-4 text-sm">
              Your cart is empty
            </p>

            <Link
              to="/products"
              className="btn-primary-glow inline-block text-sm"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ITEMS */}
            <div className="lg:col-span-2 space-y-3">
              {localCart.map((item) => {
                const product = item?.product;

                const image = product?.image
                  ? product.image
                  : product?.images?.[0]?.image_url
                    ? product.images[0].image_url.startsWith("http")
                      ? product.images[0].image_url
                      : `${API_IMAGE}${product.images[0].image_url}`
                    : "/placeholder.png";

                const price = Number(
                  product?.final_price ??
                    product?.price ??
                    0
                );

                return (
                  <div
                    key={item.id}
                    className="glass-card p-3 flex gap-3 animate-fade-in"
                  >
                    <img
                      src={image}
                      alt={product?.name || "Product"}
                      width={80}
                      height={80}
                      fetchPriority="high"
                      decoding="async"
                      className="w-20 h-20 rounded-md object-cover shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/products/${product?.id}`}
                        className="font-semibold text-xs hover:text-primary transition-colors"
                      >
                        {product?.name}
                      </Link>

                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {product?.brand?.name ||
                          product?.brand ||
                          ""}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        {/* QTY */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={item.quantity <= 1}
                            onClick={() =>
                              changeQuantity(
                                item.id,
                                item.quantity,
                                -1
                              )
                            }
                            className="w-7 h-7 rounded-lg border border-input flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-40"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <span className="text-xs font-medium w-6 text-center">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              changeQuantity(
                                item.id,
                                item.quantity,
                                1
                              )
                            }
                            className="w-7 h-7 rounded-lg border border-input flex items-center justify-center hover:bg-secondary transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* PRICE + REMOVE */}
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">
                            {formatPrice(
                              price * item.quantity
                            )}
                          </span>

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="text-center py-4">
                <Link
                  to="/products"
                  className="btn-primary-glow inline-block text-sm"
                >
                  Browse Products
                </Link>
              </div>
            </div>

            {/* SUMMARY */}
            <div className="glass-card p-4 h-fit sticky top-24">
              <h3 className="font-display font-semibold text-base mb-3">
                Order Summary
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-xs">
                    Subtotal
                  </span>

                  <span className="text-xs">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground text-xs">
                    Shipping
                  </span>

                  <span className="text-primary font-medium text-xs">
                    __
                  </span>
                </div>

                <div className="border-t border-border pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full btn-primary-glow text-sm mt-4 block text-center"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;