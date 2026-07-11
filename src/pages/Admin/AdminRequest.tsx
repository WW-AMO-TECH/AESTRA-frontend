import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

const AdminSignup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [role, setRole] = useState<"admin" | "super_admin">("admin");
  const [loading, setLoading] = useState(false);

  const { adminSignup } = useAuth();
  const nav = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await adminSignup(
        name,
        email,
        phone,
        password,
        role
      );

      toast.success("Request sent. Await approval from Super Admin.");
      nav("/admin/login");
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 422) {
        toast.error("Check your input fields");
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
            Request Admin Access
          </h1>

          <p className="text-sm text-muted-foreground mb-6">
            Submit request for admin approval
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* NAME */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                placeholder="John Doe"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.email ? "border-destructive" : "border-input"
                } bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-[11px] text-destructive mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* PHONE */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Phone</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, ""))
                }
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                placeholder="07000000000"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>

              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.password ? "border-destructive" : "border-input"
                  } bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow pr-10`}
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

              {errors.password && (
                <p className="text-[11px] text-destructive mt-1">
                  {errors.password}
                </p>
              )}

              <p className="text-[10px] text-muted-foreground mt-1">
                Must contain letters, a number, and exactly one special character
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary-glow"
            >
              {loading ? "Please wait..." : "Request Access"}
            </button>

          </form>

          <p className="text-sm mt-6 text-center">
            Already approved?{" "}
            <Link to="/admin/login" className="text-primary">
              Sign In
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default AdminSignup;