import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import axios from "@/api/axios";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  const params = new URLSearchParams(window.location.search);
  const reference = params.get("reference");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        navigate("/payment-failed?message=Missing payment reference.", { replace: true });
        return;
      }

      try {
        const response = await axios.get(
          `/payments/verify?reference=${encodeURIComponent(reference)}`
        );

        if (response.data.status !== "success") {
          const message =
            response.data?.message ||
            "Payment was successful, but your order could not be finalized.";

          navigate(
            `/payment-failed?message=${encodeURIComponent(message)}`,
            { replace: true }
          );

          return;
        }
      } catch (error: any) {
        console.error("Payment verification failed:", error);

        const message =
          error?.response?.data?.message ||
          "Payment was successful, but we could not confirm your order.";

        navigate(
          `/payment-failed?message=${encodeURIComponent(message)}`,
          { replace: true }
        );
      }
    };

    verifyPayment();
  }, [reference, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center space-y-6 glass-card p-8 rounded-2xl animate-fade-in">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-green-600">
            Payment Successful
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            Your order has been placed successfully 🎉
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            Payment Reference
          </p>

          <div className="font-mono text-sm font-semibold tracking-wide break-all">
            {reference}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() =>
              navigate("/dashboard", { state: { tab: "orders" } })
            }
            className="flex-1 btn-primary-glow px-4 py-2 rounded-xl text-sm font-medium"
          >
            View Orders
          </button>

          <button
            onClick={() => navigate("/products")}
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