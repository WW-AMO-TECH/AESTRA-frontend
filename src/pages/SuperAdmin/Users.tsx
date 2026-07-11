import { useEffect, useState } from "react";
import axios from "axios";
import { ShieldCheck, Mail, Calendar } from "lucide-react";
import Sidebar from "@/components/Admin/Sidebar";
import { useAuth } from "@/context/AuthContext";

interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

const Users = () => {
  const { user } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const token = localStorage.getItem("token");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/superadmin/users",
        config
      );

      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
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
            Approved Customers
          </h1>

          <p className="text-gray-500 mt-1">
            View all approved users
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-gray-500">
            Loading users...
          </div>
        )}

        {/* Empty State */}
        {!loading && users.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold mb-2">
              No Approved Users
            </h2>

            <p className="text-gray-500">
              There are currently no approved users.
            </p>
          </div>
        )}

        {/* User Cards */}
        {!loading && users.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-2xl shadow-sm p-6 border"
              >
                {/* Top */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h2 className="font-semibold text-lg">
                      {user.name}
                    </h2>

                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <ShieldCheck className="w-4 h-4" />
                      Approved User
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Joined{" "}
                      {new Date(
                        user.created_at
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

export default Users;