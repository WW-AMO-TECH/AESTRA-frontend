import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const nav = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password);

      toast.success("Login successful");

      nav("/"); // redirect home
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Login failed"
      );
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f4f7ff] overflow-hidden md:overflow-y-auto">

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Soft gradients */}
        <div className="absolute -top-40 -left-32 w-[500px] h-[500px] bg-primary/30 blur-3xl rounded-full" />
        <div className="absolute bottom-[-120px] right-[-100px] w-[450px] h-[450px] bg-primary/20 blur-3xl rounded-full" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #0f172a 1px, transparent 1px),
              linear-gradient(to bottom, #0f172a 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Floating circles */}
        <div className="absolute top-20 right-20 w-24 h-24 border border-cyan-300 rounded-full animate-pulse" />
        <div className="absolute bottom-24 left-16 w-16 h-16 border border-blue-300 rounded-full animate-pulse" />
      </div>

      {/* Main */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-6 md:py-12">
        <div className="w-full max-w-md">
            {/* BACK */}
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary font-semibold mb-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Go Back
            </button>
          {/* Glow */}
          <div className="relative">
            <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 opacity-40 blur-sm" />

            {/* Card */}
            <div className="relative bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 md:p-7 shadow-2xl">
              {/* Header */}
              <div className="text-center mb-7">
                <h1 className="text-2xl font-bold text-slate-900">
                  Welcome Back
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Sign in to your account
                </p>
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* EMAIL */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Email
                  </label>

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="
                      w-full px-4 py-3 rounded-2xl
                      bg-white border border-slate-200
                      text-slate-900 text-sm
                      outline-none transition-all duration-300
                      focus:border-cyan-400
                      focus:ring-4 focus:ring-cyan-100
                    "
                  />
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="
                        w-full px-4 py-3 rounded-2xl
                        bg-white border border-slate-200
                        text-slate-900 text-sm
                        outline-none transition-all duration-300
                        focus:border-cyan-400
                        focus:ring-4 focus:ring-cyan-100
                        pr-12
                      "
                    />

                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="
                        absolute right-4 top-1/2 -translate-y-1/2
                        text-slate-400 hover:text-cyan-500
                        transition
                      "
                    >
                      {showPw ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot */}
                <div className="flex justify-end -mt-1">
                  <button
                    type="button"
                    className="text-sm text-cyan-600 hover:text-cyan-500 transition"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Button */}
                <button
                  type="submit"
                  className="
                    w-full py-3 rounded-2xl
                    bg-gradient-to-r from-cyan-500 to-blue-600
                    hover:from-cyan-400 hover:to-blue-500
                    text-white font-semibold text-sm
                    transition-all duration-300
                    shadow-lg shadow-cyan-200
                    hover:scale-[1.01]
                    active:scale-[0.99]
                  "
                >
                  Sign In
                </button>
              </form>

              {/* Footer */}
              <p className="text-sm text-slate-500 mt-5 text-center">
                Don&apos;t have an account?{" "}
                <Link
                  to="/signup"
                  className="text-cyan-600 font-medium hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;