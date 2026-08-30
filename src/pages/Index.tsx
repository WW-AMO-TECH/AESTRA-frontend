import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ArrowRight, ArrowUpRight, BatteryCharging, Camera, CheckCircle2, ChevronRight, CreditCard, Gamepad2, Headphones, Headset, Laptop, Mail, Search, ShieldCheck, Smartphone, Sparkles, Tag, Truck, Watch, X, Zap, } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import axios from "@/api/axios";

const categories = [
  {
    name: "Phones",
    image: "/hero-phone.png",
  },
  {
    name: "Laptops",
    image: "/hero-laptop.png",
  },
  {
    name: "Audio",
    image: "/hero-headphones.png",
  },
  {
    name: "Smart Watches",
    image: "/hero-watch.png",
  },
  {
    name: "Gaming",
    image: "/hero-phone.png",
  },
  {
    name: "Accessories",
    image: "/hero-headphones.png",
  },
  {
    name: "Cameras",
    image: "/hero-phone.png",
  },
  {
    name: "Speakers",
    image: "/hero-laptop.png",
  },
];

const perks = [
  { icon: Truck, title: "Fast Delivery", description: "Nationwide delivery", },
  { icon: ShieldCheck, title: "Quality Assured", description: "Shop with confidence", },
  { icon: CreditCard, title: "Secure Payment", description: "Protected checkout", },
  { icon: Headset, title: "Dedicated Support", description: "We're here to help", },
];

const brands = [
  { name: "Apple", logo: "/apple.svg", },
  { name: "Samsung", logo: "/samsung.svg", },
  { name: "Google", logo: "/google.svg", },
  { name: "HP", logo: "/hp.svg", },
  { name: "Dell", logo: "/dell.svg" },
  { name: "Lenovo", logo: "/lenovo.avif", },
  { name: "Sony", logo: "/sony.svg", },
  { name: "JBL", logo: "/jbl.svg", },
];

const heroSlides = [
  {
    badge: "NEW COLLECTION",
    eyebrow: "Technology made for you",
    title: "Upgrade your\ntech lifestyle.",
    description: "Discover smartphones, laptops, audio devices and more from trusted sellers.",
    image: "/hero-phone.png",
    button: "Shop Phones",
    link: "/products?category=Phones",
  },
  {
    badge: "STUDENT DEAL",
    eyebrow: "Power meets portability",
    title: "Work smarter.\nGo further.",
    description: "Find powerful laptops designed for school, work, creativity and everything in between.",
    image: "/hero-laptop.png",
    button: "Shop Laptops",
    link: "/products?category=Laptops",
  },
  {
    badge: "PREMIUM AUDIO",
    eyebrow: "Hear every detail",
    title: "Sound that\nmoves you.",
    description: "Upgrade your listening experience with premium headphones and audio devices.",
    image: "/hero-headphones.png",
    button: "Shop Audio",
    link: "/products?category=Headphones",
  },
  {
    badge: "SMART TECHNOLOGY",
    eyebrow: "Technology on your wrist",
    title: "Stay connected.\nStay ahead.",
    description: "Explore smart watches built for your everyday life, health and productivity.",
    image: "/hero-watch.png",
    button: "Shop Watches",
    link: "/products?category=Smart%20Watches",
  },
];

const dealSlides = [
  {
    label: "DEAL OF THE WEEK",
    title: "Save up to 30%",
    description:
      "Get more for less on selected gadgets and accessories.",
    image: "/16 pro var.png",
    button: "Shop Deals",
    link: "/products?sort=deals",
  },
  {
    label: "JUST DROPPED",
    title: "Fresh tech. Fresh arrivals.",
    description:
      "Explore the latest gadgets newly added to our marketplace.",
    image: "/hero-phone.png",
    button: "Explore New Arrivals",
    link: "/products?sort=newest",
  },
];

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  tag?: string;
  brand?: {
    name?: string;
    logo_url?: string;
  };
  rating?: number | null;
  reviews_count?: number;
  condition?: "Original" | "Refurbished";
  grade?: "New" | "A" | "B" | "C";
  discount_percentage?: number;
};


