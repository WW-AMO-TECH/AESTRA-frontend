import { useEffect, useState } from "react";
import axios from "axios";
import { ShieldCheck, Mail, Calendar } from "lucide-react";
import Sidebar from "@/components/Admin/Sidebar";
import { useAuth } from "@/context/AuthContext";

interface Admin {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

const Admins = () => {
  const { user } = useAuth();

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const token = localStorage.getItem("token");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  };

  const fetchAdmins = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/superadmin/admins",
        config
      );

      setAdmins(res.data);
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar user={user} />

      <main className="flex-1 pt-20 lg:pt-6 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Approved Admins
          </h1>

          <p className="text-gray-500 mt-1">
            View all approved administrators
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-gray-500">
            Loading admins...
          </div>
        )}

        {/* Empty State */}
        {!loading && admins.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold mb-2">
              No Approved Admins
            </h2>

            <p className="text-gray-500">
              There are currently no approved admins.
            </p>
          </div>
        )}

        {/* Admin Cards */}
        {!loading && admins.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="bg-white rounded-2xl shadow-sm p-6 border"
              >
                {/* Top */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">
                    {admin.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h2 className="font-semibold text-lg">
                      {admin.name}
                    </h2>

                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <ShieldCheck className="w-4 h-4" />
                      Approved Admin
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{admin.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Joined{" "}
                      {new Date(
                        admin.created_at
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Admins;