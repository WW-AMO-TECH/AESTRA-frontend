import { useState } from "react";
import { BookOpen, ChevronRight, ChevronLeft, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

const blogPosts = [
  {
    id: 1, title: "How to Set Up Your New Phone in 10 Minutes", category: "Setup Guide",
    excerpt: "Just unboxed your new smartphone? Follow this step-by-step guide to get it fully set up — from SIM transfer to app migration.",
    date: "2024-03-15", readTime: "5 min",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=600&h=400&fit=crop",
    content: `## Getting Started\n\nCongratulations on your new phone! Here's how to set it up in just 10 minutes.\n\n### Step 1: Insert Your SIM Card\nLocate the SIM tray (usually on the side), use the ejector tool, and carefully place your SIM card.\n\n### Step 2: Power On & Initial Setup\nFollow the on-screen prompts to select your language, connect to Wi-Fi, and agree to terms.\n\n### Step 3: Transfer Your Data\n- **iPhone to iPhone:** Use Quick Start or iCloud backup\n- **Android to Android:** Use Google's data transfer tool\n- **Cross-platform:** Use the manufacturer's migration app\n\n### Step 4: Set Up Biometrics\nRegister your fingerprint or face ID for quick and secure access.\n\n### Step 5: Install Essential Apps\nHead to the App Store or Play Store and install your must-have apps. Check out our "Top 20 Apps" article for recommendations!\n\n### Step 6: Customize Your Home Screen\nArrange your apps, set your wallpaper, and configure notification settings.\n\n### Pro Tips\n- Enable automatic backups immediately\n- Set up "Find My Device" for security\n- Disable unnecessary notifications to save battery\n- Update your OS to the latest version`,
  },
  {
    id: 2, title: "Top 20 Must-Have Apps to Install on Any New Phone", category: "Tips & Tricks",
    excerpt: "From productivity boosters to entertainment essentials, these are the apps every smartphone user needs.",
    date: "2024-03-10", readTime: "7 min",
    image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=600&h=400&fit=crop",
    content: `## Essential Apps for Every Smartphone\n\n### Productivity\n1. **Notion** - All-in-one workspace for notes, tasks, and databases\n2. **Google Drive** - Cloud storage and document editing\n3. **Todoist** - Task management made simple\n4. **Microsoft Outlook** - Professional email management\n\n### Communication\n5. **WhatsApp** - Messaging and video calls\n6. **Telegram** - Fast, secure messaging\n7. **Zoom** - Video conferencing\n\n### Finance\n8. **Your bank's app** - Mobile banking\n9. **Google Pay / Apple Pay** - Contactless payments\n\n### Entertainment\n10. **Spotify** - Music streaming\n11. **Netflix** - Video streaming\n12. **YouTube** - Video content\n\n### Health & Fitness\n13. **MyFitnessPal** - Calorie tracking\n14. **Strava** - Activity tracking\n\n### Utilities\n15. **Google Maps** - Navigation\n16. **1Password** - Password manager\n17. **Snapseed** - Photo editing\n18. **VLC** - Media player\n19. **Files by Google** - File management\n20. **Shazam** - Music recognition`,
  },
  {
    id: 3, title: "How to Maximize Your Laptop Battery Life", category: "Tips & Tricks",
    excerpt: "Learn proven techniques to extend your laptop's battery life by up to 40%. Works for both Windows and Mac.",
    date: "2024-03-05", readTime: "4 min",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=600&h=400&fit=crop",
    content: `## Extend Your Battery Life\n\n### Display Settings\n- Reduce screen brightness to 50-60%\n- Enable auto-brightness\n- Use dark mode when possible\n\n### Power Management\n- Enable battery saver mode when below 30%\n- Close unused background apps\n- Disable Bluetooth and Wi-Fi when not needed\n\n### Charging Best Practices\n- Keep battery between 20-80% for longevity\n- Avoid using the laptop while charging if it gets hot\n- Use the original charger\n- Don't leave it plugged in at 100% for extended periods\n\n### Software Optimization\n- Update your OS regularly\n- Uninstall bloatware\n- Reduce startup programs\n- Use lightweight browser extensions\n\n### Hardware Tips\n- Consider an SSD upgrade (uses less power than HDD)\n- Clean vents regularly to prevent overheating\n- Keep your laptop on a hard surface for airflow`,
  },
  {
    id: 4, title: "Original vs Refurbished: What You Need to Know", category: "Buying Guide",
    excerpt: "Understanding the difference between original and refurbished devices can save you money without sacrificing quality.",
    date: "2024-02-28", readTime: "6 min",
    image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=600&h=400&fit=crop",
    content: `## Making the Right Choice\n\n### What is "Original"?\nBrand new, factory-sealed devices that have never been used. They come with full manufacturer warranty and all original accessories.\n\n### What is "Refurbished"?\nPre-owned devices that have been professionally inspected, repaired (if needed), and restored to like-new condition.\n\n### Grades of Refurbished Devices\n- **Like New:** Minimal signs of use, near-perfect condition\n- **Good:** Minor cosmetic blemishes, fully functional\n- **Fair:** Visible wear but completely functional\n\n### Pros of Refurbished\n- 20-50% cheaper than original\n- Environmentally friendly\n- Often includes warranty (6 months at AESTRA-TECH)\n- Same performance as original\n\n### Cons of Refurbished\n- May have minor cosmetic imperfections\n- Shorter warranty period\n- Limited color/storage options\n\n### Our Recommendation\nIf you want the latest model with full warranty, go original. If you want great value, refurbished "Like New" grade offers the best balance.`,
  },
  {
    id: 5, title: "Best Phones for Photography in 2024", category: "Buying Guide",
    excerpt: "A deep dive into the top camera phones for enthusiasts and professionals alike.",
    date: "2024-02-20", readTime: "8 min",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&h=400&fit=crop",
    content: `## Top Camera Phones of 2024\n\n### 1. iPhone 15 Pro Max\n- **Camera:** 48MP main + 12MP ultra-wide + 12MP telephoto\n- **Best for:** Video, ProRAW photography, night mode\n- **Standout:** 5x optical zoom, Action mode for video\n\n### 2. Samsung Galaxy S24 Ultra\n- **Camera:** 200MP main + 50MP telephoto + 12MP ultra-wide + 10MP periscope\n- **Best for:** Zoom photography, AI-enhanced shots\n- **Standout:** 100x Space Zoom, Nightography\n\n### 3. Google Pixel 8 Pro\n- **Camera:** 50MP main + 48MP ultra-wide + 48MP telephoto\n- **Best for:** Computational photography, night shots\n- **Standout:** Magic Eraser, Best Take, Photo Unblur\n\n### Key Features to Look For\n- **Sensor size:** Larger sensors capture more light\n- **OIS:** Optical image stabilization for sharper shots\n- **Night mode:** Essential for low-light photography\n- **RAW support:** For post-processing flexibility\n- **Video capabilities:** 4K at 60fps minimum`,
  },
  {
    id: 6, title: "How to Protect Your Device From Malware", category: "Tips & Tricks",
    excerpt: "Stay safe online with these essential security tips for your phone and laptop.",
    date: "2024-02-15", readTime: "5 min",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=600&h=400&fit=crop",
    content: `## Stay Safe Online\n\n### Essential Security Steps\n1. **Keep your OS updated** - Security patches fix known vulnerabilities\n2. **Only install apps from official stores** - Avoid sideloading APKs\n3. **Enable two-factor authentication** - Adds an extra layer of security\n4. **Use a password manager** - Don't reuse passwords\n\n### Recognizing Threats\n- Unexpected pop-ups or redirects\n- Apps you didn't install\n- Unusual data usage or battery drain\n- Slow performance\n- Strange texts or emails sent from your accounts\n\n### What to Do If Infected\n1. Disconnect from the internet\n2. Boot into safe mode\n3. Uninstall suspicious apps\n4. Run a security scan\n5. Change all passwords from a clean device\n6. Factory reset as a last resort\n\n### Recommended Security Apps\n- **Bitdefender** - Comprehensive protection\n- **Malwarebytes** - Excellent malware removal\n- **NordVPN** - Secure browsing on public Wi-Fi`,
  },
];

const categories = ["All", "Setup Guide", "Tips & Tricks", "Buying Guide"];

const Blog = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedPost, setSelectedPost] = useState<typeof blogPosts[0] | null>(null);

  const filtered = blogPosts.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.category === category;
    return matchSearch && matchCat;
  });

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-3xl animate-fade-in">
          <button onClick={() => setSelectedPost(null)} className="text-xs text-primary font-medium hover:underline flex items-center gap-1 mb-6">
            <ChevronLeft className="w-3 h-3" /> Back to Blog
          </button>
          <div className="aspect-video rounded-2xl overflow-hidden mb-6">
            <img src={selectedPost.image} alt={selectedPost.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{selectedPost.category}</span>
            <span className="text-[10px] text-muted-foreground">{selectedPost.readTime} read</span>
            <span className="text-[10px] text-muted-foreground">{new Date(selectedPost.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-6">{selectedPost.title}</h1>
          <div className="prose prose-sm max-w-none">
            {selectedPost.content.split("\n").map((line, i) => {
              if (line.startsWith("## ")) return <h2 key={i} className="font-display text-lg font-bold mt-6 mb-3">{line.slice(3)}</h2>;
              if (line.startsWith("### ")) return <h3 key={i} className="font-display text-base font-semibold mt-4 mb-2">{line.slice(4)}</h3>;
              if (line.startsWith("- **")) {
                const match = line.match(/- \*\*(.+?)\*\*(.*)/) ;
                return <p key={i} className="text-sm text-muted-foreground ml-4 mb-1">• <span className="font-semibold text-foreground">{match?.[1]}</span>{match?.[2]}</p>;
              }
              if (line.startsWith("- ")) return <p key={i} className="text-sm text-muted-foreground ml-4 mb-1">• {line.slice(2)}</p>;
              if (line.match(/^\d+\. \*\*/)) {
                const match = line.match(/^(\d+)\. \*\*(.+?)\*\*(.*)/) ;
                return <p key={i} className="text-sm text-muted-foreground ml-4 mb-1">{match?.[1]}. <span className="font-semibold text-foreground">{match?.[2]}</span>{match?.[3]}</p>;
              }
              if (line.trim() === "") return <div key={i} className="h-2" />;
              return <p key={i} className="text-sm text-muted-foreground mb-2">{line}</p>;
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold tracking-widest uppercase mb-3">
            <BookOpen className="w-4 h-4" /> Blog & Guides
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">Tech Tips & Device Guides</h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">Setup guides, tips & tricks, and buying advice to get the most out of your gadgets.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)} className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${category === c ? "bg-primary text-primary-foreground" : "border border-input hover:bg-secondary"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post, i) => (
            <motion.article key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card overflow-hidden hover-lift group cursor-pointer" onClick={() => setSelectedPost(post)}>
              <div className="aspect-video overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{post.category}</span>
                  <span className="text-[10px] text-muted-foreground">{post.readTime} read</span>
                </div>
                <h3 className="font-display font-semibold text-sm mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{new Date(post.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>
                  <span className="text-xs text-primary font-medium flex items-center gap-1">Read more <ChevronRight className="w-3 h-3" /></span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No articles found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;