// ============================================================
// HERO
// ============================================================

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
    if (!emblaApi) return;

    setSelectedIndex(emblaApi.selectedScrollSnap());
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
    <section className="relative overflow-hidden bg-background mt-16">


      {/* ==========================================
          MOBILE SEARCH
      ========================================== */}

      <div className="px-4 pb-3 pt-3 lg:hidden">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search gadgets..."
            className=" h-12 w-full rounded-2xl border border-border bg-card pl-11 pr-10 text-sm shadow-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="
                absolute
                right-4
                top-1/2
                -translate-y-1/2
                text-muted-foreground
              "
            >
              <X size={17} />
            </button>
          )}
        </div>
      </div>


      {/* ==========================================
          HERO SLIDER
      ========================================== */}

      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {heroSlides.map((slide, index) => (
            <div key={index} className="min-w-0 flex-[0_0_100%] px-4 pt-2 sm:px-6 lg:px-4 ">
              <div className=" relative mx-auto max-w-[1500px] overflow-hidden rounded-[2rem] bg-secondary">

                {/* Decorative glow */}
                <div className=" pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl lg:h-96 lg:w-96"/>
                <div className=" pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-primary/5 blur-3xl"/>
                <div className="relative grid min-h-[560px] grid-cols-1 lg:grid-cols-[3fr_2fr]">

                  {/* HERO TEXT */}
                  <motion.div
                    initial={{
                      opacity: 0,
                      x: -30,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      duration: 0.65,
                    }}
                    className="relative z-10 flex flex-col justify-center px-6 pb-5 pt-12 text-center sm:px-10 lg:px-14 lg:py-16 lg:text-left xl:px-20 ">
                    <div className="mx-auto flex items-center gap-2 lg:mx-0">
                      <span
                        className="text-[11px] font-bold tracking-[0.18em] text-primary">
                        {slide.badge}
                      </span>
                    </div>
                    <p className=" mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {slide.eyebrow}
                    </p>

                    <h1
                      className="
                        mt-3
                        whitespace-pre-line
                        text-[2.65rem]
                        font-bold
                        leading-[0.98]
                        tracking-[-0.045em]
                        sm:text-5xl
                        lg:text-6xl
                        xl:text-[4.5rem]
                      "
                    >
                      {slide.title}
                    </h1>

                    <p
                      className="
                        mx-auto
                        mt-4
                        max-w-xl
                        text-sm
                        leading-6
                        text-muted-foreground
                        sm:text-base
                        lg:mx-0
                        lg:text-[17px]
                        lg:leading-7
                      "
                    >
                      {slide.description}
                    </p>

                    <div
                      className="
                        mt-7
                        flex
                        justify-center
                        lg:justify-start
                      "
                    >
                      <Link
                        to={slide.link}
                        className="
                          group
                          inline-flex
                          items-center
                          gap-2
                          rounded-xl
                          bg-primary
                          px-6
                          py-3.5
                          text-sm
                          font-semibold
                          text-primary-foreground
                          shadow-lg
                          shadow-primary/20
                          transition
                          hover:-translate-y-0.5
                          hover:shadow-xl
                        "
                      >
                        {slide.button}

                        <ArrowRight
                          size={17}
                          className="
                            transition
                            group-hover:translate-x-1
                          "
                        />
                      </Link>
                    </div>

                    {/* Mini trust line */}

                    <div
                      className="
                        mt-7
                        flex
                        items-center
                        justify-center
                        gap-4
                        text-xs
                        text-muted-foreground
                        lg:justify-start
                      "
                    >
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2
                          size={14}
                          className="text-primary"
                        />
                        Quality products
                      </span>

                      <span className="hidden sm:inline">
                        •
                      </span>

                      <span className="hidden items-center gap-1.5 sm:flex">
                        <ShieldCheck
                          size={14}
                          className="text-primary"
                        />
                        Secure checkout
                      </span>
                    </div>
                  </motion.div>


                  {/* ======================================
                      HERO IMAGE
                  ====================================== */}

                  <motion.div
                    initial={{
                      opacity: 0,
                      x: 35,
                      scale: 0.96,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: 1,
                    }}
                    transition={{
                      duration: 0.7,
                    }}
                    className="
                      relative
                      flex
                      min-h-[280px]
                      items-center
                      justify-center
                      px-6
                      pb-14
                      lg:min-h-0
                      lg:px-10
                      lg:pb-0
                    "
                  >

                    {/* Image backdrop */}

                    <div
                      className="
                        absolute
                        h-56
                        w-56
                        rounded-full
                        bg-background/70
                        blur-sm
                        sm:h-72
                        sm:w-72
                        lg:h-96
                        lg:w-96
                      "
                    />

                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="
                        relative
                        z-10
                        h-[260px]
                        w-full
                        object-contain
                        drop-shadow-2xl
                        sm:h-[330px]
                        lg:h-[440px]
                        xl:h-[500px]
                      "
                    />
                  </motion.div>
                </div>


                {/* ======================================
                    SLIDER DOTS
                ====================================== */}

                <div
                  className="
                    absolute
                    bottom-5
                    left-1/2
                    flex
                    -translate-x-1/2
                    items-center
                    gap-2
                    lg:bottom-7
                    lg:left-14
                    lg:translate-x-0
                    xl:left-20
                  "
                >
                  {heroSlides.map((_, dotIndex) => (
                    <button
                      key={dotIndex}
                      type="button"
                      aria-label={`Go to slide ${
                        dotIndex + 1
                      }`}
                      onClick={() =>
                        emblaApi?.scrollTo(dotIndex)
                      }
                      className={`
                        h-1.5
                        rounded-full
                        transition-all
                        duration-300
                        ${
                          selectedIndex === dotIndex
                            ? "w-8 bg-primary"
                            : "w-1.5 bg-muted-foreground/30"
                        }
                      `}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// PRODUCT SECTION
const ProductSection = ({
  title,
  subtitle,
  products,
}: {
  title: string;
  subtitle?: string;
  products: Product[];
}) => {
  if (!products.length) return null;

  return (
    <section
      className="
        mx-auto
        max-w-[1500px]
        px-4
        py-10
        sm:px-6
        lg:px-10
        lg:py-6
        xl:px-16
      "
    >
      <div className="mb-6 flex items-end justify-between gap-4">

        <div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-primary" />

            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              {title}
            </h2>
          </div>

          {subtitle && (
            <p className="mt-1.5 pl-3 text-xs text-muted-foreground sm:text-sm">
              {subtitle}
            </p>
          )}
        </div>

        <Link
          to="/products"
          className="
            group
            flex
            shrink-0
            items-center
            gap-1
            text-xs
            font-semibold
            text-primary
            sm:text-sm
          "
        >
          View All

          <ArrowRight
            size={15}
            className="transition group-hover:translate-x-1"
          />
        </Link>
      </div>

      <div
        className="
          grid
          grid-cols-2
          gap-3
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
          lg:gap-5
        "
      >
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
          />
        ))}
      </div>
    </section>
  );
};

// CATEGORY SECTION
const CategorySection = () => {
  return (
    <section
      className="
        mx-auto
        max-w-[1500px]
        px-4
        py-8
        sm:px-6
        lg:px-10
        lg:py-12
        xl:px-16
      "
    >
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-primary">
            Explore
          </p>

          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            Shop by Category
          </h2>
        </div>

        <Link
          to="/products"
          className="
            flex
            items-center
            gap-1
            text-xs
            font-semibold
            text-primary
            sm:text-sm
          "
        >
          All Categories
          <ArrowRight size={15} />
        </Link>
      </div>


      {/* MOBILE / TABLET HORIZONTAL */}

      <div
        className="
          flex
          gap-3
          overflow-x-auto
          pb-3
          scrollbar-hide
          lg:grid
          lg:grid-cols-4
          xl:grid-cols-8
        "
      >
        {categories.map((category, index) => {

          return (
            <Link
              key={category.name}
              to={`/products?category=${encodeURIComponent(
                category.name
              )}`}
              className="
                group
                relative
                min-w-[150px]
                overflow-hidden
                rounded-2xl
                border
                bg-card
                p-3
                transition
                duration-300
                hover:-translate-y-1
                hover:border-primary/10
                hover:shadow-xl
                lg:min-w-0
                lg:p-4
              "
            >

              {/* Number */}

              <span
                className="
                  absolute
                  right-3
                  top-3
                  text-[10px]
                  font-bold
                  text-muted-foreground/40
                "
              >
                {String(index + 1).padStart(2, "0")}
              </span>


              {/* Image */}

              <div
                className="
                  flex
                  h-28
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-xl
                  bg-secondary
                  p-3
                  lg:h-32
                "
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="
                    h-full
                    w-full
                    object-contain
                    transition
                    duration-500
                    group-hover:scale-110
                  "
                />
              </div>


              {/* Details */}

              <div className="mt-3">
                <h3 className="text-sm font-semibold text-center">
                  {category.name}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};


// ============================================================
// DEAL BANNER
// ============================================================

const DealBanner = () => {
  const [dealRef] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
    },
    [
      Autoplay({
        delay: 5500,
        stopOnInteraction: false,
      }),
    ]
  );

  return (
    <section className="py-5 sm:py-8">
      <div
        ref={dealRef}
        className="overflow-hidden"
      >
        <div className="flex">
          {dealSlides.map((slide, index) => (
            <div
              key={index}
              className="
                min-w-full
                px-4
                sm:px-6
                lg:px-8
              "
            >
              <div
                className="
                  relative
                  mx-auto
                  flex
                  max-w-[1500px]
                  overflow-hidden
                  rounded-[2rem]
                  bg-foreground
                  text-background
                "
              >

                {/* Decorative circles */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    -right-20
                    -top-20
                    h-64
                    w-64
                    rounded-full
                    bg-primary/20
                    blur-3xl
                  "
                />

                <div
                  className="
                    pointer-events-none
                    absolute
                    -bottom-24
                    left-1/3
                    h-56
                    w-56
                    rounded-full
                    bg-primary/10
                    blur-3xl
                  "
                />


                <div
                  className="
                    relative
                    z-10
                    flex
                    w-full
                    flex-col
                    sm:flex-row
                    sm:items-center
                  "
                >

                  {/* Text */}

                  <div
                    className="
                      flex-1
                      px-6
                      py-9
                      sm:px-10
                      lg:px-16
                      lg:py-14
                    "
                  >
                    <div className="flex items-center gap-2">
                      <Zap
                        size={15}
                        className="text-primary"
                        fill="currentColor"
                      />

                      <span
                        className="
                          text-[10px]
                          font-bold
                          tracking-[0.2em]
                          text-primary
                        "
                      >
                        {slide.label}
                      </span>
                    </div>

                    <h2
                      className="
                        mt-3
                        text-3xl
                        font-bold
                        tracking-tight
                        sm:text-4xl
                        lg:text-5xl
                      "
                    >
                      {slide.title}
                    </h2>

                    <p
                      className="
                        mt-3
                        max-w-lg
                        text-sm
                        leading-6
                        text-background/60
                        sm:text-base
                      "
                    >
                      {slide.description}
                    </p>

                    <Link
                      to={slide.link}
                      className="
                        group
                        mt-6
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        bg-background
                        px-5
                        py-3
                        text-sm
                        font-semibold
                        text-foreground
                        transition
                        hover:-translate-y-0.5
                      "
                    >
                      {slide.button}

                      <ArrowRight
                        size={16}
                        className="transition group-hover:translate-x-1"
                      />
                    </Link>
                  </div>


                  {/* Image */}

                  <div
                    className="
                      flex
                      h-60
                      flex-1
                      items-center
                      justify-center
                      px-6
                      pb-6
                      sm:h-64
                      sm:px-8
                      sm:pb-0
                      lg:h-80
                    "
                  >
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="
                        relative
                        z-10
                        h-full
                        w-full
                        object-contain
                        drop-shadow-2xl
                        transition
                        duration-500
                        hover:scale-105
                      "
                    />
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


// ============================================================
// BRANDS
// ============================================================

const BrandSection = () => {
  return (
    <section
      className="
        border-y
        bg-secondary/30
        py-10
        sm:py-12
      "
    >
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10 xl:px-16">

        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-primary">
              Trusted names
            </p>

            <h2 className="text-xl font-bold sm:text-2xl">
              Shop Top Brands
            </h2>
          </div>

          <Link
            to="/products"
            className="
              flex
              items-center
              gap-1
              text-xs
              font-semibold
              text-primary
              sm:text-sm
            "
          >
            Explore Brands
            <ArrowRight size={15} />
          </Link>
        </div>


        {/* IMPORTANT:
            No grayscale.
            No opacity reduction.
            Original logo colors are preserved.
        */}

        <div
          className="
            grid
            grid-cols-2
            gap-3
            sm:grid-cols-4
            lg:grid-cols-8
          "
        >
          {brands.map((brand) => (
            <Link
              key={brand.name}
              to={`/products?brand=${encodeURIComponent(
                brand.name
              )}`}
              className="
                group
                flex
                h-24
                items-center
                justify-center
                rounded-2xl
                border
                bg-background
                p-5
                transition
                duration-300
                hover:-translate-y-1
                hover:border-primary/30
                hover:shadow-lg
              "
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="
                  max-h-11
                  max-w-[110px]
                  w-auto
                  object-contain
                  transition
                  duration-300
                  group-hover:scale-105
                "
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};


// ============================================================
// NEWSLETTER
// ============================================================

const Newsletter = () => {
  return (
    <section
      className="
        mx-auto
        max-w-[1500px]
        px-4
        py-10
        sm:px-6
        lg:px-10
        lg:py-14
        xl:px-16
      "
    >
      <div
        className="
          relative
          overflow-hidden
          rounded-[2rem]
          border
          bg-card
          px-6
          py-10
          sm:px-10
          lg:px-16
        "
      >

        {/* Decorative glow */}

        <div
          className="
            pointer-events-none
            absolute
            -right-20
            -top-20
            h-64
            w-64
            rounded-full
            bg-primary/10
            blur-3xl
          "
        />

        <div
          className="
            relative
            z-10
            flex
            flex-col
            gap-7
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <div className="max-w-xl">
            <div className="mb-3 flex items-center gap-2 text-primary">
              <Mail size={17} />

              <span className="text-xs font-bold uppercase tracking-wider">
                Stay in the loop
              </span>
            </div>

            <h2
              className="
                text-2xl
                font-bold
                tracking-tight
                sm:text-3xl
              "
            >
              Get the latest deals & tech drops.
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Subscribe for new arrivals, exclusive offers and
              useful gadget updates.
            </p>
          </div>


          <div className="w-full max-w-lg">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Mail
                  size={16}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-muted-foreground
                  "
                />

                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    bg-background
                    pl-11
                    pr-4
                    text-sm
                    outline-none
                    transition
                    focus:border-primary
                    focus:ring-4
                    focus:ring-primary/10
                  "
                />
              </div>

              <button
                type="button"
                className="
                  h-12
                  rounded-xl
                  bg-primary
                  px-6
                  text-sm
                  font-semibold
                  text-primary-foreground
                  transition
                  hover:opacity-90
                  sm:shrink-0
                "
              >
                Subscribe
              </button>
            </div>

            <p className="mt-2 text-[10px] text-muted-foreground">
              By subscribing, you agree to receive updates from <span className="font-semibold">AESTRA</span> gadgets.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};


// ============================================================
// FOOTER
// ============================================================

const Footer = () => {
  return (
    <footer className="border-t bg-secondary/20">

      <div
        className="
          mx-auto
          max-w-[1500px]
          px-4
          py-12
          sm:px-6
          lg:px-10
          lg:py-8
        "
      >

        <div
          className="
            grid
            gap-10
            sm:grid-cols-2
            lg:grid-cols-[1.5fr_1fr_1fr_1fr]
          "
        >

          {/* BRAND */}

          <div>
            <Link to="/">
              <img
                src="/AESTRA LOGO-navbar.png"
                alt="AMO-TECH"
                className="h-8 w-auto object-contain"
              />
            </Link>

            <p
              className="
                mt-4
                max-w-sm
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Your trusted destination for smartphones,
              laptops, audio devices, accessories and the
              latest technology.
            </p>

            <div className="mt-5 space-y-1 text-sm text-muted-foreground">
              <p>help@aestra-tech.com</p>
              <p>+234 812 345 6789</p>
            </div>
          </div>


          {/* SHOP */}

          <div>
            <h3 className="text-sm font-semibold">
              Shop
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
              <Link
                to="/products"
                className="transition hover:text-primary"
              >
                All Products
              </Link>

              <Link
                to="/products?sort=newest"
                className="transition hover:text-primary"
              >
                New Arrivals
              </Link>

              <Link
                to="/products?sort=deals"
                className="transition hover:text-primary"
              >
                Deals
              </Link>

              <Link
                to="/wishlist"
                className="transition hover:text-primary"
              >
                Wishlist
              </Link>

              <Link
                to="/cart"
                className="transition hover:text-primary"
              >
                Cart
              </Link>
            </div>
          </div>


          {/* CUSTOMER */}

          <div>
            <h3 className="text-sm font-semibold">
              Customer
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
              <Link
                to="/dashboard"
                className="transition hover:text-primary"
              >
                My Account
              </Link>

              <Link
                to="/orders"
                className="transition hover:text-primary"
              >
                My Orders
              </Link>

              <Link
                to="/track-order"
                className="transition hover:text-primary"
              >
                Track Order
              </Link>

              <Link
                to="/contact"
                className="transition hover:text-primary"
              >
                Contact Us
              </Link>

              <Link
                to="/faq"
                className="transition hover:text-primary"
              >
                FAQs
              </Link>
            </div>
          </div>


          {/* INFORMATION + SELLER */}

          <div>
            <h3 className="text-sm font-semibold">
              Information
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">

              <Link
                to="/about"
                className="transition hover:text-primary"
              >
                About Us
              </Link>

              <Link
                to="/privacy"
                className="transition hover:text-primary"
              >
                Privacy Policy
              </Link>

              <Link
                to="/terms"
                className="transition hover:text-primary"
              >
                Terms & Conditions
              </Link>

              {/* SELLER LINK ONLY IN FOOTER */}

              <Link
                to="/seller/register"
                className="
                  group
                  mt-1
                  flex
                  items-center
                  gap-1.5
                  font-semibold
                  text-primary
                "
              >
                Become a Seller

                <ArrowUpRight
                  size={14}
                  className="
                    transition
                    group-hover:translate-x-0.5
                    group-hover:-translate-y-0.5
                  "
                />
              </Link>
            </div>
          </div>
        </div>


        {/* BOTTOM */}

        <div
          className="
            mt-10
            flex
            flex-col
            gap-3
            border-t
            pt-5
            text-center
            text-xs
            text-muted-foreground
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:text-left
          "
        >
          <p>
            © 2026 AMO-TECH. All rights reserved.
          </p>

          <div className="flex items-center justify-center gap-4 sm:justify-end">
            <Link
              to="/privacy"
              className="transition hover:text-primary"
            >
              Privacy
            </Link>

            <Link
              to="/terms"
              className="transition hover:text-primary"
            >
              Terms
            </Link>

            <Link
              to="/contact"
              className="transition hover:text-primary"
            >
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};


// ============================================================
// MAIN PAGE
// ============================================================

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [activeTab, setActiveTab] = useState<
    "new" | "best" | "trending"
  >("new");


  // ==========================================================
  // FETCH PRODUCTS
  // ==========================================================

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("/products");

      // Support both:
      // { data: [...] }
      // and [...]
      const productsData = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      const transformed: Product[] = productsData.map(
        (product: any) => ({
          id: Number(product.id),
          name: product.name,
          price: Number(product.price),
          tag: product.tag,

          image: product.images?.length
            ? `https://aestra.onrender.com${product.images[0].image_url}`
            : "/placeholder.png",

          brand: {
            name: product.brand?.name,
            logo_url: product.brand?.logo_url,
          },

          rating: product.rating ?? null,
          reviews_count: product.reviews_count ?? 0,

          condition:
            product.condition === "original"
              ? "Original"
              : "Refurbished",

          grade: product.grade,

          discount_percentage:
            Number(product.discount_percentage) || 0,
        })
      );

      setProducts(transformed);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const featuredProducts = products.slice(0, 4);

  const newArrivalProducts = products
    .filter(
      (product) => product.tag === "New Arrival"
    )
    .slice(0, 4);

  const bestSellerProducts = products
    .filter(
      (product) => product.tag === "Best Seller"
    )
    .slice(0, 4);

  const trendingProducts = products
    .filter(
      (product) => product.tag === "Trending"
    )
    .slice(0, 4);

  const displayedProducts =
    activeTab === "new"
      ? newArrivalProducts
      : activeTab === "best"
      ? bestSellerProducts
      : trendingProducts;


  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Navbar />
      <HeroCarousel
        search={search}
        setSearch={setSearch}
      />

      {/* PERKS */}
      <section className="px-4 sm:px-6 lg:px-10 xl:px-16">
        <div
          className="
            mx-auto
            max-w-[1500px]
            overflow-hidden
            rounded-2xl
            border
            bg-card
            shadow-sm
          "
        >
          <div
            className="
              flex
              overflow-x-auto
              scrollbar-hide
              lg:grid
              lg:grid-cols-4
            "
          >
            {perks.map((perk) => (
              <div
                key={perk.title}
                className="
                  flex
                  min-w-[235px]
                  flex-1
                  items-center
                  gap-3
                  border-r
                  px-5
                  py-5
                  last:border-r-0
                  lg:min-w-0
                  lg:justify-center
                "
              >
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-primary/10
                  "
                >
                  <perk.icon
                    size={20}
                    className="text-primary"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-semibold">
                    {perk.title}
                  </h3>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {perk.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CategorySection />
      
      {/* FEATURED PRODUCTS */}

      {!loading ? (
        <ProductSection
          title="Featured Products"
          subtitle="Handpicked gadgets worth checking out."
          products={featuredProducts}
        />
      ) : (
        <section className="py-16 text-center text-sm text-muted-foreground">
          Loading products...
        </section>
      )}


      {/* =====================================================
          DEAL BANNER
      ===================================================== */}

      <DealBanner />


      {/* =====================================================
          DISCOVER PRODUCTS
      ===================================================== */}

      <section
        className="
          mx-auto
          max-w-[1500px]
          px-4
          py-10
          sm:px-6
          lg:px-10
          lg:py-14
          xl:px-16
        "
      >

        {/* Header */}

        <div
          className="
            mb-7
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <div className="flex items-center gap-2">
              <Sparkles
                size={19}
                className="text-primary"
              />

              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                Discover More
              </h2>
            </div>

            <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">
              Find something you'll love.
            </p>
          </div>


          {/* Tabs */}

          <div
            className="
              flex
              w-fit
              max-w-full
              overflow-x-auto
              rounded-full
              bg-secondary
              p-1
              scrollbar-hide
            "
          >
            <button
              type="button"
              onClick={() => setActiveTab("new")}
              className={`
                whitespace-nowrap
                rounded-full
                px-4
                py-2
                text-xs
                font-semibold
                transition
                sm:text-sm
                ${
                  activeTab === "new"
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              New Arrivals
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("best")}
              className={`
                whitespace-nowrap
                rounded-full
                px-4
                py-2
                text-xs
                font-semibold
                transition
                sm:text-sm
                ${
                  activeTab === "best"
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              Best Sellers
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("trending")}
              className={`
                whitespace-nowrap
                rounded-full
                px-4
                py-2
                text-xs
                font-semibold
                transition
                sm:text-sm
                ${
                  activeTab === "trending"
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              Trending
            </button>
          </div>
        </div>


        {/* Products */}

        {!loading && displayedProducts.length > 0 ? (
          <div
            className="
              grid
              grid-cols-2
              gap-3
              sm:grid-cols-2
              md:grid-cols-3
              lg:grid-cols-4
              lg:gap-5
            "
          >
            {displayedProducts.map(
              (product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                />
              )
            )}
          </div>
        ) : !loading ? (
          <div
            className="
              rounded-2xl
              border
              bg-card
              px-5
              py-16
              text-center
            "
          >
            <Tag
              size={30}
              className="mx-auto text-muted-foreground/40"
            />

            <p className="mt-3 text-sm text-muted-foreground">
              No products available in this section yet.
            </p>

            <Link
              to="/products"
              className="
                mt-4
                inline-flex
                items-center
                gap-1
                text-sm
                font-semibold
                text-primary
              "
            >
              Browse all products
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : null}
      </section>

      <BrandSection />
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Index;