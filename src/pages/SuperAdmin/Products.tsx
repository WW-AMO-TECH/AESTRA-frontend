import { useEffect, useMemo, useState } from "react";
import axios from "@/api/axios";
import {
  Plus, Search, Filter, Download, Upload, Eye, Pencil, Trash2, X,
  ChevronLeft, ChevronRight, ImagePlus, Package, Save, SlidersHorizontal,
  RefreshCw, Tag, Boxes, Zap, CheckCircle2, AlertTriangle
} from "lucide-react";

import Sidebar from "@/components/SuperAdmin/Sidebar";
import { useAuth } from "@/context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const SERVER_URL = API.replace(/\/api\/?$/, "");

type ImageItem = {
  id?: number; image_url?: string; url?: string; path?: string;
  is_primary?: boolean; sort_order?: number;
};

type Variant = {
  id?: number; sku: string; name: string; color: string; storage: string;
  ram: string; original_price: string; discount_percentage: string;
  price: string; stock: string; weight: string; status: boolean;
  images: (File | ImageItem)[];
};

type Product = {
  id: number; sku?: string; slug?: string; name: string; price: number | string;
  original_price?: number | string; discount_percentage?: number | string;
  stock: number | string; condition?: string; grade?: string; model?: string;
  color?: string; weight?: number | string; ram?: string; battery?: string;
  storage?: string; camera?: string; cpu?: string; gpu?: string; display?: string;
  os?: string; connectivity?: string; warranty?: string; tag?: string;
  description?: string; is_flash_deal?: boolean; status?: boolean;
  brand?: { id: number; name: string }; category?: { id: number; name: string };
  seller?: { id: number; name?: string; store_name?: string; email?: string };
  seller_id?: number;
  images?: ImageItem[]; variants?: Variant[];
};

type FormState = {
  sku: string; name: string; category_id: string; brand_id: string;
  price: string; original_price: string; discount_percentage: string; stock: string;
  model: string; grade: string; condition: string; color: string; weight: string;
  ram: string; battery: string; storage: string; camera: string; cpu: string;
  gpu: string; display: string; os: string; connectivity: string; warranty: string;
  tag: string; is_flash_deal: boolean; status: boolean; description: string;
  images: (File | ImageItem)[]; variants: Variant[];
};

const emptyVariant = (): Variant => ({
  sku: "", name: "", color: "", storage: "", ram: "", original_price: "",
  discount_percentage: "0", price: "", stock: "0", weight: "", status: true, images: []
});

const emptyForm: FormState = {
  sku: "", name: "", category_id: "", brand_id: "", price: "", original_price: "",
  discount_percentage: "0", stock: "0", model: "", grade: "", condition: "Original",
  color: "", weight: "", ram: "", battery: "", storage: "", camera: "", cpu: "",
  gpu: "", display: "", os: "", connectivity: "", warranty: "", tag: "",
  is_flash_deal: false, status: true, description: "", images: [], variants: []
};

const productFields: (keyof FormState)[] = [
  "sku", "name", "category_id", "brand_id", "price", "original_price",
  "discount_percentage", "stock", "model", "grade", "condition", "color",
  "weight", "ram", "battery", "storage", "camera", "cpu", "gpu", "display",
  "os", "connectivity", "warranty", "tag", "description"
];

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

