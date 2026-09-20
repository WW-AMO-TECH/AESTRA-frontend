import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import {
  CreditCard,
  Building2,
  Loader2,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import axios from "@/api/axios";

type Step = "fulfillment" | "payment" | "processing" | "success";

interface State {
  id: number;
  name: string;
}

interface Location {
  id: number;
  name: string;
  address: string;
  phone: string;
  opening_time: string;
  closing_time: string;
}

const PAYSTACK_FEE_PERCENTAGE = 2;
const BANK_TRANSFER_FEE_PERCENTAGE = 0.7;

const Checkout = () => {
  const { user, cart } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("fulfillment");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">("delivery");

  const [states, setStates] = useState<State[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const [selectedLocation, setSelectedLocation] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing">("idle");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer" | "">("");

  const [bankAccountName, setBankAccountName] = useState("");
  const [bankTransactionNumber, setBankTransactionNumber] = useState("");
  const [bankTransferReference, setBankTransferReference] = useState("");
  const [copiedAccountNumber, setCopiedAccountNumber] = useState(false);

  const safeCart = Array.isArray(cart) ? cart : [];

  const subtotal = useMemo(() => {
    return safeCart.reduce((total: number, item: any) => {
      const price = Number(
        item?.product?.final_price ?? item?.product?.price ?? 0
      );

      return total + price * Number(item?.quantity ?? 0);
    }, 0);
  }, [safeCart]);

  const paystackTransactionFee = useMemo(() => {
    return Number(
      ((subtotal * PAYSTACK_FEE_PERCENTAGE) / 100).toFixed(2)
    );
  }, [subtotal]);

  const bankTransferTransactionFee = useMemo(() => {
    return Number(
      ((subtotal * BANK_TRANSFER_FEE_PERCENTAGE) / 100).toFixed(2)
    );
  }, [subtotal]);

  const paystackTotal = useMemo(() => {
    return Number((subtotal + paystackTransactionFee).toFixed(2));
  }, [subtotal, paystackTransactionFee]);

  const bankTransferTotal = useMemo(() => {
    return Number((subtotal + bankTransferTransactionFee).toFixed(2));
  }, [subtotal, bankTransferTransactionFee]);

  const selectedTotal =
    paymentMethod === "transfer" ? bankTransferTotal : paystackTotal;

  useEffect(() => {
    if (user) {
      setFullName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await axios.get("/superadmin/states");
        setStates(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch states:", err);
        setStates([]);
      }
    };

    fetchStates();
  }, []);

  useEffect(() => {
    if (safeCart.length === 0 && step === "fulfillment") {
      navigate("/cart", { replace: true });
    }
  }, [safeCart.length, step, navigate]);

  const fetchLocations = async (stateName: string) => {
    const selectedStateObj = states.find(
      (item) => item.name === stateName
    );

    if (!selectedStateObj) {
      setLocations([]);
      return;
    }

    try {
      const res = await axios.get(
        `/superadmin/states/${selectedStateObj.id}/locations`
      );

      setLocations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch pickup locations:", err);
      setLocations([]);
    }
  };

  const handleStateChange = async (value: string) => {
    setState(value);
    setCity("");
    setSelectedLocation("");
    setLocations([]);

    if (fulfillment === "pickup" && value) {
      await fetchLocations(value);
    }
  };

  const handleFulfillmentChange = async (
    method: "delivery" | "pickup"
  ) => {
    setFulfillment(method);
    setSelectedLocation("");
    setLocations([]);

    if (method === "pickup" && state) {
      await fetchLocations(state);
    }
  };

  const validateFulfillment = () => {
    if (!fullName.trim()) {
      alert("Please enter your full name.");
      return false;
    }

    if (!phone.trim()) {
      alert("Please enter your phone number.");
      return false;
    }

    if (!state) {
      alert("Please select your state.");
      return false;
    }

    if (fulfillment === "delivery") {
      if (!city.trim()) {
        alert("Please enter your city.");
        return false;
      }

      if (!address.trim()) {
        alert("Please enter your delivery address.");
        return false;
      }
    }

    if (fulfillment === "pickup" && !selectedLocation) {
      alert("Please select a pickup location.");
      return false;
    }

    if (safeCart.length === 0) {
      alert("Your cart is empty.");
      navigate("/cart");
      return false;
    }

    return true;
  };

  const handleContinueToPayment = () => {
    if (!validateFulfillment()) return;

    setStep("payment");
  };

  const copyAccountNumber = async () => {
    try {
      await navigator.clipboard.writeText("0225328888");
      setCopiedAccountNumber(true);

      setTimeout(() => {
        setCopiedAccountNumber(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy account number:", error);
    }
  };

  const handlePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    if (!user?.email) {
      alert("Your account email could not be found. Please log in again.");
      return;
    }

    if (safeCart.length === 0) {
      alert("Your cart is empty.");
      navigate("/cart");
      return;
    }

    if (paymentMethod === "transfer") {
      if (!bankAccountName.trim()) {
        alert("Please enter the name of the bank account used for the payment.");
        return;
      }

      if (!bankTransactionNumber.trim()) {
        alert("Please enter the transaction number or session ID.");
        return;
      }

      try {
        setPaymentStatus("processing");
        setStep("processing");

        const res = await axios.post("/payments/bank-transfer", {
          email: user.email,
          fulfillment,
          full_name: fullName.trim(),
          phone: phone.trim(),
          state,
          city: fulfillment === "delivery" ? city.trim() : null,
          address: fulfillment === "delivery" ? address.trim() : null,
          pickup_state: fulfillment === "pickup" ? state : null,
          pickup_location:
            fulfillment === "pickup" ? selectedLocation : null,
          bank_account_name: bankAccountName.trim(),
          bank_transaction_number: bankTransactionNumber.trim(),
          items: safeCart.map((item: any) => ({
            product_id: item.product.id,
            quantity: Number(item.quantity),
          })),
        });

        setBankTransferReference(res.data?.reference || "");
        setPaymentStatus("idle");
        setStep("success");
      } catch (error: any) {
        console.error("Bank transfer submission failed:", error);

        setPaymentStatus("idle");
        setStep("payment");

        alert(
          error?.response?.data?.message ||
            "We couldn't submit your bank transfer details. Please try again."
        );
      }

      return;
    }

    try {
      setPaymentStatus("processing");
      setStep("processing");

      const res = await axios.post("/payments/initiate", {
        email: user.email,
        payment_method: "paystack",
        fulfillment,
        full_name: fullName.trim(),
        phone: phone.trim(),
        state,
        city: fulfillment === "delivery" ? city.trim() : null,
        address: fulfillment === "delivery" ? address.trim() : null,
        pickup_state: fulfillment === "pickup" ? state : null,
        pickup_location:
          fulfillment === "pickup" ? selectedLocation : null,
        items: safeCart.map((item: any) => ({
          product_id: item.product.id,
          quantity: Number(item.quantity),
        })),
      });

      const { authorization_url } = res.data;

      if (!authorization_url) {
        throw new Error("Missing Paystack authorization URL.");
      }

      window.location.href = authorization_url;
    } catch (error: any) {
      console.error("Payment initialization failed:", error);

      setPaymentStatus("idle");
      setStep("payment");

      navigate(
        `/payment-failed?message=${encodeURIComponent(
          "We couldn't start your payment. Please try again or use another payment method."
        )}`
      );
    }
  };

  if (step === "processing") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="glass-card w-full max-w-md p-8 text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />

            <h2 className="mt-5 text-lg font-semibold">
              {paymentMethod === "transfer"
                ? "Submitting transfer details..."
                : "Redirecting to secure payment..."}
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              {paymentMethod === "transfer"
                ? "Please wait while we submit your payment information."
                : "Please wait while we connect you to Paystack."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === "success" && paymentMethod === "transfer") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="flex min-h-[75vh] items-center justify-center px-4 py-10">
          <div className="glass-card w-full max-w-lg p-8 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />

            <h2 className="mt-5 text-2xl font-bold">
              Transfer Details Submitted
            </h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Your bank transfer details have been submitted successfully.
              Your order will remain pending while AESTRA verifies the payment.
            </p>

            {bankTransferReference && (
              <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4 text-left">
                <p className="text-xs text-muted-foreground">
                  Order Reference
                </p>

                <p className="mt-1 font-semibold">
                  {bankTransferReference}
                </p>
              </div>
            )}

            <div className="mt-6 rounded-xl bg-muted/50 p-4 text-left">
              <p className="text-xs leading-5 text-muted-foreground">
                Please keep your transfer receipt and transaction details
                until your payment has been verified.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/orders")}
              className="btn-primary-glow mt-6 w-full"
            >
              View My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto grid grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {step === "fulfillment" && (
            <div className="glass-card space-y-4 p-5">
              <h2 className="mb-3 text-base font-semibold">
                Fulfillment Method
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {(["delivery", "pickup"] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => handleFulfillmentChange(method)}
                    className={`rounded-xl border-2 p-3 text-sm font-medium transition-all ${
                      fulfillment === method
                        ? "border-primary bg-primary/5"
                        : "border-input hover:border-muted-foreground/30"
                    }`}
                  >
                    {method === "delivery" ? "🚚 Delivery" : "🏪 Pickup"}
                  </button>
                ))}
              </div>

              {fulfillment === "delivery" && (
                <div className="glass-card animate-fade-in space-y-4 p-5">
                  <h3 className="font-display text-base font-semibold">
                    Shipping Information
                  </h3>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium">
                        Full Name
                      </label>

                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium">
                        Phone Number
                      </label>

                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium">
                        State
                      </label>

                      <select
                        required
                        value={state}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select State</option>

                        {states.map((item) => (
                          <option key={item.id} value={item.name}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium">
                        City
                      </label>

                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium">
                      Address
                    </label>

                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              )}

              {fulfillment === "pickup" && (
                <div className="glass-card animate-fade-in space-y-4 p-5">
                  <h3 className="font-display text-base font-semibold">
                    Pickup Information
                  </h3>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium">
                        State
                      </label>

                      <select
                        required
                        value={state}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select State</option>

                        {states.map((item) => (
                          <option key={item.id} value={item.name}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium">
                        Pickup Location
                      </label>

                      <select
                        required
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        disabled={!state || locations.length === 0}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">
                          {!state
                            ? "Select State First"
                            : locations.length === 0
                            ? "No Locations Available"
                            : "Select Location"}
                        </option>

                        {locations.map((location) => (
                          <option key={location.id} value={location.id}>
                            {location.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedLocation &&
                    (() => {
                      const selected = locations.find(
                        (location) =>
                          location.id.toString() === selectedLocation
                      );

                      if (!selected) return null;

                      return (
                        <div className="animate-fade-in space-y-2 rounded-xl border-2 border-primary bg-primary/5 p-4">
                          <p className="text-sm font-semibold">
                            {selected.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {selected.address}
                          </p>

                          <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                            {selected.phone && (
                              <div className="flex justify-between gap-3">
                                <span>Phone:</span>
                                <span className="font-medium text-foreground">
                                  {selected.phone}
                                </span>
                              </div>
                            )}

                            {selected.opening_time && (
                              <div className="flex justify-between gap-3">
                                <span>Opens:</span>
                                <span className="font-medium text-foreground">
                                  {selected.opening_time}
                                </span>
                              </div>
                            )}

                            {selected.closing_time && (
                              <div className="flex justify-between gap-3">
                                <span>Closes:</span>
                                <span className="font-medium text-foreground">
                                  {selected.closing_time}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium">
                        Full Name
                      </label>

                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium">
                        Phone Number
                      </label>

                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleContinueToPayment}
                className="btn-primary-glow w-full"
              >
                Continue
              </button>
            </div>
          )}

          {step === "payment" && (
            <div className="animate-fade-in space-y-5">
              {paymentStatus === "processing" ? (
                <div className="glass-card space-y-3 p-10 text-center">
                  <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />

                  <p className="text-sm font-medium">
                    Processing payment...
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePayment} className="space-y-5">
                  <div className="glass-card p-5">
                    <h3 className="font-display mb-3 text-base font-semibold">
                      Select Payment Method
                    </h3>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-all ${
                          paymentMethod === "card"
                            ? "border-primary bg-primary/5"
                            : "border-input hover:border-muted-foreground/30"
                        }`}
                      >
                        <CreditCard className="h-4 w-4" />
                        Paystack Checkout
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("transfer")}
                        className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-all ${
                          paymentMethod === "transfer"
                            ? "border-primary bg-primary/5"
                            : "border-input hover:border-muted-foreground/30"
                        }`}
                      >
                        <Building2 className="h-4 w-4" />
                        Bank Transfer
                      </button>
                    </div>
                  </div>

                  {paymentMethod === "card" && (
                    <div className="glass-card space-y-3 p-4">
                      <p className="text-xs text-muted-foreground">
                        You will be securely redirected to Paystack to complete
                        your payment.
                      </p>

                      <div className="flex justify-between text-sm">
                        <span>Transaction Fee ({PAYSTACK_FEE_PERCENTAGE}%)</span>
                        <span>{formatPrice(paystackTransactionFee)}</span>
                      </div>

                      <div className="flex justify-between border-t pt-3 font-semibold">
                        <span>Total</span>
                        <span>{formatPrice(paystackTotal)}</span>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "transfer" && (
                    <div className="glass-card space-y-5 p-5">
                      <div>
                        <h3 className="font-display text-base font-semibold">
                          Bank Transfer
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          Transfer the exact amount below to the AESTRA account.
                          Your order will remain pending until the payment is
                          verified.
                        </p>
                      </div>

                      <div className="rounded-xl border-2 border-primary bg-primary/5 p-4">
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">
                              Bank
                            </span>
                            <span className="font-semibold">Zenith Bank</span>
                          </div>

                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">
                              Account Name
                            </span>
                            <span className="font-semibold">
                              AESTRA TECHNOLOGIES
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">
                              Account Number
                            </span>

                            <button
                              type="button"
                              onClick={copyAccountNumber}
                              className="flex items-center gap-2 font-semibold text-primary"
                            >
                              0225328888
                              {copiedAccountNumber ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl bg-muted/40 p-4">
                        <div className="flex justify-between text-sm">
                          <span>Product Subtotal</span>
                          <span>{formatPrice(subtotal)}</span>
                        </div>

                        <div className="mt-2 flex justify-between text-sm">
                          <span>Transaction Fee ({BANK_TRANSFER_FEE_PERCENTAGE}%)</span>
                          <span>
                            {formatPrice(bankTransferTransactionFee)}
                          </span>
                        </div>

                        <div className="mt-3 flex justify-between border-t pt-3 font-bold">
                          <span>Total to Transfer</span>
                          <span>{formatPrice(bankTransferTotal)}</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="mb-1 block text-xs font-medium">
                            Account Name Used for Payment
                          </label>

                          <input
                            type="text"
                            value={bankAccountName}
                            onChange={(e) =>
                              setBankAccountName(e.target.value)
                            }
                            placeholder="Input the name of the account used for the payment"
                            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />

                          <p className="mt-1.5 text-xs text-muted-foreground">
                            Input the name of the account used for the payment.
                          </p>
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-medium">
                            Transaction Number / Session ID
                          </label>

                          <input
                            type="text"
                            value={bankTransactionNumber}
                            onChange={(e) =>
                              setBankTransactionNumber(e.target.value)
                            }
                            placeholder="Copy the session ID or transaction number for the payment"
                            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />

                          <p className="mt-1.5 text-xs text-muted-foreground">
                            Copy the session ID or transaction number for the
                            payment.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep("fulfillment")}
                      className="rounded-xl border border-input px-5 py-2.5 text-sm"
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      disabled={
                        !paymentMethod ||
                        (paymentMethod === "transfer" &&
                          (!bankAccountName.trim() ||
                            !bankTransactionNumber.trim()))
                      }
                      className="flex-1 btn-primary-glow text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {paymentMethod === "transfer"
                        ? "I've Transferred"
                        : `Proceed — ${formatPrice(paystackTotal)}`}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        <div className="glass-card h-fit p-5">
          <h3 className="mb-3 font-bold">Order Summary</h3>

          {safeCart.map((item: any) => {
            const price = Number(
              item?.product?.final_price ?? item?.product?.price ?? 0
            );

            return (
              <div
                key={item.product.id}
                className="mb-2 flex justify-between gap-4 text-sm"
              >
                <span className="min-w-0 truncate">
                  {item.product.name} × {item.quantity}
                </span>

                <span className="shrink-0">
                  {formatPrice(price * item.quantity)}
                </span>
              </div>
            );
          })}

          <hr className="my-3" />

          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          {paymentMethod === "card" && (
            <div className="mt-2 flex justify-between text-sm">
              <span>Transaction Fee ({PAYSTACK_FEE_PERCENTAGE}%)</span>
              <span>{formatPrice(paystackTransactionFee)}</span>
            </div>
          )}

          {paymentMethod === "transfer" && (
            <div className="mt-2 flex justify-between text-sm">
              <span>Transaction Fee ({BANK_TRANSFER_FEE_PERCENTAGE}%)</span>
              <span>{formatPrice(bankTransferTransactionFee)}</span>
            </div>
          )}

          <hr className="my-3" />

          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>
              {formatPrice(
                paymentMethod ? selectedTotal : subtotal
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;