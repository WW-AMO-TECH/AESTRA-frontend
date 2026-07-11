import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Admin/Sidebar";
import { Plus, Pencil, Trash2, X } from "lucide-react";

const PickupLocations = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [locations, setLocations] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);

  const [countryId, setCountryId] = useState("");
  const [stateId, setStateId] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [openingTime, setOpeningTime] = useState("");
  const [closingTime, setClosingTime] = useState("");

  const [errors, setErrors] = useState<any>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const resetForm = () => {
    setCountryId("");
    setStateId("");
    setName("");
    setAddress("");
    setPhone("");
    setOpeningTime("");
    setClosingTime("");
    setEditingId(null);
    setErrors({});
    setStates([]);
  };

  // ---------------- FETCH LOCATIONS ----------------
  const fetchLocations = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/superadmin/pickup-locations",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      console.log("LOCATIONS RESPONSE:", res.data);

      setLocations(res.data.data ?? res.data ?? []);
    } catch (error: any) {
      console.log("FETCH LOCATIONS ERROR:", error.response?.data || error);
    }
  };

  // ---------------- FETCH COUNTRIES ----------------
  const fetchCountries = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/superadmin/countries",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCountries(res.data.data || []);
    } catch (err) {
      console.log("FETCH COUNTRIES ERROR:", err);
    }
  };

  // ---------------- FETCH STATES ----------------
  const handleCountryChange = async (id: string) => {
    setCountryId(id);
    setStateId("");

    if (!id) {
      setStates([]);
      return;
    }

    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/superadmin/countries/${id}/states`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setStates(res.data.data || []);
    } catch (err) {
      console.log("FETCH STATES ERROR:", err);
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchCountries();
  }, []);

  // ---------------- VALIDATION + SAVE ----------------
  const handleSave = async () => {
    const newErrors: any = {};

    if (!countryId) newErrors.countryId = "Country is required";
    if (!stateId) newErrors.stateId = "State is required";
    if (!name.trim()) newErrors.name = "Location name is required";
    if (!address.trim()) newErrors.address = "Address is required";
    if (!phone.trim()) newErrors.phone = "Phone is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    const payload = {
      country_id: countryId,
      state_id: stateId,
      name,
      address,
      phone,
      opening_time: openingTime,
      closing_time: closingTime,
    };

    try {
      if (editingId) {
        await axios.put(
          `http://127.0.0.1:8000/api/superadmin/pickup-locations/${editingId}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post(
          "http://127.0.0.1:8000/api/superadmin/pickup-locations",
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      resetForm();
      setShowModal(false);
      fetchLocations();
    } catch (err) {
      console.log("SAVE ERROR:", err);
    }
  };

  // ---------------- EDIT ----------------
  const handleEdit = async (location: any) => {
    setEditingId(location.id);
    setName(location.name || "");
    setAddress(location.address || "");
    setPhone(location.phone || "");
    setOpeningTime(location.opening_time || "");
    setClosingTime(location.closing_time || "");

    await handleCountryChange(String(location.country_id));
    setStateId(String(location.state_id));

    setShowModal(true);
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this pickup location?")) return;

    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/superadmin/pickup-locations/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchLocations();
    } catch (err) {
      console.log("DELETE ERROR:", err);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen bg-background lg:flex">
      <Sidebar user={user} />

      <div className="flex-1 p-6 pt-20 lg:pt-6">
        {!user ? (
          <Navigate to="/admin/login" replace />
        ) : (
          <>
            <div className="flex justify-between mb-6">
              <h1 className="text-3xl font-bold">
                Pickup Locations
              </h1>

              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg"
              >
                <Plus size={18} />
                Add Location
              </button>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="p-4">Country</th>
                    <th className="p-4">State</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Hours</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {locations.map((l) => (
                    <tr key={l.id} className="border-b">
                      <td className="p-4">{l.country?.name}</td>
                      <td className="p-4">{l.state?.name}</td>
                      <td className="p-4">{l.name}</td>
                      <td className="p-4">{l.phone}</td>
                      <td className="p-4">
                        {l.opening_time} - {l.closing_time}
                      </td>

                      <td className="p-4 flex gap-3">
                        <button onClick={() => handleEdit(l)}>
                          <Pencil size={18} />
                        </button>

                        <button onClick={() => handleDelete(l.id)}>
                          <Trash2 size={18} className="text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MODAL */}
            {showModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-xl w-[500px]">

                  <div className="flex justify-between mb-4">
                    <h2 className="text-xl font-bold">
                      {editingId ? "Edit" : "Add"} Pickup Location
                    </h2>

                    <button onClick={() => setShowModal(false)}>
                      <X />
                    </button>
                  </div>

                  {/* COUNTRY */}
                  <select
                    value={countryId}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full border p-2 mb-1"
                  >
                    <option value="">Select Country</option>
                    {countries.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-red-500 text-sm mb-2">
                    {errors.countryId}
                  </p>

                  {/* STATE */}
                  <select
                    value={stateId}
                    onChange={(e) => setStateId(e.target.value)}
                    className="w-full border p-2 mb-1"
                  >
                    <option value="">Select State</option>
                    {states.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-red-500 text-sm mb-2">
                    {errors.stateId}
                  </p>

                  {/* NAME */}
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border p-2 mb-1"
                    placeholder="Location Name"
                  />
                  <p className="text-red-500 text-sm mb-2">
                    {errors.name}
                  </p>

                  {/* ADDRESS */}
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border p-2 mb-1"
                    placeholder="Address"
                  />
                  <p className="text-red-500 text-sm mb-2">
                    {errors.address}
                  </p>

                  {/* PHONE */}
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border p-2 mb-1"
                    placeholder="Phone"
                  />
                  <p className="text-red-500 text-sm mb-2">
                    {errors.phone}
                  </p>

                  {/* HOURS */}
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={openingTime}
                      onChange={(e) => setOpeningTime(e.target.value)}
                      className="w-full border p-2"
                    />

                    <input
                      type="time"
                      value={closingTime}
                      onChange={(e) => setClosingTime(e.target.value)}
                      className="w-full border p-2"
                    />
                  </div>

                  <button
                    onClick={handleSave}
                    className="mt-4 bg-primary text-white px-4 py-2 rounded w-full"
                  >
                    {editingId ? "Update" : "Save"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PickupLocations;