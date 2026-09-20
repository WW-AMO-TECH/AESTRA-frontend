import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ArrowRight, ArrowUpRight, CheckCircle2, CreditCard, Headset, Mail, Search, ShieldCheck, Sparkles, Tag, Truck, X, Zap, ShoppingBag, Users } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import axios from "@/api/axios";

const categories = [
  { name: "Phones", image: "/hero-phone.png" },
  { name: "Laptops", image: "/hero-laptop.png" },
  { name: "Audio", image: "/hero-headphones.png" },
  { name: "Smart Watches", image: "/hero-watch.png" },
  { name: "Gaming", image: "/hero-phone.png" },
  { name: "Accessories", image: "/hero-headphones.png" },
  { name: "Cameras", image: "/hero-phone.png" },
  { name: "Speakers", image: "/hero-laptop.png" },
];

const perks = [
  { icon: Truck, title: "Fast Delivery", description: "Nationwide delivery" },
  { icon: ShieldCheck, title: "Quality Assured", description: "Shop with confidence" },
  { icon: CreditCard, title: "Secure Payment", description: "Protected checkout" },
  { icon: Headset, title: "Dedicated Support", description: "We're here to help" },
];

const brands = [
  { name: "Apple", logo: "/apple.svg" },
  { name: "Samsung", logo: "/samsung.svg" },
  { name: "Google", logo: "/google.svg" },
  { name: "HP", logo: "/hp.svg" },
  { name: "Dell", logo: "/dell.svg" },
  { name: "Lenovo", logo: "/lenovo.avif" },
  { name: "Sony", logo: "/sony.svg" },
  { name: "JBL", logo: "/jbl.svg" },
];

const heroSlides = [
  { badge: "NEW COLLECTION", eyebrow: "Technology made for you", title: "Upgrade your\ntech lifestyle.", description: "Discover smartphones, laptops, audio devices and more from trusted sellers.", image: "/hero-phone.png", button: "Shop Phones", link: "/products?category=Phones" },
  { badge: "STUDENT DEAL", eyebrow: "Power meets portability", title: "Work smarter.\nGo further.", description: "Find powerful laptops designed for school, work, creativity and everything in between.", image: "/hero-laptop.png", button: "Shop Laptops", link: "/products?category=Laptops" },
  { badge: "PREMIUM AUDIO", eyebrow: "Hear every detail", title: "Sound that\nmoves you.", description: "Upgrade your listening experience with premium headphones and audio devices.", image: "/hero-headphones.png", button: "Shop Audio", link: "/products?category=Headphones" },
  { badge: "SMART TECHNOLOGY", eyebrow: "Technology on your wrist", title: "Stay connected.\nStay ahead.", description: "Explore smart watches built for your everyday life, health and productivity.", image: "/hero-watch.png", button: "Shop Watches", link: "/products?category=Smart%20Watches" },
];

const dealSlides = [
  { label: "DEAL OF THE WEEK", title: "Save up to 30%", description: "Get more for less on selected gadgets and accessories.", image: "/16 pro var.png", button: "Shop Deals", link: "/products?sort=deals" },
  { label: "JUST DROPPED", title: "Fresh tech. Fresh arrivals.", description: "Explore the latest gadgets newly added to our marketplace.", image: "/hero-phone.png", button: "Explore New Arrivals", link: "/products?sort=newest" },
];

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  tag?: string;
  brand?: { name?: string; logo_url?: string };
  rating?: number | null;
  reviews_count?: number;
  condition?: "Original" | "Refurbished";
  grade?: "New" | "A" | "B" | "C";
  discount_percentage?: number;
};

