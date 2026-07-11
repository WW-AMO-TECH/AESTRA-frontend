import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import {
  CheckCircle2,
  MapPin,
  CreditCard,
  Building2,
  Loader2,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import axios from "@/api/axios";
import { citiesByState } from "@/lib/validation";
import { states } from "@/data/states";

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

const Checkout = () => {
  const { user, cart } = useAuth();
  const nav = useNavigate();

  const [step, setStep] = useState<Step>("fulfillment");

  // USER INFO (AUTO-FILLED)
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFullName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  // SHIPPING / PICKUP
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">("delivery");

  const [states, setStates] = useState<State[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const [selectedState, setSelectedState] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [state, setState] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [stateQuery, setStateQuery] = useState<string>("");
  const [showStateSuggestions, setShowStateSuggestions] = useState(false);
  const [stateSuggestions, setStateSuggestions] = useState<string[]>([]);
  const [address, setAddress] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState("idle");
  // idle | processing | success
  const [reference, setReference] = useState("");

  // PAYMENT
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer" | "">("");

  // CART SAFE
  const safeCart = Array.isArray(cart) ? cart : [];

  const subtotal = useMemo(() => {
    return safeCart.reduce((total: number, item: any) => {
      return total + item.product.price * item.quantity;
    }, 0);
  }, [safeCart]);

  // FETCH STATES
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await axios.get("/superadmin/states");
        setStates(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStates();
  }, []);

  // FETCH LOCATIONS
  useEffect(() => {
    const fetchLocations = async () => {
      if (!selectedState) return;

      try {
        const res = await axios.get(
          `/superadmin/states/${selectedState}/locations`
        );
        setLocations(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchLocations();
  }, [selectedState]);

  const selectedLocationData = locations.find(
    (l) => l.id === Number(selectedLocation)
  );

  // EMPTY CART REDIRECT
  useEffect(() => {
    if (safeCart.length === 0 && step === "fulfillment") {
      nav("/cart");
    }
  }, [safeCart.length, step, nav]);

  const handlePayment = async (e: any) => {
    e.preventDefault();

    try {
      setPaymentStatus("processing");

      const token = localStorage.getItem("token");

      const res = await axios.post(
        "/payments/initiate",
        {
          amount: subtotal,
          email: user?.email,

          fulfillment,
          full_name: fullName,
          phone,
          state,
          city,
          address,
          pickup_state: state,
          pickup_location: selectedLocation,

          subtotal,

          items: safeCart.map((item: any) => ({
            product_id: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { authorization_url } = res.data;

      if (!authorization_url) {
        throw new Error("Missing Paystack URL");
      }

      window.location.href = authorization_url;

    } catch (err) {
      console.log(err);
      alert("Payment failed");
      setPaymentStatus("idle");
    }
  };

  // PROCESSING
  if (step === "processing") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center py-20">
          <Loader2 className="w-10 h-10 animate-spin mx-auto" />
          <p className="mt-4">Processing payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">

          {/* FULFILLMENT */}
          {step === "fulfillment" && (
            <div className="glass-card p-5 space-y-4">

              <h2 className="font-semibold text-base mb-3">Fulfillment Method</h2>

              <div className="grid grid-cols-2 gap-3">
                {(["delivery", "pickup"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setFulfillment(m);
                    }}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      fulfillment === m
                        ? "border-primary bg-primary/5"
                        : "border-input hover:border-muted-foreground/30"
                    }`}
                  >
                    {m === "delivery" ? "🚚 Delivery" : "🏪 Pickup"}
                  </button>
                ))}
              </div>

              {/* USER INFO */}
              {fulfillment === "delivery" && (
              <div className="glass-card p-5 space-y-4 animate-fade-in">
                <h3 className="font-display font-semibold text-base">Shipping Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block">
                      State
                    </label>
                    <select
                      required
                      value={state}
                      onChange={(e) => {
                        setState(e.target.value);
                        setCity(""); // reset city when state changes
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">Select State</option>
                      {states.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">City</label>
                    <input type="text" required value={city} onChange={e => setCity(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Address</label>
                  <input type="text" required value={address} onChange={e => setAddress(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              )}

              {/* PICKUP */}
              {fulfillment === "pickup" && (
                <div className="glass-card p-5 space-y-4 animate-fade-in">
                  <h3 className="font-display font-semibold text-base">
                    Shipping Information
                  </h3>

                  {/* STATE + LOCATION */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                    {/* STATE */}
                    <div>
                      <label className="text-xs font-medium mb-1 block">
                        State
                      </label>

                      <select
                        required
                        value={state}
                        onChange={async (e) => {
                          const selectedState = e.target.value;

                          setState(selectedState);
                          setSelectedLocation("");

                          // find state object
                          const selectedStateObj = states.find(
                            (s) => s.name === selectedState
                          );

                          if (selectedStateObj?.id) {
                            try {
                              const res = await axios.get(
                                `http://127.0.0.1:8000/api/superadmin/states/${selectedStateObj.id}/locations`
                              );

                              setLocations(res.data);
                            } catch (err) {
                              console.error(err);
                              setLocations([]);
                            }
                          }
                        }}
                        className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select State</option>

                        {states.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* LOCATION */}
                    <div>
                      <label className="text-xs font-medium mb-1 block">
                        Pickup Location
                      </label>

                      <select
                        required
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select Location</option>

                        {locations.map((loc: any) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* LOCATION DETAILS DISPLAY */}
                  {selectedLocation &&
                    (() => {
                      const selected = locations.find(
                        (l: any) => l.id.toString() === selectedLocation
                      );

                      if (!selected) return null;

                      return (
                        <div className="p-4 rounded-xl border-2 border-primary bg-primary/5 space-y-2 animate-fade-in">

                          <p className="text-sm font-semibold">
                            {selected.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {selected.address}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground mt-2">

                            {selected.phone && (
                              <div className="flex justify-between">
                                <span>Phone:</span>
                                <span className="text-foreground font-medium">
                                  {selected.phone}
                                </span>
                              </div>
                            )}

                            {selected.opening_time && (
                              <div className="flex justify-between">
                                <span>Opens:</span>
                                <span className="text-foreground font-medium">
                                  {selected.opening_time}
                                </span>
                              </div>
                            )}

                            {selected.closing_time && (
                              <div className="flex justify-between">
                                <span>Closes:</span>
                                <span className="text-foreground font-medium">
                                  {selected.closing_time}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                  {/* USER INFO */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                    <div>
                      <label className="text-xs font-medium mb-1 block">
                        Full Name
                      </label>

                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium mb-1 block">
                        Phone Number
                      </label>

                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setStep("payment")}
                className="btn-primary-glow w-full"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 2: Payment */}
          {step === "payment" && paymentStatus !== "success" && (
            <div className="lg:col-span-2 space-y-5 animate-fade-in">
              
              {paymentStatus === "processing" ? (
                <div className="glass-card p-10 text-center space-y-3">
                  <div className="animate-spin w-10 h-10 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                  <p className="text-sm font-medium">Redirecting to secure payment...</p>
                </div>
              ) : (
                <form onSubmit={handlePayment} className="space-y-5">
                  
                  {/* Payment Method */}
                  <div className="glass-card p-5">
                    <h3 className="font-display font-semibold text-base mb-3">
                      Select Payment Method
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                          paymentMethod === "card"
                            ? "border-primary bg-primary/5"
                            : "border-input hover:border-muted-foreground/30"
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        Paystack Checkout
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("transfer")}
                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                          paymentMethod === "transfer"
                            ? "border-primary bg-primary/5"
                            : "border-input hover:border-muted-foreground/30"
                        }`}
                      >
                        <Building2 className="w-4 h-4" />
                        Bank Transfer
                      </button>
                    </div>
                  </div>

                  {/* Transfer Info ONLY */}
                  {paymentMethod === "transfer" && (
                    <div className="glass-card p-4 bg-secondary/50">
                      <p className="text-xs font-semibold mb-2">Bank Details</p>

                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Bank</span><span>GTBank</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Account</span><span>0123456789</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Name</span><span>AESTRA-TECH LTD</span>
                        </div>
                        <div className="flex justify-between font-semibold text-primary">
                          <span>Total</span><span>{formatPrice(subtotal)}</span>
                        </div>
                      </div>

                      <p className="text-[10px] mt-2 text-muted-foreground">
                        We will verify your payment before confirming order.
                      </p>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep("fulfillment")}
                      className="px-5 py-2.5 rounded-xl border border-input text-sm"
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      disabled={!paymentMethod}
                      className="flex-1 btn-primary-glow text-sm"
                    >
                      Proceed — {formatPrice(subtotal)}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* RIGHT - SUMMARY */}
        <div className="glass-card p-5 h-fit">
          <h3 className="font-bold mb-3">Order Summary</h3>

          {safeCart.map((item: any) => (
            <div
              key={item.product.id}
              className="flex justify-between text-sm mb-2"
            >
              <span>{item.product.name}</span>
              <span>
                {formatPrice(
                  item.product.price * item.quantity
                )}
              </span>
            </div>
          ))}

          <hr className="my-3" />

          <div className="font-bold flex justify-between">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;