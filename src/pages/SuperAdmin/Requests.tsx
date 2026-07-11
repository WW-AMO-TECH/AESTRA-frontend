import { useEffect, useState } from "react";
import axios from "axios";
import {
  ShieldAlert,
  Mail,
  Calendar,
  Check,
  X,
} from "lucide-react";

import Sidebar from "@/components/Admin/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface AdminRequest {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

const Requests = () => {
  const { user } = useAuth();

  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // GET TOKEN
  const token = localStorage.getItem("token");

  // AXIOS CONFIG
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // FETCH REQUESTS
  const fetchRequests = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://127.0.0.1:8000/api/superadmin/admin-requests",
        config
      );

      setRequests(res.data);
    } catch (error: any) {
      console.error(error);

      if (error.response?.status === 401) {
        toast.error("Unauthorized");
      } else {
        toast.error("Failed to fetch admin requests");
      }
    } finally {
      setLoading(false);
    }
  };

  // APPROVE ADMIN
  const approveAdmin = async (id: number) => {
    try {
      setProcessingId(id);

      await axios.post(
        `http://127.0.0.1:8000/api/superadmin/admin-request/${id}/approve`,
        {},
        config
      );

      toast.success("Admin approved successfully");

      // REMOVE APPROVED ADMIN FROM UI
      setRequests((prev) =>
        prev.filter((request) => request.id !== id)
      );
    } catch (error: any) {
      console.error(error);

      if (error.response?.status === 401) {
        toast.error("Unauthorized");
      } else {
        toast.error("Failed to approve admin");
      }
    } finally {
      setProcessingId(null);
    }
  };

  // DELETE REQUEST
  const deleteRequest = async (id: number) => {
    try {
      setProcessingId(id);

      await axios.delete(
        `http://127.0.0.1:8000/api/superadmin/admin-request/${id}`,
        config
      );

      toast.success("Request deleted");

      // REMOVE DELETED REQUEST FROM UI
      setRequests((prev) =>
        prev.filter((request) => request.id !== id)
      );
    } catch (error: any) {
      console.error(error);

      if (error.response?.status === 401) {
        toast.error("Unauthorized");
      } else {
        toast.error("Failed to delete request");
      }
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar user={user} />

      <main className="flex-1 pt-20 lg:pt-0 p-6">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Admin Requests
          </h1>

          <p className="text-gray-500 mt-1">
            Review and manage pending admin signup requests
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-gray-500">
            Loading requests...
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && requests.length === 0 && (
          <div className="bg-white rounded-2xl p-10 shadow-sm text-center">
            <h2 className="text-2xl font-semibold mb-2">
              No Pending Requests
            </h2>

            <p className="text-gray-500">
              All admin requests have been reviewed.
            </p>
          </div>
        )}

        {/* REQUESTS */}
        {!loading && requests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-2xl shadow-sm border p-6"
              >
                {/* TOP */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full bg-orange-500 text-white flex items-center justify-center text-xl font-bold">
                    {request.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h2 className="font-semibold text-lg">
                      {request.name}
                    </h2>

                    <div className="flex items-center gap-1 text-sm text-orange-600">
                      <ShieldAlert className="w-4 h-4" />
                      Pending Approval
                    </div>
                  </div>
                </div>

                {/* DETAILS */}
                <div className="space-y-3 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{request.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />

                    <span>
                      Requested{" "}
                      {new Date(
                        request.created_at
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-3">
                  {/* APPROVE */}
                  <button
                    onClick={() => approveAdmin(request.id)}
                    disabled={processingId === request.id}
                    className="
                      flex-1 flex items-center justify-center gap-2
                      bg-green-600 hover:bg-green-700
                      text-white px-4 py-3 rounded-xl transition
                      disabled:opacity-50
                    "
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() => deleteRequest(request.id)}
                    disabled={processingId === request.id}
                    className="
                      flex-1 flex items-center justify-center gap-2
                      bg-red-600 hover:bg-red-700
                      text-white px-4 py-3 rounded-xl transition
                      disabled:opacity-50
                    "
                  >
                    <X className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Requests;