// HERO
const HeroCarousel = ({
  search,
  setSearch,
}: {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
    },
    [
      Autoplay({
        delay: 5000,
        stopOnInteraction: false,
      }),
    ]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (emblaApi) {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    }
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();

    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="relative overflow-hidden bg-background">
      {/* MOBILE SEARCH */}
      <div className="px-4 pb-4 pt-3 lg:hidden">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, brands and more..."
            className="h-12 w-full rounded-2xl border border-border/70 bg-card pl-11 pr-11 text-sm shadow-[0_4px_20px_rgba(0,0,0,0.04)] outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
            >
              <X size={17} />
            </button>
          )}
        </div>
      </div>

      {/* CAROUSEL */}
      <div
        ref={emblaRef}
        className="w-full overflow-hidden"
      >
        <div className="flex">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className="w-full min-w-0 flex-[0_0_100%]"
            >
              {/* HERO CARD */}
              <div className="relative mx-auto w-full max-w-[1500px] overflow-hidden bg-[#f5f8f6] dark:bg-[#171c1b]">
                
                {/* BACKGROUND GRADIENT */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,rgba(99,170,125,0.16),transparent_34%),radial-gradient(circle_at_10%_90%,rgba(99,170,125,0.08),transparent_30%)]" />

                {/* TOP LIGHT */}
                <div className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[100px]" />

                {/* BOTTOM LIGHT */}
                <div className="pointer-events-none absolute -bottom-40 left-[35%] h-[360px] w-[360px] rounded-full bg-primary/10 blur-[110px]" />

                {/* SUBTLE GRID */}
                <div className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] [background-size:40px_40px]" />

                {/* HERO CONTENT */}
                <div className="relative grid min-h-[calc(100vh-150px)] grid-cols-1 lg:min-h-[calc(100vh-120px)] lg:grid-cols-[1.05fr_0.95fr]">

                  {/* LEFT CONTENT */}
                  <motion.div
                    initial={{
                      opacity: 0,
                      x: -35,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      duration: 0.7,
                      ease: "easeOut",
                    }}
                    className="relative z-10 flex flex-col justify-center px-6 pb-14 pt-12 sm:px-10 lg:px-14 lg:py-12 xl:px-20"
                  >
                    {/* BADGE */}
                    <div className="mb-4 flex">
                      <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(99,170,125,0.8)]" />

                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary sm:text-[11px]">
                          {slide.badge}
                        </span>
                      </div>
                    </div>

                    {/* EYEBROW */}
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">
                      {slide.eyebrow}
                    </p>

                    {/* TITLE */}
                    <h1 className="mt-3 max-w-2xl whitespace-pre-line text-[2.5rem] font-bold leading-[0.96] tracking-[-0.055em] text-foreground sm:text-5xl lg:text-[3.8rem] xl:text-[4.5rem]">
                      {slide.title}
                    </h1>

                    {/* DESCRIPTION */}
                    <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base lg:text-[16px] lg:leading-7">
                      {slide.description}
                    </p>

                    {/* CTA */}
                    <div className="mt-7 flex">
                      <Link
                        to={slide.link}
                        className="group inline-flex items-center gap-3 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(99,170,125,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(99,170,125,0.3)]"
                      >
                        {slide.button}

                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                          <ArrowRight
                            size={15}
                            className="transition-transform duration-300 group-hover:translate-x-0.5"
                          />
                        </span>
                      </Link>
                    </div>

                    {/* TRUST FEATURES */}
                    <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground sm:text-xs">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2
                          size={14}
                          className="text-primary"
                        />
                        Quality products
                      </span>

                      <span className="h-3 w-px bg-border" />

                      <span className="flex items-center gap-1.5">
                        <ShieldCheck
                          size={14}
                          className="text-primary"
                        />
                        Secure checkout
                      </span>
                    </div>
                  </motion.div>

                  {/* RIGHT PRODUCT AREA */}
                  <motion.div
                    initial={{
                      opacity: 0,
                      x: 45,
                      scale: 0.94,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: 1,
                    }}
                    transition={{
                      duration: 0.8,
                      ease: "easeOut",
                    }}
                    className="relative flex min-h-[260px] items-center justify-center px-6 pb-14 lg:min-h-0 lg:px-10 lg:pb-0"
                  >
                    {/* PRODUCT SPOTLIGHT */}
                    <div className="absolute h-[210px] w-[210px] rounded-full bg-white/70 shadow-[0_0_100px_rgba(99,170,125,0.18)] blur-sm sm:h-[280px] sm:w-[280px] lg:h-[380px] lg:w-[380px]" />

                    {/* OUTER RING */}
                    <div className="absolute h-[250px] w-[250px] rounded-full border border-primary/10 sm:h-[330px] sm:w-[330px] lg:h-[440px] lg:w-[440px]" />

                    {/* INNER RING */}
                    <div className="absolute h-[190px] w-[190px] rounded-full border border-primary/10 sm:h-[260px] sm:w-[260px] lg:h-[330px] lg:w-[330px]" />

                    {/* PRODUCT */}
                    <motion.img
                      src={slide.image}
                      alt={slide.title}
                      className="relative z-10 h-[220px] w-full object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.18)] sm:h-[290px] lg:h-[380px] xl:h-[430px]"
                      animate={{
                        y: [0, -7, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />

                    {/* FLOATING DECORATION */}
                    <div className="absolute right-[12%] top-[18%] hidden h-3 w-3 rounded-full bg-primary/50 shadow-[0_0_15px_rgba(99,170,125,0.5)] lg:block" />

                    <div className="absolute bottom-[22%] left-[12%] hidden h-2 w-2 rounded-full bg-primary/40 lg:block" />
                  </motion.div>
                </div>

                {/* CAROUSEL NAVIGATION */}
                <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between sm:left-10 sm:right-10 lg:left-14 lg:right-14 xl:left-20 xl:right-20">
                  
                  {/* SLIDE COUNT */}
                  <div className="hidden items-center gap-2 text-[10px] font-medium tracking-wider text-muted-foreground sm:flex">
                    <span className="font-semibold text-foreground">
                      {String(selectedIndex + 1).padStart(2, "0")}
                    </span>

                    <span className="h-px w-6 bg-border" />

                    <span>
                      {String(heroSlides.length).padStart(2, "0")}
                    </span>
                  </div>

                  {/* DOTS */}
                  <div className="mx-auto flex items-center gap-2 sm:mx-0">
                    {heroSlides.map((_, dotIndex) => (
                      <button
                        key={dotIndex}
                        type="button"
                        aria-label={`Go to slide ${dotIndex + 1}`}
                        onClick={() =>
                          emblaApi?.scrollTo(dotIndex)
                        }
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          selectedIndex === dotIndex
                            ? "w-9 bg-primary"
                            : "w-1.5 bg-muted-foreground/25 hover:bg-muted-foreground/50"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CategorySection = () => (
  <section className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10 xl:px-16">
    {/* HEADER */}
    <div className="mb-6 flex items-end justify-between">
      <div>
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
          Explore
        </p>

        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
          Shop by Category
        </h2>
      </div>

      <Link
        to="/products"
        className="group flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:text-primary/80 sm:text-sm"
      >
        All Categories

        <ArrowRight
          size={15}
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      </Link>
    </div>

    {/* CATEGORIES */}
    <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide sm:gap-7 lg:grid lg:grid-cols-9 lg:gap-4 lg:overflow-visible">
      {[
        ["📱", "Phones", "phones"],
        ["💻", "Laptops", "laptops"],
        ["🎧", "Headphones", "headphones"],
        ["⌚", "Smart Watches", "smart-watches"],
        ["🔌", "Accessories", "accessories"],
        ["🔊", "Speakers", "speakers"],
        ["📷", "Cameras", "cameras"],
        ["📺", "TV & Home", "tv"],
        ["🎮", "Gaming", "gaming"],
      ].map(([icon, name, slug], index) => (
        <Link
          key={name}
          to={`/products?category=${slug}`}
          className="group flex min-w-[72px] flex-col items-center"
        >
          {/* ICON */}
          <div className="relative flex h-[58px] w-[58px] items-center justify-center rounded-full border border-border/70 bg-card text-xl shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:bg-primary/[0.06] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
            <span className="transition-transform duration-300 group-hover:scale-110">
              {icon}
            </span>

            {/* NUMBER */}
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-background text-[7px] font-bold text-muted-foreground/50 ring-1 ring-border/50">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          {/* NAME */}
          <span className="mt-2 text-center text-[10px] font-medium leading-tight text-muted-foreground transition-colors duration-300 group-hover:text-primary sm:text-[11px]">
            {name}
          </span>
        </Link>
      ))}
    </div>
  </section>
);

// PRODUCT SECTION
const ProductSection = ({ title, subtitle, products }: { title: string; subtitle?: string; products: Product[] }) => {
  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 lg:px-4 lg:py-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-primary" />
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
          </div>
          {subtitle && <p className="mt-1.5 pl-3 text-xs text-muted-foreground sm:text-sm">{subtitle}</p>}
        </div>

        <Link to="/products" className="group flex shrink-0 items-center gap-1 text-xs font-semibold text-primary sm:text-sm">
          View All <ArrowRight size={15} className="transition group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
        {products.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
      </div>
    </section>
  );
};

// DEAL BANNER
const DealBanner = () => {
  const [dealRef] = useEmblaCarousel({ loop: true, align: "start" }, [Autoplay({ delay: 5500, stopOnInteraction: false })]);

  return (
    <section className="py-5 sm:py-8">
      <div ref={dealRef} className="overflow-hidden">
        <div className="flex">
          {dealSlides.map((slide, index) => (
            <div key={index} className="min-w-full px-4 sm:px-6 lg:px-1">
              <div className="relative mx-auto flex max-w-[1500px] overflow-hidden rounded-[2rem] bg-foreground text-background">
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

                <div className="relative z-10 flex w-full flex-col sm:flex-row sm:items-center">
                  <div className="flex-1 px-6 py-9 sm:px-10 lg:px-16 lg:py-14">
                    <div className="flex items-center gap-2">
                      <Zap size={15} className="text-primary" fill="currentColor" />
                      <span className="text-[10px] font-bold tracking-[0.2em] text-primary">{slide.label}</span>
                    </div>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl md:text-wrap">{slide.title}</h2>
                    <p className="mt-3 max-w-lg text-sm leading-6 text-background/60 sm:text-base">{slide.description}</p>
                    <Link to={slide.link} className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:-translate-y-0.5">
                      {slide.button} <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                    </Link>
                  </div>

                  <div className="flex h-60 flex-1 items-center justify-center px-6 pb-6 sm:h-64 sm:px-8 sm:pb-0 lg:h-80">
                    <img src={slide.image} alt={slide.title} className="relative z-10 h-full w-full object-contain drop-shadow-2xl transition duration-500 hover:scale-105" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// PROMOTIONAL BANNERS
const PromotionalBanners = () => (
  <section className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
    <div className="grid gap-4 md:grid-cols-3">
      <Link
        to="/products?category=Phones"
        className="group relative min-h-[145px] overflow-hidden rounded-xl bg-[#e8f7df] p-6"
      >
        <div className="relative z-10 max-w-[55%]">
          <h3 className="text-lg font-bold">Upgrade Your Tech</h3>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Latest phones, laptops & gadgets
          </p>
          <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-[10px] font-semibold text-primary-foreground">
            Shop Now <ArrowRight size={12} />
          </span>
        </div>

        <img
          src="/hero-phone.png"
          alt=""
          className="absolute -bottom-5 right-0 h-36 w-44 object-contain transition duration-500 group-hover:scale-105"
        />
      </Link>

      <Link
        to="/products?category=Fashion"
        className="group relative min-h-[145px] overflow-hidden rounded-xl bg-[#fff0eb] p-6"
      >
        <div className="relative z-10 max-w-[55%]">
          <h3 className="text-lg font-bold">Refresh Your Style</h3>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Fashion, shoes, bags & accessories
          </p>
          <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-[#e85b48] px-4 py-2 text-[10px] font-semibold text-white">
            Shop Now <ArrowRight size={12} />
          </span>
        </div>

        <img
          src="/hero-headphones.png"
          alt=""
          className="absolute -bottom-4 right-0 h-36 w-44 object-contain transition duration-500 group-hover:scale-105"
        />
      </Link>

      <Link
        to="/products?category=Home%20%26%20Kitchen"
        className="group relative min-h-[145px] overflow-hidden rounded-xl bg-[#f8f0e7] p-6"
      >
        <div className="relative z-10 max-w-[55%]">
          <h3 className="text-lg font-bold">Make Your Home Better</h3>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Furniture, kitchen & home décor
          </p>
          <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-[#9b6b37] px-4 py-2 text-[10px] font-semibold text-white">
            Shop Now <ArrowRight size={12} />
          </span>
        </div>

        <img
          src="/hero-laptop.png"
          alt=""
          className="absolute -bottom-4 right-0 h-36 w-44 object-contain transition duration-500 group-hover:scale-105"
        />
      </Link>
    </div>
  </section>
);

// BRANDS
const BrandSection = () => (
  <section className="border-y bg-secondary/30 py-10 sm:py-12">
    <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10 xl:px-16">
      <div className="mb-7 flex items-end justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-primary">Trusted names</p>
          <h2 className="text-xl font-bold sm:text-2xl">Shop Top Brands</h2>
        </div>
        <Link to="/products" className="flex items-center gap-1 text-xs font-semibold text-primary sm:text-sm">Explore Brands <ArrowRight size={15} /></Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {brands.map((brand) => (
          <Link key={brand.name} to={`/products?brand=${encodeURIComponent(brand.name)}`} className="group flex h-24 items-center justify-center rounded-2xl border bg-background p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
            <img src={brand.logo} alt={brand.name} className="h-auto max-h-11 w-auto max-w-[110px] object-contain transition duration-300 group-hover:scale-105" />
          </Link>
        ))}
      </div>
    </div>
  </section>
);

// SELLER BANNER
const SellerBanner = () => (
  <section className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
    <div className="relative overflow-hidden rounded-2xl bg-[#eef8f1] px-6 py-8 sm:px-10 lg:px-12">
      <div className="absolute -bottom-24 -left-10 h-60 w-60 rounded-full bg-primary/10" />
      <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-primary/10" />

      <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_1.2fr_1fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">
            Sell on AESTRA
          </p>

          <h2 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">
            Grow Your Business
            <span className="block">With AESTRA</span>
          </h2>

          <p className="mt-3 max-w-sm text-xs leading-5 text-muted-foreground">
            Reach thousands of customers and grow your online store with powerful seller tools.
          </p>

          <Link
            to="/seller/signup"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground"
          >
            Start Selling <ArrowRight size={14} />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="hidden justify-center lg:flex"
        >
          <div className="w-full max-w-[430px] rounded-xl border bg-white p-4 shadow-xl">
            {/* Dashboard Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <img
                  src="/AESTRA LOGO-navbar.png"
                  alt="AESTRA"
                  className="h-5 w-auto"
                />
                <span className="text-xs font-semibold">
                  Dashboard
                </span>
              </div>

              <motion.span
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="h-2 w-2 rounded-full bg-primary"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 py-4">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="rounded-lg bg-slate-50 p-3"
              >
                <p className="text-[9px] text-muted-foreground">
                  Total Sales
                </p>

                <p className="mt-1 text-sm font-bold">
                  ₦2,480,000
                </p>

                <p className="mt-1 text-[9px] text-primary">
                  +24%
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="rounded-lg bg-slate-50 p-3"
              >
                <p className="text-[9px] text-muted-foreground">
                  Total Orders
                </p>

                <p className="mt-1 text-sm font-bold">
                  248
                </p>

                <p className="mt-1 text-[9px] text-primary">
                  +18%
                </p>
              </motion.div>
            </div>

            {/* Animated Chart */}
            <div className="flex h-24 items-end gap-2 rounded-lg bg-slate-50 p-3">
              {[30, 42, 35, 60, 52, 75, 68, 90].map(
                (height, index) => (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${height}%` }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{
                      duration: 0.7,
                      delay: 0.55 + index * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="flex-1 rounded-t bg-primary/70"
                  />
                )
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4 lg:grid-cols-2">
          {[
            { icon: ShoppingBag, text: "Product Management" },
            { icon: CreditCard, text: "Order Management" },
            { icon: Sparkles, text: "Sales Analytics" },
            { icon: Users, text: "Customer Management" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <item.icon size={14} className="text-primary" />
              </div>
              <span className="font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// APP BANNER
const AppBanner = () => (
  <section className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
    <div className="relative overflow-hidden rounded-2xl bg-[#edf8f1] px-6 py-7 sm:px-10 lg:px-14">
      <div className="absolute -top-32 -left-12 h-60 w-60 rounded-full bg-primary/10" />
      <div className="absolute -right-20 -bottom-52 h-72 w-72 rounded-full bg-primary/10" />
      <div className="grid items-center gap-8 md:grid-cols-[180px_1fr_1fr]">
        <div className="hidden items-center justify-center md:flex">
          <motion.div
            animate={{
              rotate: [-8, -11, -5, -10, -6, -8],
              x: [0, -2, 2, -2, 2, 0],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatDelay: 2,
              ease: "easeInOut",
            }}
            className="relative h-32 w-20 rotate-[-8deg] rounded-2xl border-4 border-slate-800 bg-white shadow-xl"
          >
            <div className="mx-auto mt-2 h-1 w-7 rounded-full bg-slate-300" />

            <div className="mt-5 grid grid-cols-2 gap-1 p-2">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="h-7 rounded bg-primary/10"
                />
              ))}
            </div>
          </motion.div>
        </div>

        <div>
          <h2 className="text-xl font-bold sm:text-2xl">Shop AESTRA Anywhere</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Get the best shopping experience on your phone.
          </p>

          <div className="mt-5 flex gap-2">
            <div className="rounded-md bg-black px-4 py-2 text-white">
              <p className="text-[7px]">Download on the</p>
              <p className="text-xs font-semibold">App Store</p>
            </div>

            <div className="rounded-md bg-black px-4 py-2 text-white">
              <p className="text-[7px]">GET IT ON</p>
              <p className="text-xs font-semibold">Google Play</p>
            </div>
          </div>
        </div>

        <div className="hidden space-y-3 sm:block">
          {[
            "Exclusive app deals",
            "Faster checkout",
            "Order tracking",
            "Personalized recommendations",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-xs">
              <CheckCircle2 size={15} className="text-primary" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// NEWSLETTER
const Newsletter = () => (
  <section className="mx-auto max-w-[1500px] px-4 pb-6 sm:px-6 lg:px-8">
    <div className="relative overflow-hidden rounded-xl bg-[#edf8f1] px-5 py-4 sm:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Mail size={17} className="text-primary" />
          </div>

          <div>
            <h3 className="text-xs font-bold sm:text-sm">Stay Updated With AESTRA</h3>
            <p className="text-[9px] text-muted-foreground sm:text-[10px]">
              Get notified about new products, exclusive deals and special offers.
            </p>
          </div>
        </div>

        <div className="flex w-full max-w-md">
          <input
            type="email"
            placeholder="Enter your email address"
            className="h-10 min-w-0 flex-1 rounded-l-lg border border-r-0 bg-white px-4 text-xs outline-none focus:border-primary"
          />

          <button
            type="button"
            className="rounded-r-lg bg-primary px-5 text-xs font-semibold text-primary-foreground"
          >
            Subscribe
          </button>
        </div>
      </div>
    </div>
  </section>
);

// FOOTER
const Footer = () => (
  <footer className="bg-[#20272e] text-white">
    <div className="mx-auto max-w-[1500px] px-5 pt-8 pb-5 sm:px-8 lg:px-10">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
        <div>
          <Link to="/">
            <img
              src="/AESTRA LOGO-navbar.png"
              alt="AESTRA"
              className="h-8 w-auto object-contain brightness-0 invert"
            />
          </Link>

          <p className="mt-3 max-w-xs text-[10px] leading-5 text-white/60">
            Your trusted online marketplace for quality products from trusted sellers.
          </p>

          <div className="mt-4 flex gap-3 text-white/60">
            <span>𝕏</span>
            <span>f</span>
            <span>◎</span>
            <span>▶</span>
            <span>♪</span>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold">Shop</h3>
          <div className="mt-3 flex flex-col gap-2 text-[10px] text-white/60">
            <Link to="/products">All Products</Link>
            <Link to="/products">Electronics</Link>
            <Link to="/products">Fashion</Link>
            <Link to="/products">Beauty</Link>
            <Link to="/products">Home & Kitchen</Link>
            <Link to="/products">Groceries</Link>
            <Link to="/products">Deals</Link>
            <Link to="/categories">More Categories</Link>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold">Customer Service</h3>
          <div className="mt-3 flex flex-col gap-2 text-[10px] text-white/60">
            <Link to="/contact">Contact Us</Link>
            <Link to="/faq">Help Center</Link>
            <Link to="/delivery">Delivery Information</Link>
            <Link to="/returns">Returns & Refunds</Link>
            <Link to="/payment-methods">Payment Methods</Link>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold">Sell on AESTRA</h3>
          <div className="mt-3 flex flex-col gap-2 text-[10px] text-white/60">
            <Link to="/seller/signup">Become a Seller</Link>
            <Link to="/seller/dashboard">Seller Dashboard</Link>
            <Link to="/seller/orders">Seller Guidelines</Link>
            <Link to="/seller/support">Seller Support</Link>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold">Company</h3>
          <div className="mt-3 flex flex-col gap-2 text-[10px] text-white/60">
            <Link to="/about">About Us</Link>
            <Link to="/careers">Careers</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms & Conditions</Link>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-4 text-[9px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 AESTRA. All rights reserved.</p>

        <div className="flex gap-4">
          <span>Trust</span>
          <span>Variety</span>
          <span>Convenience</span>
          <span>Affordability</span>
          <span>Premium Quality</span>
        </div>
      </div>
    </div>
  </footer>
);

// MAIN PAGE
const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"new" | "best" | "trending">("new");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("/products");
      const productsData = Array.isArray(response.data) ? response.data : Array.isArray(response.data?.data) ? response.data.data : [];

      const transformed: Product[] = productsData.map((product: any) => ({
        id: Number(product.id),
        name: product.name,
        price: Number(product.price),
        tag: product.tag,
        image: product.images?.length ? `http://127.0.0.1:8000${product.images[0].image_url}` : "/placeholder.png",
        brand: { name: product.brand?.name, logo_url: product.brand?.logo_url },
        rating: product.rating ?? null,
        reviews_count: product.reviews_count ?? 0,
        condition: product.condition === "original" ? "Original" : "Refurbished",
        grade: product.grade,
        discount_percentage: Number(product.discount_percentage) || 0,
      }));

      setProducts(transformed);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const featuredProducts = products.slice(0, 4);
  const newArrivalProducts = products.filter((product) => product.tag === "New Arrival").slice(0, 4);
  const bestSellerProducts = products.filter((product) => product.tag === "Best Seller").slice(0, 4);
  const trendingProducts = products.filter((product) => product.tag === "Trending").slice(0, 4);

  const displayedProducts = activeTab === "new" ? newArrivalProducts : activeTab === "best" ? bestSellerProducts : trendingProducts;

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Navbar />

      <div className="animate-fade-in">
        <HeroCarousel search={search} setSearch={setSearch} />

        {/* PERKS */}
        <section className="px-4 sm:px-6 lg:px-10 xl:px-16">
          <div className="">
            <div className="flex overflow-x-auto scrollbar-hide lg:grid lg:grid-cols-4">
              {perks.map((perk) => (
                <div key={perk.title} className="flex min-w-[235px] flex-1 items-center gap-3 border-r px-5 py-5 last:border-r-0 lg:min-w-0 lg:justify-center">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <perk.icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{perk.title}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{perk.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <CategorySection />

        {/* FEATURED PRODUCTS */}
        {!loading ? (
          <ProductSection title="Featured Products" subtitle="Handpicked gadgets worth checking out." products={featuredProducts} />
        ) : (
          <section className="py-16 text-center text-sm text-muted-foreground">Loading products...</section>
        )}

        <DealBanner />

        {/* DISCOVER MORE */}
        <section className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-4 lg:py-4">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={19} className="text-primary" />
                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Discover More</h2>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">Find something you'll love.</p>
            </div>

            <div className="flex w-fit max-w-full overflow-x-auto rounded-full bg-secondary p-1 scrollbar-hide">
              <button type="button" onClick={() => setActiveTab("new")} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition sm:text-sm ${activeTab === "new" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}>New Arrivals</button>
              <button type="button" onClick={() => setActiveTab("best")} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition sm:text-sm ${activeTab === "best" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}>Best Sellers</button>
              <button type="button" onClick={() => setActiveTab("trending")} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition sm:text-sm ${activeTab === "trending" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}>Trending</button>
            </div>
          </div>

          {!loading && displayedProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
              {displayedProducts.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
            </div>
          ) : !loading ? (
            <div className="rounded-2xl border bg-card px-5 py-16 text-center">
              <Tag size={30} className="mx-auto text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">No products available in this section yet.</p>
              <Link to="/products" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Browse all products <ArrowRight size={15} />
              </Link>
            </div>
          ) : null}
        </section>

        <PromotionalBanners />
        <BrandSection />
        <SellerBanner />
        <AppBanner />
        <Newsletter />
        <Footer />
      </div>
    </div>
  );
};

export default Index;