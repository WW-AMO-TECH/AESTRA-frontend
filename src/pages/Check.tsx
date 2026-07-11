import { Link } from "react-router-dom";
import { ArrowRight, Smartphone, Laptop, Headphones, Watch, Shield, Truck, CreditCard, Headset, Zap, Star, BookOpen, ArrowUp } from "lucide-react";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState } from "react";

const flashDeals = [
  { title: "Up to 30% Off Premium Audio", desc: "Limited time offer on Sony & Bose headphones.", link: "/products?category=Audio", linkText: "Shop Audio", color: "var(--gradient-hero)" },
  { title: "iPhone 15 Pro Max — Save ₦300K", desc: "Flagship performance at an unbeatable price.", link: "/products?category=Phones", linkText: "Shop Phones", color: "linear-gradient(135deg, hsl(262 80% 30%), hsl(300 60% 25%))" },
  { title: "MacBook Air M3 — Student Deal", desc: "The perfect laptop for school and beyond.", link: "/products?category=Laptops", linkText: "Shop Laptops", color: "linear-gradient(135deg, hsl(200 80% 25%), hsl(220 70% 30%))" },
  { title: "Galaxy S24 Ultra — Limited Stock", desc: "AI-powered smartphone with titanium frame.", link: "/products?category=Phones", linkText: "Shop Now", color: "linear-gradient(135deg, hsl(340 70% 30%), hsl(20 80% 35%))" },
];

