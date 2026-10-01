import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "@/api/axios";
import { toast } from "sonner";
import {
  ChevronDown,
  Globe,
  Loader2,
  Map,
  MapPin,
  Pencil,
  Plus,
  Route,
  Search,
  Trash2,
  X,
} from "lucide-react";

import Sidebar from "@/components/SuperAdmin/Sidebar";
import { useAuth } from "@/context/AuthContext";

type Tab = "countries" | "states" | "locations" | "deliveryLocations" | "rates";

type Country = {
  id: number;
  name: string;
  is_active?: boolean;
};

type State = {
  id: number;
  country_id: number;
  name: string;
  is_active?: boolean;
  country?: Country;
};

type Location = {
  id: number;
  country_id: number;
  state_id: number;
  name: string;
  address: string;
  phone: string;
  opening_time?: string | null;
  closing_time?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  is_active?: boolean;
  country?: Country;
  state?: State;
};

type DeliveryLocation = {
  id: number;
  country_id: number;
  state_id: number;
  name: string;
  address: string;
  phone?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  is_active?: boolean;
  country?: Country;
  state?: State;
};

type DeliveryType = "Standard" | "Express";

type DeliveryRate = {
  id: number;
  pickup_location_id: number;
  delivery_location_id: number;
  delivery_type: DeliveryType | string;
  delivery_fee: number | string;
  is_active?: boolean;
  pickup_location?: Location;
  delivery_location?: DeliveryLocation;
  pickupLocation?: Location;
  deliveryLocation?: DeliveryLocation;
};

type PickupForm = {
  countryId: string;
  stateId: string;
  name: string;
  address: string;
  phone: string;
  openingTime: string;
  closingTime: string;
  latitude: string;
  longitude: string;
  isActive: string;
};

type DeliveryLocationForm = {
  countryId: string;
  stateId: string;
  name: string;
  address: string;
  phone: string;
  latitude: string;
  longitude: string;
  isActive: string;
};

type RateForm = {
  pickupLocationId: string;
  deliveryLocationId: string;
  deliveryType: string;
  deliveryFee: string;
  isActive: string;
};

const emptyPickupForm: PickupForm = {
  countryId: "",
  stateId: "",
  name: "",
  address: "",
  phone: "",
  openingTime: "",
  closingTime: "",
  latitude: "",
  longitude: "",
  isActive: "1",
};

const emptyDeliveryForm: DeliveryLocationForm = {
  countryId: "",
  stateId: "",
  name: "",
  address: "",
  phone: "",
  latitude: "",
  longitude: "",
  isActive: "1",
};

const emptyRateForm: RateForm = {
  pickupLocationId: "",
  deliveryLocationId: "",
  deliveryType: "",
  deliveryFee: "",
  isActive: "1",
};

const headers = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  Accept: "application/json",
});

const deliveryTypeOptions = [
  { value: "Standard", label: "Standard" },
  { value: "Express", label: "Express" },
];

const deliveryTypeLabel = (type?: string) => {
  if (type === "interstate") return "Interstate";
  if (type === "intrastate") return "Intrastate";
  return type || "—";
};

