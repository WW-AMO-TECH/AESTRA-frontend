src/components/ProductCard.tsx — bumped text from text-[8px]/text-[9px] to text-[10px]/text-[11px]/text-[13px], icons from w-2.5/w-3 to w-3.5/w-4, cart button padding from p-1 to p-1.5, and card padding from p-2 to p-3.

src/index.css — added font-size: 16px to the body rule, which sets the base text size for the entire app.

Global text size — set base font to 16px across the entire app
Card expiry — auto-inserts / between MM and YY as you type
Features page — created at /features listing every feature (Home, Products, Admin panels, Auth, etc.) with a clean card grid layout, added to navbar and footer.

To create  categories and brands in the db
php artisan:tinker
\App\Models\Category::create(['name' => 'Phones']);
\App\Models\Category::create(['name' => 'Laptops']);
Wi-FI, cords, etc is part of accessories

\App\Models\Brand::create(['name' => 'Apple']);
\App\Models\Brand::create(['name' => 'Samsung']);














import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { CheckCircle2, MapPin, CreditCard, Building2, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { citiesByState } from "@/lib/validation";
import axios from "axios";

const nigerianStates = ["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara","FCT"];

const pickupLocationsByState: Record<string, { id: string; name: string; address: string; hours: string }[]> = {
  Lagos: [
    { id: "ikeja", name: "Ikeja City Mall", address: "Alausa, Ikeja, Lagos", hours: "9AM - 8PM" },
    { id: "cv", name: "Computer Village", address: "Otigba Street, Ikeja, Lagos", hours: "8AM - 6PM" },
    { id: "vi", name: "Victoria Island Hub", address: "Akin Adesola St, VI, Lagos", hours: "10AM - 7PM" },
    { id: "lekki", name: "Lekki Outlet", address: "Admiralty Way, Lekki, Lagos", hours: "9AM - 7PM" },
  ],
  FCT: [
    { id: "wuse", name: "Wuse Market Center", address: "Wuse Zone 4, Abuja", hours: "9AM - 6PM" },
    { id: "garki", name: "Garki Hub", address: "Area 11, Garki, Abuja", hours: "9AM - 5PM" },
  ],
  Rivers: [
    { id: "ph", name: "Port Harcourt Outlet", address: "Aba Road, Port Harcourt", hours: "9AM - 5PM" },
  ],
  Oyo: [
    { id: "ibadan", name: "Ibadan Center", address: "Ring Road, Ibadan", hours: "9AM - 6PM" },
  ],
};

type Step = "fulfillment" | "payment" | "processing" | "success";

const Checkout = () => {
  const { cart } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState<Step>("fulfillment");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [stateQuery, setStateQuery] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">("delivery");
  const [pickupState, setPickupState] = useState("");
  const [selectedPickup, setSelectedPickup] = useState("");
  const [showStateSuggestions, setShowStateSuggestions] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer" | "">("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const safeCart = Array.isArray(cart) ? cart : [];
  
  const subtotal = safeCart.reduce((total, item) => {
    const price = item?.product?.price ?? 0;
    const qty = item?.quantity ?? 0;
    return total + price * qty;
  }, 0);

  const stateSuggestions = useMemo(() => {
    if (!stateQuery) return [];
    return nigerianStates.filter(s => s.toLowerCase().startsWith(stateQuery.toLowerCase())).slice(0, 5);
  }, [stateQuery]);

  const pickupStates = Object.keys(pickupLocationsByState);
  const pickupLocations = pickupState ? pickupLocationsByState[pickupState] || [] : [];
  const selectedPickupData = pickupLocations.find(l => l.id === selectedPickup);

  const handleFulfillmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("processing");
    // Simulate backend confirmation
    setTimeout(() => {
      placeOrder(paymentMethod);
      setStep("success");
    }, 2500);
  };

  if (step === "success") return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-20 text-center animate-fade-in">
        <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold mb-2">Order Placed!</h1>
        <p className="text-muted-foreground text-sm mb-6">Thank you for your purchase. You'll receive a confirmation email shortly.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => nav("/")} className="btn-primary-glow text-sm">Back to Home</button>
          <button onClick={() => nav("/dashboard")} className="px-5 py-2.5 rounded-xl font-semibold border border-input hover:bg-secondary transition-colors text-sm">View Orders</button>
        </div>
      </div>
    </div>
  );

  if (step === "processing") return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-20 text-center animate-fade-in">
        <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
        <h2 className="font-display text-xl font-bold mb-2">Processing Payment...</h2>
        <p className="text-muted-foreground text-sm">Please wait while we confirm your payment.</p>
      </div>
    </div>
  );

  if (cart.length === 0 && step === "fulfillment") { nav("/cart"); return null; }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${step === "fulfillment" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>1. Fulfillment</span>
          <span className="text-muted-foreground">→</span>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${step === "payment" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>2. Payment</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* STEP 1: Fulfillment */}
          {step === "fulfillment" && (
            <form onSubmit={handleFulfillmentSubmit} className="lg:col-span-2 space-y-5 animate-fade-in">
              <div className="glass-card p-5">
                <h3 className="font-display font-semibold text-base mb-3">Fulfillment Method</h3>
                <div className="grid grid-cols-2 gap-3">
                  {(["delivery", "pickup"] as const).map(m => (
                    <button key={m} type="button" onClick={() => { setFulfillment(m); setSelectedPickup(""); setPickupState(""); }}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${fulfillment === m ? "border-primary bg-primary/5" : "border-input hover:border-muted-foreground/30"}`}>
                      {m === "delivery" ? "🚚 Delivery" : "🏪 Pickup"}
                    </button>
                  ))}
                </div>
              </div>

              {fulfillment === "delivery" && (
                <div className="glass-card p-5 space-y-4 animate-fade-in">
                  <h3 className="font-display font-semibold text-base">Shipping Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium mb-1 block">Full Name</label>
                      <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Phone</label>
                      <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="relative">
                      <label className="text-xs font-medium mb-1 block">State</label>
                      <input type="text" required value={stateQuery || state} onChange={e => { setStateQuery(e.target.value); setState(""); setCity(""); setShowStateSuggestions(true); }} onFocus={() => setShowStateSuggestions(true)} onBlur={() => setTimeout(() => setShowStateSuggestions(false), 200)} className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Type to search..." />
                      {showStateSuggestions && stateSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-xl shadow-lg overflow-hidden">
                          {stateSuggestions.map(s => (
                            <button key={s} type="button" onMouseDown={() => { setState(s); setStateQuery(""); setShowStateSuggestions(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors">{s}</button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">City</label>
                      <select required value={city} onChange={e => setCity(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="">Select a city</option>
                        {(state && citiesByState[state] ? citiesByState[state] : []).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {!state && <p className="text-[10px] text-muted-foreground mt-0.5">Select a state first</p>}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Address</label>
                    <input type="text" required value={address} onChange={e => setAddress(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
              )}

              {fulfillment === "pickup" && (
                <div className="glass-card p-5 space-y-4 animate-fade-in">
                  <h3 className="font-display font-semibold text-base flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Select Pickup Location</h3>
                  <div>
                    <label className="text-xs font-medium mb-1 block">State</label>
                    <select required value={pickupState} onChange={e => { setPickupState(e.target.value); setSelectedPickup(""); }} className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">Select a state</option>
                      {pickupStates.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  {pickupState && (
                    <div>
                      <label className="text-xs font-medium mb-1 block">Location</label>
                      <select required value={selectedPickup} onChange={e => setSelectedPickup(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="">Select a location</option>
                        {pickupLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                      </select>
                    </div>
                  )}
                  {selectedPickupData && (
                    <div className="p-3 rounded-xl border-2 border-primary bg-primary/5">
                      <p className="text-sm font-semibold">{selectedPickupData.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedPickupData.address}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Hours: {selectedPickupData.hours}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-xs font-medium mb-1 block">Full Name</label>
                      <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Phone</label>
                      <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" className="w-full btn-primary-glow text-sm">Continue to Payment</button>
            </form>
          )}

          {/* STEP 2: Payment */}
          {step === "payment" && (
            <form onSubmit={handlePayment} className="lg:col-span-2 space-y-5 animate-fade-in">
              <div className="glass-card p-5">
                <h3 className="font-display font-semibold text-base mb-3">Make Payment</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button type="button" onClick={() => setPaymentMethod("card")}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center justify-center gap-2 ${paymentMethod === "card" ? "border-primary bg-primary/5" : "border-input hover:border-muted-foreground/30"}`}>
                    <CreditCard className="w-4 h-4" /> Card
                  </button>
                  <button type="button" onClick={() => setPaymentMethod("transfer")}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center justify-center gap-2 ${paymentMethod === "transfer" ? "border-primary bg-primary/5" : "border-input hover:border-muted-foreground/30"}`}>
                    <Building2 className="w-4 h-4" /> Transfer
                  </button>
                </div>

                {paymentMethod === "card" && (
                  <div className="space-y-3 animate-fade-in">
                    <div>
                      <label className="text-xs font-medium mb-1 block">Card Holder Name</label>
                      <input type="text" required value={cardName} onChange={e => setCardName(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Name on card" />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Card Number</label>
                      <input type="text" required value={cardNumber} onChange={e => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))} className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium mb-1 block">Expiry</label>
                        <input type="text" required value={cardExpiry} onChange={e => {
                          let val = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
                          if (val.length >= 3) val = val.slice(0, 2) + "/" + val.slice(2);
                          setCardExpiry(val);
                        }} className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="MM/YY" maxLength={5} />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block">CVV</label>
                        <input type="text" required value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="123" />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "transfer" && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="glass-card p-4 bg-secondary/50">
                      <p className="text-xs font-semibold mb-2">Transfer to the account below:</p>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground text-xs">Bank</span><span className="font-semibold text-xs">GTBank</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground text-xs">Account Number</span><span className="font-semibold text-xs">0123456789</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground text-xs">Account Name</span><span className="font-semibold text-xs">AESTRA-TECH LTD</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground text-xs">Amount</span><span className="font-semibold text-xs text-primary">{formatPrice(cartTotal)}</span></div>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">After transferring, click "Confirm Payment" below. Your order will be confirmed once payment is verified.</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep("fulfillment")} className="px-5 py-2.5 rounded-xl font-semibold border border-input hover:bg-secondary transition-colors text-sm">Back</button>
                <button type="submit" disabled={!paymentMethod} className="flex-1 btn-primary-glow text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  {paymentMethod === "transfer" ? "Confirm Payment" : "Pay"} — {formatPrice(cartTotal)}
                </button>
              </div>
            </form>
          )}

          {/* Order Summary Sidebar */}
          <div className="glass-card p-5 h-fit sticky top-24">
            <h3 className="font-display font-semibold text-base mb-3">Order Summary</h3>
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.product.id} className="flex items-center gap-2">
                  <img src={item.product.image} alt="" className="w-10 h-10 rounded-sm object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{item.product.name}</p>
                    <p className="text-[10px] text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-semibold">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-3 pt-3 flex justify-between font-display font-bold text-sm">
              <span>Total</span><span>{formatPrice(subtotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;