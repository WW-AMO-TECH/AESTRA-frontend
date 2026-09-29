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
  Search,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import axios from "@/api/axios";

type Step = "fulfillment" | "payment" | "processing" | "success";
type Fulfillment = "delivery" | "pickup";
type SearchMode = "search" | "select";
type DeliveryType = "standard" | "express" | "";

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
  state_id: number;
  country_id?: number;
  is_active: boolean;
}

interface DeliveryRate {
  id: number;
  pickup_location_id: number;
  delivery_location_id: number;
  delivery_type: "standard" | "express";
  delivery_fee: number | string;
  pickup_location?: Location;
  delivery_location?: Location;
}

const PAYSTACK_FEE_PERCENTAGE = 2;
const BANK_TRANSFER_FEE_PERCENTAGE = 0.7;

const Checkout = () => {
  const { user, cart } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("fulfillment");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [fulfillment, setFulfillment] =
    useState<Fulfillment>("delivery");

  const [states, setStates] = useState<State[]>([]);

  const [pickupLocations, setPickupLocations] = useState<Location[]>([]);
  const [deliveryLocations, setDeliveryLocations] = useState<Location[]>([]);

  const [pickupState, setPickupState] = useState("");
  const [deliveryState, setDeliveryState] = useState("");

  const [selectedPickupLocation, setSelectedPickupLocation] = useState("");
  const [selectedDeliveryLocation, setSelectedDeliveryLocation] = useState("");

  const [pickupSearchMode, setPickupSearchMode] =
    useState<SearchMode>("search");

  const [deliverySearchMode, setDeliverySearchMode] =
    useState<SearchMode>("search");

  const [pickupSearchTerm, setPickupSearchTerm] = useState("");
  const [deliverySearchTerm, setDeliverySearchTerm] = useState("");

  const [pickupSearchFocused, setPickupSearchFocused] = useState(false);
  const [deliverySearchFocused, setDeliverySearchFocused] = useState(false);

  const [deliveryType, setDeliveryType] = useState<DeliveryType>("");

  const [standardRate, setStandardRate] =
    useState<DeliveryRate | null>(null);

  const [expressRate, setExpressRate] =
    useState<DeliveryRate | null>(null);

  const [deliveryRateLoading, setDeliveryRateLoading] = useState(false);
  const [deliveryRateChecked, setDeliveryRateChecked] = useState(false);

  const [paymentStatus, setPaymentStatus] =
    useState<"idle" | "processing">("idle");

  const [paymentMethod, setPaymentMethod] =
    useState<"card" | "transfer" | "">("");

  const [bankAccountName, setBankAccountName] = useState("");
  const [bankTransactionNumber, setBankTransactionNumber] = useState("");
  const [bankTransferReference, setBankTransferReference] = useState("");
  const [copiedAccountNumber, setCopiedAccountNumber] = useState(false);

  const safeCart = Array.isArray(cart) ? cart : [];

  const subtotal = useMemo(() => {
    return safeCart.reduce((total: number, item: any) => {
      const price = Number(
        item?.product?.final_price ??
          item?.product?.price ??
          0
      );

      return total + price * Number(item?.quantity ?? 0);
    }, 0);
  }, [safeCart]);

  const selectedDeliveryFee = useMemo(() => {
    if (deliveryType === "standard") {
      return Number(standardRate?.delivery_fee ?? 0);
    }

    if (deliveryType === "express") {
      return Number(expressRate?.delivery_fee ?? 0);
    }

    return 0;
  }, [deliveryType, standardRate, expressRate]);

  const amountBeforeTransactionFee = useMemo(() => {
    return Number(
      (
        subtotal +
        (fulfillment === "delivery" ? selectedDeliveryFee : 0)
      ).toFixed(2)
    );
  }, [subtotal, fulfillment, selectedDeliveryFee]);

  const paystackTransactionFee = useMemo(() => {
    return Number(
      (
        (amountBeforeTransactionFee * PAYSTACK_FEE_PERCENTAGE) /
        100
      ).toFixed(2)
    );
  }, [amountBeforeTransactionFee]);

  const bankTransferTransactionFee = useMemo(() => {
    return Number(
      (
        (amountBeforeTransactionFee *
          BANK_TRANSFER_FEE_PERCENTAGE) /
        100
      ).toFixed(2)
    );
  }, [amountBeforeTransactionFee]);

  const paystackTotal = useMemo(() => {
    return Number(
      (
        amountBeforeTransactionFee +
        paystackTransactionFee
      ).toFixed(2)
    );
  }, [amountBeforeTransactionFee, paystackTransactionFee]);

  const bankTransferTotal = useMemo(() => {
    return Number(
      (
        amountBeforeTransactionFee +
        bankTransferTransactionFee
      ).toFixed(2)
    );
  }, [
    amountBeforeTransactionFee,
    bankTransferTransactionFee,
  ]);

  const selectedTotal =
    paymentMethod === "transfer"
      ? bankTransferTotal
      : paystackTotal;

  useEffect(() => {
    if (user) {
      setFullName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await axios.get("/states");

        setStates(
          Array.isArray(res.data) ? res.data : []
        );
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

  const fetchPickupLocations = async (stateId: string) => {
    if (!stateId) {
      setPickupLocations([]);
      return;
    }

    try {
      const res = await axios.get(
        `/states/${stateId}/pickup-locations`
      );

      setPickupLocations(
        Array.isArray(res.data) ? res.data : []
      );
    } catch (err) {
      console.error(
        "Failed to fetch pickup locations:",
        err
      );

      setPickupLocations([]);
    }
  };

  const fetchDeliveryLocations = async (stateId: string) => {
    if (!stateId) {
      setDeliveryLocations([]);
      return;
    }

    try {
      const res = await axios.get(
        `/states/${stateId}/delivery-locations`
      );

      setDeliveryLocations(
        Array.isArray(res.data) ? res.data : []
      );
    } catch (err) {
      console.error(
        "Failed to fetch delivery locations:",
        err
      );

      setDeliveryLocations([]);
    }
  };

  const resetDeliveryRates = () => {
    setDeliveryType("");
    setStandardRate(null);
    setExpressRate(null);
    setDeliveryRateChecked(false);
  };

  const handlePickupStateChange = async (value: string) => {
    setPickupState(value);
    setSelectedPickupLocation("");
    setPickupSearchTerm("");
    setPickupSearchFocused(false);
    resetDeliveryRates();

    if (value) {
      await fetchPickupLocations(value);
    } else {
      setPickupLocations([]);
    }
  };

  const handleDeliveryStateChange = async (value: string) => {
    setDeliveryState(value);
    setSelectedDeliveryLocation("");
    setDeliverySearchTerm("");
    setDeliverySearchFocused(false);
    resetDeliveryRates();

    if (value) {
      await fetchDeliveryLocations(value);
    } else {
      setDeliveryLocations([]);
    }
  };

  const handleFulfillmentChange = (method: Fulfillment) => {
    setFulfillment(method);

    resetDeliveryRates();

    if (method === "pickup") {
      setSelectedDeliveryLocation("");
      setDeliverySearchTerm("");
      setDeliverySearchFocused(false);
      setDeliveryLocations([]);
    }
  };

  const fetchAvailableDeliveryRates = async () => {
    if (
      !selectedPickupLocation ||
      !selectedDeliveryLocation
    ) {
      return;
    }

    setDeliveryRateLoading(true);
    setDeliveryRateChecked(false);
    setStandardRate(null);
    setExpressRate(null);
    setDeliveryType("");

    try {
      const [standardResult, expressResult] =
        await Promise.allSettled([
          axios.get("/delivery-rates/quote", {
            params: {
              pickup_location_id: selectedPickupLocation,
              delivery_location_id: selectedDeliveryLocation,
              delivery_type: "standard",
            },
          }),

          axios.get("/delivery-rates/quote", {
            params: {
              pickup_location_id: selectedPickupLocation,
              delivery_location_id: selectedDeliveryLocation,
              delivery_type: "express",
            },
          }),
        ]);

      if (standardResult.status === "fulfilled") {
        setStandardRate(standardResult.value.data);
      }

      if (expressResult.status === "fulfilled") {
        setExpressRate(expressResult.value.data);
      }

      setDeliveryRateChecked(true);
    } catch (err) {
      console.error(
        "Failed to fetch delivery rates:",
        err
      );

      setDeliveryRateChecked(true);
    } finally {
      setDeliveryRateLoading(false);
    }
  };

  useEffect(() => {
    if (
      fulfillment !== "delivery" ||
      !selectedPickupLocation ||
      !selectedDeliveryLocation
    ) {
      return;
    }

    fetchAvailableDeliveryRates();
  }, [
    fulfillment,
    selectedPickupLocation,
    selectedDeliveryLocation,
  ]);

  const validateFulfillment = () => {
    if (!fullName.trim()) {
      alert("Please enter your full name.");
      return false;
    }

    if (!phone.trim()) {
      alert("Please enter your phone number.");
      return false;
    }

    if (!/^[0-9]+$/.test(phone.trim())) {
      alert("Please enter a valid phone number.");
      return false;
    }

    if (!pickupState) {
      alert("Please select a pickup state.");
      return false;
    }

    if (!selectedPickupLocation) {
      alert("Please select a pickup location.");
      return false;
    }

    const selectedPickup = pickupLocations.find(
      (location) =>
        location.id.toString() === selectedPickupLocation
    );

    if (!selectedPickup) {
      alert("Please select a valid pickup location.");
      return false;
    }

    if (!selectedPickup.is_active) {
      alert(
        "The selected pickup location is currently inactive. Please select another location."
      );
      return false;
    }

    if (fulfillment === "delivery") {
      if (!deliveryState) {
        alert("Please select a delivery state.");
        return false;
      }

      if (!selectedDeliveryLocation) {
        alert("Please select a delivery location.");
        return false;
      }

      const selectedDelivery = deliveryLocations.find(
        (location) =>
          location.id.toString() ===
          selectedDeliveryLocation
      );

      if (!selectedDelivery) {
        alert(
          "Please select a valid delivery location."
        );
        return false;
      }

      if (!selectedDelivery.is_active) {
        alert(
          "The selected delivery location is currently inactive. Please select another location."
        );
        return false;
      }

      if (!deliveryType) {
        alert("Please select a delivery type.");
        return false;
      }

      if (
        deliveryType === "standard" &&
        !standardRate
      ) {
        alert(
          "There is no standard delivery rate available for the selected locations. Please select another."
        );
        return false;
      }

      if (
        deliveryType === "express" &&
        !expressRate
      ) {
        alert(
          "There is no express delivery rate available for the selected locations. Please select another."
        );
        return false;
      }
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
      console.error(
        "Failed to copy account number:",
        error
      );
    }
  };

  const handlePayment = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!validateFulfillment()) return;

    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    if (!user?.email) {
      alert(
        "Your account email could not be found. Please log in again."
      );
      return;
    }

    if (safeCart.length === 0) {
      alert("Your cart is empty.");
      navigate("/cart");
      return;
    }

    if (paymentMethod === "transfer") {
      if (!bankAccountName.trim()) {
        alert(
          "Please enter the name of the bank account used for the payment."
        );
        return;
      }

      if (!bankTransactionNumber.trim()) {
        alert(
          "Please enter the transaction number or session ID."
        );
        return;
      }

      try {
        setPaymentStatus("processing");
        setStep("processing");

        const res = await axios.post(
          "/payments/bank-transfer",
          {
            email: user.email,
            fulfillment,
            full_name: fullName.trim(),
            phone: phone.trim(),

            pickup_state: pickupState,
            pickup_location_id: selectedPickupLocation,

            delivery_state:
              fulfillment === "delivery"
                ? deliveryState
                : null,

            delivery_location_id:
              fulfillment === "delivery"
                ? selectedDeliveryLocation
                : null,

            delivery_type:
              fulfillment === "delivery"
                ? deliveryType
                : null,

            bank_account_name:
              bankAccountName.trim(),

            bank_transaction_number:
              bankTransactionNumber.trim(),

            items: safeCart.map((item: any) => ({
              product_id: item.product.id,
              quantity: Number(item.quantity),
            })),
          }
        );

        setBankTransferReference(
          res.data?.reference || ""
        );

        setPaymentStatus("idle");
        setStep("success");
      } catch (error: any) {
        console.error(
          "Bank transfer submission failed:",
          error
        );

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

      const res = await axios.post(
        "/payments/initiate",
        {
          email: user.email,
          payment_method: "paystack",
          fulfillment,
          full_name: fullName.trim(),
          phone: phone.trim(),

          pickup_state: pickupState,
          pickup_location_id: selectedPickupLocation,

          delivery_state:
            fulfillment === "delivery"
              ? deliveryState
              : null,

          delivery_location_id:
            fulfillment === "delivery"
              ? selectedDeliveryLocation
              : null,

          delivery_type:
            fulfillment === "delivery"
              ? deliveryType
              : null,

          items: safeCart.map((item: any) => ({
            product_id: item.product.id,
            quantity: Number(item.quantity),
          })),
        }
      );

      const { authorization_url } = res.data;

      if (!authorization_url) {
        throw new Error(
          "Missing Paystack authorization URL."
        );
      }

      window.location.href = authorization_url;
    } catch (error: any) {
      console.error(
        "Payment initialization failed:",
        error
      );

      setPaymentStatus("idle");
      setStep("payment");

      navigate(
        `/payment-failed?message=${encodeURIComponent(
          "We couldn't start your payment. Please try again or use another payment method."
        )}`
      );
    }
  };

  const selectedPickup = pickupLocations.find(
    (location) =>
      location.id.toString() ===
      selectedPickupLocation
  );

  const selectedDelivery = deliveryLocations.find(
    (location) =>
      location.id.toString() ===
      selectedDeliveryLocation
  );

  /*
   * IMPORTANT:
   * These useMemo hooks are intentionally above the
   * conditional returns below so React always executes
   * hooks in the same order on every render.
   */
  const filteredPickupLocations = useMemo(() => {
    const query = pickupSearchTerm.trim().toLowerCase();

    if (!query) return [];

    return pickupLocations.filter((location) => {
      const name =
        location.name?.toLowerCase() || "";

      const address =
        location.address?.toLowerCase() || "";

      return (
        name.includes(query) ||
        address.includes(query)
      );
    });
  }, [pickupLocations, pickupSearchTerm]);

  const filteredDeliveryLocations = useMemo(() => {
    const query =
      deliverySearchTerm.trim().toLowerCase();

    if (!query) return [];

    return deliveryLocations.filter((location) => {
      const name =
        location.name?.toLowerCase() || "";

      const address =
        location.address?.toLowerCase() || "";

      return (
        name.includes(query) ||
        address.includes(query)
      );
    });
  }, [
    deliveryLocations,
    deliverySearchTerm,
  ]);

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

  if (
    step === "success" &&
    paymentMethod === "transfer"
  ) {
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
              Your bank transfer details have been submitted
              successfully. Your order will remain pending while
              AESTRA verifies the payment.
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
                Please keep your transfer receipt and
                transaction details until your payment has
                been verified.
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

      <div className="container mx-auto grid grid-cols-1 gap-6 px-2 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {step === "fulfillment" && (
            <div className="glass-card space-y-4 p-2">
              <div className="grid grid-cols-2 gap-3">
                {(["delivery", "pickup"] as const).map(
                  (method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() =>
                        handleFulfillmentChange(method)
                      }
                      className={`rounded-xl border-2 p-3 text-sm font-medium transition-all ${
                        fulfillment === method
                          ? "border-primary bg-primary/5"
                          : "border-input hover:border-muted-foreground/30"
                      }`}
                    >
                      {method === "delivery"
                        ? "🚚 Delivery"
                        : "🏪 Pickup"}
                    </button>
                  )
                )}
              </div>

              <div className="glass-card animate-fade-in space-y-4 p-5">
                <h3 className="font-display text-base font-semibold">
                  {fulfillment === "delivery"
                    ? "Shipping Information"
                    : "Pickup Information"}
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
                      onChange={(e) =>
                        setFullName(e.target.value)
                      }
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
                      onChange={(e) =>
                        setPhone(e.target.value)
                      }
                      className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium">
                      Pickup State
                    </label>

                    <select
                      required
                      value={pickupState}
                      onChange={(e) =>
                        handlePickupStateChange(
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">
                        Select Pickup State
                      </option>

                      {states.map((item) => (
                        <option
                          key={item.id}
                          value={item.id}
                        >
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {fulfillment === "delivery" ? (
                    <div>
                      <label className="mb-1 block text-xs font-medium">
                        Delivery State
                      </label>

                      <select
                        required
                        value={deliveryState}
                        onChange={(e) =>
                          handleDeliveryStateChange(
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">
                          Select Delivery State
                        </option>

                        {states.map((item) => (
                          <option
                            key={item.id}
                            value={item.id}
                          >
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="mb-1 block text-xs font-medium">
                        Pickup Location
                        <p className="mt-2 text-xs text-muted-foreground">
                          Select the location your order will come from.
                        </p>
                      </label>

                      <div className="relative">
                        {pickupSearchMode === "search" && (
                          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        )}

                        {pickupSearchMode === "search" ? (
                          <input
                            type="text"
                            value={pickupSearchTerm}
                            onChange={(e) => {
                              setPickupSearchFocused(true);
                              setPickupSearchTerm(
                                e.target.value
                              );
                            }}
                            onFocus={() =>
                              setPickupSearchFocused(true)
                            }
                            placeholder={
                              pickupState
                                ? "Search pickup locations..."
                                : "Select pickup state first"
                            }
                            disabled={!pickupState}
                            className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-24 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                          />
                        ) : (
                          <select
                            required
                            value={selectedPickupLocation}
                            onChange={(e) =>
                              setSelectedPickupLocation(
                                e.target.value
                              )
                            }
                            disabled={!pickupState}
                            className="w-full appearance-none rounded-xl border border-input bg-background px-3 py-2.5 pr-24 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <option value="">
                              {!pickupState
                                ? "Select State First"
                                : pickupLocations.length ===
                                  0
                                ? "No Locations Available"
                                : "Select Location"}
                            </option>

                            {pickupLocations.map(
                              (location) => (
                                <option
                                  key={location.id}
                                  value={location.id}
                                  disabled={
                                    !location.is_active
                                  }
                                >
                                  {location.name}
                                  {!location.is_active
                                    ? " (Inactive)"
                                    : ""}
                                </option>
                              )
                            )}
                          </select>
                        )}

                        <select
                          value={pickupSearchMode}
                          onChange={(e) => {
                            const mode =
                              e.target.value as SearchMode;

                            setPickupSearchMode(mode);
                            setPickupSearchFocused(false);

                            if (mode === "select") {
                              setPickupSearchTerm("");
                            } else {
                              setSelectedPickupLocation("");
                            }
                          }}
                          className="absolute right-1.5 top-1/2 z-20 -translate-y-1/2 rounded-lg border-0 bg-muted px-2 py-1.5 text-xs font-medium outline-none"
                        >
                          <option value="search">
                            Search
                          </option>

                          <option value="select">
                            Select
                          </option>
                        </select>

                        {pickupSearchMode === "search" &&
                          pickupSearchFocused &&
                          pickupSearchTerm.trim() &&
                          pickupState && (
                            <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border border-input bg-background shadow-lg">
                              {filteredPickupLocations.length >
                              0 ? (
                                filteredPickupLocations.map(
                                  (location) => {
                                    const inactive =
                                      !location.is_active;

                                    return (
                                      <button
                                        key={location.id}
                                        type="button"
                                        disabled={inactive}
                                        onClick={() => {
                                          if (inactive)
                                            return;

                                          setSelectedPickupLocation(
                                            location.id.toString()
                                          );

                                          setPickupSearchTerm(
                                            location.name
                                          );

                                          setPickupSearchFocused(
                                            false
                                          );
                                        }}
                                        className={`block w-full border-b border-input px-4 py-3 text-left last:border-0 ${
                                          inactive
                                            ? "cursor-not-allowed bg-muted/30 text-muted-foreground"
                                            : "hover:bg-muted"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between gap-3">
                                          <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">
                                              {location.name}
                                            </p>

                                            {location.address && (
                                              <p className="mt-1 truncate text-xs text-muted-foreground">
                                                {
                                                  location.address
                                                }
                                              </p>
                                            )}
                                          </div>

                                          {inactive && (
                                            <span className="shrink-0 text-xs">
                                              Inactive
                                            </span>
                                          )}
                                        </div>
                                      </button>
                                    );
                                  }
                                )
                              ) : (
                                <div className="px-4 py-3 text-sm text-muted-foreground">
                                  No matching locations
                                  found.
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </div>

                {fulfillment === "delivery" && (
                  <>
                    <div>
                      <label className="mb-1 block text-xs font-medium">
                        Pickup Location
                        <p className="mt-2 text-xs text-muted-foreground">
                          Select the location your order will come from.
                        </p>
                      </label>

                      <div className="relative">
                        {pickupSearchMode === "search" && (
                          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        )}

                        {pickupSearchMode === "search" ? (
                          <input
                            type="text"
                            value={pickupSearchTerm}
                            onChange={(e) => {
                              setPickupSearchFocused(true);
                              setPickupSearchTerm(
                                e.target.value
                              );
                            }}
                            onFocus={() =>
                              setPickupSearchFocused(true)
                            }
                            placeholder={
                              pickupState
                                ? "Search pickup locations..."
                                : "Select pickup state first"
                            }
                            disabled={!pickupState}
                            className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-24 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                          />
                        ) : (
                          <select
                            required
                            value={selectedPickupLocation}
                            onChange={(e) =>
                              setSelectedPickupLocation(
                                e.target.value
                              )
                            }
                            disabled={!pickupState}
                            className="w-full appearance-none rounded-xl border border-input bg-background px-3 py-2.5 pr-24 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <option value="">
                              {!pickupState
                                ? "Select State First"
                                : pickupLocations.length ===
                                  0
                                ? "No Locations Available"
                                : "Select Location"}
                            </option>

                            {pickupLocations.map(
                              (location) => (
                                <option
                                  key={location.id}
                                  value={location.id}
                                  disabled={
                                    !location.is_active
                                  }
                                >
                                  {location.name}
                                  {!location.is_active
                                    ? " (Inactive)"
                                    : ""}
                                </option>
                              )
                            )}
                          </select>
                        )}

                        <select
                          value={pickupSearchMode}
                          onChange={(e) => {
                            const mode =
                              e.target.value as SearchMode;

                            setPickupSearchMode(mode);
                            setPickupSearchFocused(false);

                            if (mode === "select") {
                              setPickupSearchTerm("");
                            } else {
                              setSelectedPickupLocation("");
                            }
                          }}
                          className="absolute right-1.5 top-1/2 z-20 -translate-y-1/2 rounded-lg border-0 bg-muted px-2 py-1.5 text-xs font-medium outline-none"
                        >
                          <option value="search">
                            Search
                          </option>

                          <option value="select">
                            Select
                          </option>
                        </select>

                        {pickupSearchMode === "search" &&
                          pickupSearchFocused &&
                          pickupSearchTerm.trim() &&
                          pickupState && (
                            <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border border-input bg-background shadow-lg">
                              {filteredPickupLocations.length >
                              0 ? (
                                filteredPickupLocations.map(
                                  (location) => {
                                    const inactive =
                                      !location.is_active;

                                    return (
                                      <button
                                        key={location.id}
                                        type="button"
                                        disabled={inactive}
                                        onClick={() => {
                                          if (inactive)
                                            return;

                                          setSelectedPickupLocation(
                                            location.id.toString()
                                          );

                                          setPickupSearchTerm(
                                            location.name
                                          );

                                          setPickupSearchFocused(
                                            false
                                          );
                                        }}
                                        className={`block w-full border-b border-input px-4 py-3 text-left last:border-0 ${
                                          inactive
                                            ? "cursor-not-allowed bg-muted/30 text-muted-foreground"
                                            : "hover:bg-muted"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between gap-3">
                                          <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">
                                              {location.name}
                                            </p>

                                            {location.address && (
                                              <p className="mt-1 truncate text-xs text-muted-foreground">
                                                {
                                                  location.address
                                                }
                                              </p>
                                            )}
                                          </div>

                                          {inactive && (
                                            <span className="shrink-0 text-xs">
                                              Inactive
                                            </span>
                                          )}
                                        </div>
                                      </button>
                                    );
                                  }
                                )
                              ) : (
                                <div className="px-4 py-3 text-sm text-muted-foreground">
                                  No matching locations
                                  found.
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                  </>
                )}

                {fulfillment === "pickup" &&
                  selectedPickup && (
                    <div className="animate-fade-in space-y-2 rounded-xl border-2 border-primary bg-primary/5 p-4">
                      <p className="text-sm font-semibold">
                        {selectedPickup.name}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {selectedPickup.address}
                      </p>

                      <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                        {selectedPickup.phone && (
                          <div className="flex justify-between gap-3">
                            <span>Phone:</span>

                            <span className="font-medium text-foreground">
                              {selectedPickup.phone}
                            </span>
                          </div>
                        )}

                        {selectedPickup.opening_time && (
                          <div className="flex justify-between gap-3">
                            <span>Opens:</span>

                            <span className="font-medium text-foreground">
                              {selectedPickup.opening_time}
                            </span>
                          </div>
                        )}

                        {selectedPickup.closing_time && (
                          <div className="flex justify-between gap-3">
                            <span>Closes:</span>

                            <span className="font-medium text-foreground">
                              {selectedPickup.closing_time}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {fulfillment === "delivery" && (
                  <>
                    <div>
                      <label className="mb-1 block text-xs font-medium">
                        Delivery Location
                        <p className="mt-2 text-xs text-muted-foreground">
                          Select the location closest to you for delivery.
                        </p>
                      </label>

                      <div className="relative">
                        {deliverySearchMode === "search" && (
                          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        )}

                        {deliverySearchMode === "search" ? (
                          <input
                            type="text"
                            value={deliverySearchTerm}
                            onChange={(e) => {
                              setDeliverySearchFocused(true);
                              setDeliverySearchTerm(
                                e.target.value
                              );
                            }}
                            onFocus={() =>
                              setDeliverySearchFocused(true)
                            }
                            placeholder={
                              deliveryState
                                ? "Search delivery locations..."
                                : "Select delivery state first"
                            }
                            disabled={!deliveryState}
                            className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-24 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                          />
                        ) : (
                          <select
                            required
                            value={
                              selectedDeliveryLocation
                            }
                            onChange={(e) =>
                              setSelectedDeliveryLocation(
                                e.target.value
                              )
                            }
                            disabled={!deliveryState}
                            className="w-full appearance-none rounded-xl border border-input bg-background px-3 py-2.5 pr-24 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <option value="">
                              {!deliveryState
                                ? "Select State First"
                                : deliveryLocations.length ===
                                  0
                                ? "No Locations Available"
                                : "Select Location"}
                            </option>

                            {deliveryLocations.map(
                              (location) => (
                                <option
                                  key={location.id}
                                  value={location.id}
                                  disabled={
                                    !location.is_active
                                  }
                                >
                                  {location.name}
                                  {!location.is_active
                                    ? " (Inactive)"
                                    : ""}
                                </option>
                              )
                            )}
                          </select>
                        )}

                        <select
                          value={deliverySearchMode}
                          onChange={(e) => {
                            const mode =
                              e.target.value as SearchMode;

                            setDeliverySearchMode(mode);
                            setDeliverySearchFocused(false);

                            if (mode === "select") {
                              setDeliverySearchTerm("");
                            } else {
                              setSelectedDeliveryLocation("");
                            }
                          }}
                          className="absolute right-1.5 top-1/2 z-20 -translate-y-1/2 rounded-lg border-0 bg-muted px-2 py-1.5 text-xs font-medium outline-none"
                        >
                          <option value="search">
                            Search
                          </option>

                          <option value="select">
                            Select
                          </option>
                        </select>

                        {deliverySearchMode === "search" &&
                          deliverySearchFocused &&
                          deliverySearchTerm.trim() &&
                          deliveryState && (
                            <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border border-input bg-background shadow-lg">
                              {filteredDeliveryLocations.length >
                              0 ? (
                                filteredDeliveryLocations.map(
                                  (location) => {
                                    const inactive =
                                      !location.is_active;

                                    return (
                                      <button
                                        key={location.id}
                                        type="button"
                                        disabled={inactive}
                                        onClick={() => {
                                          if (inactive)
                                            return;

                                          setSelectedDeliveryLocation(
                                            location.id.toString()
                                          );

                                          setDeliverySearchTerm(
                                            location.name
                                          );

                                          setDeliverySearchFocused(
                                            false
                                          );
                                        }}
                                        className={`block w-full border-b border-input px-4 py-3 text-left last:border-0 ${
                                          inactive
                                            ? "cursor-not-allowed bg-muted/30 text-muted-foreground"
                                            : "hover:bg-muted"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between gap-3">
                                          <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">
                                              {location.name}
                                            </p>

                                            {location.address && (
                                              <p className="mt-1 truncate text-xs text-muted-foreground">
                                                {
                                                  location.address
                                                }
                                              </p>
                                            )}
                                          </div>

                                          {inactive && (
                                            <span className="shrink-0 text-xs">
                                              Inactive
                                            </span>
                                          )}
                                        </div>
                                      </button>
                                    );
                                  }
                                )
                              ) : (
                                <div className="px-4 py-3 text-sm text-muted-foreground">
                                  No matching locations
                                  found.
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                    </div>

                    {selectedPickup &&
                      selectedDelivery && (
                        <div className="animate-fade-in space-y-2 rounded-xl border-2 border-primary bg-primary/5 p-4">
                          <p className="text-sm font-semibold">
                            {selectedPickup.name} →{" "}
                            {selectedDelivery.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {selectedPickup.address} →{" "}
                            {selectedDelivery.address}
                          </p>
                        </div>
                      )}

                    {selectedPickupLocation &&
                      selectedDeliveryLocation && (
                        <div className="space-y-3">
                          <h3 className="font-display text-base font-semibold">
                            Delivery Type
                          </h3>

                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <button
                              type="button"
                              disabled={
                                deliveryRateLoading ||
                                !standardRate
                              }
                              onClick={() =>
                                setDeliveryType(
                                  "standard"
                                )
                              }
                              className={`rounded-xl border-2 p-4 text-left transition-all ${
                                deliveryType ===
                                "standard"
                                  ? "border-yellow-500 bg-yellow-100 dark:bg-yellow-950/30"
                                  : "border-input hover:border-yellow-400"
                              } ${
                                !standardRate
                                  ? "cursor-not-allowed opacity-60"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold">
                                    Standard
                                  </p>

                                  <p className="mt-1 text-xs text-muted-foreground">
                                    Normal delivery
                                  </p>
                                </div>

                                {standardRate && (
                                  <span className="text-sm font-semibold">
                                    {formatPrice(
                                      Number(
                                        standardRate.delivery_fee
                                      )
                                    )}
                                  </span>
                                )}

                                {deliveryRateLoading && (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                              </div>
                            </button>

                            <button
                              type="button"
                              disabled={
                                deliveryRateLoading ||
                                !expressRate
                              }
                              onClick={() =>
                                setDeliveryType(
                                  "express"
                                )
                              }
                              className={`rounded-xl border-2 p-4 text-left transition-all ${
                                deliveryType ===
                                "express"
                                  ? "border-green-500 bg-green-100 dark:bg-green-950/30"
                                  : "border-input hover:border-green-400"
                              } ${
                                !expressRate
                                  ? "cursor-not-allowed opacity-60"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold">
                                    Express
                                  </p>

                                  <p className="mt-1 text-xs text-muted-foreground">
                                    Faster delivery
                                  </p>
                                </div>

                                {expressRate && (
                                  <span className="text-sm font-semibold">
                                    {formatPrice(
                                      Number(
                                        expressRate.delivery_fee
                                      )
                                    )}
                                  </span>
                                )}

                                {deliveryRateLoading && (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                              </div>
                            </button>
                          </div>

                          {deliveryRateChecked &&
                            !deliveryRateLoading &&
                            !standardRate &&
                            !expressRate && (
                              <p className="text-sm text-destructive">
                                No delivery option is available for these locations. Please select different locations.
                              </p>
                            )}
                        </div>
                      )}
                  </>
                )}

                {fulfillment === "pickup" && (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium">
                        Full Name
                      </label>

                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) =>
                          setFullName(e.target.value)
                        }
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
                        onChange={(e) =>
                          setPhone(e.target.value)
                        }
                        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                )}
              </div>

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
                <form
                  onSubmit={handlePayment}
                  className="space-y-5"
                >
                  <div className="glass-card p-5">
                    <h3 className="font-display mb-3 text-base font-semibold">
                      Select Payment Method
                    </h3>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() =>
                          setPaymentMethod("card")
                        }
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
                        onClick={() =>
                          setPaymentMethod("transfer")
                        }
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
                        You will be securely redirected to Paystack
                        to complete your payment.
                      </p>

                      <div className="flex justify-between text-sm">
                        <span>
                          Transaction Fee (
                          {PAYSTACK_FEE_PERCENTAGE}%)
                        </span>

                        <span>
                          {formatPrice(
                            paystackTransactionFee
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between border-t pt-3 font-semibold">
                        <span>Total</span>

                        <span>
                          {formatPrice(paystackTotal)}
                        </span>
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
                          Transfer the exact amount below to the
                          AESTRA account. Your order will remain
                          pending until the payment is verified.
                        </p>
                      </div>

                      <div className="rounded-xl border-2 border-primary bg-primary/5 p-4">
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">
                              Bank
                            </span>

                            <span className="font-semibold">
                              Zenith Bank
                            </span>
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
                              onClick={
                                copyAccountNumber
                              }
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
                          <span>
                            Product Subtotal
                          </span>

                          <span>
                            {formatPrice(subtotal)}
                          </span>
                        </div>

                        {fulfillment === "delivery" && (
                          <div className="mt-2 flex justify-between text-sm">
                            <span>Delivery</span>

                            <span>
                              {formatPrice(
                                selectedDeliveryFee
                              )}
                            </span>
                          </div>
                        )}

                        <div className="mt-2 flex justify-between text-sm">
                          <span>
                            Transaction Fee (
                            {
                              BANK_TRANSFER_FEE_PERCENTAGE
                            }
                            %)
                          </span>

                          <span>
                            {formatPrice(
                              bankTransferTransactionFee
                            )}
                          </span>
                        </div>

                        <div className="mt-3 flex justify-between border-t pt-3 font-bold">
                          <span>
                            Total to Transfer
                          </span>

                          <span>
                            {formatPrice(
                              bankTransferTotal
                            )}
                          </span>
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
                              setBankAccountName(
                                e.target.value
                              )
                            }
                            placeholder="Input the name of the account used for the payment"
                            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />

                          <p className="mt-1.5 text-xs text-muted-foreground">
                            Input the name of the account used
                            for the payment.
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
                              setBankTransactionNumber(
                                e.target.value
                              )
                            }
                            placeholder="Copy the session ID or transaction number for the payment"
                            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />

                          <p className="mt-1.5 text-xs text-muted-foreground">
                            Copy the session ID or transaction
                            number for the payment.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setStep("fulfillment")
                      }
                      className="rounded-xl border border-input px-5 py-2.5 text-sm"
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      disabled={
                        !paymentMethod ||
                        (paymentMethod ===
                          "transfer" &&
                          (!bankAccountName.trim() ||
                            !bankTransactionNumber.trim()))
                      }
                      className="flex-1 btn-primary-glow text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {paymentMethod === "transfer"
                        ? "I've Transferred"
                        : `Proceed — ${formatPrice(
                            paystackTotal
                          )}`}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        <div className="glass-card h-fit p-5">
          <h3 className="mb-3 font-bold">
            Order Summary
          </h3>

          {safeCart.map((item: any) => {
            const price = Number(
              item?.product?.final_price ??
                item?.product?.price ??
                0
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
                  {formatPrice(
                    price * item.quantity
                  )}
                </span>
              </div>
            );
          })}

          <hr className="my-3" />

          <div className="flex justify-between text-sm">
            <span>Subtotal</span>

            <span>
              {formatPrice(subtotal)}
            </span>
          </div>

          {fulfillment === "delivery" && (
            <div className="mt-2 flex justify-between text-sm">
              <span>Delivery</span>

              <span>
                {deliveryType
                  ? formatPrice(selectedDeliveryFee)
                  : "—"}
              </span>
            </div>
          )}

          {paymentMethod === "card" && (
            <div className="mt-2 flex justify-between text-sm">
              <span>
                Transaction Fee (
                {PAYSTACK_FEE_PERCENTAGE}%)
              </span>

              <span>
                {formatPrice(
                  paystackTransactionFee
                )}
              </span>
            </div>
          )}

          {paymentMethod === "transfer" && (
            <div className="mt-2 flex justify-between text-sm">
              <span>
                Transaction Fee (
                {BANK_TRANSFER_FEE_PERCENTAGE}%)
              </span>

              <span>
                {formatPrice(
                  bankTransferTransactionFee
                )}
              </span>
            </div>
          )}

          <hr className="my-3" />

          <div className="flex justify-between font-bold">
            <span>Total</span>

            <span>
              {formatPrice(
                paymentMethod
                  ? selectedTotal
                  : amountBeforeTransactionFee
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;