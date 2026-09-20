import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

const SuperAdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const { superAdminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await superAdminLogin(email, password);

      if (user.role !== "super_admin") {
        toast.error("Access denied.");
        return;
      }

      toast.success("Super Admin login successful.");
      navigate("/superadmin/dashboard");
    } catch (err: any) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message;

      if (status === 401) {
        toast.error(message || "Invalid email or password.");
      } else if (status === 403) {
        toast.error(message || "Access denied.");
      } else {
        toast.error(message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="w-full max-w-md glass-card p-8 animate-fade-in">
          <h1 className="text-2xl font-bold mb-2">
            Super Admin Login
          </h1>

          <p className="text-sm text-muted-foreground mb-6">
            Sign in to access the Super Admin dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Email
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary-glow"
            >
              {loading ? "Please wait..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;