export default function SuperAdminProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sellerSearch, setSellerSearch] = useState("");
  const [sellerOpen, setSellerOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [brand, setBrand] = useState("");
  const [seller, setSeller] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [status, setStatus] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [tag, setTag] = useState("");
  const [flashDeal, setFlashDeal] = useState("");
  const [sort, setSort] = useState("created_at");
  const [direction, setDirection] = useState("desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const api = axios;

  const showMessage = (text: string, type: "success" | "error" = "success") => {
    setMessage(text); setMessageType(type);
    window.setTimeout(() => setMessage(""), 4500);
  };

  const errorMessage = (error: any) => {
    const data = error?.response?.data;
    if (data?.errors) {
      const errors = Object.entries(data.errors).flatMap(([field, messages]: any) =>
        Array.isArray(messages) ? messages.map((m: string) => `${field}: ${m}`) : [`${field}: ${messages}`]
      );
      if (errors.length) return errors.join(" | ");
    }
    return data?.message || data?.error || error?.message || "Something went wrong.";
  };

  const list = (response: any) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    return [];
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/superadmin/products", {
        params: {
          search: search || undefined, category_id: subcategory || category || undefined, subcategory_id: subcategory || undefined,
          brand_id: brand || undefined, seller_id: seller || undefined, min_price: minPrice || undefined, max_price: maxPrice || undefined, condition: condition || undefined,
          status: status || undefined, tag: tag || undefined,
          is_flash_deal: flashDeal === "" ? undefined : flashDeal,
          stock: stockFilter || undefined, sort_by: sort, sort_order: direction,
          page, per_page: perPage
        }
      });
      const response = res.data;
      const rows = Array.isArray(response?.data) ? response.data :
        Array.isArray(response?.data?.data) ? response.data.data : [];
      setProducts(rows);
      setLastPage(Number(response?.meta?.last_page || response?.data?.last_page || response?.last_page || 1));
      setTotal(Number(response?.meta?.total || response?.data?.total || response?.total || rows.length));
    } catch (error: any) {
      console.error(error); showMessage(errorMessage(error), "error");
    } finally { setLoading(false); }
  };

  const getSubcategories = (items: any[], categoryId: string) => {
    const selected = items.find((item: any) => String(item.id) === String(categoryId));
    const nested = selected?.subcategories || selected?.children || selected?.sub_categories || [];
    if (Array.isArray(nested) && nested.length) return nested;
    return items.filter((item: any) => String(item.parent_id ?? item.category_id ?? "") === String(categoryId));
  };

  const loadSubcategories = async (categoryId: string) => {
    if (!categoryId) return setSubcategories([]);
    const local = getSubcategories(categories, categoryId);
    if (local.length) return setSubcategories(local);
    try {
      const res = await api.get(`/categories/${categoryId}`);
      const data = res.data?.data || res.data;
      const nested = data?.subcategories || data?.children || data?.sub_categories || [];
      setSubcategories(Array.isArray(nested) ? nested : []);
    } catch (error) {
      console.error("Subcategory metadata error:", error); setSubcategories([]);
    }
  };

  const loadMeta = async () => {
    try {
      const [c, b, s] = await Promise.all([api.get("/categories"), api.get("/brands"), api.get("/superadmin/sellers")]);
      const categoryList = list(c.data);
      setCategories(categoryList); setBrands(list(b.data)); setSellers(list(s.data));
      if (category) setSubcategories(getSubcategories(categoryList, category));
    } catch (error) { console.error("Metadata error:", error); }
  };

  useEffect(() => { loadMeta(); }, []);

  useEffect(() => {
    setSubcategory("");
    loadSubcategories(category);
    setPage(1);
  }, [category]);

  useEffect(() => {
    const timer = window.setTimeout(() => loadProducts(), search ? 350 : 0);
    return () => window.clearTimeout(timer);
  }, [page, perPage, search, category, subcategory, brand, seller, minPrice, maxPrice, condition, status, stockFilter, tag, flashDeal, sort, direction]);

  const resetFilters = () => {
    setSearch(""); setCategory(""); setSubcategory(""); setSubcategories([]); setBrand(""); setSeller(""); setMinPrice(""); setMaxPrice(""); setCondition("");
    setStatus(""); setStockFilter(""); setTag(""); setFlashDeal("");
    setSort("created_at"); setDirection("desc"); setPage(1);
  };

  const resetForm = () => {
    setForm({ ...emptyForm, images: [], variants: [] });
    setEditingId(null); setShowModal(false);
  };

  const openAdd = () => {
    setForm({ ...emptyForm, images: [], variants: [] });
    setEditingId(null); setShowModal(true); setMessage("");
  };

  const openView = async (product: Product) => {
    try {
      const res = await api.get(`/superadmin/products/${product.id}`);
      setViewProduct(res.data?.data || res.data || product);
    } catch {
      setViewProduct(product);
    }
  };

  const calculatePrice = (original: string | number, discount: string | number) => {
    const originalPrice = Number(original);
    const discountPercentage = Math.min(100, Math.max(0, Number(discount) || 0));

    if (!Number.isFinite(originalPrice) || originalPrice <= 0) return "";

    const finalPrice = originalPrice - (originalPrice * discountPercentage) / 100;

    return String(Math.max(0, Number(finalPrice.toFixed(2))));
  };

  const openEdit = async (product: Product) => {
    try {
      setLoading(true);
      const res = await api.get(`/superadmin/products/${product.id}`);
      const p = res.data?.data || res.data;
      setEditingId(p.id);
      setForm({
        ...emptyForm,
        sku: p.sku || "", name: p.name || "",
        category_id: String(p.category?.id || p.category_id || ""),
        brand_id: String(p.brand?.id || p.brand_id || ""),
        original_price: String(p.original_price ?? ""),
        discount_percentage: String(p.discount_percentage ?? 0),
        price: calculatePrice(String(p.original_price ?? ""), String(p.discount_percentage ?? 0)),
        stock: String(p.stock ?? 0),
        model: p.model || "", grade: p.grade || "",
        condition: p.condition === "Refurbished" ? "Refurbished" : "Original",
        color: p.color || "", weight: String(p.weight ?? ""), ram: p.ram || "",
        battery: p.battery || "", storage: p.storage || "", camera: p.camera || "",
        cpu: p.cpu || "", gpu: p.gpu || "", display: p.display || "", os: p.os || "",
        connectivity: p.connectivity || "", warranty: p.warranty || "", tag: p.tag || "",
        is_flash_deal: !!p.is_flash_deal, status: p.status !== false,
        description: p.description || "", images: Array.isArray(p.images) ? p.images : [],
        variants: Array.isArray(p.variants) ? p.variants.map((v: any) => ({
          id: v.id, sku: v.sku || "", name: v.name || "", color: v.color || "",
          storage: v.storage || "", ram: v.ram || "", original_price: String(v.original_price ?? ""),
          discount_percentage: String(v.discount_percentage ?? 0),
          price: calculatePrice(String(v.original_price ?? ""), String(v.discount_percentage ?? 0)),
          stock: String(v.stock ?? 0), weight: String(v.weight ?? ""), status: v.status !== false,
          images: Array.isArray(v.images) ? v.images : []
        })) : []
      });
      setShowModal(true);
    } catch (error: any) {
      showMessage(errorMessage(error), "error");
    } finally { setLoading(false); }
  };

  const setField = (key: keyof FormState, value: any) => {
    setForm(prev => {
      const next = { ...prev, [key]: value };

      if (key === "original_price" || key === "discount_percentage") {
        const originalPrice = key === "original_price" ? value : prev.original_price;
        const discountPercentage = key === "discount_percentage" ? value : prev.discount_percentage;

        next.price = calculatePrice(originalPrice, discountPercentage);
      }

      return next;
    });
  };

  const addVariant = () => setForm(prev => ({ ...prev, variants: [...prev.variants, emptyVariant()] }));

  const removeVariant = (index: number) => setForm(prev => ({
    ...prev, variants: prev.variants.filter((_, i) => i !== index)
  }));

  const updateVariant = (index: number, key: keyof Variant, value: any) => {
    setForm(prev => ({
      ...prev, variants: prev.variants.map((v, i) => {
        if (i !== index) return v;

        const next = { ...v, [key]: value };

        if (key === "original_price" || key === "discount_percentage") {
          const originalPrice = key === "original_price" ? value : v.original_price;
          const discountPercentage = key === "discount_percentage" ? value : v.discount_percentage;

          next.price = calculatePrice(originalPrice, discountPercentage);
        }

        return next;
      })
    }));
  };

  const addImages = (files: FileList | null, variantIndex?: number) => {
    if (!files?.length) return;
    const selected = Array.from(files);
    if (variantIndex === undefined) setForm(prev => ({ ...prev, images: [...prev.images, ...selected] }));
    else setForm(prev => ({
      ...prev, variants: prev.variants.map((v, i) => i === variantIndex ? { ...v, images: [...v.images, ...selected] } : v)
    }));
  };

  const removeImage = (index: number, variantIndex?: number) => {
    if (variantIndex === undefined) setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    else setForm(prev => ({
      ...prev, variants: prev.variants.map((v, i) => i === variantIndex ? { ...v, images: v.images.filter((_, x) => x !== index) } : v)
    }));
  };

  const imageUrl = (image: any) => {
    if (!image) return "";
    if (image instanceof File) return URL.createObjectURL(image);
    const raw = typeof image === "string" ? image : image.image_url || image.url || image.path || "";
    return raw ? (raw.startsWith("http") || raw.startsWith("blob:") ? raw : `${SERVER_URL}/${raw.replace(/^\/+/, "")}`) : "";
  };

  const validate = () => {
    if (!form.name.trim()) return showMessage("Product name is required.", "error"), false;
    if (!form.category_id) return showMessage("Please select a category.", "error"), false;
    if (!form.brand_id) return showMessage("Please select a brand.", "error"), false;
    if (!form.original_price || Number(form.original_price) <= 0) return showMessage("Please enter a valid original price.", "error"), false;
    if (form.price === "" || Number(form.price) < 0) return showMessage("Please enter a valid product price.", "error"), false;

    for (let i = 0; i < form.variants.length; i++) {
      const v = form.variants[i];
      if (!v.sku.trim()) return showMessage(`Variant ${i + 1}: SKU is required.`, "error"), false;
      if (!v.original_price || Number(v.original_price) <= 0) return showMessage(`Variant ${i + 1}: Enter a valid original price.`, "error"), false;
      if (v.price === "" || Number(v.price) < 0) return showMessage(`Variant ${i + 1}: Enter a valid price.`, "error"), false;
      if (v.stock === "" || Number(v.stock) < 0) return showMessage(`Variant ${i + 1}: Enter a valid stock quantity.`, "error"), false;
    }

    return true;
  };

  const appendProduct = (data: FormData) => {
    productFields.forEach(key => {
      const value = form[key];
      if (value !== undefined && value !== null) data.append(key, String(value));
    });

    data.append("is_flash_deal", form.is_flash_deal ? "1" : "0");
    data.append("status", form.status ? "1" : "0");
  };

  const appendVariant = (data: FormData, v: Variant, index: number) => {
    const fields: Record<string, string> = {
      sku: v.sku.trim(), name: v.name.trim(), color: v.color.trim(), storage: v.storage.trim(),
      ram: v.ram.trim(), original_price: v.original_price || "", discount_percentage: v.discount_percentage || "0",
      price: v.price, stock: v.stock, weight: v.weight || "", status: v.status ? "1" : "0"
    };

    Object.entries(fields).forEach(([key, value]) => data.append(`variants[${index}][${key}]`, value));
    if (v.id) data.append(`variants[${index}][id]`, String(v.id));
  };

  const saveProduct = async () => {
    if (!validate()) return;

    try {
      setLoading(true); setMessage("");

      if (!editingId) {
        const data = new FormData();
        appendProduct(data);

        form.images.forEach(image => image instanceof File && data.append("images[]", image));

        form.variants.forEach((v, i) => {
          appendVariant(data, v, i);
          v.images.forEach(image => image instanceof File && data.append(`variant_images[${i}][]`, image));
        });

        const res = await api.post("/superadmin/products", data);
        showMessage(res.data?.message || "Product created successfully.");
      } else {
        const payload: Record<string, any> = {};
        productFields.forEach(key => payload[key] = form[key]);
        payload.is_flash_deal = form.is_flash_deal; payload.status = form.status;

        await api.put(`/superadmin/products/${editingId}`, payload);

        const existingIds: number[] = [];

        for (const v of form.variants) {
          const data = {
            sku: v.sku.trim(), name: v.name.trim(), color: v.color.trim(), storage: v.storage.trim(),
            ram: v.ram.trim(), original_price: v.original_price || null,
            discount_percentage: Number(v.discount_percentage || 0), price: Number(v.price),
            stock: Number(v.stock), weight: v.weight || null, status: v.status
          };

          if (v.id) {
            await api.put(`/superadmin/products/${editingId}/variants/${v.id}`, data);
            existingIds.push(v.id);
          } else {
            const res = await api.post(`/superadmin/products/${editingId}/variants`, data);
            const newId = res.data?.data?.id || res.data?.id;
            if (newId) { v.id = newId; existingIds.push(newId); }
          }
        }

        const mainFiles = form.images.filter(x => x instanceof File) as File[];

        if (mainFiles.length) {
          const fd = new FormData();
          mainFiles.forEach(file => fd.append("images[]", file));
          await api.post(`/superadmin/products/${editingId}/images`, fd);
        }

        for (const v of form.variants) {
          const files = v.images.filter(x => x instanceof File) as File[];
          if (!files.length || !v.id) continue;

          const fd = new FormData();
          files.forEach(file => fd.append("images[]", file));
          await api.post(`/superadmin/products/${editingId}/variants/${v.id}/images`, fd);
        }

        showMessage("Product updated successfully.");
      }

      resetForm(); await loadProducts();
    } catch (error: any) {
      console.error("Save product error:", error?.response?.data || error);
      showMessage(errorMessage(error), "error");
    } finally { setLoading(false); }
  };

  const deleteProduct = async (id: number) => {
    if (!window.confirm("Delete this product and all its variants/images?")) return;

    try {
      setLoading(true); await api.delete(`/superadmin/products/${id}`);
      showMessage("Product deleted successfully."); await loadProducts();
    } catch (error: any) {
      showMessage(errorMessage(error), "error");
    } finally { setLoading(false); }
  };

  const exportProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/superadmin/products/export", { responseType: "blob" });
      const url = URL.createObjectURL(res.data), a = document.createElement("a");
      a.href = url; a.download = "products.xlsx"; a.click(); URL.revokeObjectURL(url);
    } catch (error: any) {
      showMessage(errorMessage(error), "error");
    } finally { setLoading(false); }
  };

  const importProducts = async (file: File) => {
    try {
      setLoading(true); const fd = new FormData(); fd.append("file", file);
      await api.post("/superadmin/products/import", fd);
      showMessage("Products imported successfully."); setPage(1); await loadProducts();
    } catch (error: any) {
      showMessage(errorMessage(error), "error");
    } finally { setLoading(false); }
  };

  const stockBadge = (stock: number) => {
    if (stock <= 0) return "bg-red-50 text-red-600";
    if (stock <= 5) return "bg-amber-50 text-amber-700";
    return "bg-emerald-50 text-emerald-700";
  };

  const pages = useMemo(() => {
    const start = Math.max(1, page - 2), end = Math.min(lastPage, start + 4);
    return Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);
  }, [page, lastPage]);

  const activeFilterCount = [category, subcategory, brand, seller, minPrice, maxPrice, condition, status, stockFilter, tag, flashDeal].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-primary/20 lg:flex">
      <Sidebar user={user} />

      <main className="flex-1 p-3 lg:p-3 mt-14 lg:mt-0 h-screen overflow-y-auto">
        <div className="min-h-full sm:p-5 lg:p-3">
          <div className="mx-auto max-w-7xl">
            <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Products</h1>
                </div>
                <p className="text-xs text-slate-500 sm:text-sm">Manage products, variants, pricing and inventory.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <label className={`${buttonClass} cursor-pointer border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}>
                  <Upload className="h-4 w-4" /> Import
                  <input type="file" accept=".xlsx,.xls,.csv" hidden onChange={e => {
                    const file = e.target.files?.[0]; if (file) importProducts(file); e.target.value = "";
                  }} />
                </label>

                <button onClick={exportProducts} className={`${buttonClass} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}><Download className="h-4 w-4" /> Export</button>
                <button onClick={openAdd} className={`${buttonClass} bg-primary text-white shadow-sm hover:bg-primary/90`}><Plus className="h-4 w-4" /> Add Product</button>
              </div>
            </header>

            {message && (
              <div className={`mb-4 flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium ${
                messageType === "error" ? "border-red-100 bg-red-50 text-red-700" : "border-emerald-100 bg-emerald-50 text-emerald-700"
              }`}>
                {messageType === "error" ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}{message}
              </div>
            )}

            <section className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 p-3 sm:p-4">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by product name..." className={`${inputClass} pl-10`} />
                  </div>

                  <button onClick={() => setShowFilters(true)} className={`${buttonClass} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}>
                    <SlidersHorizontal className="h-4 w-4" /> Filters
                    {activeFilterCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">{activeFilterCount}</span>}
                  </button>

                  <button onClick={loadProducts} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-primary" title="Refresh"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></button>
                </div>

                {showFilters && (
                  <>
                    <div className="fixed inset-0 z-[80] bg-slate-950/35 backdrop-blur-[2px]" onClick={() => setShowFilters(false)} />

                    <aside className="fixed right-0 top-0 z-[90] flex h-screen w-full max-w-md flex-col bg-white shadow-2xl">
                      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <div><p className="text-base font-bold text-slate-900">Filter Products</p><p className="mt-0.5 text-xs text-slate-400">Refine the inventory you want to view.</p></div>
                        <button onClick={() => setShowFilters(false)} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"><X className="h-5 w-5" /></button>
                      </div>

                      <div className="flex-1 overflow-y-auto p-5">
                        <div className="space-y-5">
                          <div>
                            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Product details</p>

                            <div className="grid gap-3">
                              <div className="relative">
                                <label className="mb-1.5 block text-sm font-medium">
                                  Seller
                                </label>

                                <div className="relative">
                                  <Search
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                  />

                                  <input
                                    type="text"
                                    value={sellerSearch}
                                    onChange={(e) => {
                                      setSellerSearch(e.target.value);
                                      setSellerOpen(true);
                                    }}
                                    onFocus={() => setSellerOpen(true)}
                                    placeholder={
                                      seller
                                        ? sellers.find((s) => String(s.id) === String(seller))?.store_name ||
                                          sellers.find((s) => String(s.id) === String(seller))?.name ||
                                          sellers.find((s) => String(s.id) === String(seller))?.email ||
                                          "Search seller..."
                                        : "Search seller..."
                                    }
                                    className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                  />
                                </div>

                                {sellerOpen && (
                                  <>
                                    {/* Click outside */}
                                    <div
                                      className="fixed inset-0 z-40"
                                      onClick={() => setSellerOpen(false)}
                                    />

                                    {/* Results */}
                                    <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-xl">
                                      {/* All Sellers */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSeller("");
                                          setSellerSearch("");
                                          setSellerOpen(false);
                                          setPage(1);
                                        }}
                                        className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-primary/5 ${
                                          !seller ? "bg-primary/5 text-primary" : ""
                                        }`}
                                      >
                                        All Sellers
                                      </button>

                                      {sellers
                                        .filter((s) => {
                                          const search = sellerSearch.toLowerCase().trim();

                                          if (!search) return true;

                                          const name = s.store_name || s.name || "";
                                          const email = s.email || "";

                                          return (
                                            name.toLowerCase().includes(search) ||
                                            email.toLowerCase().includes(search) ||
                                            String(s.id).includes(search)
                                          );
                                        })
                                        .map((s) => {
                                          const name =
                                            s.store_name ||
                                            s.name ||
                                            s.email ||
                                            `Seller #${s.id}`;

                                          return (
                                            <button
                                              key={s.id}
                                              type="button"
                                              onClick={() => {
                                                setSeller(String(s.id));
                                                setSellerSearch(name);
                                                setSellerOpen(false);
                                                setPage(1);
                                              }}
                                              className={`flex w-full flex-col rounded-lg px-3 py-2.5 text-left transition hover:bg-primary/5 ${
                                                String(seller) === String(s.id)
                                                  ? "bg-primary/5 text-primary"
                                                  : ""
                                              }`}
                                            >
                                              <span className="text-sm font-medium">
                                                {name}
                                              </span>

                                              {s.email && s.email !== name && (
                                                <span className="mt-0.5 text-xs text-muted-foreground">
                                                  {s.email}
                                                </span>
                                              )}
                                            </button>
                                          );
                                        })}

                                      {sellers.filter((s) => {
                                        const search = sellerSearch.toLowerCase().trim();

                                        if (!search) return true;

                                        const name = s.store_name || s.name || "";
                                        const email = s.email || "";

                                        return (
                                          name.toLowerCase().includes(search) ||
                                          email.toLowerCase().includes(search) ||
                                          String(s.id).includes(search)
                                        );
                                      }).length === 0 && (
                                        <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                                          No sellers found.
                                        </div>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>

                              <div className="grid gap-3 sm:grid-cols-2">
                                <Select label="Category" value={category} onChange={v => { setCategory(v); setPage(1); }} options={categories.filter(c => !c.parent_id && !c.category_id)} />
                                <Select label="Subcategory" value={subcategory} disabled={!category} onChange={v => { setSubcategory(v); setPage(1); }} options={subcategories} />
                              </div>

                              <Select label="Brand" value={brand} onChange={v => { setBrand(v); setPage(1); }} options={brands} />
                              <Select label="Condition" value={condition} onChange={v => { setCondition(v); setPage(1); }} options={[{ id: "Original", name: "Original" }, { id: "Refurbished", name: "Refurbished" }]} />
                            </div>
                          </div>

                          <div>
                            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Price range</p>

                            <div className="grid grid-cols-2 gap-3">
                              <label><span className="mb-1 block text-[11px] font-medium text-slate-500">Minimum price</span><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">₦</span><input type="number" min="0" value={minPrice} onChange={e => { setMinPrice(e.target.value); setPage(1); }} placeholder="0" className={`${inputClass} pl-7`} /></div></label>
                              <label><span className="mb-1 block text-[11px] font-medium text-slate-500">Maximum price</span><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">₦</span><input type="number" min="0" value={maxPrice} onChange={e => { setMaxPrice(e.target.value); setPage(1); }} placeholder="No limit" className={`${inputClass} pl-7`} /></div></label>
                            </div>
                          </div>

                          <div>
                            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Inventory & status</p>

                            <div className="grid gap-3 sm:grid-cols-2">
                              <Select label="Status" value={status} onChange={v => { setStatus(v); setPage(1); }} options={[{ id: "1", name: "Active" }, { id: "0", name: "Inactive" }]} />
                              <Select label="Inventory" value={stockFilter} onChange={v => { setStockFilter(v); setPage(1); }} options={[{ id: "in_stock", name: "In Stock" }, { id: "low_stock", name: "Low Stock (≤5)" }, { id: "out_of_stock", name: "Out of Stock" }]} />
                              <Select label="Tag" value={tag} onChange={v => { setTag(v); setPage(1); }} options={["Featured", "Best Seller", "New Arrival", "Trending", "Hot Deal", "Product Page"].map(x => ({ id: x, name: x }))} />
                              <Select label="Flash Deal" value={flashDeal} onChange={v => { setFlashDeal(v); setPage(1); }} options={[{ id: "1", name: "Flash Deals" }, { id: "0", name: "Not Flash Deal" }]} />
                            </div>
                          </div>

                          <div>
                            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Sort products</p>

                            <div className="grid grid-cols-2 gap-3">
                              <label><span className="mb-1 block text-[11px] font-medium text-slate-500">Sort by</span><select value={sort} onChange={e => setSort(e.target.value)} className={inputClass}><option value="created_at">Newest</option><option value="name">Name</option><option value="price">Price</option><option value="stock">Stock</option></select></label>
                              <label><span className="mb-1 block text-[11px] font-medium text-slate-500">Order</span><select value={direction} onChange={e => setDirection(e.target.value)} className={inputClass}><option value="desc">Descending</option><option value="asc">Ascending</option></select></label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 border-t border-slate-100 bg-slate-50/70 p-4">
                        <button onClick={resetFilters} className={`${buttonClass} flex-1 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}><RefreshCw className="h-4 w-4" /> Clear all</button>
                        <button onClick={() => setShowFilters(false)} className={`${buttonClass} flex-1 bg-primary text-white shadow-sm hover:bg-primary/90`}>Apply filters</button>
                      </div>
                    </aside>
                  </>
                )}
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div><h2 className="text-sm font-bold text-slate-800">Product Inventory</h2><p className="text-[11px] text-slate-400">{total.toLocaleString()} product{total === 1 ? "" : "s"} found</p></div>

                <label className="flex items-center gap-2 text-[11px] text-slate-500">Show
                  <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"><option value={10}>10</option><option value={20}>20</option><option value={30}>30</option><option value={50}>50</option></select>
                </label>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                    <tr><th className="px-4 py-3">Product</th><th className="px-4 py-3">Seller</th><th className="px-4 py-3">Category / Brand</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Tag</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {loading ? <tr><td colSpan={8} className="py-16 text-center text-sm text-slate-400">Loading products...</td></tr> :
                    products.length === 0 ? <tr><td colSpan={8} className="py-16 text-center"><Package className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-2 text-sm font-medium text-slate-500">No products found</p><p className="text-xs text-slate-400">Try changing your filters or search.</p></td></tr> :
                    products.map(product => {
                      const image = product.images?.[0];
                      const stock = Number(product.stock || 0);

                      return <tr key={product.id} className="transition hover:bg-slate-50/80">
                        <td className="px-4 py-3"><div className="flex items-center gap-3">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100">{imageUrl(image) ? <img src={imageUrl(image)} alt={product.name} className="h-full w-full object-cover" onError={e => e.currentTarget.style.display = "none"} /> : <Package className="m-3 h-6 w-6 text-slate-300" />}</div>
                          <div className="min-w-0"><p className="max-w-[260px] truncate text-xs font-bold text-slate-800">{product.name}</p><p className="mt-0.5 text-[10px] text-slate-400">{product.model || product.sku || "No SKU"}</p></div>
                        </div></td>

                        <td className="px-4 py-3"><p className="max-w-[150px] truncate text-xs font-medium text-slate-700">{product.seller?.store_name || product.seller?.name || "—"}</p><p className="text-[10px] text-slate-400">{product.seller?.email || "Seller"}</p></td>

                        <td className="px-4 py-3"><p className="text-xs font-medium text-slate-700">{product.category?.name || "—"}</p><p className="text-[10px] text-slate-400">{product.brand?.name || "—"}</p></td>

                        <td className="px-4 py-3"><p className="text-xs font-bold text-slate-800">₦{Number(product.price).toLocaleString()}</p>{Number(product.discount_percentage || 0) > 0 && <span className="text-[10px] text-emerald-600">{product.discount_percentage}% off</span>}</td>

                        <td className="px-4 py-3">{product.tag ? <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary"><Tag className="h-3 w-3" />{product.tag}</span> : <span className="text-xs text-slate-300">—</span>}</td>

                        <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${stockBadge(stock)}`}>{stock} {stock <= 1 ? "unit" : "units"}</span></td>

                        <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${product.status === false ? "bg-slate-100 text-slate-500" : "bg-emerald-50 text-emerald-700"}`}>{product.status === false ? "Inactive" : "Active"}</span></td>

                        <td className="px-4 py-3"><div className="flex justify-end gap-1">
                          <IconButton title="View" onClick={() => openView(product)}><Eye className="h-4 w-4" /></IconButton>
                          <IconButton title="Edit" onClick={() => openEdit(product)} className="text-blue-600 hover:bg-blue-50"><Pencil className="h-4 w-4" /></IconButton>
                          <IconButton title="Delete" onClick={() => deleteProduct(product.id)} className="text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></IconButton>
                        </div></td>
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] text-slate-500">Page <b>{page}</b> of <b>{lastPage}</b></p>

                <div className="flex items-center gap-1">
                  <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
                  {pages.map(p => <button key={p} onClick={() => setPage(p)} className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold ${p === page ? "bg-primary text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{p}</button>)}
                  <button disabled={page >= lastPage} onClick={() => setPage(p => p + 1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {showModal && <ProductModal
        editing={!!editingId} form={form} categories={categories} brands={brands} loading={loading}
        setField={setField} save={saveProduct} close={resetForm} addVariant={addVariant}
        removeVariant={removeVariant} updateVariant={updateVariant} addImages={addImages}
        removeImage={removeImage} imageUrl={imageUrl}
      />}

      {viewProduct && <ViewModal product={viewProduct} close={() => setViewProduct(null)} imageUrl={imageUrl} />}
    </div>
  );
}

function ProductModal({ editing, form, categories, brands, loading, setField, save, close, addVariant, removeVariant, updateVariant, addImages, removeImage, imageUrl }: any) {
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-2 backdrop-blur-sm sm:p-5">
    <div className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 sm:px-5">
        <div><div className="flex items-center gap-2"><div className="rounded-lg bg-primary/10 p-2 text-primary"><Package className="h-4 w-4" /></div><h2 className="text-base font-bold text-slate-900 sm:text-lg">{editing ? "Edit Product" : "Add Product"}</h2></div><p className="mt-1 text-[11px] text-slate-400">Product details, pricing, inventory, images and variants.</p></div>
        <button onClick={close} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
      </div>

      <div className="overflow-y-auto p-4 sm:p-5">
        <ModalSection title="Basic Information">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Input label="Product Name" value={form.name} onChange={(v: string) => setField("name", v)} />
            <Input label="SKU" value={form.sku} onChange={(v: string) => setField("sku", v)} />
            <Input label="Model" value={form.model} onChange={(v: string) => setField("model", v)} />
            <Select label="Category" value={form.category_id} onChange={(v: string) => setField("category_id", v)} options={categories} />
            <Select label="Brand" value={form.brand_id} onChange={(v: string) => setField("brand_id", v)} options={brands} />
            <Select label="Condition" value={form.condition} onChange={(v: string) => setField("condition", v)} options={[{ id: "Original", name: "Original" }, { id: "Refurbished", name: "Refurbished" }]} />
            <Select label="Grade" value={form.grade} onChange={(v: string) => setField("grade", v)} options={[{ id: "New", name: "New" }, { id: "A", name: "Grade A" }, { id: "B", name: "Grade B" }, { id: "C", name: "Grade C" }]} />
            <Input label="Original Price" type="number" value={form.original_price} onChange={(v: string) => setField("original_price", v)} />
            <Input label="Discount %" type="number" value={form.discount_percentage} onChange={(v: string) => setField("discount_percentage", v)} />
            <Input label="Price" type="number" value={form.price} readOnly />
            <Input label="Stock" type="number" value={form.stock} onChange={(v: string) => setField("stock", v)} />
            <Input label="Color" value={form.color} onChange={(v: string) => setField("color", v)} />
            <Input label="Weight" type="number" value={form.weight} onChange={(v: string) => setField("weight", v)} />
          </div>
        </ModalSection>

        <ModalSection title="Specifications">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["ram", "RAM"], ["battery", "Battery"], ["storage", "Storage"], ["camera", "Camera"],
              ["cpu", "CPU"], ["gpu", "GPU"], ["display", "Display"], ["os", "Operating System"], ["connectivity", "Connectivity"]
            ].map(([key, label]) => <Input key={key} label={label} value={form[key]} onChange={(v: string) => setField(key, v)} />)}

            <Select label="Warranty" value={form.warranty} onChange={(v: string) => setField("warranty", v)} options={[
              "No Warranty", "3 Months", "6 Months", "12 Months", "24 Months"
            ].map(x => ({ id: x, name: x }))} />

            <Select label="Tag" value={form.tag} onChange={(v: string) => setField("tag", v)} options={[
              "Featured", "Best Seller", "New Arrival", "Trending", "Hot Deal", "Product Page"
            ].map(x => ({ id: x, name: x }))} />
          </div>

          <textarea value={form.description} onChange={e => setField("description", e.target.value)} rows={4} placeholder="Write a clear product description..." className={`${inputClass} mt-3 resize-none`} />

          <div className="mt-3 flex flex-wrap gap-2">
            <Toggle checked={form.is_flash_deal} onChange={(v: boolean) => setField("is_flash_deal", v)} label="Flash Deal" icon={<Zap className="h-3.5 w-3.5" />} />
            <Toggle checked={form.status} onChange={(v: boolean) => setField("status", v)} label="Active" icon={<CheckCircle2 className="h-3.5 w-3.5" />} />
          </div>
        </ModalSection>

        <ImageUploader title="Product Images" images={form.images} onFiles={(f: FileList | null) => addImages(f)} onRemove={(i: number) => removeImage(i)} imageUrl={imageUrl} />

        <ModalSection title="Variants" action={<button type="button" onClick={addVariant} className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/15"><Plus className="h-3.5 w-3.5" /> Add Variant</button>}>
          <p className="mb-3 text-[11px] text-slate-400">Each variant can have its own color, storage, RAM, price, stock and multiple images.</p>

          <div className="space-y-3">
            {form.variants.length === 0 ? <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-xs text-slate-400">No variants added.</div> :
            form.variants.map((v: Variant, i: number) => <div key={v.id || `v-${i}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
              <div className="mb-3 flex items-center justify-between"><div><p className="text-xs font-bold text-slate-800">Variant {i + 1}</p>{v.id && <p className="text-[10px] text-slate-400">ID: {v.id}</p>}</div><button type="button" onClick={() => removeVariant(i)} className="rounded-lg px-2 py-1.5 text-[11px] font-semibold text-red-600 hover:bg-red-50"><Trash2 className="mr-1 inline h-3.5 w-3.5" /> Remove</button></div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["sku", "SKU"], ["name", "Name"], ["color", "Color"], ["storage", "Storage"], ["ram", "RAM"],
                  ["original_price", "Original Price"], ["discount_percentage", "Discount %"], ["price", "Price"], ["stock", "Stock"], ["weight", "Weight"]
                ].map(([key, label]) => <Input key={key} label={label} type={["original_price", "discount_percentage", "price", "stock", "weight"].includes(key) ? "number" : "text"} value={String(v[key as keyof Variant] ?? "")} readOnly={key === "price"} onChange={(value: string) => updateVariant(i, key as keyof Variant, value)} />)}
              </div>

              <div className="mt-3"><Toggle checked={v.status} onChange={(value: boolean) => updateVariant(i, "status", value)} label="Variant Active" icon={<CheckCircle2 className="h-3.5 w-3.5" />} /></div>

              <ImageUploader title="Variant Images" images={v.images} onFiles={(f: FileList | null) => addImages(f, i)} onRemove={(x: number) => removeImage(x, i)} imageUrl={imageUrl} />
            </div>)}
          </div>
        </ModalSection>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-100 bg-white px-4 py-3.5">
        <button onClick={close} className={`${buttonClass} border border-slate-200 bg-white text-slate-600`}>Cancel</button>
        <button disabled={loading} onClick={save} className={`${buttonClass} bg-primary text-white shadow-sm hover:bg-primary/90`}><Save className="h-4 w-4" />{loading ? "Saving..." : editing ? "Save Changes" : "Create Product"}</button>
      </div>
    </div>
  </div>;
}

