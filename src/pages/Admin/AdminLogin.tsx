import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { adminLogin } = useAuth();
  const nav = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await adminLogin(email, password);

      if (!user) {
        toast.error("Login failed");
        return;
      }

      toast.success("Logged in successfully.");

      if (user?.role === "admin" || user?.role === "super_admin") {
        nav("/admin/dashboard");
      } else {
        nav("/admin/login");
      }
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 403) {
        toast.error("Not approved yet, wait for approval.");
      } else if (status === 401) {
        toast.error("Invalid credentials");
      } else if (status === 404) {
        toast.error("Admin not found");
      } else {
        toast.error(err?.response?.data?.message || "Something went wrong");
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
            Admin Login
          </h1>

          <p className="text-sm text-muted-foreground mb-6">
            Login as Admin or Super Admin
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Email
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm"
                placeholder="you@example.com"
              />
            </div>

            {/* PASSWORD */}
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
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm pr-10"
                  placeholder="••••••••"
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

          <p className="text-sm mt-6 text-center">
            Need access?{" "}
            <Link to="/admin/signup" className="text-primary">
              Request here
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default AdminLogin;