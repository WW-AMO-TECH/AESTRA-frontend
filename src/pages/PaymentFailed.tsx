import { useSearchParams, useNavigate } from "react-router-dom";
import { XCircle, ShoppingCart, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const message =
    searchParams.get("message") ||
    "Unable to complete your payment. Please try again.";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-2xl border shadow-sm p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Payment Failed
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            {message}
          </p>

          <p className="mt-2 text-xs text-gray-400">
            If your account was charged, please do not make another payment until the transaction is confirmed.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/checkout")}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Try Again
            </button>

            <button
              onClick={() => navigate("/cart")}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              <ShoppingCart className="h-4 w-4" />
              View Cart
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentFailed;
