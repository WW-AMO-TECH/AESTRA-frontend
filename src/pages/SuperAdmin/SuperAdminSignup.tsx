import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

const SuperAdminSignup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const { superAdminSignup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await superAdminSignup(name, email, password);

      toast.success("Super Admin account created successfully.");
      navigate("/seller/login");
    } catch (err: any) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message;

      if (status === 422) {
        const errors = err?.response?.data?.errors;

        if (errors) {
          const firstError = Object.values(errors)[0];
          toast.error(
            Array.isArray(firstError)
              ? firstError[0]
              : "Please check your information."
          );
        } else {
          toast.error(message || "Invalid information.");
        }
      } else if (status === 403) {
        toast.error(message || "You are not authorized to create a Super Admin.");
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
            Create Super Admin
          </h1>

          <p className="text-sm text-muted-foreground mb-6">
            Create a Super Admin account to manage the platform.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Full Name
              </label>

              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm"
              />
            </div>

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

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPw ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showConfirmPw ? (
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
              {loading ? "Creating..." : "Create Super Admin"}
            </button>
          </form>

          <p className="text-sm mt-6 text-center">
            Already have an account?{" "}
            <Link to="/superadmin/login" className="text-primary">
              Super Admin Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSignup;