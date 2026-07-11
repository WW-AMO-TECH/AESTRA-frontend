import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import {
  ArrowLeft,
  Home,
  Search,
  Smartphone,
  Sparkles,
} from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(41,123,255,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(0,255,200,0.08),transparent_30%)]" />

      {/* GRID */}
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:70px_70px]" />

      {/* GLOW ORBS */}
      <div className="absolute top-24 left-20 h-72 w-72 rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-5xl">
          <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] shadow-[0_0_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
            <div className="grid lg:grid-cols-2">
              
              {/* LEFT SIDE */}
              <div className="relative flex flex-col justify-center p-10 sm:p-14">
                
                {/* TOP BADGE */}
                <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 backdrop-blur-xl">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Premium Tech Experience
                </div>

                {/* 404 */}
                <h1 className="text-[90px] leading-none font-black tracking-[-4px] md:text-[130px]">
                  <span className="bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent">
                    404
                  </span>
                </h1>

                {/* TITLE */}
                <h2 className="mt-5 text-3xl font-bold tracking-tight md:text-5xl">
                  Lost in the
                  <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                    {" "}
                    digital universe
                  </span>
                </h2>

                {/* DESC */}
                <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400 md:text-lg">
                  The page you attempted to access may have been moved,
                  removed, or never existed. Continue exploring premium
                  gadgets, flagship devices, and cutting-edge accessories.
                </p>

                {/* URL */}
                <div className="mt-8 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-400 backdrop-blur-xl">
                  <span className="text-zinc-500">Requested route</span>
                  <span className="rounded-lg bg-primary/10 px-3 py-1 font-medium text-primary">
                    {location.pathname}
                  </span>
                </div>

                {/* ACTIONS */}
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <Link
                    to="/"
                    className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-7 py-4 font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(41,123,255,0.45)]"
                  >
                    <Home className="h-5 w-5 transition group-hover:scale-110" />
                    Return Home
                  </Link>

                  <button
                    onClick={() => window.history.back()}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-7 py-4 font-semibold text-white transition-all duration-300 hover:border-white/20 hover:bg-white/10"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    Previous Page
                  </button>
                </div>

                {/* SEARCH */}
                <div className="mt-12">
                  <div className="group flex items-center overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl transition-all focus-within:border-primary/40">
                    <div className="px-5 text-zinc-500">
                      <Search className="h-5 w-5" />
                    </div>

                    <input
                      type="text"
                      placeholder="Search products, brands, accessories..."
                      className="w-full bg-transparent py-5 text-sm text-white placeholder:text-zinc-500 outline-none"
                    />

                    <button className="m-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90">
                      Search
                    </button>
                  </div>
                </div>

                {/* FOOTER */}
                <p className="mt-10 text-sm text-zinc-600">
                  © 2026 Gadget Store — Curated Premium Electronics
                </p>
              </div>

              {/* RIGHT SIDE */}
              <div className="relative hidden lg:flex items-center justify-center overflow-hidden border-l border-white/10 bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-12">
                
                {/* CIRCLES */}
                <div className="absolute h-[500px] w-[500px] rounded-full border border-white/5" />
                <div className="absolute h-[380px] w-[380px] rounded-full border border-white/5" />
                <div className="absolute h-[260px] w-[260px] rounded-full border border-white/10" />

                {/* FLOATING CARD */}
                <div className="relative rounded-[32px] border border-white/10 bg-white/[0.05] p-10 shadow-2xl backdrop-blur-2xl">
                  <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-primary/10 to-cyan-500/5" />

                  <div className="relative flex flex-col items-center text-center">
                    <div className="flex h-28 w-28 items-center justify-center rounded-[28px] border border-white/10 bg-black/40 shadow-[0_0_60px_rgba(41,123,255,0.25)]">
                      <Smartphone className="h-14 w-14 text-primary" />
                    </div>

                    <h3 className="mt-8 text-2xl font-bold">
                      Premium Gadget Store
                    </h3>

                    <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-400">
                      Explore flagship smartphones, ultra-fast laptops,
                      gaming accessories, wearables, and next-generation
                      technology products.
                    </p>

                    <div className="mt-8 flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <div className="h-2 w-2 rounded-full bg-cyan-400" />
                      <div className="h-2 w-2 rounded-full bg-white/40" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM TEXT */}
          <div className="mt-8 text-center text-xs tracking-[0.25em] text-zinc-700 uppercase">
            Designed for a premium digital commerce experience
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;