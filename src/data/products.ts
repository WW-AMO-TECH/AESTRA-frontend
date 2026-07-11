export interface TechSpecs {
  ram?: string;
  battery?: string;
  camera?: string;
  cpu?: string;
  gpu?: string;
  display?: string;
  storage?: string;
  os?: string;
  connectivity?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  brand: string;
  model: string;
  grade: string;
  rating: number;
  reviewCount: number;
  description: string;
  features: string[];
  images: string[];
  reviews: Review[];
  isNew?: boolean;
  specs?: TechSpecs;
  warranty: string;
  condition: "Original" | "Refurbished";
  stockCount: number;
  useCases: string[];
  availability: { lagos: boolean; abuja: boolean; portHarcourt: boolean; sameDayLagos: boolean };
  pickupLocations?: string[];
}

export interface Review {
  id: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export const categories = ["Phones", "Laptops", "Audio", "Wearables", "Accessories"];
export const brands = ["Apple", "Samsung", "Sony", "Google", "Bose", "Microsoft"];
export const grades = ["New", "Like New", "Good", "Fair"];
export const useCaseTags = ["Gaming", "Photography", "Business", "Student", "Content Creation", "Fitness"];

const IMG = (q: string) => `https://images.unsplash.com/${q}&w=600&h=600&fit=crop`;

const defaultPickup = ["Ikeja City Mall, Lagos", "Computer Village, Ikeja", "Wuse Market, Abuja"];

export const products: Product[] = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    price: 1899000,
    originalPrice: 2199000,
    image: IMG("photo-1695048133142-1a20484d2569?q=80"),
    category: "Phones",
    brand: "Apple",
    model: "iPhone 15 Pro Max",
    grade: "New",
    rating: 4.8,
    reviewCount: 324,
    description: "The most powerful iPhone ever with A17 Pro chip, titanium design, and a 48MP camera system.",
    features: ["A17 Pro chip", "Titanium design", "48MP camera", "USB-C", "Action Button"],
    images: [
      IMG("photo-1695048133142-1a20484d2569?q=80"),
      IMG("photo-1592750475338-74b7b21085ab?q=80"),
      IMG("photo-1510557880182-3d4d3cba35a5?q=80"),
    ],
    reviews: [
      { id: 1, user: "Alex M.", rating: 5, comment: "Incredible camera and battery life!", date: "2024-01-15" },
      { id: 2, user: "Sarah K.", rating: 4, comment: "Great phone, a bit heavy though.", date: "2024-01-10" },
    ],
    isNew: true,
    specs: { ram: "8GB", battery: "4441 mAh", camera: "48MP + 12MP + 12MP", cpu: "A17 Pro", gpu: "Apple 6-core GPU", display: "6.7\" Super Retina XDR OLED", storage: "256GB / 512GB / 1TB", os: "iOS 17", connectivity: "5G, Wi-Fi 6E, Bluetooth 5.3" },
    warranty: "1 Year",
    condition: "Original",
    stockCount: 12,
    useCases: ["Photography", "Business", "Content Creation"],
    availability: { lagos: true, abuja: true, portHarcourt: true, sameDayLagos: true },
    pickupLocations: defaultPickup,
  },
  {
    id: 2,
    name: "MacBook Air M3",
    price: 1749000,
    image: IMG("photo-1517336714731-489689fd1ca8?q=80"),
    category: "Laptops",
    brand: "Apple",
    model: "MacBook Air M3",
    grade: "New",
    rating: 4.9,
    reviewCount: 512,
    description: "Supercharged by M3. The world's best consumer laptop with up to 18 hours of battery life.",
    features: ["M3 chip", "15.3-inch Liquid Retina", "18hr battery", "MagSafe", "1080p webcam"],
    images: [
      IMG("photo-1517336714731-489689fd1ca8?q=80"),
      IMG("photo-1611186871348-b1ce696e52c9?q=80"),
    ],
    reviews: [
      { id: 1, user: "David R.", rating: 5, comment: "Best laptop I've ever owned.", date: "2024-02-20" },
    ],
    isNew: true,
    specs: { ram: "8GB / 16GB / 24GB", battery: "Up to 18 hours", cpu: "Apple M3", gpu: "10-core GPU", display: "15.3\" Liquid Retina", storage: "256GB / 512GB / 1TB / 2TB SSD", os: "macOS Sonoma", connectivity: "Wi-Fi 6E, Bluetooth 5.3" },
    warranty: "1 Year",
    condition: "Original",
    stockCount: 8,
    useCases: ["Business", "Student", "Content Creation"],
    availability: { lagos: true, abuja: true, portHarcourt: false, sameDayLagos: true },
    pickupLocations: defaultPickup,
  },
  {
    id: 3,
    name: "Sony WH-1000XM5",
    price: 549000,
    originalPrice: 629000,
    image: IMG("photo-1618366712010-f4ae9c647dcb?q=80"),
    category: "Audio",
    brand: "Sony",
    model: "WH-1000XM5",
    grade: "New",
    rating: 4.7,
    reviewCount: 891,
    description: "Industry-leading noise cancellation with exceptional sound quality.",
    features: ["30hr battery", "Multipoint connection", "Speak-to-Chat", "LDAC"],
    images: [IMG("photo-1618366712010-f4ae9c647dcb?q=80")],
    reviews: [
      { id: 1, user: "Mike T.", rating: 5, comment: "Best ANC headphones on the market.", date: "2024-03-01" },
    ],
    specs: { battery: "30 hours", connectivity: "Bluetooth 5.2, LDAC, NFC" },
    warranty: "1 Year",
    condition: "Original",
    stockCount: 25,
    useCases: ["Gaming", "Business", "Student"],
    availability: { lagos: true, abuja: true, portHarcourt: true, sameDayLagos: true },
    pickupLocations: defaultPickup,
  },
  {
    id: 4,
    name: "Samsung Galaxy S24 Ultra",
    price: 2049000,
    image: IMG("photo-1610945265064-0e34e5519bbf?q=80"),
    category: "Phones",
    brand: "Samsung",
    model: "Galaxy S24 Ultra",
    grade: "New",
    rating: 4.6,
    reviewCount: 267,
    description: "Galaxy AI-powered smartphone with S Pen and titanium frame.",
    features: ["Galaxy AI", "200MP camera", "S Pen", "Titanium frame", "QHD+ display"],
    images: [IMG("photo-1610945265064-0e34e5519bbf?q=80")],
    reviews: [
      { id: 1, user: "Lisa W.", rating: 5, comment: "The AI features are game-changing.", date: "2024-02-15" },
    ],
    isNew: true,
    specs: { ram: "12GB", battery: "5000 mAh", camera: "200MP + 50MP + 12MP + 10MP", cpu: "Snapdragon 8 Gen 3", gpu: "Adreno 750", display: "6.8\" Dynamic AMOLED 2X", storage: "256GB / 512GB / 1TB", os: "Android 14 (One UI 6.1)", connectivity: "5G, Wi-Fi 7, Bluetooth 5.3" },
    warranty: "1 Year",
    condition: "Original",
    stockCount: 5,
    useCases: ["Photography", "Business", "Gaming"],
    availability: { lagos: true, abuja: false, portHarcourt: false, sameDayLagos: true },
    pickupLocations: defaultPickup,
  },
  {
    id: 5,
    name: "Google Pixel Watch 2",
    price: 549000,
    image: IMG("photo-1546868871-af0de0ae72be?q=80"),
    category: "Wearables",
    brand: "Google",
    model: "Pixel Watch 2",
    grade: "New",
    rating: 4.3,
    reviewCount: 156,
    description: "The best of Google and Fitbit on your wrist.",
    features: ["Wear OS", "Fitbit integration", "Heart rate", "24hr battery"],
    images: [IMG("photo-1546868871-af0de0ae72be?q=80")],
    reviews: [],
    specs: { battery: "24 hours", display: "1.2\" AMOLED", connectivity: "Bluetooth 5.0, Wi-Fi, NFC" },
    warranty: "6 Months",
    condition: "Original",
    stockCount: 30,
    useCases: ["Fitness", "Business"],
    availability: { lagos: true, abuja: true, portHarcourt: false, sameDayLagos: false },
    pickupLocations: defaultPickup,
  },
  {
    id: 6,
    name: "Bose QuietComfort Ultra",
    price: 679000,
    image: IMG("photo-1505740420928-5e560c06d30e?q=80"),
    category: "Audio",
    brand: "Bose",
    model: "QC Ultra",
    grade: "Like New",
    rating: 4.5,
    reviewCount: 203,
    description: "Immersive spatial audio with world-class noise cancellation.",
    features: ["Spatial audio", "CustomTune", "24hr battery", "Bluetooth 5.3"],
    images: [IMG("photo-1505740420928-5e560c06d30e?q=80")],
    reviews: [],
    specs: { battery: "24 hours", connectivity: "Bluetooth 5.3, Multipoint" },
    warranty: "6 Months",
    condition: "Refurbished",
    stockCount: 3,
    useCases: ["Gaming", "Student"],
    availability: { lagos: true, abuja: false, portHarcourt: false, sameDayLagos: true },
    pickupLocations: defaultPickup,
  },
  {
    id: 7,
    name: "Surface Laptop 5",
    price: 1599000,
    originalPrice: 2049000,
    image: IMG("photo-1587614382346-4ec70e388b28?q=80"),
    category: "Laptops",
    brand: "Microsoft",
    model: "Surface Laptop 5",
    grade: "Like New",
    rating: 4.4,
    reviewCount: 178,
    description: "Sleek design with Intel 12th Gen performance and a stunning PixelSense display.",
    features: ["Intel 12th Gen", "PixelSense display", "Thunderbolt 4", "All-day battery"],
    images: [IMG("photo-1587614382346-4ec70e388b28?q=80")],
    reviews: [],
    specs: { ram: "8GB / 16GB", battery: "Up to 17 hours", cpu: "Intel Core i5-1245U / i7-1265U", gpu: "Intel Iris Xe", display: "13.5\" / 15\" PixelSense", storage: "256GB / 512GB SSD", os: "Windows 11", connectivity: "Wi-Fi 6, Bluetooth 5.1, Thunderbolt 4" },
    warranty: "6 Months",
    condition: "Refurbished",
    stockCount: 2,
    useCases: ["Business", "Student"],
    availability: { lagos: true, abuja: true, portHarcourt: true, sameDayLagos: false },
    pickupLocations: defaultPickup,
  },
  {
    id: 8,
    name: "USB-C Hub 10-in-1",
    price: 95000,
    image: IMG("photo-1625842268584-8f3296236761?q=80"),
    category: "Accessories",
    brand: "Apple",
    model: "USB-C Hub",
    grade: "New",
    rating: 4.2,
    reviewCount: 445,
    description: "Expand your connectivity with HDMI, USB-A, SD card, and more.",
    features: ["4K HDMI", "100W PD", "SD/microSD", "3x USB-A"],
    images: [IMG("photo-1625842268584-8f3296236761?q=80")],
    reviews: [],
    warranty: "6 Months",
    condition: "Original",
    stockCount: 50,
    useCases: ["Business", "Student", "Content Creation"],
    availability: { lagos: true, abuja: true, portHarcourt: true, sameDayLagos: true },
    pickupLocations: defaultPickup,
  },
];