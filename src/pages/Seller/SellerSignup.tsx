import { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Eye,EyeOff,User,Store,Mail,Phone,MapPin,Building2,MessageSquare,ShieldCheck,Users,TrendingUp, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const SellerSignup=()=>{
  const [form,setForm]=useState({
    name:"",
    store_name:"",
    email:"",
    phone:"",
    password:"",
    address:"",
    business_address:"",
    contact_information:"",
  });
  const [showPw,setShowPw]=useState(false);
  const [loading,setLoading]=useState(false);
  const {sellerSignup,googleLogin}=useAuth();
  const nav=useNavigate();

  const update=(key:keyof typeof form,value:string)=>{
    setForm(prev=>({...prev,[key]:value}));
  };

  const submit=async(e:React.FormEvent)=>{
    e.preventDefault();
    setLoading(true);

    try{
      await sellerSignup(form);
      toast.success("Seller request submitted successfully.");
      nav("/seller/login");
    }catch(err:any){
      toast.error(
        err?.response?.data?.message||
        "Unable to submit seller request."
      );
    }finally{
      setLoading(false);
    }
  };

  const inputClass="h-12 w-full rounded-xl border border-input bg-background pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";
  const textareaClass="min-h-[100px] w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";

  return(
    <div className="min-h-screen bg-muted/30">
      <Navbar/>

      <div className="px-3 py-5 sm:px-5 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-[1480px] overflow-hidden rounded-2xl bg-background shadow-sm ring-1 ring-border/50">
          <div className="grid lg:grid-cols-2">

            {/* LEFT PROMOTIONAL PANEL */}
            <section className="relative hidden min-h-[780px] overflow-hidden bg-primary/10 lg:block">
              <img
                src="/images/seller-login.jpg"
                alt="Sell on AESTRA"
                className="absolute inset-0 h-[480px] w-full object-cover"
              />

              <div className="absolute inset-x-0 top-0 h-[480px] bg-gradient-to-t from-primary/10 via-transparent to-transparent"/>

              <div className="absolute bottom-0 left-0 right-0 bg-primary/10 px-8 pb-9 pt-8 xl:px-10">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                  JOIN AESTRA
                </p>

                <h2 className="max-w-lg text-3xl font-extrabold leading-tight text-foreground xl:text-[38px]">
                  Start selling.
                  <br/>
                  <span className="text-primary">Grow your business.</span>
                </h2>

                <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                  Create your seller account and connect your products with
                  thousands of customers shopping on AESTRA.
                </p>

                <div className="mt-7 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Store className="h-4 w-4"/>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Create Your Store</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        Build your online presence
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Users className="h-4 w-4"/>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Reach More Buyers</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        Connect with AESTRA customers
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <TrendingUp className="h-4 w-4"/>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Grow With Us</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        Manage and grow your business
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SIGNUP FORM */}
            <section className="flex justify-center px-5 py-8 sm:px-8 sm:py-10 lg:px-10 xl:px-14">
              <div className="w-full max-w-[570px]">

                <div className="mb-6">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                    BECOME A SELLER
                  </p>

                  <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-[34px]">
                    Create Your Store
                  </h1>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Submit your details to start selling on AESTRA.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={()=>googleLogin("seller")}
                  className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-input bg-background text-sm font-semibold text-foreground transition hover:bg-muted active:scale-[.99]"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M21.35 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.23a4.47 4.47 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.92-4.18 2.92-7.22Z"/>
                    <path fill="#34A853" d="M12 21.6c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.29v2.53A9.74 9.74 0 0 0 12 21.6Z"/>
                    <path fill="#FBBC05" d="M6.54 13.68A5.85 5.85 0 0 1 6.23 12c0-.58.11-1.15.31-1.68V7.79H3.29A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.05 1.04 4.21l3.25-2.53Z"/>
                    <path fill="#EA4335" d="M12 6.29c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.37 14.63 2.4 12 2.4a9.74 9.74 0 0 0-8.71 5.39l3.25 2.53C7.31 8.01 9.46 6.29 12 6.29Z"/>
                  </svg>
                  Continue with Google
                </button>

                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border"/>
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="h-px flex-1 bg-border"/>
                </div>

                <form onSubmit={submit} className="space-y-4">

                  {/* BASIC INFORMATION */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-bold text-foreground">
                        Full Name <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-muted-foreground"/>
                        <input
                          required
                          value={form.name}
                          onChange={e=>update("name",e.target.value)}
                          placeholder="Enter your full name"
                          autoComplete="name"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold text-foreground">
                        Store Name <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <Store className="absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-muted-foreground"/>
                        <input
                          required
                          value={form.store_name}
                          onChange={e=>update("store_name",e.target.value)}
                          placeholder="Enter your store name"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold text-foreground">
                        Email Address <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-muted-foreground"/>
                        <input
                          required
                          type="email"
                          value={form.email}
                          onChange={e=>update("email",e.target.value)}
                          placeholder="Enter your email"
                          autoComplete="email"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold text-foreground">
                        Phone Number <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-muted-foreground"/>
                        <input
                          required
                          type="tel"
                          value={form.phone}
                          onChange={e=>update("phone",e.target.value)}
                          placeholder="Enter your phone number"
                          autoComplete="tel"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label className="mb-2 block text-xs font-bold text-foreground">
                      Password <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <LockIcon/>
                      <input
                        required
                        type={showPw?"text":"password"}
                        value={form.password}
                        onChange={e=>update("password",e.target.value)}
                        placeholder="Create a password"
                        autoComplete="new-password"
                        className="h-12 w-full rounded-xl border border-input bg-background pl-11 pr-11 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                      <button
                        type="button"
                        onClick={()=>setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground transition hover:text-primary"
                        aria-label={showPw?"Hide password":"Show password"}
                      >
                        {showPw?<EyeOff className="h-[17px] w-[17px]"/>:<Eye className="h-[17px] w-[17px]"/>}
                      </button>
                    </div>
                  </div>

                  {/* ADDRESSES */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-bold text-foreground">
                        Your Address <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-4 h-[17px] w-[17px] text-muted-foreground"/>
                        <textarea
                          required
                          value={form.address}
                          onChange={e=>update("address",e.target.value)}
                          placeholder="Enter your address"
                          className={`${textareaClass} pl-11`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold text-foreground">
                        Business Address <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-4 h-[17px] w-[17px] text-muted-foreground"/>
                        <textarea
                          required
                          value={form.business_address}
                          onChange={e=>update("business_address",e.target.value)}
                          placeholder="Enter your business address"
                          className={`${textareaClass} pl-11`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* CONTACT INFORMATION */}
                  <div>
                    <label className="mb-2 block text-xs font-bold text-foreground">
                      Contact Information <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-4 h-[17px] w-[17px] text-muted-foreground"/>
                      <textarea
                        required
                        value={form.contact_information}
                        onChange={e=>update("contact_information",e.target.value)}
                        placeholder="Add additional contact information"
                        className={`${textareaClass} pl-11`}
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-1 text-xs text-muted-foreground">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary"/>
                    <p>
                      Your seller request will be reviewed before your store
                      can start selling on AESTRA.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading?"Submitting...":"Submit Seller Request"}
                    {!loading&&<span className="text-lg">→</span>}
                  </button>
                </form>

                <p className="mt-6 text-center text-xs text-muted-foreground">
                  Already a seller?{" "}
                  <Link
                    to="/seller/login"
                    className="font-semibold text-primary hover:underline"
                  >
                    Sign in
                  </Link>
                </p>

              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

const LockIcon=()=>{
  return(
    <Lock
      className="absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-muted-foreground"
    />
  );
};

export default SellerSignup;