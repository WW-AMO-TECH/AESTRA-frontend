import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "@/components/Navbar";
import { CheckCircle2 } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

const OrderConfirmation = () => {

  const { id } = useParams();

  const [order, setOrder] = useState<any>(null);

  useEffect(() => {

    fetchOrder();

  }, []);

  const fetchOrder = async () => {

    try {

      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API}/orders/${id}/confirmation`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrder(res.data);

    } catch (error) {

      console.error(error);
    }
  };

  if (!order) return null;

  return (
    <div className="min-h-screen bg-background">

      <Navbar />

      <div className="container mx-auto px-4 py-20 text-center">

        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />

        <h1 className="text-3xl font-bold mb-2">
          Order Confirmed
        </h1>

        <p className="text-muted-foreground mb-6">
          Your order has been placed successfully.
        </p>

        <div className="glass-card p-6 max-w-md mx-auto text-left">

          <div className="flex justify-between mb-2">
            <span>Order Number</span>
            <span className="font-semibold">
              {order.order_number}
            </span>
          </div>

          <div className="flex justify-between mb-2">
            <span>Payment</span>
            <span className="capitalize">
              {order.payment_method}
            </span>
          </div>

          <div className="flex justify-between mb-2">
            <span>Fulfillment</span>
            <span className="capitalize">
              {order.fulfillment}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Total</span>
            <span className="font-bold">
              ₦{Number(order.total).toLocaleString()}
            </span>
          </div>
        </div>

        <Link
          to="/dashboard"
          className="inline-block mt-6 btn-primary-glow"
        >
          View Orders
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;