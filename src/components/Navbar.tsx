import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Menu, Search, LogOut } from "lucide-react";
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
            <button className="md:hidden p-2 rounded-lg hover:bg-secondary">
              <Menu className="w-6 h-6" />
            </button>
          </SheetTrigger>

          <SheetContent side="right" className="w-[280px]">
            <SheetHeader className="mb-6">
              <SheetTitle className="flex items-center gap-2">
                <div>
                  <img className="lg:h-8 lg:w-25 h-5" src="/AESTRA LOGO-navbar.png" alt=""/>
                </div>
              </SheetTitle>
            </SheetHeader>

            <div className="flex flex-col gap-2">
              {navLinks.map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setSheetOpen(false)}
                  className="py-2 px-2 rounded-md hover:bg-gray-200 hover:text-primary"
                >
                  {l.label}
                </Link>
              ))}

              <Link
                to="/cart"
                onClick={() => setSheetOpen(false)}
                className="py-2 px-2 rounded-md hover:bg-gray-200 hover:text-primary flex justify-between"
              >
                Cart
                {cartCount > 0 && <span>{cartCount}</span>}
              </Link>

              <div className="border-t my-3" />

              {user ? (
                <>
                  <Link
                    to={isAdmin ? "/admin/dashboard" : "/dashboard"}
                    onClick={() => setSheetOpen(false)}
                    className="py-2 px-2 rounded-md hover:bg-gray-200 hover:text-primary"
                  >
                    {isAdmin ? "Admin Dashboard" : "Dashboard"}
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setSheetOpen(false);
                    }}
                    className="py-1 px-2 text-left text-primary hover:text-red-500"
                  >
                  <span className="flex items-center gap-2 rounded-xl w-fit">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setSheetOpen(false)}
                  className="btn-primary-glow text-center py-2"
                >
                  Login
                </Link>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;