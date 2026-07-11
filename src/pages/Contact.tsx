import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, Shield, Award, Headset, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";

const faqs = [
  { q: "How long does delivery take?", a: "Delivery within Lagos takes 1-2 business days. Other states in Nigeria take 3-5 business days. Same-day delivery is available for select items in Lagos." },
  { q: "Do you offer returns?", a: "Yes! We offer a 7-day return policy for all products in their original condition. Refurbished items have a 3-day return window." },
  { q: "Are your products original?", a: "All products labeled 'Original' are brand new and sourced directly from authorized distributors. Refurbished items are clearly labeled and thoroughly tested." },
  { q: "What payment methods do you accept?", a: "We accept card payments (Visa, Mastercard) and bank transfers. All payments are secured with 256-bit SSL encryption." },
  { q: "How does your warranty work?", a: "Each product comes with a warranty period (6 months or 1 year) as stated on the product page. Warranty covers manufacturing defects but not physical damage." },
  { q: "Can I pick up my order?", a: "Yes! We have pickup locations in Lagos (Ikeja City Mall, Computer Village) and Abuja (Wuse Market). Select 'Pickup' during checkout." },
  { q: "How do I track my order?", a: "Once your order is confirmed, you can track it from your Dashboard under the 'Tracking' tab. You'll receive status updates via email." },
  { q: "Do you ship outside Nigeria?", a: "Currently, we only ship within Nigeria. We're working on expanding to other West African countries soon." },
];

const trustPoints = [
  { icon: Shield, title: "100% Secure Payments", desc: "All transactions are encrypted with 256-bit SSL. Your financial data is never stored on our servers." },
  { icon: Award, title: "Verified Authentic Products", desc: "Every product goes through a rigorous authentication process. We guarantee genuine items or your money back." },
  { icon: Headset, title: "24/7 Customer Support", desc: "Our support team is available around the clock via phone, email, and live chat to assist you." },
  { icon: Clock, title: "Fast & Reliable Delivery", desc: "Same-day delivery in Lagos, 1-2 days across major cities. We partner with trusted logistics providers." },
];

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [activeSection, setActiveSection] = useState<"contact" | "trust" | "faq">("contact");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="py-10 md:py-14" style={{ background: "var(--gradient-hero)" }}>
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-2xl md:text-4xl font-bold text-primary-foreground mb-2">Get In Touch</h1>
            <p className="text-muted text-sm max-w-md mx-auto">Have a question, feedback, or need help? We're here for you.</p>
          </motion.div>
        </div>
      </section>

      {/* Section Tabs */}
      <div className="container mx-auto px-4 pt-6">
        <div className="flex gap-2 border-b border-border pb-3 overflow-x-auto">
          {([
            { id: "contact" as const, label: "Contact Us", icon: MessageCircle },
            { id: "trust" as const, label: "Trust & Support", icon: Shield },
            { id: "faq" as const, label: "FAQ", icon: ChevronDown },
          ]).map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${activeSection === s.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>
              <s.icon className="w-3.5 h-3.5" /> {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

        {/* Contact Us */}
        {activeSection === "contact" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-lg font-bold mb-4">Contact Information</h2>
                <div className="space-y-4">
                  {[
                    { icon: Mail, label: "Email", value: "help@aestra-tech.com", sub: "We respond within 24 hours" },
                    { icon: Phone, label: "Phone", value: "+234 (0) 812 345 6789", sub: "Mon-Sat, 8am - 8pm WAT" },
                    { icon: MapPin, label: "Address", value: "Ikeja City Mall, Lagos", sub: "Visit our showroom" },
                    { icon: Clock, label: "Business Hours", value: "Mon - Sat: 8am - 8pm", sub: "Sunday: 10am - 4pm" },
                  ].map(item => (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold">{item.label}</p>
                        <p className="text-sm font-medium">{item.value}</p>
                        <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map placeholder */}
              <div className="glass-card p-4 rounded-2xl">
                <div className="aspect-video bg-secondary/50 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Ikeja City Mall, Lagos, Nigeria</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="glass-card p-5 md:p-6 rounded-2xl h-fit">
              <h2 className="font-display text-lg font-bold mb-4">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-medium mb-1 block">Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="Your name" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputCls} placeholder="your@email.com" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Subject</label>
                  <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className={inputCls} placeholder="What's this about?" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Message *</label>
                  <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className={`${inputCls} min-h-[120px]`} placeholder="Tell us how we can help..." />
                </div>
                <button type="submit" className="btn-primary-glow text-sm w-full flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Trust & Support */}
        {activeSection === "trust" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="font-display text-lg font-bold mb-6 text-center">Why Trust AESTRA-TECH?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {trustPoints.map(t => (
                <div key={t.title} className="glass-card p-5 rounded-2xl text-center">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <t.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-sm mb-1">{t.title}</h3>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </div>
              ))}
            </div>

            <div className="glass-card p-5 md:p-8 rounded-2xl max-w-2xl mx-auto text-center">
              <h3 className="font-display font-bold text-base mb-2">Our Commitment</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                At AESTRA-TECH, customer satisfaction is our top priority. We ensure every product is genuine, every transaction is secure, and every customer is supported. With over 10,000 happy customers across Nigeria, we're building the most trusted tech marketplace in West Africa.
              </p>
            </div>
          </motion.div>
        )}

        {/* FAQ */}
        {activeSection === "faq" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
            <h2 className="font-display text-lg font-bold mb-6 text-center">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="glass-card rounded-xl border-none px-4">
                  <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground pb-3">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="glass-card p-5 rounded-2xl mt-8 text-center">
              <p className="text-sm font-medium mb-1">Still have questions?</p>
              <p className="text-xs text-muted-foreground mb-3">Our support team is ready to help.</p>
              <button onClick={() => setActiveSection("contact")} className="btn-primary-glow text-xs">Contact Support</button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Contact;