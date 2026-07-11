import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Admin/Sidebar";
import { Plus, Pencil, Trash2, X } from "lucide-react";

const API = "http://127.0.0.1:8000/api";

const Countries = () => {
  const { user } = useAuth();

  const [countries, setCountries] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };

  const fetchCountries = async () => {
    try {
      const res = await axios.get(
        `${API}/superadmin/countries`,
        { headers }
      );

      setCountries(
        Array.isArray(res.data)
          ? res.data
          : res.data.data || []
      );
    } catch (err: any) {
      console.log(
        "FETCH COUNTRIES ERROR:",
        err.response?.data || err
      );
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const handleSaveCountry = async () => {
    try {
      if (!name.trim()) {
        alert("Country name is required");
        return;
      }

      if (editingId) {
        await axios.put(
          `${API}/superadmin/countries/${editingId}`,
          { name },
          { headers }
        );
      } else {
        await axios.post(
          `${API}/superadmin/countries`,
          { name },
          { headers }
        );
      }

      setName("");
      setEditingId(null);
      setShowModal(false);

      fetchCountries();
    } catch (err: any) {
      console.log(
        "SAVE COUNTRY ERROR:",
        err.response?.data || err
      );

      alert(
        err.response?.data?.message ||
        "Failed to save country"
      );
    }
  };

  const handleEdit = (country: any) => {
    setName(country.name);
    setEditingId(country.id);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this country?")) return;

    try {
      await axios.delete(
        `${API}/superadmin/countries/${id}`,
        { headers }
      );

      fetchCountries();
    } catch (err: any) {
      console.log(
        "DELETE COUNTRY ERROR:",
        err.response?.data || err
      );
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setName("");
    setEditingId(null);
  };

  return (
    <div className="min-h-screen lg:flex bg-background">
      <Sidebar user={user} />

      <div className="flex-1 p-6 pt-20 lg:pt-6">
        {!user ? (
          <Navigate to="/admin/login" replace />
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">
                Countries
              </h1>

              <button
                onClick={() => setShowModal(true)}
                className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus size={18} />
                Add Country
              </button>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="p-4 text-left">ID</th>
                    <th className="p-4 text-left">Country</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {countries.length > 0 ? (
                    countries.map((country) => (
                      <tr
                        key={country.id}
                        className="border-b"
                      >
                        <td className="p-4">
                          {country.id}
                        </td>

                        <td className="p-4">
                          {country.name}
                        </td>

                        <td className="p-4">
                          <div className="flex gap-3">
                            <button
                              onClick={() =>
                                handleEdit(country)
                              }
                            >
                              <Pencil size={18} />
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(country.id)
                              }
                            >
                              <Trash2
                                size={18}
                                className="text-red-500"
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center p-6"
                      >
                        No countries found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {showModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-[400px]">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-xl">
                      {editingId
                        ? "Edit Country"
                        : "Add Country"}
                    </h2>

                    <button onClick={closeModal}>
                      <X />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Country name"
                    className="w-full border p-2 rounded mb-4"
                  />

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveCountry}
                      className="bg-primary text-white px-4 py-2 rounded-lg"
                    >
                      {editingId ? "Update" : "Save"}
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

export default Countries;