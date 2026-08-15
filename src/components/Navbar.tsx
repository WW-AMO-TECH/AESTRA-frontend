import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Menu, Search, LogOut, ChevronRight, Store, ArrowRight, LayoutDashboard, Headset } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const Navbar = () => {
  const { user, loading, logout } = useAuth(); // ✅ FIXED
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const query = search.trim();

    if (!query) {
      navigate("/products");
      return;
    }

    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  // ❌ Removed cartCount (we'll reconnect later)
  const cartCount = 0;

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Products" },
    { to: "/blog", label: "Blog" },
    { to: "/contact", label: "Contact" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (loading) return null; // prevents flicker

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4 lg:h-16 h-12 flex items-center justify-between">

        {/* LOGO */}
        <Link to="/" className="">
          <div>
            <img className="lg:h-8 lg:w-25 h-5" src="/AESTRA LOGO-navbar.png" alt=""/>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-12">
          {navLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium transition-colors hover:text-primary/80 hover:border-b-2 hover:border-primary ${
                location.pathname === l.to ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* RIGHT SIDE */}
        <div className="hidden md:flex items-center gap-3">

          <form
            onSubmit={handleSearch}
            className="hidden lg:flex items-center w-full max-w-md xl:max-w-lg"
          >
            <div className="flex items-center w-full bg-background border border-border rounded-xl shadow-sm hover:shadow-md focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all duration-300">

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for products..."
                className="flex-1 bg-transparent px-4 py-2 outline-none text-sm placeholder:text-muted-foreground"
              />

              <button
                type="submit"
                className="flex items-center justify-center rounded-xl active:scale-95 transition-all"
              >
                <Search className="h-4 w-4 mx-3" />
              </button>
            </div>
          </form>

          <Link to="/cart" className="p-2 rounded-lg hover:bg-secondary relative">
            <ShoppingCart className="w-5 h-5 text-muted-foreground" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link
                to={isAdmin ? "/admin/dashboard" : "/dashboard"}
                className="p-2 rounded-lg hover:bg-secondary"
              >
                <User className="w-5 h-5 text-muted-foreground" />
              </Link>

              <button
                onClick={handleLogout}
                className="text-sm text-muted-foreground hover:text-red-500"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary-glow text-sm px-4 py-2">
              Login
            </Link>
          )}
        </div>

        {/* MOBILE MENU */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button
              className="
                md:hidden
                w-10 h-10
                flex items-center justify-center
                rounded-xl
                bg-secondary/70
                hover:bg-primary/10
                transition-all duration-200
              "
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>

          <SheetContent
            side="right"
            className="
              w-[88%]
              max-w-[360px]
              p-0
              border-l
              bg-background
              overflow-y-auto
            "
          >
            {/* HEADER */}
            <SheetHeader className="px-5 pt-6 pb-5 border-b">
              <SheetTitle className="flex items-center justify-between">
                <img
                  src="/AESTRA LOGO-navbar.png"
                  alt="AESTRA TECH"
                  className="h-7 w-auto object-contain"
                />
              </SheetTitle>
            </SheetHeader>

            <div className="px-4 py-5">

              {/* USER PROFILE / WELCOME */}
              {user ? (
                <div
                  className="
                    flex items-center gap-3
                    p-3
                    mb-5
                    rounded-2xl
                    bg-secondary/60
                    border
                  "
                >
                  <div
                    className="
                      w-11 h-11
                      rounded-full
                      bg-primary/10
                      text-primary
                      flex items-center justify-center
                      font-bold
                      text-lg
                      shrink-0
                    "
                  >
                    {(
                      user.name ||
                      user.email ||
                      "U"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      Welcome back
                    </p>

                    <p className="font-semibold truncate">
                      {user.name || user.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  className="
                    mb-5
                    p-4
                    rounded-2xl
                    bg-primary/5
                    border
                    border-primary/10
                  "
                >
                  <p className="font-semibold">
                    Welcome to AESTRA TECH
                  </p>

                  <p className="text-sm text-muted-foreground mt-1">
                    Shop premium gadgets and accessories.
                  </p>
                </div>
              )}

              {/* MAIN NAVIGATION */}
              <div className="space-y-1">

                <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Menu
                </p>

                {navLinks.map((l) => {
                  const Icon = ChevronRight;

                  return (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setSheetOpen(false)}
                      className="
                        group
                        flex items-center justify-between
                        w-full
                        px-3 py-3
                        rounded-xl
                        text-sm
                        font-medium
                        transition-all duration-200
                        hover:bg-primary/10
                        hover:text-primary
                      "
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className="
                            w-9 h-9
                            rounded-lg
                            bg-secondary
                            group-hover:bg-primary/10
                            flex items-center justify-center
                            transition-colors
                          "
                        >
                          <Icon className="w-[18px] h-[18px]" />
                        </span>

                        {l.label}
                      </span>

                      <ChevronRight
                        className="
                          w-4 h-4
                          text-muted-foreground
                          group-hover:text-primary
                          transition-all
                          group-hover:translate-x-0.5
                        "
                      />
                    </Link>
                  );
                })}

                {/* CART */}
                <Link
                  to="/cart"
                  onClick={() => setSheetOpen(false)}
                  className="
                    group
                    flex items-center justify-between
                    w-full
                    px-3 py-3
                    rounded-xl
                    text-sm
                    font-medium
                    hover:bg-primary/10
                    hover:text-primary
                    transition-all duration-200
                  "
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="
                        w-9 h-9
                        rounded-lg
                        bg-secondary
                        group-hover:bg-primary/10
                        flex items-center justify-center
                      "
                    >
                      <ShoppingCart className="w-[18px] h-[18px]" />
                    </span>

                    Cart
                  </span>

                  {cartCount > 0 ? (
                    <span
                      className="
                        min-w-6 h-6
                        px-1.5
                        rounded-full
                        bg-primary
                        text-primary-foreground
                        text-xs
                        font-bold
                        flex items-center justify-center
                      "
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </Link>
              </div>

              {/* SELLER CTA */}
              {!isAdmin && (
                <div className="mt-6">
                  <Link
                    to="/become-seller"
                    onClick={() => setSheetOpen(false)}
                    className="
                      group
                      relative
                      overflow-hidden
                      flex items-center justify-between
                      p-4
                      rounded-2xl
                      bg-primary
                      text-primary-foreground
                      shadow-lg
                      hover:shadow-xl
                      transition-all duration-300
                    "
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      <div
                        className="
                          w-10 h-10
                          rounded-xl
                          bg-white/15
                          flex items-center justify-center
                        "
                      >
                        <Store className="w-5 h-5" />
                      </div>

                      <div>
                        <p className="font-semibold text-sm">
                          Become a Seller
                        </p>

                        <p className="text-xs text-primary-foreground/75 mt-0.5">
                          Sell your gadgets on AESTRA
                        </p>
                      </div>
                    </div>

                    <ArrowRight
                      className="
                        w-5 h-5
                        relative z-10
                        transition-transform duration-300
                        group-hover:translate-x-1
                      "
                    />

                    {/* Decorative glow */}
                    <div
                      className="
                        absolute
                        -right-8
                        -bottom-10
                        w-24 h-24
                        rounded-full
                        bg-white/10
                        blur-2xl
                      "
                    />
                  </Link>
                </div>
              )}

              {/* ACCOUNT */}
              <div className="mt-7 pt-5 border-t">

                <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Account
                </p>

                {user ? (
                  <div className="space-y-1">

                    {/* DASHBOARD */}
                    <Link
                      to={isAdmin ? "/admin/dashboard" : "/dashboard"}
                      onClick={() => setSheetOpen(false)}
                      className="
                        group
                        flex items-center justify-between
                        px-3 py-3
                        rounded-xl
                        text-sm
                        font-medium
                        hover:bg-primary/10
                        hover:text-primary
                        transition-all
                      "
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className="
                            w-9 h-9
                            rounded-lg
                            bg-secondary
                            group-hover:bg-primary/10
                            flex items-center justify-center
                          "
                        >
                          <LayoutDashboard className="w-[18px] h-[18px]" />
                        </span>

                        {isAdmin
                          ? "Admin Dashboard"
                          : "My Dashboard"}
                      </span>

                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                    </Link>

                    {/* LOGOUT */}
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setSheetOpen(false);
                      }}
                      className="
                        group
                        flex items-center
                        w-full
                        px-3 py-3
                        rounded-xl
                        text-sm
                        font-medium
                        text-red-500
                        hover:bg-red-500/10
                        transition-all
                      "
                    >
                      <span
                        className="
                          w-9 h-9
                          rounded-lg
                          bg-red-500/10
                          flex items-center justify-center
                          mr-3
                        "
                      >
                        <LogOut className="w-[18px] h-[18px]" />
                      </span>

                      Logout
                    </button>

                  </div>
                ) : (
                  <div className="space-y-3">

                    <Link
                      to="/login"
                      onClick={() => setSheetOpen(false)}
                      className="
                        flex items-center justify-center
                        w-full
                        py-3
                        rounded-xl
                        bg-primary
                        text-primary-foreground
                        font-semibold
                        text-sm
                        shadow-md
                        hover:shadow-lg
                        transition-all
                      "
                    >
                      Sign In
                    </Link>

                    <Link
                      to="/register"
                      onClick={() => setSheetOpen(false)}
                      className="
                        flex items-center justify-center
                        w-full
                        py-3
                        rounded-xl
                        border
                        font-semibold
                        text-sm
                        hover:bg-secondary
                        transition-all
                      "
                    >
                      Create Account
                    </Link>

                  </div>
                )}
              </div>

              {/* QUICK INFO */}
              <div
                className="
                  mt-7
                  p-4
                  rounded-2xl
                  border
                  bg-secondary/30
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      w-9 h-9
                      rounded-full
                      bg-primary/10
                      text-primary
                      flex items-center justify-center
                    "
                  >
                    <Headset className="w-4 h-4" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Need Help?
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Our support team is available 24/7.
                    </p>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="text-center py-6">
                <p className="text-[11px] text-muted-foreground">
                  © 2026 AESTRA TECH
                </p>

                <p className="text-[10px] text-muted-foreground mt-1">
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