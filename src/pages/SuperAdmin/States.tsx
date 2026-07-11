import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Admin/Sidebar";
import { Plus, Pencil, Trash2, X } from "lucide-react";

const States = () => {
  const { user } = useAuth();

  const token = localStorage.getItem("token");

  const [states, setStates] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);

  const [countryId, setCountryId] = useState("");
  const [name, setName] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchStates = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/superadmin/states",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStates(
        Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
          ? res.data.data
          : []
      );
    } catch (err: any) {
      console.log(
        "FETCH STATES ERROR:",
        err.response?.data || err
      );
    }
  };

  const fetchCountries = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/superadmin/countries",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCountries(
        Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
          ? res.data.data
          : []
      );
    } catch (err: any) {
      console.log(
        "FETCH COUNTRIES ERROR:",
        err.response?.data || err
      );
    }
  };

  useEffect(() => {
    fetchStates();
    fetchCountries();
  }, []);

  const handleSaveState = async () => {
    try {
      const payload = {
        country_id: countryId,
        name,
      };

      if (editingId) {
        await axios.put(
          `http://127.0.0.1:8000/api/superadmin/states/${editingId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await axios.post(
          `http://127.0.0.1:8000/api/superadmin/states`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      setName("");
      setCountryId("");
      setEditingId(null);
      setShowModal(false);

      fetchStates();
    } catch (err: any) {
      console.log(
        "SAVE STATE ERROR:",
        err.response?.data || err
      );
    }
  };

  const handleEdit = (state: any) => {
    setEditingId(state.id);
    setName(state.name);
    setCountryId(String(state.country_id));
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this state?")) return;

    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/superadmin/states/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchStates();
    } catch (err: any) {
      console.log(
        "DELETE STATE ERROR:",
        err.response?.data || err
      );
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setName("");
    setCountryId("");
    setShowModal(true);
  };

  return (
    <div className="min-h-screen lg:flex bg-background">
      <Sidebar user={user} />

      <div className="flex-1 p-6 pt-20 lg:pt-6">
        {!user ? (
          <Navigate to="/admin/login" replace />
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">
                Manage States
              </h1>

              <button
                onClick={openAddModal}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg"
              >
                <Plus size={18} />
                Add State
              </button>
            </div>

            <div className="bg-white rounded-xl shadow overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="p-4 text-left">ID</th>
                    <th className="p-4 text-left">Country</th>
                    <th className="p-4 text-left">State</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {states.length > 0 ? (
                    states.map((state) => (
                      <tr
                        key={state.id}
                        className="border-b hover:bg-muted/20"
                      >
                        <td className="p-4">{state.id}</td>

                        <td className="p-4">
                          {state.country?.name}
                        </td>

                        <td className="p-4">{state.name}</td>

                        <td className="p-4">
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={() =>
                                handleEdit(state)
                              }
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Pencil size={18} />
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(state.id)
                              }
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-6 text-center text-gray-500"
                      >
                        No states found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {showModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl w-full max-w-md p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-bold text-xl">
                      {editingId
                        ? "Edit State"
                        : "Add State"}
                    </h2>

                    <button
                      onClick={() =>
                        setShowModal(false)
                      }
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <select
                    value={countryId}
                    onChange={(e) =>
                      setCountryId(e.target.value)
                    }
                    className="w-full border rounded-lg p-3 mb-4"
                  >
                    <option value="">
                      Select Country
                    </option>

                    {countries.map((country) => (
                      <option
                        key={country.id}
                        value={country.id}
                      >
                        {country.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="State Name"
                    className="w-full border rounded-lg p-3 mb-4"
                  />

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() =>
                        setShowModal(false)
                      }
                      className="px-4 py-2 border rounded-lg"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleSaveState}
                      className="bg-primary text-white px-4 py-2 rounded-lg"
                    >
                      {editingId
                        ? "Update State"
                        : "Save State"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default States;