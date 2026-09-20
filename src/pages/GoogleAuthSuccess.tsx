import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import api from "@/api/axios";
import { Check, ShieldCheck } from "lucide-react";

const GoogleAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();

  useEffect(() => {
    const handleAuth = async () => {
      const token = searchParams.get("token");
      const type = searchParams.get("type");

      if (!token || !type || !["user", "seller"].includes(type)) {
        toast.error("Google authentication failed.");
        navigate("/login", { replace: true });
        return;
      }

      const isSeller = type === "seller";
      const endpoint = isSeller ? "/seller/me" : "/user/me";
      const loginPath = isSeller ? "/seller/login" : "/login";
      const dashboardPath = isSeller ? "/seller/dashboard" : "/";

      try {
        const res = await api.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const user = res.data.user || res.data;

        if (user.role !== type) {
          toast.error(
            isSeller
              ? "This account is not a seller account."
              : "This account is not a customer account."
          );
          navigate(loginPath, { replace: true });
          return;
        }

        setAuthUser(token, user);
        toast.success("Google login successful.");
        navigate(dashboardPath, { replace: true });
      } catch (error: any) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("cart");

        toast.error(
          error?.response?.data?.message ||
            "Unable to complete Google authentication."
        );

        navigate(loginPath, { replace: true });
      }
    };

    handleAuth();
  }, [navigate, searchParams, setAuthUser]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f9f5] px-4 py-8">
      {/* BACKGROUND DECORATION */}
      <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#229653]/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-[#229653]/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-[440px]">
        {/* LOGO */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-11 w-11 items-center justify-center">
              <span className="absolute left-[2px] top-[1px] text-[45px] font-black leading-none tracking-[-0.12em] text-[#229653]">
                A
              </span>
            </div>

            <span className="text-[28px] font-extrabold tracking-[0.04em] text-[#142638]">
              AESTRA
            </span>
          </div>
        </div>

        {/* CARD */}
        <div className="rounded-[20px] border border-[#e5ebe6] bg-white px-6 py-9 shadow-[0_20px_60px_rgba(20,45,30,0.08)] sm:px-10 sm:py-11">
          
          {/* GOOGLE ICON */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#e1e7ec] bg-white shadow-sm">
            <svg
              className="h-8 w-8"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
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
          </div>

          {/* TITLE */}
          <div className="mt-6 text-center">
            <h1 className="text-[25px] font-extrabold tracking-[-0.02em] text-[#142638]">
              Signing you in
            </h1>

            <p className="mx-auto mt-2 max-w-[320px] text-[14px] leading-6 text-[#68798b]">
              We're securely connecting your Google account to AESTRA.
            </p>
          </div>

          {/* PROGRESS */}
          <div className="mt-8">
            <div className="flex items-center">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#229653] text-white">
                <Check className="h-4 w-4" strokeWidth={3} />
              </div>

              <div className="mx-2 h-[2px] flex-1 overflow-hidden rounded-full bg-[#229653]/20">
                <div className="h-full w-[70%] animate-pulse rounded-full bg-[#229653]" />
              </div>

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#229653]/30 bg-white">
                <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#229653]" />
              </div>
            </div>

            <div className="mt-2 flex justify-between text-[11px] font-medium">
              <span className="text-[#229653]">
                Google verified
              </span>
              <span className="text-[#8a98a7]">
                Completing sign in
              </span>
            </div>
          </div>

          {/* SECURITY MESSAGE */}
          <div className="mt-8 flex items-start gap-3 rounded-[11px] border border-[#e5eee8] bg-[#f7faf8] px-4 py-3.5">
            <ShieldCheck className="mt-0.5 h-[19px] w-[19px] shrink-0 text-[#229653]" />

            <div>
              <p className="text-[12px] font-semibold text-[#26394a]">
                Secure authentication
              </p>
              <p className="mt-0.5 text-[11px] leading-5 text-[#738293]">
                Your Google account is being securely authenticated.
              </p>
            </div>
          </div>

          {/* LOADER */}
          <div className="mt-7 flex items-center justify-center gap-2">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#229653] [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#229653] [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#229653]" />
          </div>
        </div>

        {/* FOOTER */}
        <p className="mt-6 text-center text-[11px] text-[#8793a0]">
          © {new Date().getFullYear()} AESTRA. Secure shopping starts here.
        </p>
      </div>
    </main>
  );
};

export default GoogleAuthSuccess;