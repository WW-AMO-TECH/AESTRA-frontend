import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  ArrowRight,
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Truck,
  Shield,
  CreditCard,
  Headset,
} from "lucide-react";
import { motion } from "framer-motion";

import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import axios from "@/api/axios";
import { useAuth } from "@/context/AuthContext";

const categories = [
  {
    name: "Phones",
    icon: Smartphone,
    img: "/hero-phone.png",
  },
  {
    name: "Laptops",
    icon: Laptop,
    img: "/hero-laptop.png",
  },
  {
    name: "Headphones",
    icon: Headphones,
    img: "/hero-headphones.png",
  },
  {
    name: "Smart Watches",
    icon: Watch,
    img: "/hero-watch.png",
  },
  {
    name: "Phones",
    icon: Smartphone,
    img: "/hero-phone.png",
  },
  {
    name: "Laptops",
    icon: Laptop,
    img: "/hero-laptop.png",
  },
];

const perks = [
  {
    icon: Truck,
    title: "Free Shipping",
    desc: "On selected orders",
  },
  {
    icon: Shield,
    title: "Warranty",
    desc: "Up to 1 year coverage",
  },
  {
    icon: CreditCard,
    title: "Secure Payment",
    desc: "Safe & encrypted",
  },
  {
    icon: Headset,
    title: "24/7 Support",
    desc: "Always available",
  },
];

const promoSlides = [
  {
    title: "Hot Deals",
    subtitle: "Deal Of The Week",
    description: "Save up to 30% on selected gadgets and accessories.",
    button: "Shop Deals",
    link: "/products?sort=deals",
    bg: "bg-black",
    text: "text-white",
    image: "/images/banners/hot-deals.png",
  },
  {
    title: "Hot Deals",
    subtitle: "Deal Of The Week",
    description: "Save up to 30% on selected gadgets and accessories.",
    button: "Shop Deals",
    link: "/products?sort=deals",
    bg: "bg-black",
    text: "text-white",
    image: "/images/banners/hot-deals.png",
  },
  {
    title: "Hot Deals",
    subtitle: "Deal Of The Week",
    description: "Save up to 30% on selected gadgets and accessories.",
    button: "Shop Deals",
    link: "/products?sort=deals",
    bg: "bg-black",
    text: "text-white",
    image: "/images/banners/hot-deals.png",
  },
];

const brands = [
  {
    name: "Apple",
    logo: "/apple.svg",
  },
  {
    name: "Samsung",
    logo: "/samsung.svg",
  },
  {
    name: "Google",
    logo: "/google.svg",
  },
  {
    name: "HP",
    logo: "/hp.svg",
  },
  {
    name: "Dell",
    logo: "/dell.svg",
  },
  {
    name: "Lenovo",
    logo: "/lenovo.avif",
  },
  {
    name: "Sony",
    logo: "/sony.svg",
  },
  {
    name: "JBL",
    logo: "/jbl.svg",
  },
];

