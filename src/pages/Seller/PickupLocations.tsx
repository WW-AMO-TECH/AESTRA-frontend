import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { ChevronDown, Globe, Loader2, Map, MapPin, Pencil, Plus, Search, Trash2, X } from "lucide-react";

import Sidebar from "@/components/SuperAdmin/Sidebar";
import { useAuth } from "@/context/AuthContext";

const API = "http://127.0.0.1:8000/api";

type Tab = "countries" | "states" | "locations";

type Country = {
  id: number;
  name: string;
};

type State = {
  id: number;
  country_id: number;
  name: string;
  country?: Country;
};

type Location = {
  id: number;
  country_id: number;
  state_id: number;
  name: string;
  address: string;
  phone: string;
  opening_time?: string;
  closing_time?: string;
  country?: Country;
  state?: State;
};

type Form = {
  countryId: string;
  stateId: string;
  name: string;
  address: string;
  phone: string;
  openingTime: string;
  closingTime: string;
};

const emptyForm: Form = {
  countryId: "",
  stateId: "",
  name: "",
  address: "",
  phone: "",
  openingTime: "",
  closingTime: "",
};

const headers = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  Accept: "application/json",
});

function Field({ label, value, onChange, placeholder, type = "text", error }: {
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
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20" />
      {error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder, disabled = false }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-semibold">{label}</label>
      <div className="relative mt-1.5">
        <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className="w-full appearance-none rounded-xl border bg-background px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20">
          <option value="">{placeholder}</option>
          {options.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );
}

function StatCard({ icon, label, count, active, onClick }: {
  icon: React.ReactNode;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className={`glass-card p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${active ? "ring-2 ring-primary/30" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</span>
        <div className="text-right">
          <p className="text-xl font-bold">{count}</p>
          <p className="text-[10px] text-muted-foreground">{label}</p>
        </div>
      </div>
    </button>
  );
}

function Modal({ title, description, children, onClose }: {
  title: string;
  description: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto glass-card">
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h2 className="font-bold">{title}</h2>
            <p className="mt-1 text-[11px] text-muted-foreground">{description}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Actions({ onEdit, onDelete }: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex justify-end gap-1">
      <button type="button" onClick={onEdit} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
        <Pencil className="h-4 w-4" />
      </button>
      <button type="button" onClick={onDelete} className="rounded-lg p-2 text-red-500 hover:bg-red-50">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function PickupLocations() {
  const { user } = useAuth();

  const [tab, setTab] = useState<Tab>("locations");
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");

  const [locationModal, setLocationModal] = useState(false);
  const [simpleModal, setSimpleModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteType, setDeleteType] = useState<Tab>("locations");

  const [form, setForm] = useState<Form>(emptyForm);
  const [simpleName, setSimpleName] = useState("");
  const [simpleCountry, setSimpleCountry] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!user) return <Navigate to="/login" replace />;

  const fetchData = async () => {
    setLoading(true);

    try {
      const h = { headers: headers() };
      const [c, s, l] = await Promise.all([
        axios.get(`${API}/superadmin/countries`, h),
        axios.get(`${API}/superadmin/states`, h),
        axios.get(`${API}/superadmin/pickup-locations`, h),
      ]);

      setCountries(c.data?.data ?? c.data ?? []);
      setStates(s.data?.data ?? s.data ?? []);
      setLocations(l.data?.data ?? l.data ?? []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCountries = useMemo(() => {
    const q = search.toLowerCase();
    return countries.filter((item) => item.name.toLowerCase().includes(q));
  }, [countries, search]);

  const filteredStates = useMemo(() => {
    const q = search.toLowerCase();

    return states.filter((item) => {
      const country = item.country?.name || countries.find((c) => c.id === item.country_id)?.name || "";
      return item.name.toLowerCase().includes(q) || country.toLowerCase().includes(q);
    });
  }, [states, countries, search]);

  const filteredLocations = useMemo(() => {
    const q = search.toLowerCase();

    return locations.filter((item) => {
      const country = item.country?.name || countries.find((c) => c.id === item.country_id)?.name || "";
      const state = item.state?.name || states.find((s) => s.id === item.state_id)?.name || "";

      return [item.name, item.address, item.phone, country, state].some((v) => v?.toLowerCase().includes(q));
    });
  }, [locations, countries, states, search]);

  const reset = () => {
    setForm(emptyForm);
    setSimpleName("");
    setSimpleCountry("");
    setEditingId(null);
    setErrors({});
  };

  const updateForm = (field: keyof Form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const openLocation = (item?: Location) => {
    reset();

    if (item) {
      setEditingId(item.id);
      setForm({
        countryId: String(item.country_id),
        stateId: String(item.state_id),
        name: item.name,
        address: item.address,
        phone: item.phone,
        openingTime: item.opening_time || "",
        closingTime: item.closing_time || "",
      });
    }

    setLocationModal(true);
  };

  const openSimple = (type: "country" | "state", item?: Country | State) => {
    reset();

    if (item) {
      setEditingId(item.id);
      setSimpleName(item.name);

      if (type === "state") setSimpleCountry(String((item as State).country_id));
    }

    setSimpleModal(true);
  };

  const validateLocation = () => {
    const next: Record<string, string> = {};

    if (!form.countryId) next.countryId = "Required.";
    if (!form.stateId) next.stateId = "Required.";
    if (!form.name.trim()) next.name = "Required.";
    if (!form.address.trim()) next.address = "Required.";
    if (!form.phone.trim()) next.phone = "Required.";

    setErrors(next);
    return !Object.keys(next).length;
  };

  const saveLocation = async () => {
    if (!validateLocation()) return;

    setSaving(true);

    try {
      const data = {
        country_id: Number(form.countryId),
        state_id: Number(form.stateId),
        name: form.name.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        opening_time: form.openingTime || null,
        closing_time: form.closingTime || null,
      };

      const h = { headers: headers() };

      if (editingId) {
        await axios.put(`${API}/superadmin/pickup-locations/${editingId}`, data, h);
        toast.success("Location updated.");
      } else {
        await axios.post(`${API}/superadmin/pickup-locations`, data, h);
        toast.success("Location created.");
      }

      setLocationModal(false);
      reset();
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save location.");
    } finally {
      setSaving(false);
    }
  };

  const saveSimple = async () => {
    if (!simpleName.trim()) {
      setErrors({ name: "Name is required." });
      return;
    }

    if (tab === "states" && !simpleCountry) {
      toast.error("Select a country.");
      return;
    }

    setSaving(true);

    try {
      const h = { headers: headers() };

      if (tab === "countries") {
        const data = { name: simpleName.trim() };

        if (editingId) {
          await axios.put(`${API}/superadmin/countries/${editingId}`, data, h);
          toast.success("Country updated.");
        } else {
          await axios.post(`${API}/superadmin/countries`, data, h);
          toast.success("Country created.");
        }
      } else {
        const data = { name: simpleName.trim(), country_id: Number(simpleCountry) };

        if (editingId) {
          await axios.put(`${API}/superadmin/states/${editingId}`, data, h);
          toast.success("State updated.");
        } else {
          await axios.post(`${API}/superadmin/states`, data, h);
          toast.success("State created.");
        }
      }

      setSimpleModal(false);
      reset();
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const openDelete = (type: Tab, id: number) => {
    setDeleteType(type);
    setDeleteId(id);
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);

    try {
      const paths = {
        countries: "countries",
        states: "states",
        locations: "pickup-locations",
      };

      await axios.delete(`${API}/superadmin/${paths[deleteType]}/${deleteId}`, { headers: headers() });

      toast.success("Deleted successfully.");
      setDeleteModal(false);
      setDeleteId(null);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Unable to delete.");
    } finally {
      setDeleting(false);
    }
  };

  const addItem = () => {
    if (tab === "locations") openLocation();
    else openSimple(tab === "states" ? "state" : "country");
  };

  const title = tab === "locations" ? "Pickup Locations" : tab === "states" ? "States" : "Countries";

  return (
    <div className="min-h-screen bg-primary/20 lg:flex">
      <Sidebar user={user} />

      <div className="mt-14 h-screen flex-1 overflow-y-auto p-3 lg:mt-0">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-lg font-bold">Pickup Locations</h1>
              <p className="text-[11px] text-muted-foreground">Manage pickup locations and regions.</p>
            </div>

            <button onClick={addItem} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground">
              <Plus className="h-4 w-4" />
              Add {tab === "locations" ? "Location" : tab === "states" ? "State" : "Country"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard icon={<MapPin className="h-5 w-5" />} label="Pickup Locations" count={locations.length} active={tab === "locations"} onClick={() => { setTab("locations"); setSearch(""); }} />
            <StatCard icon={<Map className="h-5 w-5" />} label="States" count={states.length} active={tab === "states"} onClick={() => { setTab("states"); setSearch(""); }} />
            <StatCard icon={<Globe className="h-5 w-5" />} label="Countries" count={countries.length} active={tab === "countries"} onClick={() => { setTab("countries"); setSearch(""); }} />
            <StatCard icon={<MapPin className="h-5 w-5" />} label="Active Locations" count={locations.length} active={false} onClick={() => { setTab("locations"); setSearch(""); }} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold">{title}</h2>
              <p className="text-[11px] text-muted-foreground">View and manage your {tab}.</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${tab}...`} className="w-full rounded-xl border bg-background py-2.5 pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>

          {tab === "locations" && (
            <div className="glass-card overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-secondary/50">
                    <th className="p-3 text-left">Location</th>
                    <th className="p-3 text-left">Country</th>
                    <th className="p-3 text-left">State</th>
                    <th className="p-3 text-left">Address</th>
                    <th className="p-3 text-left">Phone</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></td>
                    </tr>
                  ) : filteredLocations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">No locations found.</td>
                    </tr>
                  ) : (
                    filteredLocations.map((item) => {
                      const country = item.country?.name || countries.find((c) => c.id === item.country_id)?.name || "—";
                      const state = item.state?.name || states.find((s) => s.id === item.state_id)?.name || "—";

                      return (
                        <tr key={item.id} className="border-b border-border hover:bg-secondary/30">
                          <td className="p-3 font-semibold">{item.name}</td>
                          <td className="p-3"><span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">{country}</span></td>
                          <td className="p-3">{state}</td>
                          <td className="p-3">{item.address}</td>
                          <td className="p-3">{item.phone}</td>
                          <td className="p-3"><Actions onEdit={() => openLocation(item)} onDelete={() => openDelete("locations", item.id)} /></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === "states" && (
            <div className="glass-card overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-secondary/50">
                    <th className="p-3 text-left">State</th>
                    <th className="p-3 text-left">Country</th>
                    <th className="p-3 text-left">Locations</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></td>
                    </tr>
                  ) : filteredStates.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground">No states found.</td>
                    </tr>
                  ) : (
                    filteredStates.map((item) => {
                      const country = item.country?.name || countries.find((c) => c.id === item.country_id)?.name || "—";
                      const count = locations.filter((l) => l.state_id === item.id).length;

                      return (
                        <tr key={item.id} className="border-b border-border hover:bg-secondary/30">
                          <td className="p-3 font-semibold">{item.name}</td>
                          <td className="p-3"><span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">{country}</span></td>
                          <td className="p-3"><span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-semibold">{count}</span></td>
                          <td className="p-3"><Actions onEdit={() => openSimple("state", item)} onDelete={() => openDelete("states", item.id)} /></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === "countries" && (
            <div className="glass-card overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-secondary/50">
                    <th className="p-3 text-left">Country</th>
                    <th className="p-3 text-left">States</th>
                    <th className="p-3 text-left">Locations</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></td>
                    </tr>
                  ) : filteredCountries.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground">No countries found.</td>
                    </tr>
                  ) : (
                    filteredCountries.map((item) => {
                      const stateCount = states.filter((s) => s.country_id === item.id).length;
                      const locationCount = locations.filter((l) => l.country_id === item.id).length;

                      return (
                        <tr key={item.id} className="border-b border-border hover:bg-secondary/30">
                          <td className="p-3 font-semibold">{item.name}</td>
                          <td className="p-3"><span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-semibold">{stateCount}</span></td>
                          <td className="p-3"><span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">{locationCount}</span></td>
                          <td className="p-3"><Actions onEdit={() => openSimple("country", item)} onDelete={() => openDelete("countries", item.id)} /></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {locationModal && (
        <Modal
          title={editingId ? "Edit Pickup Location" : "Add Pickup Location"}
          description="Manage pickup location details."
          onClose={() => { setLocationModal(false); reset(); }}
        >
          <div className="space-y-4 p-4">
            <SelectField label="Country" value={form.countryId} onChange={(v) => updateForm("countryId", v)} placeholder="Select country" options={countries.map((c) => ({ value: String(c.id), label: c.name }))} />

            <SelectField label="State" value={form.stateId} onChange={(v) => updateForm("stateId", v)} disabled={!form.countryId} placeholder="Select state" options={states.filter((s) => String(s.country_id) === form.countryId).map((s) => ({ value: String(s.id), label: s.name }))} />

            <Field label="Location Name" value={form.name} onChange={(v) => updateForm("name", v)} placeholder="e.g. Ikeja Pickup Centre" error={errors.name} />
            <Field label="Address" value={form.address} onChange={(v) => updateForm("address", v)} placeholder="Enter pickup address" error={errors.address} />
            <Field label="Phone" value={form.phone} onChange={(v) => updateForm("phone", v)} placeholder="08012345678" error={errors.phone} />

            <div className="grid grid-cols-2 gap-3">
              <Field label="Opening Time" type="time" value={form.openingTime} onChange={(v) => updateForm("openingTime", v)} />
              <Field label="Closing Time" type="time" value={form.closingTime} onChange={(v) => updateForm("closingTime", v)} />
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button onClick={() => { setLocationModal(false); reset(); }} className="rounded-xl border px-4 py-2.5 text-xs font-medium">Cancel</button>
              <button onClick={saveLocation} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-60">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? "Save Changes" : "Create Location"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {simpleModal && (
        <Modal
          title={`${editingId ? "Edit" : "Add"} ${tab === "states" ? "State" : "Country"}`}
          description={`Manage this ${tab === "states" ? "state" : "country"}.`}
          onClose={() => { setSimpleModal(false); reset(); }}
        >
          <div className="space-y-4 p-4">
            {tab === "states" && (
              <SelectField label="Country" value={simpleCountry} onChange={setSimpleCountry} placeholder="Select country" options={countries.map((c) => ({ value: String(c.id), label: c.name }))} />
            )}

            <Field label={tab === "states" ? "State Name" : "Country Name"} value={simpleName} onChange={setSimpleName} placeholder={tab === "states" ? "e.g. Lagos" : "e.g. Nigeria"} error={errors.name} />

            <div className="flex justify-end gap-2 border-t pt-4">
              <button onClick={() => { setSimpleModal(false); reset(); }} className="rounded-xl border px-4 py-2.5 text-xs font-medium">Cancel</button>
              <button onClick={saveSimple} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-60">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? "Save Changes" : "Create"}
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

              <h3 className="mt-3 font-bold">Delete {deleteType === "locations" ? "Pickup Location" : deleteType === "states" ? "State" : "Country"}?</h3>
              <p className="mt-1 text-xs text-muted-foreground">This action cannot be undone.</p>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setDeleteModal(false)} disabled={deleting} className="rounded-xl border px-4 py-2.5 text-xs font-medium">Cancel</button>
              <button onClick={confirmDelete} disabled={deleting} className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-60">
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}