function ViewModal({ product, close, imageUrl }: any) {
  const stock = Number(product.stock || 0);

  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-2 backdrop-blur-sm sm:p-5">
    <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="min-w-0"><div className="flex items-center gap-2"><div className="rounded-lg bg-primary/10 p-2 text-primary"><Eye className="h-4 w-4" /></div><h2 className="truncate text-base font-bold text-slate-900 sm:text-lg">{product.name}</h2></div><p className="mt-1 truncate text-[11px] text-slate-400">{product.brand?.name || "—"} · {product.model || product.sku || "Product"}</p></div>
        <button onClick={close} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
      </div>

      <div className="overflow-y-auto p-4 sm:p-5">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Info label="Price" value={`₦${Number(product.price).toLocaleString()}`} />
          <Info label="Stock" value={`${stock} units`} />
          <Info label="Condition" value={product.condition || "—"} />
          <Info label="Status" value={product.status === false ? "Inactive" : "Active"} />
          <Info label="Category" value={product.category?.name || "—"} />
          <Info label="Brand" value={product.brand?.name || "—"} />
          <Info label="Seller" value={product.seller?.store_name || product.seller?.name || "—"} />
          <Info label="Warranty" value={product.warranty || "—"} />
          <Info label="Tag" value={product.tag || "—"} />
        </div>

        {product.images?.length > 0 && <div className="mt-5"><SectionTitle title="Product Images" /><div className="grid grid-cols-3 gap-2 sm:grid-cols-5">{product.images.map((img: ImageItem, i: number) => <img key={img.id || i} src={imageUrl(img)} alt={`${product.name} ${i + 1}`} className="aspect-square w-full rounded-xl border border-slate-100 bg-slate-50 object-cover" />)}</div></div>}

        <div className="mt-5"><SectionTitle title={`Variants (${product.variants?.length || 0})`} />
          <div className="space-y-2.5">
            {product.variants?.length ? product.variants.map((v: Variant, i: number) => <div key={v.id || i} className="rounded-xl border border-slate-200 p-3.5">
              <div className="flex flex-col justify-between gap-2 sm:flex-row"><div><p className="text-xs font-bold text-slate-800">{v.name || [v.storage, v.color, v.ram].filter(Boolean).join(" ") || `Variant ${i + 1}`}</p><p className="mt-0.5 text-[10px] text-slate-400">SKU: {v.sku || "—"}</p></div><div className="sm:text-right"><p className="text-xs font-bold text-slate-800">₦{Number(v.price).toLocaleString()}</p><p className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${Number(v.stock) > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>{v.stock} in stock</p></div></div>

              <div className="mt-2 flex flex-wrap gap-1.5">{[["Color", v.color], ["Storage", v.storage], ["RAM", v.ram]].filter(([, x]) => x).map(([label, value]) => <span key={label} className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] text-slate-600">{label}: <b>{value}</b></span>)}</div>

              {v.images?.length > 0 && <div className="mt-3 flex gap-2 overflow-x-auto">{v.images.map((img: ImageItem, x: number) => <img key={img.id || x} src={imageUrl(img)} alt="" className="h-14 w-14 shrink-0 rounded-lg border object-cover" />)}</div>}
            </div>) : <div className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-400">This product has no variants.</div>}
          </div>
        </div>

        {product.description && <div className="mt-5"><SectionTitle title="Description" /><p className="whitespace-pre-line rounded-xl bg-slate-50 p-3.5 text-xs leading-5 text-slate-600">{product.description}</p></div>}
      </div>
    </div>
  </div>;
}

function ModalSection({ title, action, children }: any) {
  return <section className="mb-6"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold text-slate-800">{title}</h3>{action}</div>{children}</section>;
}

function SectionTitle({ title }: { title: string }) {
  return <h3 className="mb-2.5 text-sm font-bold text-slate-800">{title}</h3>;
}

function Input({ label, value, onChange, type = "text", readOnly = false }: any) {
  return <label className="block"><span className="mb-1 block text-[11px] font-medium text-slate-500">{label}</span><input type={type} value={value ?? ""} readOnly={readOnly} onChange={e => onChange(e.target.value)} className={`${inputClass} ${readOnly ? "bg-slate-50 text-slate-500" : ""}`} /></label>;
}

function Select({ label, value, onChange, options, disabled = false }: any) {
  return <label className="block"><span className="mb-1 block text-[11px] font-medium text-slate-500">{label}</span><select value={value} disabled={disabled} onChange={e => onChange(e.target.value)} className={`${inputClass} ${disabled ? "cursor-not-allowed bg-slate-50 text-slate-400" : ""}`}><option value="">{disabled ? "Select a category first" : `All / Select ${label}`}</option>{options.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></label>;
}

function Toggle({ checked, onChange, label, icon }: any) {
  return <button type="button" onClick={() => onChange(!checked)} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-semibold transition ${checked ? "border-primary/20 bg-primary/10 text-primary" : "border-slate-200 bg-white text-slate-500"}`}>{icon}{label}<span className={`ml-1 h-3.5 w-6 rounded-full p-0.5 ${checked ? "bg-primary" : "bg-slate-300"}`}><span className={`block h-2.5 w-2.5 rounded-full bg-white transition ${checked ? "translate-x-2.5" : ""}`} /></span></button>;
}

function IconButton({ children, onClick, title, className = "" }: any) {
  return <button title={title} onClick={onClick} className={`rounded-lg p-2 text-slate-500 hover:bg-slate-100 ${className}`}>{children}</button>;
}

function ImageUploader({ title, images, onFiles, onRemove, imageUrl }: any) {
  return <section className="mb-6"><div className="mb-2 flex items-center justify-between"><div><h3 className="text-sm font-bold text-slate-800">{title}</h3><p className="text-[10px] text-slate-400">{images.length} image{images.length === 1 ? "" : "s"}</p></div><label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 hover:border-primary hover:text-primary"><ImagePlus className="h-3.5 w-3.5" /> Add Images<input type="file" multiple accept="image/jpeg,image/png,image/webp" hidden onChange={e => { onFiles(e.target.files); e.target.value = ""; }} /></label></div>

    {images.length ? <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">{images.map((image: any, i: number) => <div key={image instanceof File ? `${image.name}-${image.lastModified}-${i}` : image.id || i} className="group relative overflow-hidden rounded-xl"><img src={imageUrl(image)} alt="" className="aspect-square w-full border border-slate-200 bg-slate-50 object-cover" onError={e => e.currentTarget.style.display = "none"} /><button type="button" onClick={() => onRemove(i)} className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white shadow"><X className="h-3 w-3" /></button>{image instanceof File && <span className="absolute bottom-1 left-1 rounded bg-slate-900/70 px-1.5 py-0.5 text-[9px] text-white">New</span>}</div>)}</div> :
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-[11px] text-slate-400">No images added yet.</div>}
  </section>;
}

function Info({ label, value }: { label: string; value: any }) {
  return <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] text-slate-400">{label}</p><p className="mt-1 truncate text-xs font-semibold text-slate-700">{value}</p></div>;
}