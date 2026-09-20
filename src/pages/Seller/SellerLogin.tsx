import { useEffect,useState } from "react";
import { Link,useNavigate,useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Eye,EyeOff,Mail,Lock,Store,ArrowRight } from "lucide-react";

const SellerLogin=()=>{
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [loading,setLoading]=useState(false);
  const [showPw,setShowPw]=useState(false);
  const [searchParams]=useSearchParams();
  const { sellerLogin,googleLogin }=useAuth();
  const navigate=useNavigate();

  useEffect(()=>{
    const error=searchParams.get("error");
    if(error){
      toast.error(error);
      window.history.replaceState({},document.title,"/seller/login");
    }
  },[searchParams]);

  const handleSubmit=async(e:React.FormEvent)=>{
    e.preventDefault();
    setLoading(true);

    try{
      const user=await sellerLogin(email,password);

      if(user.role!=="seller"){
        toast.error("This account is not a seller account.");
        return;
      }

      toast.success("Seller login successful.");
      navigate("/seller/dashboard");
    }catch(err:any){
      const status=err?.response?.status;
      const message=err?.response?.data?.message;

      if(status===401){
        toast.error(message||"Invalid email or password.");
      }else if(status===403){
        toast.error(message||"You are not allowed to access the seller account.");
      }else{
        toast.error(message||"Something went wrong.");
      }
    }finally{
      setLoading(false);
    }
  };

  return(
    <main className="relative min-h-[100dvh] w-full overflow-hidden bg-[#f5f8f5] bg-cover bg-center bg-no-repeat lg:bg-[url('/seller-login.png')]">
      <div className="absolute inset-0 bg-white/10"/>

      <div className="relative z-10 min-h-[100dvh]">
        <div className="mx-auto grid min-h-[100dvh] w-full max-w-[1536px] grid-cols-1 lg:grid-cols-[1fr_560px]">

          {/* LEFT CONTENT */}
          <section className="hidden min-h-[100dvh] px-10 py-[clamp(24px,5vh,48px)] lg:flex lg:flex-col xl:px-16 2xl:px-20">
            
          </section>

          {/* LOGIN SIDE */}
          <section className="flex min-h-[100dvh] items-center justify-center px-4 py-[clamp(12px,2vh,24px)] sm:px-6 lg:px-7 xl:px-8">
            <div className="relative w-full max-w-[552px] rounded-[18px] bg-white px-6 py-[clamp(18px,3vh,36px)] shadow-[0_12px_50px_rgba(24,45,35,0.08)] sm:px-9 lg:px-14">

              {/* SIGNUP */}
              <div className="flex justify-end">
                <p className="text-[clamp(11px,1vw,13px)] text-[#526274]">
                  New to AESTRA?
                  <Link
                    to="/seller/signup"
                    className="ml-1 font-semibold text-primary transition hover:text-primary/90 hover:underline"
                  >
                    Become a Seller
                  </Link>
                </p>
              </div>

              {/* HEADER */}
              <div className="mt-[clamp(18px,3vh,38px)]">
                <div className="mb-[clamp(6px,1vh,12px)] flex items-center gap-2">
                  <Store className="h-[18px] w-[18px] text-primary"/>
                  <span className="text-[clamp(10px,1vw,12px)] font-bold uppercase tracking-[0.13em] text-primary">
                    SELL ON AESTRA
                  </span>
                </div>

                <h1 className="text-[clamp(27px,2.3vw,34px)] font-extrabold tracking-[-0.025em] text-[#142638]">
                  Welcome Back
                </h1>

                <p className="mt-1.5 text-[clamp(12px,1.1vw,15px)] text-[#607084]">
                  Log in to your AESTRA seller account.
                </p>
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="mt-[clamp(18px,3vh,36px)] space-y-[clamp(12px,2vh,20px)]">

                {/* EMAIL */}
                <div>
                  <label className="mb-2 block text-[clamp(12px,1vw,14px)] font-semibold text-[#172839]">
                    Email Address <span className="text-[#e53935]">*</span>
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-[19px] w-[19px] -translate-y-1/2 text-[#647589]"/>

                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e=>setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      autoComplete="email"
                      className="h-[clamp(44px,6vh,51px)] w-full rounded-[10px] border border-[#d7dfe7] bg-white pl-12 pr-4 text-[14px] text-[#172839] outline-none transition placeholder:text-[#8997a8] focus:border-[#229653] focus:ring-2 focus:ring-[#229653]/10"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="mb-2 block text-[clamp(12px,1vw,14px)] font-semibold text-[#172839]">
                    Password <span className="text-[#e53935]">*</span>
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-[19px] w-[19px] -translate-y-1/2 text-[#647589]"/>

                    <input
                      type={showPw?"text":"password"}
                      required
                      value={password}
                      onChange={e=>setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="h-[clamp(44px,6vh,51px)] w-full rounded-[10px] border border-[#d7dfe7] bg-white pl-12 pr-12 text-[14px] text-[#172839] outline-none transition placeholder:text-[#8997a8] focus:border-[#229653] focus:ring-2 focus:ring-[#229653]/10"
                    />

                    <button
                      type="button"
                      onClick={()=>setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-[#647589] transition hover:text-[#229653]"
                      aria-label={showPw?"Hide password":"Show password"}
                    >
                      {showPw?<EyeOff className="h-[18px] w-[18px]"/>:<Eye className="h-[18px] w-[18px]"/>}
                    </button>
                  </div>
                </div>

                {/* OPTIONS */}
                <div className="flex items-center justify-between gap-3">
                  <label className="flex cursor-pointer items-center gap-2 text-[clamp(11px,1vw,13px)] text-[#596a7d]">
                    <input
                      type="checkbox"
                      className="h-[19px] w-[19px] cursor-pointer rounded-[4px] border-[#ccd5dd] accent-primary transition focus:ring-0"
                    />
                    Remember me
                  </label>

                  <button
                    type="button"
                    className="text-[clamp(11px,1vw,13px)] font-semibold text-primary transition hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* LOGIN */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-[clamp(45px,6vh,52px)] w-full items-center justify-center gap-2 rounded-[10px] bg-primary text-[clamp(13px,1.1vw,15px)] font-bold text-white shadow-[0_5px_14px_rgba(34,150,83,0.18)] transition hover:bg-primary/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading?"Please wait...":"Login"}
                  {!loading&&<ArrowRight className="h-[18px] w-[18px]"/>}
                </button>
              </form>

              {/* DIVIDER */}
              <div className="my-[clamp(14px,2.5vh,28px)] flex items-center gap-3">
                <div className="h-px flex-1 bg-[#dce2e8]"/>
                <span className="px-1 text-[12px] text-[#66778a]">or</span>
                <div className="h-px flex-1 bg-[#dce2e8]"/>
              </div>

              {/* GOOGLE */}
              <button
                type="button"
                onClick={()=>googleLogin("seller")}
                className="flex h-[clamp(45px,6vh,52px)] w-full items-center justify-center gap-4 rounded-[10px] border border-[#d7dfe7] bg-white text-[clamp(12px,1vw,13px)] font-medium text-[#172839] transition hover:bg-[#f8faf9] active:scale-[0.99]"
              >
                <svg className="h-[20px] w-[20px]" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M21.35 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.23a4.47 4.47 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.92-4.18 2.92-7.22Z"/>
                  <path fill="#34A853" d="M12 21.6c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.29v2.53A9.74 9.74 0 0 0 12 21.6Z"/>
                  <path fill="#FBBC05" d="M6.54 13.68A5.85 5.85 0 0 1 6.23 12c0-.58.11-1.15.31-1.68V7.79H3.29A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.05 1.04 4.21l3.25-2.53Z"/>
                  <path fill="#EA4335" d="M12 6.29c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.37 14.63 2.4 12 2.4a9.74 9.74 0 0 0-8.71 5.39l3.25 2.53C7.31 8.01 9.46 6.29 12 6.29Z"/>
                </svg>
                Continue with Google
              </button>

              {/* CUSTOMER LOGIN */}
              <div className="mt-[clamp(14px,2.5vh,28px)] text-center text-[clamp(11px,1vw,13px)] text-[#657487]">
                Are you a customer?
                <Link
                  to="/login"
                  className="ml-1 font-semibold text-primary transition hover:underline"
                >
                  Customer Login
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default SellerLogin;