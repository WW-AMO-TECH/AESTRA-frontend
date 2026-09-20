import { useState } from "react";
import { Link,useLocation,useNavigate } from "react-router-dom";
import {
  ShoppingCart,User,Menu,Search,LogOut,ChevronRight,Store,
  ArrowRight,LayoutDashboard,Headset,Home,Package,Newspaper,
  Phone,Heart,X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Sheet,SheetContent,SheetHeader,SheetTitle,SheetTrigger } from "@/components/ui/sheet";

const Navbar=()=>{
  const {user,loading,logout}=useAuth();
  const location=useLocation();
  const navigate=useNavigate();
  const [sheetOpen,setSheetOpen]=useState(false);
  const [search,setSearch]=useState("");

  const isSeller=user?.role==="seller";
  const isSuperAdmin=user?.role==="super_admin";
  const isStaff=isSeller||isSuperAdmin;
  const cartCount=0;

  const navLinks=[
    {to:"/",label:"Home",icon:Home},
    {to:"/products",label:"Products",icon:Package},
    {to:"/blog",label:"Blog",icon:Newspaper},
    {to:"/contact",label:"Contact",icon:Phone},
  ];

  const dashboardPath=isSeller
    ?"/seller/dashboard"
    :isSuperAdmin
    ?"/superadmin/dashboard"
    :"/dashboard";

  const handleSearch=(e:React.FormEvent)=>{
    e.preventDefault();
    const query=search.trim();
    navigate(query?`/products?search=${encodeURIComponent(query)}`:"/products");
  };

  const handleLogout=async()=>{
    await logout();
    navigate("/");
    setSheetOpen(false);
  };

  if(loading)return null;

  return(
    <nav className="sticky top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1480px] items-center gap-4 px-4 sm:px-6 lg:px-8">

        {/* LOGO */}
        <Link to="/" className="shrink-0">
          <img
            src="/AESTRA LOGO-navbar.png"
            alt="AESTRA"
            className="h-7 w-auto object-contain sm:h-8"
          />
        </Link>

        {/* DESKTOP NAVIGATION */}
        <div className="ml-5 hidden items-center gap-1 md:flex">
          {navLinks.map(({to,label})=>(
            <Link
              key={to}
              to={to}
              className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                location.pathname===to
                  ?"text-primary"
                  :"text-muted-foreground hover:bg-primary/5 hover:text-primary"
              }`}
            >
              {label}
              {location.pathname===to&&(
                <span className="absolute bottom-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-primary"/>
              )}
            </Link>
          ))}
        </div>

        {/* DESKTOP RIGHT */}
        <div className="ml-auto hidden items-center gap-2 md:flex">

          {/* SEARCH */}
          <form onSubmit={handleSearch} className="hidden lg:block">
            <div className="flex h-10 w-[250px] items-center rounded-xl border border-border bg-muted/30 transition-all focus-within:border-primary focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/10 xl:w-[310px]">
              <Search className="ml-3 h-4 w-4 shrink-0 text-muted-foreground"/>

              <input
                type="text"
                value={search}
                onChange={e=>setSearch(e.target.value)}
                placeholder="Search products..."
                className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
              />

              {search&&(
                <button
                  type="button"
                  onClick={()=>setSearch("")}
                  className="mr-2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5"/>
                </button>
              )}
            </div>
          </form>

          {/* MOBILE-SIZED SEARCH BUTTON ON TABLET */}
          <button
            onClick={()=>navigate("/products")}
            className="hidden rounded-xl p-2.5 text-muted-foreground transition hover:bg-primary/10 hover:text-primary md:max-lg:flex"
            aria-label="Search"
          >
            <Search className="h-5 w-5"/>
          </button>

          {/* CART */}
          <Link
            to="/cart"
            className="relative rounded-xl p-2.5 text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5"/>
            {cartCount>0&&(
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {cartCount>99?"99+":cartCount}
              </span>
            )}
          </Link>

          {/* USER */}
          {user?(
            <>
              <Link
                to={dashboardPath}
                className="flex items-center gap-2 rounded-xl px-2.5 py-2 transition hover:bg-primary/10"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {(user.name||user.email||"U").charAt(0).toUpperCase()}
                </div>
                <div className="hidden xl:block max-w-[100px]">
                  <p className="truncate text-xs font-semibold text-foreground">
                    {user.name||"Account"}
                  </p>
                  <p className="text-[10px] capitalize text-muted-foreground">
                    {user.role==="super_admin"?"Super Admin":user.role}
                  </p>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-xl p-2.5 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-500"
                aria-label="Logout"
              >
                <LogOut className="h-4.5 w-4.5"/>
              </button>
            </>
          ):(
            <Link
              to="/login"
              className="flex h-10 items-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/15 transition hover:bg-primary/90 hover:shadow-lg"
            >
              Login
            </Link>
          )}
        </div>

        {/* MOBILE MENU */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button
              className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5"/>
            </button>
          </SheetTrigger>

          <SheetContent
            side="right"
            className="w-[88%] max-w-[390px] overflow-y-auto border-l border-border bg-background p-0"
          >
            {/* MOBILE HEADER */}
            <SheetHeader className="border-b border-border px-5 py-5">
              <SheetTitle className="flex items-center">
                <img
                  src="/AESTRA LOGO-navbar.png"
                  alt="AESTRA"
                  className="h-7 w-auto object-contain"
                />
              </SheetTitle>
            </SheetHeader>

            <div className="px-4 py-5">

              {/* MOBILE SEARCH */}
              <form onSubmit={handleSearch} className="mb-5">
                <div className="flex h-11 items-center rounded-xl border border-border bg-muted/30 focus-within:border-primary focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/10">
                  <Search className="ml-3.5 h-4 w-4 text-muted-foreground"/>
                  <input
                    value={search}
                    onChange={e=>setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
                  />
                  <button
                    type="submit"
                    className="mr-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
                  >
                    <ArrowRight className="h-4 w-4"/>
                  </button>
                </div>
              </form>

              {/* USER CARD */}
              {user?(
                <Link
                  to={dashboardPath}
                  onClick={()=>setSheetOpen(false)}
                  className="mb-5 flex items-center gap-3 rounded-2xl border border-primary/10 bg-primary/5 p-3.5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {(user.name||user.email||"U").charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-muted-foreground">
                      Welcome back
                    </p>
                    <p className="truncate text-sm font-bold">
                      {user.name||user.email}
                    </p>
                    <p className="mt-0.5 text-[10px] capitalize text-primary">
                      {user.role==="super_admin"?"Super Admin":user.role}
                    </p>
                  </div>

                  <ChevronRight className="h-4 w-4 text-muted-foreground"/>
                </Link>
              ):(
                <div className="mb-5 rounded-2xl border border-primary/10 bg-primary/5 p-4">
                  <p className="text-sm font-bold">Welcome to AESTRA</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Discover quality products from trusted sellers.
                  </p>
                </div>
              )}

              {/* NAVIGATION */}
              <div>
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Navigation
                </p>

                <div className="space-y-1">
                  {navLinks.map(({to,label,icon:Icon})=>{
                    const active=location.pathname===to;

                    return(
                      <Link
                        key={to}
                        to={to}
                        onClick={()=>setSheetOpen(false)}
                        className={`group flex items-center justify-between rounded-xl px-3 py-2.5 transition ${
                          active
                            ?"bg-primary/10 text-primary"
                            :"text-foreground hover:bg-muted"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                            active
                              ?"bg-primary/10 text-primary"
                              :"bg-muted text-muted-foreground group-hover:text-primary"
                          }`}>
                            <Icon className="h-[17px] w-[17px]"/>
                          </span>
                          <span className="text-sm font-medium">{label}</span>
                        </span>

                        <ChevronRight className="h-4 w-4 text-muted-foreground"/>
                      </Link>
                    );
                  })}

                  {/* CART */}
                  <Link
                    to="/cart"
                    onClick={()=>setSheetOpen(false)}
                    className="group flex items-center justify-between rounded-xl px-3 py-2.5 transition hover:bg-muted"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:text-primary">
                        <ShoppingCart className="h-[17px] w-[17px]"/>
                      </span>
                      <span className="text-sm font-medium">Cart</span>
                    </span>

                    {cartCount>0?(
                      <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                        {cartCount>99?"99+":cartCount}
                      </span>
                    ):(
                      <ChevronRight className="h-4 w-4 text-muted-foreground"/>
                    )}
                  </Link>
                </div>
              </div>

              {/* SELLER CTA */}
              {!isStaff&&(
                <Link
                  to="/seller/signup"
                  onClick={()=>setSheetOpen(false)}
                  className="group relative mt-6 flex items-center justify-between overflow-hidden rounded-2xl bg-primary p-4 text-primary-foreground shadow-lg shadow-primary/15 transition hover:shadow-xl"
                >
                  <div className="relative z-10 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                      <Store className="h-5 w-5"/>
                    </div>

                    <div>
                      <p className="text-sm font-bold">Become a Seller</p>
                      <p className="mt-0.5 text-[10px] text-primary-foreground/75">
                        Start selling on AESTRA
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1"/>

                  <div className="absolute -bottom-10 -right-8 h-24 w-24 rounded-full bg-white/10 blur-2xl"/>
                </Link>
              )}

              {/* ACCOUNT */}
              <div className="mt-7 border-t border-border pt-5">
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Account
                </p>

                {user?(
                  <div className="space-y-1">
                    <Link
                      to={dashboardPath}
                      onClick={()=>setSheetOpen(false)}
                      className="group flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-muted"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted group-hover:text-primary">
                          <LayoutDashboard className="h-[17px] w-[17px]"/>
                        </span>
                        <span className="text-sm font-medium">
                          {isSeller?"Seller Dashboard":isSuperAdmin?"Super Admin Dashboard":"My Dashboard"}
                        </span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground"/>
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="group flex w-full items-center rounded-xl px-3 py-2.5 text-red-500 hover:bg-red-500/10"
                    >
                      <span className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10">
                        <LogOut className="h-[17px] w-[17px]"/>
                      </span>
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                ):(
                  <div className="space-y-2.5">
                    <Link
                      to="/login"
                      onClick={()=>setSheetOpen(false)}
                      className="flex h-11 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-md shadow-primary/15"
                    >
                      Sign In
                    </Link>

                    <Link
                      to="/signup"
                      onClick={()=>setSheetOpen(false)}
                      className="flex h-11 items-center justify-center rounded-xl border border-border text-sm font-bold transition hover:bg-muted"
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>

              {/* SUPPORT */}
              <div className="mt-6 rounded-2xl border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Headset className="h-4 w-4"/>
                  </div>

                  <div>
                    <p className="text-xs font-bold">Need Help?</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      Our support team is here for you.
                    </p>
                  </div>
                </div>
              </div>

              <div className="py-6 text-center">
                <p className="text-[10px] text-muted-foreground">
                  © 2026 AESTRA
                </p>
                <p className="mt-1 text-[9px] text-muted-foreground">
                  Shop smart. Live better.
                </p>
              </div>

            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;