const FlashDealCarousel = ({ deals }: { deals: typeof flashDeals }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000, stopOnInteraction: false })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden rounded-2xl">
        <div className="flex">
          {deals.map((deal, i) => (
            <div key={i} className="flex-[0_0_100%] min-w-0">
              <div className="rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-4" style={{ background: deal.color }}>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Flash Deal</span>
                  </div>
                  <h3 className="font-display text-xl md:text-2xl font-bold text-primary-foreground mb-1">{deal.title}</h3>
                  <p className="text-muted text-xs">{deal.desc}</p>
                </div>
                <Link to={deal.link} className="btn-primary-glow whitespace-nowrap flex items-center gap-2 text-sm">{deal.linkText} <ArrowRight className="w-4 h-4" /></Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {deals.map((_, i) => (
          <button key={i} onClick={() => emblaApi?.scrollTo(i)} className={`w-2 h-2 rounded-full transition-all ${i === selectedIndex ? "bg-primary w-5" : "bg-muted-foreground/30"}`} />
        ))}
      </div>
    </div>
  );
};

const categories = [
  { name: "Phones", icon: Smartphone, count: 2 },
  { name: "Laptops", icon: Laptop, count: 2 },
  { name: "Audio", icon: Headphones, count: 2 },
  { name: "Wearables", icon: Watch, count: 1 },
];

const perks = [
  { icon: Truck, title: "Free Shipping", desc: `On orders over ${formatPrice(100000)}` },
  { icon: Shield, title: "Up to 1-Year Warranty", desc: "Full coverage included" },
  { icon: CreditCard, title: "Secure Payment", desc: "256-bit SSL encryption" },
  { icon: Headset, title: "24/7 Support", desc: "Always here to help" },
];

const testimonials = [
  { name: "Alex M.", role: "Tech Enthusiast", text: "AESTRA-TECH has the best prices for premium tech. My go-to store!", rating: 5 },
  { name: "Sarah K.", role: "Content Creator", text: "Fast shipping and authentic products. Couldn't ask for more.", rating: 5 },
  { name: "David R.", role: "Developer", text: "The MacBook Air I got was flawless. Great customer service too.", rating: 4 },
];

const Index = () => {
  const { user } = useAuth();
  const featured = products.filter(p => p.isNew || p.originalPrice).slice(0, 4);
  const bestSellers = [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 4);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[500px] md:min-h-[600px] flex items-center">
        <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-foreground/70" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-2xl mx-auto text-center">
            <span className="inline-block text-primary text-xs font-semibold tracking-widest uppercase mb-3">Next-Gen Tech</span>
            <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight mb-4 text-primary-foreground">
              Smart Gadgets for <span className="text-gradient">Smarter Living</span>
            </h1>
            <p className="text-sm md:text-base mb-6 text-muted">Discover cutting-edge technology at unbeatable prices. From flagship phones to premium audio — we've got your tech covered.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/products" className="btn-primary-glow flex items-center gap-2 text-sm">Shop Now <ArrowRight className="w-4 h-4" /></Link>
              {!user && (
                <Link to="/login" className="px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 border border-border/30 hover:bg-secondary/20 text-primary-foreground text-sm">Login</Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Perks Bar */}
      <section className="border-b border-border bg-secondary/30">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {perks.map((perk) => (
              <div key={perk.title} className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <perk.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold">{perk.title}</p>
                  <p className="text-[10px] text-muted-foreground">{perk.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="font-display text-xl md:text-2xl font-bold mb-6">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <Link key={cat.name} to={`/products?category=${cat.name}`} className="glass-card p-4 text-center hover-lift group">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/20 transition-colors">
                  <cat.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-sm">{cat.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{cat.count} products</p>
              </Link>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl md:text-2xl font-bold">Featured Products</h2>
            <Link to="/products" className="text-primary text-xs font-medium flex items-center gap-1 hover:gap-2 transition-all">View All <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          </div>
        </motion.div>
      </section>

      {/* Flash Deal Carousel */}
      <section className="container mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
          <FlashDealCarousel deals={flashDeals} />
        </motion.div>
      </section>

      {/* Best Sellers */}
      <section className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="font-display text-xl md:text-2xl font-bold mb-6">Best Sellers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          </div>
        </motion.div>
      </section>

      {/* Blog Preview */}
      <section className="bg-secondary/30 py-12">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl md:text-2xl font-bold flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" /> From Our Blog</h2>
              <Link to="/blog" className="text-primary text-xs font-medium flex items-center gap-1 hover:gap-2 transition-all">All articles <ArrowRight className="w-3 h-3" /></Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "How to Set Up Your New Phone", cat: "Setup Guide", img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=400&h=250&fit=crop" },
                { title: "Original vs Refurbished: What to Know", cat: "Buying Guide", img: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=400&h=250&fit=crop" },
                { title: "Top 20 Must-Have Apps", cat: "Tips & Tricks", img: "https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=400&h=250&fit=crop" },
              ].map(post => (
                <Link to="/blog" key={post.title} className="glass-card overflow-hidden hover-lift group">
                  <div className="aspect-video overflow-hidden">
                    <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{post.cat}</span>
                    <h3 className="font-display font-semibold text-xs mt-1.5 group-hover:text-primary transition-colors">{post.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="font-display text-xl md:text-2xl font-bold mb-6 text-center">What Our Customers Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {testimonials.map((t) => (
                <div key={t.name} className="glass-card p-4">
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">"{t.text}"</p>
                  <div>
                    <p className="font-semibold text-xs">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <div className="glass-card p-6 md:p-10 text-center max-w-2xl mx-auto">
            <h2 className="font-display text-xl md:text-2xl font-bold mb-2">Stay in the Loop</h2>
            <p className="text-muted-foreground text-xs mb-4">Get notified about new arrivals, exclusive deals, and tech updates.</p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input type="email" placeholder="Enter your email" className="flex-1 px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <button className="btn-primary-glow text-sm whitespace-nowrap">Subscribe</button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/30">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <h4 className="font-display font-semibold text-sm mb-3">AESTRA-TECH</h4>
              <p className="text-xs text-muted-foreground">Your one-stop shop for premium tech gadgets.</p>
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm mb-3">Quick Links</h4>
              <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                <Link to="/products" className="hover:text-foreground transition-colors">Products</Link>
                <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
                <Link to="/cart" className="hover:text-foreground transition-colors">Cart</Link>
                <button onClick={scrollToTop} className="hover:text-foreground transition-colors text-left flex items-center gap-1">
                  <ArrowUp className="w-3 h-3" /> Back to Top
                </button>
              </div>
            </div>
            {!user && (
              <div>
                <h4 className="font-display font-semibold text-sm mb-3">Account</h4>
                <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                  <Link to="/login" className="hover:text-foreground transition-colors">Login</Link>
                  <Link to="/signup" className="hover:text-foreground transition-colors">Sign Up</Link>
                </div>
              </div>
            )}
            {user && (
              <div>
                <h4 className="font-display font-semibold text-sm mb-3">Account</h4>
                <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                  <Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
                  <Link to="/cart" className="hover:text-foreground transition-colors">My Cart</Link>
                </div>
              </div>
            )}
            <div>
              <h4 className="font-display font-semibold text-sm mb-3">Support</h4>
              <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                <Link to="/contact" className="hover:text-foreground transition-colors">Contact Us</Link>
                <span>help@aestra-tech.com</span>
                <span>+234 (0) 812 345 6789</span>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-6 pt-6 text-center text-xs text-muted-foreground">
            © 2024 AESTRA-TECH. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;









