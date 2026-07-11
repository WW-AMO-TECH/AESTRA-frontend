import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";
import axios from "@/api/axios";
import { useAuth } from "@/context/AuthContext";


const PaymentSuccess = () => {
  const params = new URLSearchParams(window.location.search);
  const reference = params.get("reference");
  const navigate = useNavigate();
  const { clearCart } = useAuth();

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        navigate("/orders");
        return;
      }

      try {
        const token = localStorage.getItem("token");

        // 🔥 VERIFY PAYMENT WITH BACKEND (Paystack check optional but good safety)
        const res = await axios.get(
          `/payments/verify?reference=${reference}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Only clear cart if payment is confirmed
        if (res.data?.status === "success") {
          clearCart();
        }

      } catch (err) {
        console.log("Payment verification failed", err);
        navigate("/orders");
      }
    };

    verifyPayment();
  }, [reference, navigate, clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center space-y-6 glass-card p-8 rounded-2xl animate-fade-in">

        {/* ICON */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
        </div>

        {/* TITLE */}
        <div>
          <h1 className="text-2xl font-bold text-green-600">
            Payment Successful
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your order has been placed successfully 🎉
          </p>
        </div>

        {/* ORDER REF */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Order Number</p>
          <div className="font-mono text-lg font-semibold tracking-wide">
            {reference}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => navigate("/dashboard", { state: { tab: "orders" } }) }
            className="flex-1 btn-primary-glow px-4 py-2 rounded-xl text-sm font-medium"
          >
            View Orders
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex-1 border border-input px-4 py-2 rounded-xl text-sm font-medium hover:bg-muted transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;