const normalizeTimeForInput = (time?: string | null) => {
  if (!time) return "";

  const value = String(time).trim();

  if (!value) return "";

  const match = value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);

  if (!match) return "";

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return "";
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const formatTime12Hour = (time?: string | null) => {
  if (!time) return "—";

  const normalized = normalizeTimeForInput(time);

  if (!normalized) return time;

  const [hours, minutes] = normalized.split(":").map(Number);

  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;

  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold">{label}</label>

      <input
        type={type}
        step={type === "number" ? "any" : undefined}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20"
      />

      {error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  disabled?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold">{label}</label>

      <div className="relative mt-1.5">
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border bg-background px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
        >
          <option value="">{placeholder}</option>

          {options.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>

      {error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}
    </div>
  );
}

function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  disabled?: boolean;
  error?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const selected = options.find((item) => item.value === value);

  useEffect(() => {
    setQuery(selected?.label || "");
  }, [value, selected?.label]);

  const filtered = options.filter((item) =>
    item.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="relative">
      <label className="text-xs font-semibold">{label}</label>

      <div className="relative mt-1.5">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <input
          type="text"
          value={query}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={() => {
            setOpen(true);

            if (value) {
              setQuery(selected?.label || "");
            }
          }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onChange={(e) => {
            const nextValue = e.target.value;

            setQuery(nextValue);
            setOpen(true);

            if (!nextValue.trim()) {
              onChange("");
            }
          }}
          className="w-full rounded-xl border bg-background py-2.5 pl-9 pr-9 text-xs outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
        />

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>

      {error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}

      {open && !disabled && (
        <div className="absolute left-0 right-0 z-[60] mt-1 max-h-56 overflow-y-auto rounded-xl border bg-background p-1 shadow-xl">
          {filtered.length === 0 ? (
            <p className="p-3 text-xs text-muted-foreground">
              No results found.
            </p>
          ) : (
            filtered.map((item) => (
              <button
                key={item.value}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setQuery(item.label);
                  onChange(item.value);
                  setOpen(false);
                }}
                className={`block w-full rounded-lg px-3 py-2.5 text-left text-xs hover:bg-secondary ${
                  item.value === value ? "bg-secondary font-semibold" : ""
                }`}
              >
                {item.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`glass-card p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
        active ? "ring-2 ring-primary/30" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </span>

        <div className="text-right">
          <p className="text-xl font-bold">{count}</p>
          <p className="text-[10px] text-muted-foreground">{label}</p>
        </div>
      </div>
    </button>
  );
}

function Modal({
  title,
  description,
  children,
  onClose,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto glass-card">
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h2 className="font-bold">{title}</h2>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function ToggleSwitch({
  active,
  onClick,
  disabled = false,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      onClick={onClick}
      disabled={disabled}
      title={active ? "Deactivate" : "Activate"}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        active ? "bg-primary" : "bg-muted-foreground/30"
      }`}
    >
      <span
        className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          active ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function Actions({
  onEdit,
  onDelete,
  onToggle,
  active = true,
}: {
  onEdit: () => void;
  onDelete: () => void;
  onToggle?: () => void;
  active?: boolean;
}) {
  return (
    <div className="flex justify-end gap-1">
      {onToggle && (
        <ToggleSwitch active={active} onClick={onToggle} />
      )}

      <button
        type="button"
        onClick={onEdit}
        title="Edit"
        className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <Pencil className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={onDelete}
        title="Delete"
        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  setCurrentPage,
}: {
  currentPage: number;
  totalPages: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <div className="flex items-center justify-between gap-1">
      <button
        type="button"
        onClick={() =>
          setCurrentPage((page) => Math.max(page - 1, 1))
        }
        disabled={currentPage === 1}
        className="rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
      >
        Previous
      </button>

      <div className="flex items-center gap-1">
        {Array.from(
          { length: totalPages },
          (_, index) => index + 1
        ).map((page) => (
          <button
            type="button"
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`h-8 min-w-8 rounded-lg px-2 text-[11px] font-semibold transition-colors ${
              currentPage === page
                ? "bg-primary text-primary-foreground"
                : "hover:bg-secondary"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() =>
          setCurrentPage((page) =>
            Math.min(page + 1, totalPages)
          )
        }
        disabled={currentPage === totalPages}
        className="rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}

const formatNaira = (value: number | string) =>
  `₦${Number(value || 0).toLocaleString("en-NG")}`;

export default function PickupLocations() {
  const { user } = useAuth();

  const [tab, setTab] = useState<Tab>("locations");
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [deliveryLocations, setDeliveryLocations] = useState<
    DeliveryLocation[]
  >([]);
  const [rates, setRates] = useState<DeliveryRate[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");

  const [pickupStateFilter, setPickupStateFilter] = useState("");
  const [deliveryStateFilter, setDeliveryStateFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [locationModal, setLocationModal] = useState(false);
  const [deliveryLocationModal, setDeliveryLocationModal] = useState(false);
  const [rateModal, setRateModal] = useState(false);
  const [simpleModal, setSimpleModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteType, setDeleteType] = useState<Tab>("locations");

  const [pickupForm, setPickupForm] =
    useState<PickupForm>(emptyPickupForm);
  const [deliveryForm, setDeliveryForm] =
    useState<DeliveryLocationForm>(emptyDeliveryForm);
  const [rateForm, setRateForm] =
    useState<RateForm>(emptyRateForm);

  const [simpleName, setSimpleName] = useState("");
  const [simpleCountry, setSimpleCountry] = useState("");
  const [errors, setErrors] =
    useState<Record<string, string>>({});

  const fetchData = async () => {
    setLoading(true);

    try {
      const h = { headers: headers() };

      const results = await Promise.allSettled([
        axios.get("/superadmin/countries", h),
        axios.get("/superadmin/states", h),
        axios.get("/superadmin/pickup-locations", h),
        axios.get("/superadmin/delivery-locations", h),
        axios.get("/superadmin/delivery-rates", h),
      ]);

      const getData = (result: PromiseSettledResult<any>) => {
        if (result.status !== "fulfilled") return [];

        const payload = result.value?.data;

        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.data)) return payload.data;

        return [];
      };

      setCountries(getData(results[0]));
      setStates(getData(results[1]));
      setLocations(getData(results[2]));
      setDeliveryLocations(getData(results[3]));
      setRates(getData(results[4]));
    } catch (error) {
      console.error("Failed to fetch pickup/delivery data:", error);
      toast.error("Failed to load pickup and delivery data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    tab,
    search,
    pickupStateFilter,
    deliveryStateFilter,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    locations.length,
    deliveryLocations.length,
    rates.length,
    states.length,
    countries.length,
  ]);

  const getCountryName = (
    countryId: number,
    country?: Country
  ) =>
    country?.name ||
    countries.find((item) => item.id === countryId)?.name ||
    "";

  const getStateName = (
    stateId: number,
    state?: State
  ) =>
    state?.name ||
    states.find((item) => item.id === stateId)?.name ||
    "";

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();

    return countries.filter((item) =>
      [
        item.name,
        String(item.id),
        item.is_active === false ? "inactive" : "active",
        item.is_active === false ? "0" : "1",
      ].some((value) =>
        String(value).toLowerCase().includes(q)
      )
    );
  }, [countries, search]);

  const filteredStates = useMemo(() => {
    const q = search.trim().toLowerCase();

    return states.filter((item) => {
      const country = getCountryName(
        item.country_id,
        item.country
      );

      return [
        item.name,
        country,
        String(item.id),
        String(item.country_id),
        item.is_active === false ? "inactive" : "active",
        item.is_active === false ? "0" : "1",
      ].some((value) =>
        String(value).toLowerCase().includes(q)
      );
    });
  }, [states, countries, search]);

  const filteredLocations = useMemo(() => {
    const q = search.trim().toLowerCase();

    return locations.filter((item) => {
      const country = getCountryName(
        item.country_id,
        item.country
      );

      const state = getStateName(
        item.state_id,
        item.state
      );

      const status =
        item.is_active === false ? "inactive" : "active";

      const matchesState =
        !pickupStateFilter ||
        String(item.state_id) === pickupStateFilter;

      const values = [
        item.id,
        item.country_id,
        item.state_id,
        item.name,
        item.address,
        item.phone,
        item.opening_time,
        item.closing_time,
        item.latitude,
        item.longitude,
        country,
        state,
        status,
        item.is_active === false ? "0" : "1",
      ];

      return (
        matchesState &&
        values.some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(q)
        )
      );
    });
  }, [
    locations,
    countries,
    states,
    search,
    pickupStateFilter,
  ]);

  const filteredDeliveryLocations = useMemo(() => {
    const q = search.trim().toLowerCase();

    return deliveryLocations.filter((item) => {
      const country = getCountryName(
        item.country_id,
        item.country
      );

      const state = getStateName(
        item.state_id,
        item.state
      );

      const status =
        item.is_active === false ? "inactive" : "active";

      const matchesState =
        !deliveryStateFilter ||
        String(item.state_id) === deliveryStateFilter;

      const values = [
        item.id,
        item.country_id,
        item.state_id,
        item.name,
        item.address,
        item.phone,
        item.latitude,
        item.longitude,
        country,
        state,
        status,
        item.is_active === false ? "0" : "1",
      ];

      return (
        matchesState &&
        values.some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(q)
        )
      );
    });
  }, [
    deliveryLocations,
    countries,
    states,
    search,
    deliveryStateFilter,
  ]);

  const filteredRates = useMemo(() => {
    const q = search.trim().toLowerCase();

    return rates.filter((item) => {
      const pickup =
        item.pickup_location ||
        item.pickupLocation ||
        locations.find(
          (location) =>
            location.id === item.pickup_location_id
        );

      const delivery =
        item.delivery_location ||
        item.deliveryLocation ||
        deliveryLocations.find(
          (location) =>
            location.id === item.delivery_location_id
        );

      const pickupCountry =
        pickup?.country?.name ||
        countries.find(
          (country) =>
            country.id === pickup?.country_id
        )?.name ||
        "";

      const pickupState =
        pickup?.state?.name ||
        states.find(
          (state) =>
            state.id === pickup?.state_id
        )?.name ||
        "";

      const deliveryCountry =
        delivery?.country?.name ||
        countries.find(
          (country) =>
            country.id === delivery?.country_id
        )?.name ||
        "";

      const deliveryState =
        delivery?.state?.name ||
        states.find(
          (state) =>
            state.id === delivery?.state_id
        )?.name ||
        "";

      const status =
        item.is_active === false ? "inactive" : "active";

      const type = deliveryTypeLabel(
        item.delivery_type
      );

      const values = [
        item.id,
        item.pickup_location_id,
        item.delivery_location_id,
        item.delivery_type,
        type,
        item.delivery_fee,
        status,
        item.is_active === false ? "0" : "1",

        pickup?.id,
        pickup?.name,
        pickup?.address,
        pickup?.phone,
        pickup?.latitude,
        pickup?.longitude,
        pickupCountry,
        pickupState,
        pickup?.country_id,
        pickup?.state_id,

        delivery?.id,
        delivery?.name,
        delivery?.address,
        delivery?.phone,
        delivery?.latitude,
        delivery?.longitude,
        deliveryCountry,
        deliveryState,
        delivery?.country_id,
        delivery?.state_id,
      ];

      return values.some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [
    rates,
    locations,
    deliveryLocations,
    states,
    countries,
    search,
  ]);

  const paginatedCountries = useMemo(() => {
    const start =
      (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredCountries.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [filteredCountries, currentPage]);

  const paginatedStates = useMemo(() => {
    const start =
      (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredStates.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [filteredStates, currentPage]);

  const paginatedLocations = useMemo(() => {
    const start =
      (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredLocations.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [filteredLocations, currentPage]);

  const paginatedDeliveryLocations = useMemo(() => {
    const start =
      (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredDeliveryLocations.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [filteredDeliveryLocations, currentPage]);

  const paginatedRates = useMemo(() => {
    const start =
      (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredRates.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [filteredRates, currentPage]);

  const totalPages =
    tab === "countries"
      ? Math.max(
          1,
          Math.ceil(
            filteredCountries.length / ITEMS_PER_PAGE
          )
        )
      : tab === "states"
        ? Math.max(
            1,
            Math.ceil(
              filteredStates.length / ITEMS_PER_PAGE
            )
          )
        : tab === "locations"
          ? Math.max(
              1,
              Math.ceil(
                filteredLocations.length /
                  ITEMS_PER_PAGE
              )
            )
          : tab === "deliveryLocations"
            ? Math.max(
                1,
                Math.ceil(
                  filteredDeliveryLocations.length /
                    ITEMS_PER_PAGE
                )
              )
            : Math.max(
                1,
                Math.ceil(
                  filteredRates.length /
                    ITEMS_PER_PAGE
                )
              );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const reset = () => {
    setPickupForm(emptyPickupForm);
    setDeliveryForm(emptyDeliveryForm);
    setRateForm(emptyRateForm);
    setSimpleName("");
    setSimpleCountry("");
    setEditingId(null);
    setErrors({});
  };

  const updatePickupForm = (
    field: keyof PickupForm,
    value: string
  ) => {
    setPickupForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const updateDeliveryForm = (
    field: keyof DeliveryLocationForm,
    value: string
  ) => {
    setDeliveryForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const updateRateForm = (
    field: keyof RateForm,
    value: string
  ) => {
    setRateForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const openLocation = (item?: Location) => {
    reset();

    if (item) {
      setEditingId(item.id);

      setPickupForm({
        countryId: String(item.country_id),
        stateId: String(item.state_id),
        name: item.name,
        address: item.address,
        phone: item.phone || "",
        openingTime: normalizeTimeForInput(
          item.opening_time
        ),
        closingTime: normalizeTimeForInput(
          item.closing_time
        ),
        latitude:
          item.latitude !== null &&
          item.latitude !== undefined
            ? String(item.latitude)
            : "",
        longitude:
          item.longitude !== null &&
          item.longitude !== undefined
            ? String(item.longitude)
            : "",
        isActive:
          item.is_active === false ? "0" : "1",
      });
    }

    setLocationModal(true);
  };

  const openDeliveryLocation = (
    item?: DeliveryLocation
  ) => {
    reset();

    if (item) {
      setEditingId(item.id);

      setDeliveryForm({
        countryId: String(item.country_id),
        stateId: String(item.state_id),
        name: item.name,
        address: item.address,
        phone: item.phone || "",
        latitude:
          item.latitude !== null &&
          item.latitude !== undefined
            ? String(item.latitude)
            : "",
        longitude:
          item.longitude !== null &&
          item.longitude !== undefined
            ? String(item.longitude)
            : "",
        isActive:
          item.is_active === false ? "0" : "1",
      });
    }

    setDeliveryLocationModal(true);
  };

  const openRate = (item?: DeliveryRate) => {
    reset();

    if (item) {
      const pickup =
        item.pickup_location ||
        item.pickupLocation;

      const delivery =
        item.delivery_location ||
        item.deliveryLocation;

      setEditingId(item.id);

      setRateForm({
        pickupLocationId: String(
          item.pickup_location_id ||
            pickup?.id ||
            ""
        ),
        deliveryLocationId: String(
          item.delivery_location_id ||
            delivery?.id ||
            ""
        ),
        deliveryType: item.delivery_type || "",
        deliveryFee: String(item.delivery_fee),
        isActive:
          item.is_active === false ? "0" : "1",
      });
    }

    setRateModal(true);
  };

  const openSimple = (
    type: "country" | "state",
    item?: Country | State
  ) => {
    reset();

    if (item) {
      setEditingId(item.id);
      setSimpleName(item.name);

      if (type === "state") {
        setSimpleCountry(
          String((item as State).country_id)
        );
      }
    }

    setSimpleModal(true);
  };

  const validatePickup = () => {
    const next: Record<string, string> = {};

    if (!pickupForm.countryId) {
      next.countryId = "Required.";
    }

    if (!pickupForm.stateId) {
      next.stateId = "Required.";
    }

    if (!pickupForm.name.trim()) {
      next.name = "Required.";
    }

    if (!pickupForm.address.trim()) {
      next.address = "Required.";
    }

    if (!pickupForm.phone.trim()) {
      next.phone = "Required.";
    }

    if (!pickupForm.latitude.trim()) {
      next.latitude = "Required.";
    }

    if (!pickupForm.longitude.trim()) {
      next.longitude = "Required.";
    }

    const latitude = Number(
      pickupForm.latitude
    );

    const longitude = Number(
      pickupForm.longitude
    );

    if (
      pickupForm.latitude &&
      !Number.isFinite(latitude)
    ) {
      next.latitude = "Enter a valid latitude.";
    } else if (
      pickupForm.latitude &&
      (latitude < -90 || latitude > 90)
    ) {
      next.latitude =
        "Latitude must be between -90 and 90.";
    }

    if (
      pickupForm.longitude &&
      !Number.isFinite(longitude)
    ) {
      next.longitude =
        "Enter a valid longitude.";
    } else if (
      pickupForm.longitude &&
      (longitude < -180 || longitude > 180)
    ) {
      next.longitude =
        "Longitude must be between -180 and 180.";
    }

    if (
      pickupForm.openingTime &&
      pickupForm.closingTime &&
      pickupForm.closingTime <
        pickupForm.openingTime
    ) {
      next.closingTime =
        "Closing time cannot be before opening time.";
    }

    setErrors(next);

    return !Object.keys(next).length;
  };

  const validateDeliveryLocation = () => {
    const next: Record<string, string> = {};

    if (!deliveryForm.countryId) {
      next.countryId = "Required.";
    }

    if (!deliveryForm.stateId) {
      next.stateId = "Required.";
    }

    if (!deliveryForm.name.trim()) {
      next.name = "Required.";
    }

    if (!deliveryForm.address.trim()) {
      next.address = "Required.";
    }

    if (!deliveryForm.phone.trim()) {
      next.phone = "Required.";
    }

    if (!deliveryForm.latitude.trim()) {
      next.latitude = "Required.";
    }

    if (!deliveryForm.longitude.trim()) {
      next.longitude = "Required.";
    }

    const latitude = Number(
      deliveryForm.latitude
    );

    const longitude = Number(
      deliveryForm.longitude
    );

    if (
      deliveryForm.latitude &&
      !Number.isFinite(latitude)
    ) {
      next.latitude = "Enter a valid latitude.";
    } else if (
      deliveryForm.latitude &&
      (latitude < -90 || latitude > 90)
    ) {
      next.latitude =
        "Latitude must be between -90 and 90.";
    }

    if (
      deliveryForm.longitude &&
      !Number.isFinite(longitude)
    ) {
      next.longitude =
        "Enter a valid longitude.";
    } else if (
      deliveryForm.longitude &&
      (longitude < -180 || longitude > 180)
    ) {
      next.longitude =
        "Longitude must be between -180 and 180.";
    }

    setErrors(next);

    return !Object.keys(next).length;
  };

  const validateRate = () => {
    const next: Record<string, string> = {};

    if (!rateForm.pickupLocationId) {
      next.pickupLocationId =
        "Select a pickup location.";
    }

    if (!rateForm.deliveryLocationId) {
      next.deliveryLocationId =
        "Select a delivery location.";
    }

    if (!rateForm.deliveryType) {
      next.deliveryType =
        "Select a delivery type.";
    }

    if (
      !rateForm.deliveryFee ||
      Number(rateForm.deliveryFee) < 0
    ) {
      next.deliveryFee =
        "Enter a valid fee.";
    }

    setErrors(next);

    return !Object.keys(next).length;
  };

  const saveLocation = async () => {
    if (!validatePickup()) return;

    const latitude = Number.parseFloat(
      pickupForm.latitude.trim()
    );

    const longitude = Number.parseFloat(
      pickupForm.longitude.trim()
    );

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      setErrors({
        latitude: !Number.isFinite(latitude)
          ? "Enter a valid latitude."
          : "",
        longitude: !Number.isFinite(longitude)
          ? "Enter a valid longitude."
          : "",
      });

      return;
    }

    setSaving(true);

    try {
      const data = {
        country_id: Number(
          pickupForm.countryId
        ),
        state_id: Number(
          pickupForm.stateId
        ),
        name: pickupForm.name.trim(),
        address: pickupForm.address.trim(),
        phone: pickupForm.phone.trim(),

        // Browser sends HH:mm, e.g. 08:00.
        // Laravel should validate these as H:i.
        opening_time:
          pickupForm.openingTime || null,
        closing_time:
          pickupForm.closingTime || null,

        latitude,
        longitude,
        is_active:
          pickupForm.isActive === "1",
      };

      const h = {
        headers: headers(),
      };

      let response;

      if (editingId !== null) {
        response = await axios.put(
          `/superadmin/pickup-locations/${editingId}`,
          data,
          h
        );
      } else {
        response = await axios.post(
          `/superadmin/pickup-locations`,
          data,
          h
        );
      }

      console.log(
        "Pickup location save payload:",
        data
      );

      console.log(
        "Pickup location save response:",
        response.data
      );

      const saved =
        response.data?.data ??
        response.data?.location ??
        null;

      if (saved) {
        const savedLatitude = Number(
          saved.latitude
        );

        const savedLongitude = Number(
          saved.longitude
        );

        if (
          savedLatitude !== latitude ||
          savedLongitude !== longitude
        ) {
          console.error(
            "Coordinates returned by API do not match:",
            {
              sent: {
                latitude,
                longitude,
              },
              received: {
                latitude:
                  saved.latitude,
                longitude:
                  saved.longitude,
              },
            }
          );

          toast.error(
            "Location saved, but the coordinates were not persisted correctly."
          );

          return;
        }
      }

      toast.success(
        editingId !== null
          ? "Location updated."
          : "Location created."
      );

      setLocationModal(false);
      reset();

      await fetchData();
    } catch (error: any) {
      console.error(
        "Pickup location save error:",
        error
      );

      console.error(
        "Response:",
        error?.response?.data
      );

      const validationErrors =
        error?.response?.data?.errors;

      if (validationErrors) {
        const firstError = Object.values(
          validationErrors
        )[0];

        if (Array.isArray(firstError)) {
          toast.error(
            String(firstError[0])
          );
        } else {
          toast.error(String(firstError));
        }
      } else {
        toast.error(
          error?.response?.data?.message ||
            "Failed to save location."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const saveDeliveryLocation = async () => {
    if (!validateDeliveryLocation()) return;

    const latitude = Number.parseFloat(
      deliveryForm.latitude.trim()
    );

    const longitude = Number.parseFloat(
      deliveryForm.longitude.trim()
    );

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      setErrors({
        latitude: !Number.isFinite(latitude)
          ? "Enter a valid latitude."
          : "",
        longitude: !Number.isFinite(longitude)
          ? "Enter a valid longitude."
          : "",
      });

      return;
    }

    setSaving(true);

    try {
      const data = {
        country_id: Number(
          deliveryForm.countryId
        ),
        state_id: Number(
          deliveryForm.stateId
        ),
        name: deliveryForm.name.trim(),
        address: deliveryForm.address.trim(),
        phone: deliveryForm.phone.trim(),
        latitude,
        longitude,
        is_active:
          deliveryForm.isActive === "1",
      };

      const h = {
        headers: headers(),
      };

      let response;

      if (editingId !== null) {
        response = await axios.put(
          `/superadmin/delivery-locations/${editingId}`,
          data,
          h
        );
      } else {
        response = await axios.post(
          `/superadmin/delivery-locations`,
          data,
          h
        );
      }

      console.log(
        "Delivery location save payload:",
        data
      );

      console.log(
        "Delivery location save response:",
        response.data
      );

      // DeliveryLocationController returns "location",
      // while PickupLocationController returns "data".
      const saved =
        response.data?.location ??
        response.data?.data ??
        null;

      if (saved) {
        const savedLatitude = Number(
          saved.latitude
        );

        const savedLongitude = Number(
          saved.longitude
        );

        if (
          savedLatitude !== latitude ||
          savedLongitude !== longitude
        ) {
          console.error(
            "Delivery coordinates returned by API do not match:",
            {
              sent: {
                latitude,
                longitude,
              },
              received: {
                latitude:
                  saved.latitude,
                longitude:
                  saved.longitude,
              },
            }
          );

          toast.error(
            "Location saved, but the coordinates were not persisted correctly."
          );

          return;
        }
      }

      toast.success(
        editingId !== null
          ? "Delivery location updated."
          : "Delivery location created."
      );

      setDeliveryLocationModal(false);
      reset();

      await fetchData();
    } catch (error: any) {
      console.error(
        "Delivery location save error:",
        error
      );

      console.error(
        "Response:",
        error?.response?.data
      );

      const validationErrors =
        error?.response?.data?.errors;

      if (validationErrors) {
        const firstError = Object.values(
          validationErrors
        )[0];

        if (Array.isArray(firstError)) {
          toast.error(
            String(firstError[0])
          );
        } else {
          toast.error(String(firstError));
        }
      } else {
        toast.error(
          error?.response?.data?.message ||
            "Failed to save delivery location."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const saveRate = async () => {
    if (!validateRate()) return;

    setSaving(true);

    try {
      const data = {
        pickup_location_id: Number(
          rateForm.pickupLocationId
        ),
        delivery_location_id: Number(
          rateForm.deliveryLocationId
        ),
        delivery_type:
          rateForm.deliveryType,
        delivery_fee: Number(
          rateForm.deliveryFee
        ),
        is_active:
          rateForm.isActive === "1",
      };

      const h = {
        headers: headers(),
      };

      if (editingId !== null) {
        await axios.put(
          `/superadmin/delivery-rates/${editingId}`,
          data,
          h
        );

        toast.success(
          "Delivery rate updated."
        );
      } else {
        await axios.post(
          `/superadmin/delivery-rates`,
          data,
          h
        );

        toast.success(
          "Delivery rate created."
        );
      }

      setRateModal(false);
      reset();

      await fetchData();
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to save delivery rate."
      );
    } finally {
      setSaving(false);
    }
  };

  const saveSimple = async () => {
    if (!simpleName.trim()) {
      setErrors({
        name: "Name is required.",
      });

      return;
    }

    if (
      tab === "states" &&
      !simpleCountry
    ) {
      toast.error("Select a country.");
      return;
    }

    setSaving(true);

    try {
      const h = {
        headers: headers(),
      };

      if (tab === "countries") {
        const data = {
          name: simpleName.trim(),
        };

        if (editingId !== null) {
          await axios.put(
            `/superadmin/countries/${editingId}`,
            data,
            h
          );

          toast.success(
            "Country updated."
          );
        } else {
          await axios.post(
            `/superadmin/countries`,
            data,
            h
          );

          toast.success(
            "Country created."
          );
        }
      } else {
        const data = {
          name: simpleName.trim(),
          country_id: Number(
            simpleCountry
          ),
        };

        if (editingId !== null) {
          await axios.put(
            `/superadmin/states/${editingId}`,
            data,
            h
          );

          toast.success(
            "State updated."
          );
        } else {
          await axios.post(
            `/superadmin/states`,
            data,
            h
          );

          toast.success(
            "State created."
          );
        }
      }

      setSimpleModal(false);
      reset();

      await fetchData();
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to save."
      );
    } finally {
      setSaving(false);
    }
  };

  const openDelete = (
    type: Tab,
    id: number
  ) => {
    setDeleteType(type);
    setDeleteId(id);
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;

    setDeleting(true);

    try {
      const paths = {
        countries: "countries",
        states: "states",
        locations: "pickup-locations",
        deliveryLocations:
          "delivery-locations",
        rates: "delivery-rates",
      };

      await axios.delete(
        `/superadmin/${paths[deleteType]}/${deleteId}`,
        {
          headers: headers(),
        }
      );

      toast.success(
        "Deleted successfully."
      );

      setDeleteModal(false);
      setDeleteId(null);

      await fetchData();
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
          "Unable to delete."
      );
    } finally {
      setDeleting(false);
    }
  };

  const toggleItem = async (
    type:
      | "locations"
      | "deliveryLocations"
      | "rates"
      | "states"
      | "countries",
    id: number
  ) => {
    try {
      const paths = {
        locations: "pickup-locations",
        deliveryLocations:
          "delivery-locations",
        rates: "delivery-rates",
        states: "states",
        countries: "countries",
      };

      await axios.patch(
        `/superadmin/${paths[type]}/${id}/toggle-status`,
        {},
        {
          headers: headers(),
        }
      );

      toast.success("Status updated.");

      await fetchData();
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
          "Unable to update status."
      );
    }
  };

  const addItem = () => {
    if (tab === "locations") {
      openLocation();
    } else if (
      tab === "deliveryLocations"
    ) {
      openDeliveryLocation();
    } else if (tab === "rates") {
      openRate();
    } else {
      openSimple(
        tab === "states"
          ? "state"
          : "country"
      );
    }
  };

  const title =
    tab === "locations"
      ? "Pickup Locations"
      : tab === "deliveryLocations"
        ? "Delivery Locations"
        : tab === "rates"
          ? "Delivery Rates"
          : tab === "states"
            ? "States"
            : "Countries";

  const pickupOptions = locations.map(
    (item) => {
      const state =
        item.state?.name ||
        states.find(
          (s) => s.id === item.state_id
        )?.name ||
        "";

      const country =
        item.country?.name ||
        countries.find(
          (c) => c.id === item.country_id
        )?.name ||
        "";

      return {
        value: String(item.id),
        label: `${item.name} — ${state}, ${country}`,
      };
    }
  );

  const deliveryOptions =
    deliveryLocations.map((item) => {
      const state =
        item.state?.name ||
        states.find(
          (s) => s.id === item.state_id
        )?.name ||
        "";

      const country =
        item.country?.name ||
        countries.find(
          (c) => c.id === item.country_id
        )?.name ||
        "";

      return {
        value: String(item.id),
        label: `${item.name} — ${state}, ${country}`,
      };
    });

  const stateOptions = states.map(
    (item) => ({
      value: String(item.id),
      label: `${item.name} — ${getCountryName(
        item.country_id,
        item.country
      )}`,
    })
  );

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-primary/20 lg:flex">
      <Sidebar user={user} />

      <div className="mt-14 h-screen flex-1 overflow-y-auto p-3 lg:mt-0">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-lg font-bold">
                Pickup & Delivery
              </h1>

              <p className="text-[11px] text-muted-foreground">
                Manage pickup locations,
                delivery locations and
                delivery rates.
              </p>
            </div>

            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground"
            >
              <Plus className="h-4 w-4" />

              Add{" "}
              {tab === "locations"
                ? "Location"
                : tab ===
                    "deliveryLocations"
                  ? "Delivery Location"
                  : tab === "rates"
                    ? "Delivery Rate"
                    : tab === "states"
                      ? "State"
                      : "Country"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <StatCard
              icon={
                <MapPin className="h-5 w-5" />
              }
              label="Pickup Locations"
              count={locations.length}
              active={
                tab === "locations"
              }
              onClick={() => {
                setTab("locations");
                setSearch("");
              }}
            />

            <StatCard
              icon={
                <MapPin className="h-5 w-5" />
              }
              label="Delivery Locations"
              count={
                deliveryLocations.length
              }
              active={
                tab === "deliveryLocations"
              }
              onClick={() => {
                setTab(
                  "deliveryLocations"
                );
                setSearch("");
              }}
            />

            <StatCard
              icon={
                <Route className="h-5 w-5" />
              }
              label="Delivery Rates"
              count={rates.length}
              active={tab === "rates"}
              onClick={() => {
                setTab("rates");
                setSearch("");
              }}
            />

            <StatCard
              icon={
                <Map className="h-5 w-5" />
              }
              label="States"
              count={states.length}
              active={tab === "states"}
              onClick={() => {
                setTab("states");
                setSearch("");
              }}
            />

            <StatCard
              icon={
                <Globe className="h-5 w-5" />
              }
              label="Countries"
              count={countries.length}
              active={tab === "countries"}
              onClick={() => {
                setTab("countries");
                setSearch("");
              }}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold">
                {title}
              </h2>

              <p className="text-[11px] text-muted-foreground">
                View and manage your{" "}
                {tab ===
                "deliveryLocations"
                  ? "delivery locations"
                  : tab}
                .
              </p>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              {tab === "locations" && (
                <div className="relative w-full sm:w-52">
                  <select
                    value={
                      pickupStateFilter
                    }
                    onChange={(e) =>
                      setPickupStateFilter(
                        e.target.value
                      )
                    }
                    className="w-full appearance-none rounded-xl border bg-background px-3 py-2.5 pr-9 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">
                      All States
                    </option>

                    {stateOptions.map(
                      (item) => (
                        <option
                          key={item.value}
                          value={item.value}
                        >
                          {item.label}
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              )}

              {tab ===
                "deliveryLocations" && (
                <div className="relative w-full sm:w-52">
                  <select
                    value={
                      deliveryStateFilter
                    }
                    onChange={(e) =>
                      setDeliveryStateFilter(
                        e.target.value
                      )
                    }
                    className="w-full appearance-none rounded-xl border bg-background px-3 py-2.5 pr-9 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">
                      All States
                    </option>

                    {stateOptions.map(
                      (item) => (
                        <option
                          key={item.value}
                          value={item.value}
                        >
                          {item.label}
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              )}

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder={`Search ${
                    tab ===
                    "deliveryLocations"
                      ? "delivery locations"
                      : tab
                  }...`}
                  className="w-full rounded-xl border bg-background py-2.5 pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {tab === "locations" && (
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-secondary/50">
                      <th className="p-3 text-left">
                        Location
                      </th>

                      <th className="p-3 text-left">
                        Country
                      </th>

                      <th className="p-3 text-left">
                        State
                      </th>

                      <th className="p-3 text-left">
                        Address
                      </th>

                      <th className="p-3 text-left">
                        Hours
                      </th>

                      <th className="p-3 text-left">
                        Coordinates
                      </th>

                      <th className="p-3 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-8 text-center"
                        >
                          <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                        </td>
                      </tr>
                    ) : paginatedLocations.length ===
                      0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-8 text-center text-muted-foreground"
                        >
                          No locations found.
                        </td>
                      </tr>
                    ) : (
                      paginatedLocations.map(
                        (item) => {
                          const country =
                            getCountryName(
                              item.country_id,
                              item.country
                            ) || "—";

                          const state =
                            getStateName(
                              item.state_id,
                              item.state
                            ) || "—";

                          return (
                            <tr
                              key={item.id}
                              className="border-b border-border hover:bg-secondary/30"
                            >
                              <td className="p-3 font-semibold">
                                {item.name}
                              </td>

                              <td className="p-3">
                                <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                                  {country}
                                </span>
                              </td>

                              <td className="p-3">
                                {state}
                              </td>

                              <td className="p-3">
                                {item.address}
                              </td>

                              <td className="p-3 text-[10px]">
                                <div>
                                  {formatTime12Hour(
                                    item.opening_time
                                  )}
                                </div>

                                <div className="text-muted-foreground">
                                  {formatTime12Hour(
                                    item.closing_time
                                  )}
                                </div>
                              </td>

                              <td className="p-3 text-[10px]">
                                {item.latitude ??
                                  "—"}
                                ,{" "}
                                {item.longitude ??
                                  "—"}
                              </td>

                              <td className="p-3">
                                <Actions
                                  active={
                                    item.is_active !==
                                    false
                                  }
                                  onToggle={() =>
                                    toggleItem(
                                      "locations",
                                      item.id
                                    )
                                  }
                                  onEdit={() =>
                                    openLocation(
                                      item
                                    )
                                  }
                                  onDelete={() =>
                                    openDelete(
                                      "locations",
                                      item.id
                                    )
                                  }
                                />
                              </td>
                            </tr>
                          );
                        }
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={
                  setCurrentPage
                }
              />
            </div>
          )}

          {tab ===
            "deliveryLocations" && (
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-secondary/50">
                      <th className="p-3 text-left">
                        Location
                      </th>

                      <th className="p-3 text-left">
                        Country
                      </th>

                      <th className="p-3 text-left">
                        State
                      </th>

                      <th className="p-3 text-left">
                        Address
                      </th>

                      <th className="p-3 text-left">
                        Phone
                      </th>

                      <th className="p-3 text-left">
                        Coordinates
                      </th>

                      <th className="p-3 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-8 text-center"
                        >
                          <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                        </td>
                      </tr>
                    ) : paginatedDeliveryLocations.length ===
                      0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-8 text-center text-muted-foreground"
                        >
                          No delivery
                          locations found.
                        </td>
                      </tr>
                    ) : (
                      paginatedDeliveryLocations.map(
                        (item) => {
                          const country =
                            getCountryName(
                              item.country_id,
                              item.country
                            ) || "—";

                          const state =
                            getStateName(
                              item.state_id,
                              item.state
                            ) || "—";

                          return (
                            <tr
                              key={item.id}
                              className="border-b border-border hover:bg-secondary/30"
                            >
                              <td className="p-3 font-semibold">
                                {item.name}
                              </td>

                              <td className="p-3">
                                <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                                  {country}
                                </span>
                              </td>

                              <td className="p-3">
                                {state}
                              </td>

                              <td className="p-3">
                                {item.address}
                              </td>

                              <td className="p-3">
                                {item.phone ||
                                  "—"}
                              </td>

                              <td className="p-3 text-[10px]">
                                {item.latitude ??
                                  "—"}
                                ,{" "}
                                {item.longitude ??
                                  "—"}
                              </td>

                              <td className="p-3">
                                <Actions
                                  active={
                                    item.is_active !==
                                    false
                                  }
                                  onToggle={() =>
                                    toggleItem(
                                      "deliveryLocations",
                                      item.id
                                    )
                                  }
                                  onEdit={() =>
                                    openDeliveryLocation(
                                      item
                                    )
                                  }
                                  onDelete={() =>
                                    openDelete(
                                      "deliveryLocations",
                                      item.id
                                    )
                                  }
                                />
                              </td>
                            </tr>
                          );
                        }
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={
                  setCurrentPage
                }
              />
            </div>
          )}

          {tab === "rates" && (
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-secondary/50">
                      <th className="p-3 text-left">
                        Pickup Location
                      </th>

                      <th className="p-3 text-left">
                        Delivery Location
                      </th>

                      <th className="p-3 text-left">
                        Delivery Type
                      </th>

                      <th className="p-3 text-left">
                        Delivery Fee
                      </th>

                      <th className="p-3 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-8 text-center"
                        >
                          <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                        </td>
                      </tr>
                    ) : paginatedRates.length ===
                      0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-8 text-center text-muted-foreground"
                        >
                          No delivery rates
                          found.
                        </td>
                      </tr>
                    ) : (
                      paginatedRates.map(
                        (item) => {
                          const pickup =
                            item.pickup_location ||
                            item.pickupLocation;

                          const delivery =
                            item.delivery_location ||
                            item.deliveryLocation;

                          const pickupName =
                            pickup?.name ||
                            locations.find(
                              (l) =>
                                l.id ===
                                item.pickup_location_id
                            )?.name ||
                            "—";

                          const deliveryName =
                            delivery?.name ||
                            deliveryLocations.find(
                              (l) =>
                                l.id ===
                                item.delivery_location_id
                            )?.name ||
                            "—";

                          return (
                            <tr
                              key={item.id}
                              className="border-b border-border hover:bg-secondary/30"
                            >
                              <td className="p-3 font-semibold">
                                {pickupName}
                              </td>

                              <td className="p-3">
                                {deliveryName}
                              </td>

                              <td className="p-3">
                                <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                                  {deliveryTypeLabel(
                                    item.delivery_type
                                  )}
                                </span>
                              </td>

                              <td className="p-3 font-semibold">
                                {formatNaira(
                                  item.delivery_fee
                                )}
                              </td>

                              <td className="p-3">
                                <Actions
                                  active={
                                    item.is_active !==
                                    false
                                  }
                                  onToggle={() =>
                                    toggleItem(
                                      "rates",
                                      item.id
                                    )
                                  }
                                  onEdit={() =>
                                    openRate(
                                      item
                                    )
                                  }
                                  onDelete={() =>
                                    openDelete(
                                      "rates",
                                      item.id
                                    )
                                  }
                                />
                              </td>
                            </tr>
                          );
                        }
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={
                  setCurrentPage
                }
              />
            </div>
          )}

          {tab === "states" && (
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-secondary/50">
                      <th className="p-3 text-left">
                        State
                      </th>

                      <th className="p-3 text-left">
                        Country
                      </th>

                      <th className="p-3 text-left">
                        Locations
                      </th>

                      <th className="p-3 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-8 text-center"
                        >
                          <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                        </td>
                      </tr>
                    ) : paginatedStates.length ===
                      0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-8 text-center text-muted-foreground"
                        >
                          No states found.
                        </td>
                      </tr>
                    ) : (
                      paginatedStates.map(
                        (item) => {
                          const country =
                            getCountryName(
                              item.country_id,
                              item.country
                            ) || "—";

                          const count =
                            locations.filter(
                              (l) =>
                                l.state_id ===
                                item.id
                            ).length;

                          return (
                            <tr
                              key={item.id}
                              className="border-b border-border hover:bg-secondary/30"
                            >
                              <td className="p-3 font-semibold">
                                {item.name}
                              </td>

                              <td className="p-3">
                                <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                                  {country}
                                </span>
                              </td>

                              <td className="p-3">
                                <span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-semibold">
                                  {count}
                                </span>
                              </td>

                              <td className="p-3">
                                <Actions
                                  active={
                                    item.is_active !==
                                    false
                                  }
                                  onToggle={() =>
                                    toggleItem(
                                      "states",
                                      item.id
                                    )
                                  }
                                  onEdit={() =>
                                    openSimple(
                                      "state",
                                      item
                                    )
                                  }
                                  onDelete={() =>
                                    openDelete(
                                      "states",
                                      item.id
                                    )
                                  }
                                />
                              </td>
                            </tr>
                          );
                        }
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={
                  setCurrentPage
                }
              />
            </div>
          )}

          {tab === "countries" && (
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-secondary/50">
                      <th className="p-3 text-left">
                        Country
                      </th>

                      <th className="p-3 text-left">
                        States
                      </th>

                      <th className="p-3 text-left">
                        Locations
                      </th>

                      <th className="p-3 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-8 text-center"
                        >
                          <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                        </td>
                      </tr>
                    ) : paginatedCountries.length ===
                      0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-8 text-center text-muted-foreground"
                        >
                          No countries found.
                        </td>
                      </tr>
                    ) : (
                      paginatedCountries.map(
                        (item) => {
                          const stateCount =
                            states.filter(
                              (s) =>
                                s.country_id ===
                                item.id
                            ).length;

                          const locationCount =
                            locations.filter(
                              (l) =>
                                l.country_id ===
                                item.id
                            ).length;

                          return (
                            <tr
                              key={item.id}
                              className="border-b border-border hover:bg-secondary/30"
                            >
                              <td className="p-3 font-semibold">
                                {item.name}
                              </td>

                              <td className="p-3">
                                <span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-semibold">
                                  {stateCount}
                                </span>
                              </td>

                              <td className="p-3">
                                <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                                  {locationCount}
                                </span>
                              </td>

                              <td className="p-3">
                                <Actions
                                  active={
                                    item.is_active !==
                                    false
                                  }
                                  onToggle={() =>
                                    toggleItem(
                                      "countries",
                                      item.id
                                    )
                                  }
                                  onEdit={() =>
                                    openSimple(
                                      "country",
                                      item
                                    )
                                  }
                                  onDelete={() =>
                                    openDelete(
                                      "countries",
                                      item.id
                                    )
                                  }
                                />
                              </td>
                            </tr>
                          );
                        }
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={
                  setCurrentPage
                }
              />
            </div>
          )}
        </div>
      </div>

      {locationModal && (
        <Modal
          title={
            editingId !== null
              ? "Edit Pickup Location"
              : "Add Pickup Location"
          }
          description="Manage pickup location details."
          onClose={() => {
            setLocationModal(false);
            reset();
          }}
        >
          <div className="space-y-4 p-4">
            <SelectField
              label="Country"
              value={pickupForm.countryId}
              onChange={(v) =>
                updatePickupForm(
                  "countryId",
                  v
                )
              }
              placeholder="Select country"
              options={countries.map(
                (c) => ({
                  value: String(c.id),
                  label: c.name,
                })
              )}
              error={errors.countryId}
            />

            <SelectField
              label="State"
              value={pickupForm.stateId}
              onChange={(v) =>
                updatePickupForm(
                  "stateId",
                  v
                )
              }
              disabled={
                !pickupForm.countryId
              }
              placeholder="Select state"
              options={states
                .filter(
                  (s) =>
                    String(
                      s.country_id
                    ) ===
                    pickupForm.countryId
                )
                .map((s) => ({
                  value: String(s.id),
                  label: s.name,
                }))}
              error={errors.stateId}
            />

            <Field
              label="Location Name"
              value={pickupForm.name}
              onChange={(v) =>
                updatePickupForm(
                  "name",
                  v
                )
              }
              placeholder="e.g. Ikeja Pickup Hub"
              error={errors.name}
            />

            <Field
              label="Address"
              value={pickupForm.address}
              onChange={(v) =>
                updatePickupForm(
                  "address",
                  v
                )
              }
              placeholder="Enter pickup address"
              error={errors.address}
            />

            <Field
              label="Phone"
              value={pickupForm.phone}
              onChange={(v) =>
                updatePickupForm(
                  "phone",
                  v
                )
              }
              placeholder="08012345678"
              error={errors.phone}
            />

            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Latitude"
                value={
                  pickupForm.latitude
                }
                onChange={(v) =>
                  updatePickupForm(
                    "latitude",
                    v
                  )
                }
                placeholder="e.g. 6.6018"
                type="number"
                error={errors.latitude}
              />

              <Field
                label="Longitude"
                value={
                  pickupForm.longitude
                }
                onChange={(v) =>
                  updatePickupForm(
                    "longitude",
                    v
                  )
                }
                placeholder="e.g. 3.3515"
                type="number"
                error={errors.longitude}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Opening Time"
                type="time"
                value={
                  pickupForm.openingTime
                }
                onChange={(v) =>
                  updatePickupForm(
                    "openingTime",
                    v
                  )
                }
              />

              <Field
                label="Closing Time"
                type="time"
                value={
                  pickupForm.closingTime
                }
                onChange={(v) =>
                  updatePickupForm(
                    "closingTime",
                    v
                  )
                }
              />
            </div>

            {errors.closingTime && (
              <p className="-mt-2 text-[10px] text-red-500">
                {errors.closingTime}
              </p>
            )}

            <SelectField
              label="Status"
              value={
                pickupForm.isActive
              }
              onChange={(v) =>
                updatePickupForm(
                  "isActive",
                  v
                )
              }
              placeholder="Select status"
              options={[
                {
                  value: "1",
                  label: "Active",
                },
                {
                  value: "0",
                  label: "Inactive",
                },
              ]}
            />

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => {
                  setLocationModal(
                    false
                  );
                  reset();
                }}
                className="rounded-xl border px-4 py-2.5 text-xs font-medium"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveLocation}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-60"
              >
                {saving && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {editingId !== null
                  ? "Save Changes"
                  : "Create Location"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {deliveryLocationModal && (
        <Modal
          title={
            editingId !== null
              ? "Edit Delivery Location"
              : "Add Delivery Location"
          }
          description="Manage delivery destination details."
          onClose={() => {
            setDeliveryLocationModal(
              false
            );
            reset();
          }}
        >
          <div className="space-y-4 p-4">
            <SelectField
              label="Country"
              value={
                deliveryForm.countryId
              }
              onChange={(v) =>
                updateDeliveryForm(
                  "countryId",
                  v
                )
              }
              placeholder="Select country"
              options={countries.map(
                (c) => ({
                  value: String(c.id),
                  label: c.name,
                })
              )}
              error={errors.countryId}
            />

            <SelectField
              label="State"
              value={
                deliveryForm.stateId
              }
              onChange={(v) =>
                updateDeliveryForm(
                  "stateId",
                  v
                )
              }
              disabled={
                !deliveryForm.countryId
              }
              placeholder="Select state"
              options={states
                .filter(
                  (s) =>
                    String(
                      s.country_id
                    ) ===
                    deliveryForm.countryId
                )
                .map((s) => ({
                  value: String(s.id),
                  label: s.name,
                }))}
              error={errors.stateId}
            />

            <Field
              label="Location Name"
              value={deliveryForm.name}
              onChange={(v) =>
                updateDeliveryForm(
                  "name",
                  v
                )
              }
              placeholder="e.g. Lekki Phase 1"
              error={errors.name}
            />

            <Field
              label="Address"
              value={
                deliveryForm.address
              }
              onChange={(v) =>
                updateDeliveryForm(
                  "address",
                  v
                )
              }
              placeholder="Enter delivery address"
              error={errors.address}
            />

            <Field
              label="Phone"
              value={
                deliveryForm.phone
              }
              onChange={(v) =>
                updateDeliveryForm(
                  "phone",
                  v
                )
              }
              placeholder="08012345678"
              error={errors.phone}
            />

            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Latitude"
                value={
                  deliveryForm.latitude
                }
                onChange={(v) =>
                  updateDeliveryForm(
                    "latitude",
                    v
                  )
                }
                placeholder="e.g. 6.4474"
                type="number"
                error={errors.latitude}
              />

              <Field
                label="Longitude"
                value={
                  deliveryForm.longitude
                }
                onChange={(v) =>
                  updateDeliveryForm(
                    "longitude",
                    v
                  )
                }
                placeholder="e.g. 3.4722"
                type="number"
                error={errors.longitude}
              />
            </div>

            <SelectField
              label="Status"
              value={
                deliveryForm.isActive
              }
              onChange={(v) =>
                updateDeliveryForm(
                  "isActive",
                  v
                )
              }
              placeholder="Select status"
              options={[
                {
                  value: "1",
                  label: "Active",
                },
                {
                  value: "0",
                  label: "Inactive",
                },
              ]}
            />

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => {
                  setDeliveryLocationModal(
                    false
                  );
                  reset();
                }}
                className="rounded-xl border px-4 py-2.5 text-xs font-medium"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  saveDeliveryLocation
                }
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-60"
              >
                {saving && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {editingId !== null
                  ? "Save Changes"
                  : "Create Delivery Location"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {rateModal && (
        <Modal
          title={
            editingId !== null
              ? "Edit Delivery Rate"
              : "Add Delivery Rate"
          }
          description="Create a delivery route and set its fee."
          onClose={() => {
            setRateModal(false);
            reset();
          }}
        >
          <div className="space-y-4 p-4">
            <SearchableSelect
              label="Pickup Location"
              value={
                rateForm.pickupLocationId
              }
              onChange={(v) =>
                updateRateForm(
                  "pickupLocationId",
                  v
                )
              }
              placeholder="Search pickup location..."
              options={pickupOptions}
              error={
                errors.pickupLocationId
              }
            />

            <SearchableSelect
              label="Delivery Location"
              value={
                rateForm.deliveryLocationId
              }
              onChange={(v) =>
                updateRateForm(
                  "deliveryLocationId",
                  v
                )
              }
              placeholder="Search delivery location..."
              options={deliveryOptions}
              error={
                errors.deliveryLocationId
              }
            />

            <SelectField
              label="Delivery Type"
              value={
                rateForm.deliveryType
              }
              onChange={(v) =>
                updateRateForm(
                  "deliveryType",
                  v
                )
              }
              placeholder="Select delivery type"
              options={
                deliveryTypeOptions
              }
              error={
                errors.deliveryType
              }
            />

            <Field
              label="Delivery Fee"
              value={
                rateForm.deliveryFee
              }
              onChange={(v) =>
                updateRateForm(
                  "deliveryFee",
                  v
                )
              }
              placeholder="e.g. 2500"
              type="number"
              error={
                errors.deliveryFee
              }
            />

            <SelectField
              label="Status"
              value={
                rateForm.isActive
              }
              onChange={(v) =>
                updateRateForm(
                  "isActive",
                  v
                )
              }
              placeholder="Select status"
              options={[
                {
                  value: "1",
                  label: "Active",
                },
                {
                  value: "0",
                  label: "Inactive",
                },
              ]}
            />

            <div className="rounded-xl bg-secondary/50 p-3 text-[11px] text-muted-foreground">
              <div>
                Route:{" "}
                <span className="font-semibold text-foreground">
                  {pickupOptions.find(
                    (item) =>
                      item.value ===
                      rateForm.pickupLocationId
                  )?.label ||
                    "Pickup Location"}
                </span>

                {" → "}

                <span className="font-semibold text-foreground">
                  {deliveryOptions.find(
                    (item) =>
                      item.value ===
                      rateForm.deliveryLocationId
                  )?.label ||
                    "Delivery Location"}
                </span>
              </div>

              <div className="mt-1">
                Type:{" "}
                <span className="font-semibold text-foreground">
                  {deliveryTypeLabel(
                    rateForm.deliveryType
                  )}
                </span>

                {" • "}

                Fee:{" "}
                <span className="font-semibold text-foreground">
                  {rateForm.deliveryFee
                    ? formatNaira(
                        rateForm.deliveryFee
                      )
                    : "₦0"}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => {
                  setRateModal(false);
                  reset();
                }}
                className="rounded-xl border px-4 py-2.5 text-xs font-medium"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveRate}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-60"
              >
                {saving && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {editingId !== null
                  ? "Save Changes"
                  : "Create Delivery Rate"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {simpleModal && (
        <Modal
          title={`${editingId !== null ? "Edit" : "Add"} ${
            tab === "states"
              ? "State"
              : "Country"
          }`}
          description={`Manage this ${
            tab === "states"
              ? "state"
              : "country"
          }.`}
          onClose={() => {
            setSimpleModal(false);
            reset();
          }}
        >
          <div className="space-y-4 p-4">
            {tab === "states" && (
              <SelectField
                label="Country"
                value={simpleCountry}
                onChange={
                  setSimpleCountry
                }
                placeholder="Select country"
                options={countries.map(
                  (c) => ({
                    value: String(
                      c.id
                    ),
                    label: c.name,
                  })
                )}
              />
            )}

            <Field
              label={
                tab === "states"
                  ? "State Name"
                  : "Country Name"
              }
              value={simpleName}
              onChange={setSimpleName}
              placeholder={
                tab === "states"
                  ? "e.g. Lagos"
                  : "e.g. Nigeria"
              }
              error={errors.name}
            />

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => {
                  setSimpleModal(
                    false
                  );
                  reset();
                }}
                className="rounded-xl border px-4 py-2.5 text-xs font-medium"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveSimple}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-60"
              >
                {saving && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {editingId !== null
                  ? "Save Changes"
                  : "Create"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
          <div className="w-full max-w-sm glass-card p-5">
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-500">
                <Trash2 className="h-5 w-5" />
              </div>

              <h3 className="mt-3 font-bold">
                Delete{" "}
                {deleteType ===
                "locations"
                  ? "Pickup Location"
                  : deleteType ===
                      "deliveryLocations"
                    ? "Delivery Location"
                    : deleteType ===
                        "rates"
                      ? "Delivery Rate"
                      : deleteType ===
                          "states"
                        ? "State"
                        : "Country"}
                ?
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                This action cannot be
                undone.
              </p>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  setDeleteModal(false)
                }
                disabled={deleting}
                className="rounded-xl border px-4 py-2.5 text-xs font-medium"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-60"
              >
                {deleting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}