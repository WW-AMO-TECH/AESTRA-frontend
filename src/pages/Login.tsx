import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ShieldCheck, Truck, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const { login, googleLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = (await login(email, password)) as any;

      if (user && user.role && user.role !== "user") {
        toast.error("This account is not a customer account.");
        return;
      }

      toast.success("Login successful.");
      nav("/");
    } catch (err: any) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message;

      if (status === 401) {
        toast.error(message || "Invalid email or password.");
      } else if (status === 403) {
        toast.error(message || "You are not allowed to access this account.");
      } else {
        toast.error(message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    googleLogin("user");
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#f5f7f2]">
      {/* DESKTOP BACKGROUND */}
      <div
        className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat lg:block"
        style={{ backgroundImage: "url('public/customer-login.png')" }}
      />

      {/* SOFT OVERLAY */}
      <div className="absolute inset-0 hidden bg-white/10 lg:block" />

      <div className="relative z-10 min-h-screen">
        <div className="mx-auto grid min-h-screen w-full max-w-[1536px] grid-cols-1 lg:grid-cols-[1fr_560px]">

          {/* LEFT CONTENT */}
          <section className="hidden min-h-screen px-10 py-12 lg:flex lg:flex-col xl:px-16 2xl:px-20">
            {/* LOGO */}
            <Link to="/" className="flex w-fit items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center">
                <span className="absolute left-[3px] top-[3px] text-[48px] font-black leading-none tracking-[-0.12em] text-[#229653]">
                  A
                </span>
              </div>
              <span className="text-[30px] font-extrabold tracking-[0.04em] text-[#142638]">
                AESTRA
              </span>
            </Link>

            {/* HERO COPY */}
            <div className="mt-9 max-w-[650px]">
              <h2 className="text-[38px] font-extrabold leading-[1.15] tracking-[-0.02em] text-[#142638] xl:text-[42px] 2xl:text-[44px]">
                More Than Just Shopping,
                <br />
                <span className="text-primary">
                  It’s A Better Way to Live.
                </span>
              </h2>

              <p className="mt-4 max-w-[520px] text-[19px] leading-8 text-[#526678]">
                Discover quality products from trusted sellers,
                <br />
                all in one place.
              </p>
            </div>
          </section>

          {/* LOGIN SIDE */}
          <section className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-7 xl:px-8">
            <div className="relative w-full max-w-[552px] rounded-[18px] bg-white px-6 py-7 shadow-[0_12px_50px_rgba(24,45,35,0.08)] sm:px-9 sm:py-8 lg:px-16 lg:py-9">

              {/* TOP SIGN UP */}
              <div className="flex justify-end">
                <p className="text-[13px] text-[#526274]">
                  Don’t have an account?{" "}
                  <Link
                    to="/signup"
                    className="ml-1 font-semibold text-primary transition hover:text-[#116b38]"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>

              {/* HEADER */}
              <div className="mt-10">
                <h1 className="text-[31px] font-extrabold tracking-[-0.025em] text-[#142638] sm:text-[34px]">
                  Welcome Back
                </h1>

                <p className="mt-2 text-[15px] text-[#607084]">
                  Log in to your AESTRA account.
                </p>
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="mt-10 space-y-5">

                {/* EMAIL / PHONE */}
                <div>
                  <label className="mb-2.5 block text-[14px] font-semibold text-[#172839]">
                    Email Address or Phone Number{" "}
                    <span className="text-[#e53935]">*</span>
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-[20px] w-[20px] -translate-y-1/2 text-[#647589]" />

                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email or phone number"
                      autoComplete="username"
                      className="h-[51px] w-full rounded-[10px] border border-[#d7dfe7] bg-white pl-12 pr-4 text-[14px] text-[#172839] outline-none transition placeholder:text-[#8997a8] focus:border-primary focus:ring-2 focus:ring-[#229653]/10"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="mb-2.5 block text-[14px] font-semibold text-[#172839]">
                    Password <span className="text-[#e53935]">*</span>
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-[20px] w-[20px] -translate-y-1/2 text-[#647589]" />

                    <input
                      type={showPw ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="h-[51px] w-full rounded-[10px] border border-[#d7dfe7] bg-white pl-12 pr-12 text-[14px] text-[#172839] outline-none transition placeholder:text-[#8997a8] focus:border-[#229653] focus:ring-2 focus:ring-[#229653]/10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-[#647589] transition hover:text-primary"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? (
                        <EyeOff className="h-[19px] w-[19px]" />
                      ) : (
                        <Eye className="h-[19px] w-[19px]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* REMEMBER / FORGOT */}
                <div className="flex items-center justify-between gap-3 pt-0.5">
                  <label className="flex cursor-pointer items-center gap-2 text-[13px] text-[#596a7d]">
                    <input
                      type="checkbox"
                      className="h-[21px] w-[21px] cursor-pointer rounded-[4px] border-[#ccd5dd] accent-[#229653]"
                    />
                    Remember me
                  </label>

                  <button
                    type="button"
                    className="text-[13px] font-semibold text-[#188b4a] transition hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* LOGIN BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#229653] text-[15px] font-bold text-white shadow-[0_5px_14px_rgba(34,150,83,0.18)] transition hover:bg-[#1d864a] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Please wait..." : "Log In"}
                  {!loading && <ArrowRight className="h-[19px] w-[19px]" />}
                </button>
              </form>

              {/* OR */}
              <div className="my-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#dce2e8]" />
                <span className="px-1 text-[13px] text-[#66778a]">or</span>
                <div className="h-px flex-1 bg-[#dce2e8]" />
              </div>

              {/* GOOGLE */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex h-[52px] w-full items-center justify-center gap-4 rounded-[10px] border border-[#d7dfe7] bg-white text-[13px] font-medium text-[#172839] transition hover:bg-[#f8faf9] active:scale-[0.99]"
              >
                <svg className="h-[21px] w-[21px]" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M21.35 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.23a4.47 4.47 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.92-4.18 2.92-7.22Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 21.6c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.29v2.53A9.74 9.74 0 0 0 12 21.6Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M6.54 13.68A5.85 5.85 0 0 1 6.23 12c0-.58.11-1.15.31-1.68V7.79H3.29A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.05 1.04 4.21l3.25-2.53Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 6.29c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.37 14.63 2.4 12 2.4a9.74 9.74 0 0 0-8.71 5.39l3.25 2.53C7.31 8.01 9.46 6.29 12 6.29Z"
                  />
                </svg>
                Continue with Google
              </button>

              {/* APPLE */}
              <button
                type="button"
                className="mt-3 flex h-[52px] w-full items-center justify-center gap-4 rounded-[10px] border border-[#d7dfe7] bg-white text-[13px] font-medium text-[#172839] transition hover:bg-[#f8faf9] active:scale-[0.99]"
              >
                <svg className="h-[21px] w-[21px] fill-black" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.31-1.34-3.14-2.58-1.71-2.53-3.02-7.15-1.26-10.28.87-1.55 2.43-2.52 4.12-2.55 1.28-.02 2.49.87 3.26.87.77 0 2.22-1.08 3.75-.92.64.03 2.44.26 3.6 1.97-.09.06-2.15 1.25-2.13 3.73.03 2.96 2.6 3.95 2.63 3.96-.02.07-.41 1.4-1.22 2.77ZM15.53 3.75c.68-.83 1.14-2 1.01-3.16-.98.04-2.16.65-2.86 1.48-.62.72-1.16 1.89-1.02 3.02 1.09.08 2.19-.56 2.87-1.34Z" />
                </svg>
                Continue with Apple
              </button>

              {/* BOTTOM SIGNUP */}
              <div className="mt-8 text-center text-[13px] text-[#657487]">
                Don’t have an account?{" "}
                <Link
                  to="/signup"
                  className="ml-1 font-semibold text-[#188b4a] transition hover:underline"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Login;