const Index = () => {
  const { user } = useAuth();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const heroSlides = [
    {
      badge: "New Collection",
      title: "Upgrade Your\nTech Lifestyle",
      description:
        "Discover premium gadgets and smart devices at unbeatable prices.",
      image: "/hero-phone.png",
      button: "Shop Phones",
      link: "/products?category=Phones",
    },
    {
      badge: "Student Deal",
      title: "MacBook Air M3\nNow Available",
      description:
        "Powerful performance and all-day battery life for work and school.",
      image: "/hero-laptop.png",
      button: "Shop Laptops",
      link: "/products?category=Laptops",
    },
    {
      badge: "Limited Offer",
      title: "Experience\nPremium Audio",
      description:
        "Enjoy immersive sound with industry-leading headphones.",
      image: "/hero-headphones.png",
      button: "Shop Audio",
      link: "/products?category=Headphones",
    },
    {
      badge: "Trending",
      title: "Smart Watches\nFor Every Lifestyle",
      description:
        "Stay connected, track fitness and look stylish everywhere.",
      image: "/hero-watch.png",
      button: "Shop Watches",
      link: "/products?category=Smart Watches",
    },
  ];

  const HeroCarousel = () => {
    const [emblaRef, emblaApi] = useEmblaCarousel(
      { loop: true },
      [Autoplay({ delay: 5000, stopOnInteraction: false })]
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
      <section className="bg-background py-3 overflow-hidden">
        <div className="md:px-10 lg:px-16">

          {/* Carousel */}
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">

              {heroSlides.map((slide, index) => (
                <div
                  key={index}
                  className="flex-[0_0_100%] min-w-0"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative">

                    {/* LEFT (TEXT) */}
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="relative z-10 text-center lg:text-left px-2 sm:px-4 lg:px-0"
                    >
                      <span className="text-primary uppercase font-semibold text-sm md:text-base">
                        {slide.badge}
                      </span>

                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mt-3 leading-tight whitespace-pre-line">
                        {slide.title}
                      </h1>

                      <p className="text-muted-foreground mt-5 max-w-md mx-auto lg:mx-0 text-sm sm:text-base">
                        {slide.description}
                      </p>

                      <div className="flex justify-center lg:justify-start gap-4 mt-6 ml-2">
                        <Link
                          to={slide.link}
                          className="btn-primary-glow flex items-center gap-1"
                        >
                          {slide.button}
                          <ArrowRight size={18} />
                        </Link>
                      </div>
                    </motion.div>

                    {/* RIGHT (IMAGE) */}
                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex justify-center relative"
                    >
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="
                          w-full
                          max-w-[320px] sm:max-w-[400px] md:max-w-[480px] lg:max-w-[520px]
                          max-h-[420px] md:max-h-[500px]
                          object-contain
                        "
                      />
                    </motion.div>

                  </div>
                </div>
              ))}

            </div>
          </div>

          {/* DOTS */}
          {/* <div className="flex justify-center gap-2 mt-6 md:mt-8">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`
                  h-2 rounded-full transition-all duration-300
                  ${selectedIndex === index
                    ? "w-8 bg-primary"
                    : "w-2 bg-gray-300"
                  }
                `}
              />
            ))}
          </div> */}

        </div>
      </section>
    );
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("/products");

      const transformed = response.data.data.map(
        (product: any) => ({
          id: product.id,
          name: product.name,
          price: Number(product.price),

          tag: product.tag,

          image: product.images?.length
            ? `http://127.0.0.1:8000${product.images[0].image_url}`
            : "/placeholder.png",

          brand: {
            name: product.brand?.name,
          },

          rating: 5,

          condition:
            product.condition === "original"
              ? "Original"
              : "Refurbished",

          grade: product.grade,

          discount_percentage:
            product.discount_percentage,
        })
      );

      setProducts(transformed);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const featuredProducts = products.slice(0, 4);

  const bestSellerProducts = products
    .filter(product => product.tag === "Best Seller")
    .slice(0, 4);

  const newArrivalProducts = products
    .filter(product => product.tag === "New Arrival")
    .slice(0, 4);

  const trendingProducts = products
    .filter(product => product.tag === "Trending")
    .slice(0, 4);

  const [activeTab, setActiveTab] = useState<
    "new" | "best" | "trending"
  >("new");

  const displayedProducts =
    activeTab === "new"
      ? newArrivalProducts
      : activeTab === "best"
      ? bestSellerProducts
      : trendingProducts;


  const [promoRef] = useEmblaCarousel(
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <HeroCarousel />

      {/* PERKS */}
      <section className="border mx-5 rounded-2xl border-primary bg-primary/10 shadow-xl">
        <div className="container mx-auto px-4 py-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

            {perks.map((perk) => (
              <div
                key={perk.title}
                className="flex gap-4 items-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <perk.icon className="text-primary" />
                </div>

                <div>
                  <h4 className="font-semibold">
                    {perk.title}
                  </h4>

                  <p className="text-sm text-muted-foreground">
                    {perk.desc}
                  </p>
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>

        {/* BRANDS */}
        <section className="py-14 overflow-hidden">

          <div className="overflow-hidden relative py-2">

            <motion.div
              className="flex items-center gap-16 w-max"
              animate={{
                x: ["0%", "-50%"],
              }}
              transition={{
                duration: 25,
                ease: "linear",
                repeat: Infinity,
              }}
            >
              {[...brands, ...brands].map((brand, index) => (
                <Link
                  key={`${brand.name}-${index}`}
                  to={`/products?brand=${encodeURIComponent(brand.name)}`}
                  className="flex-shrink-0"
                >
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="h-10 md:h-12 lg:h-14 w-auto object-contain hover:scale-110 transition-all duration-300"
                  />
                </Link>
              ))}
            </motion.div>

          </div>

        </section>

        {/* CATEGORIES */}
        <section className="container mx-auto px-4 pt-8 pb-10">

          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">
              Shop By Category
            </h2>

            <Link
              to="/products"
              className="font-bold text-primary text-sm gap-1"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">

            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/products?category=${category.name}`}
                className="border rounded-2xl p-4 hover:shadow-lg bg-secondary transition text-center"
              >
                <div className="w-25 h-20 mx-auto flex items-center justify-center">
                  {category.img ? (
                    <img
                      src={category.img}
                      alt={category.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <category.icon className="text-primary" size={30} />
                  )}
                </div>

                <h3 className="font-semibold text-sm mt-2">
                  {category.name}
                </h3>
              </Link>
            ))}

          </div>
        </section>

        {/* FEATURED PRODUCTS */}
        <section className="container mx-auto px-4 py-8">

          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">
              Featured Products
            </h2>

            <Link
              to="/products"
              className="font-bold text-primary text-sm gap-1"
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-10">
              Loading products...
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredProducts.map(
                (product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                  />
                )
              )}
            </div>
          )}
        </section>

        {/* PROMO BANNER */}
        <section className="py-10">
          <div className="overflow-hidden" ref={promoRef}>
            <div className="flex">
              {promoSlides.map((slide, index) => (
                <div key={index} className="min-w-full">
                  <div
                      className={`${slide.bg} ${slide.text} px-6 py-6 md:py-8`}
                  >
                    <div className="grid lg:grid-cols-2 gap-10 items-center">

                      {/* LEFT */}
                      <div>
                        <p className="text-primary font-medium uppercase mb-3">
                          {slide.subtitle}
                        </p>

                        <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-5">
                          {slide.title}
                        </h2>

                        <p className="text-white/80 text-lg mb-8 max-w-lg">
                          {slide.description}
                        </p>

                        <Link
                          to={slide.link}
                          className="inline-flex bg-white text-black px-8 py-3 rounded-xl font-medium hover:scale-105 transition"
                        >
                          {slide.button}
                        </Link>
                      </div>

                      {/* RIGHT */}
                      <div className="flex justify-center lg:justify-end">
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-64 md:w-80 lg:w-[420px] object-contain"
                        />
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* OTHER TAGS */}
        <section className="container mx-auto px-4 py-2">

          <div className="flex flex-col lg:flex-row items-center justify-between gap-5 mb-8">

            {/* Empty spacer to keep the tabs centered on large screens */}
            <div className="hidden lg:block w-32" />

            {/* Tabs */}
            <div className="flex bg-secondary rounded-full p-1 overflow-x-auto">

              <button
                onClick={() => setActiveTab("new")}
                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  activeTab === "new"
                    ? "bg-primary text-white shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                New Arrival
              </button>

              <button
                onClick={() => setActiveTab("best")}
                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  activeTab === "best"
                    ? "bg-primary text-white shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Best Seller
              </button>

              <button
                onClick={() => setActiveTab("trending")}
                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  activeTab === "trending"
                    ? "bg-primary text-white shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Trending
              </button>

            </div>

            {/* View All */}
            <Link
              to="/products"
              className="text-primary font-bold hover:underline whitespace-nowrap"
            >
              View All →
            </Link>

          </div>

          {loading ? (
            <div className="text-center py-10">
              Loading products...
            </div>
          ) : (
            <>
              {activeTab === "new" && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                  {newArrivalProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                    />
                  ))}
                </div>
              )}

              {activeTab === "best" && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                  {bestSellerProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                    />
                  ))}
                </div>
              )}

              {activeTab === "trending" && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                  {trendingProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </>
          )}

        </section>

      {/* FOOTER */}
      <footer className="border-t mt-4 bg-secondary/20">
        <div className="container mx-auto py-5">
          <div className="grid md:grid-cols-5 gap-2">
            <div>
              <h3>
                <img className="h-8 w-25" src="src/assets/AESTRA LOGO-navbar.png" alt=""/>
              </h3>

              <p className="text-muted-foreground mt-3">
                Your trusted destination for
                premium gadgets and smart
                devices.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">
                Shop
              </h4>

              <div className="flex flex-col gap-2">
                <Link to="/products">
                  Products
                </Link>

                <Link to="/cart">
                  Cart
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">
                Account
              </h4>

              <div className="flex flex-col gap-2">
                <Link to="/dashboard">
                  Dashboard
                </Link>

                <Link to="/wishlist">
                  Wishlist
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">
                Contact
              </h4>

              <p>help@aestra-tech.com</p>
              <p>+234 812 345 6789</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">
                Stay Updated
              </h4>

              <p className="text-sm text-muted-foreground mb-4">
                Subscribe for exclusive offers, new arrivals
                and tech updates.
              </p>

              <div className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="
                    w-full
                    rounded-xl
                    border
                    px-4
                    py-3
                    bg-background
                    focus:outline-none
                    focus:ring-2
                    focus:ring-primary
                  "
                />

                <button className="btn-primary-glow">
                  Subscribe
                </button>
              </div>
            </div>

          </div>

          <div className="border-t mt-10 pt-6 text-center text-sm text-muted-foreground">
            © 2026 AESTRA TECH. All rights reserved.
          </div>

        </div>
      </footer>
    </div>
  );
};

export default Index;