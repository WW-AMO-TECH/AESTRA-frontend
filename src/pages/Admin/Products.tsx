import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Plus, Search, Filter, Download, Upload, Eye, Pencil, Trash2,
  X, ChevronLeft, ChevronRight, ImagePlus, Package, Save
} from "lucide-react";
import Sidebar from "@/components/Admin/Sidebar";
import { useAuth } from "@/context/AuthContext";

const API = import.meta.env.VITE_API_URL || "https://aestra.onrender.com/api";
const SERVER_URL = API.replace(/\/api\/?$/, "");

type ImageItem = {
  id?: number;
  image_url?: string;
  url?: string;
  path?: string;
  is_primary?: boolean;
  sort_order?: number;
};

type Variant = {
  id?: number;
  sku: string;
  name: string;
  color: string;
  storage: string;
  ram: string;
  original_price: string;
  discount_percentage: string;
  price: string;
  stock: string;
  weight: string;
  status: boolean;
  images: (File | ImageItem)[];
};

type Product = {
  id: number;
  sku?: string;
  slug?: string;
  name: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  stock: number;
  condition?: string;
  grade?: string;
  model?: string;
  color?: string;
  weight?: number;
  ram?: string;
  battery?: string;
  storage?: string;
  camera?: string;
  cpu?: string;
  gpu?: string;
  display?: string;
  os?: string;
  connectivity?: string;
  warranty?: string;
  tag?: string;
  description?: string;
  is_flash_deal?: boolean;
  status?: boolean;
  brand?: { id: number; name: string };
  category?: { id: number; name: string };
  images?: ImageItem[];
  variants?: Variant[];
};

type FormState = {
  sku: string;
  name: string;
  category_id: string;
  brand_id: string;
  price: string;
  original_price: string;
  discount_percentage: string;
  stock: string;
  model: string;
  grade: string;
  condition: string;
  color: string;
  weight: string;
  ram: string;
  battery: string;
  storage: string;
  camera: string;
  cpu: string;
  gpu: string;
  display: string;
  os: string;
  connectivity: string;
  warranty: string;
  tag: string;
  is_flash_deal: boolean;
  status: boolean;
  description: string;
  images: (File | ImageItem)[];
  variants: Variant[];
};

const emptyVariant = (): Variant => ({
  sku: "",
  name: "",
  color: "",
  storage: "",
  ram: "",
  original_price: "",
  discount_percentage: "0",
  price: "",
  stock: "0",
  weight: "",
  status: true,
  images: [],
});

const emptyForm: FormState = {
  sku: "",
  name: "",
  category_id: "",
  brand_id: "",
  price: "",
  original_price: "",
  discount_percentage: "0",
  stock: "0",
  model: "",
  grade: "",
  condition: "Original",
  color: "",
  weight: "",
  ram: "",
  battery: "",
  storage: "",
  camera: "",
  cpu: "",
  gpu: "",
  display: "",
  os: "",
  connectivity: "",
  warranty: "",
  tag: "",
  is_flash_deal: false,
  status: true,
  description: "",
  images: [],
  variants: [],
};

export default function AdminProducts() {
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [condition, setCondition] = useState("");

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const token = localStorage.getItem("token");

  const api = useMemo(
    () =>
      axios.create({
        baseURL: API,
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            }
          : {
              Accept: "application/json",
            },
      }),
    [token]
  );

  const showMessage = (
    text: string,
    type: "success" | "error" = "success"
  ) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const getErrorMessage = (error: any) => {
    const response = error?.response?.data;

    if (response?.errors) {
      const errors = Object.entries(response.errors)
        .flatMap(([field, messages]: any) =>
          Array.isArray(messages)
            ? messages.map((msg: string) => `${field}: ${msg}`)
            : [`${field}: ${messages}`]
        );

      if (errors.length) return errors.join(" | ");
    }

    return (
      response?.message ||
      response?.error ||
      error?.message ||
      "Something went wrong."
    );
  };

  const getList = (response: any) => {
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    return [];
  };

  const loadProducts = async () => {
    try {
      setLoading(true);

      const res = await api.get("/admin/products", {
        params: {
          search: search || undefined,
          category_id: category || undefined,
          brand_id: brand || undefined,
          condition: condition || undefined,
          page,
          per_page: 10,
        },
      });

      const response = res.data;

      setProducts(
        Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.data)
          ? response.data.data
          : []
      );

      setLastPage(
        response?.meta?.last_page ||
          response?.data?.last_page ||
          response?.last_page ||
          1
      );
    } catch (error: any) {
      console.error("Load products error:", error);
      showMessage(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  };

  const loadMeta = async () => {
    try {
      const [c, b] = await Promise.all([
        api.get("/categories"),
        api.get("/brands"),
      ]);

      setCategories(getList(c.data));
      setBrands(getList(b.data));
    } catch (error: any) {
      console.error("Load metadata error:", error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [page, search, category, brand, condition]);

  useEffect(() => {
    loadMeta();
  }, []);

  const resetForm = () => {
    setForm({ ...emptyForm, variants: [], images: [] });
    setEditingId(null);
    setShowModal(false);
  };

  const openAdd = () => {
    setForm({ ...emptyForm, variants: [], images: [] });
    setEditingId(null);
    setShowModal(true);
    setMessage("");
  };

  const openEdit = async (product: Product) => {
    try {
      setLoading(true);

      const res = await api.get(`/admin/products/${product.id}`);
      const p = res.data?.data || res.data;

      setEditingId(p.id);

      setForm({
        sku: p.sku || "",
        name: p.name || "",
        category_id: String(p.category?.id || p.category_id || ""),
        brand_id: String(p.brand?.id || p.brand_id || ""),
        price: String(p.price ?? ""),
        original_price: String(p.original_price ?? ""),
        discount_percentage: String(p.discount_percentage ?? 0),
        stock: String(p.stock ?? 0),
        model: p.model || "",
        grade: p.grade || "",
        condition:
        p.condition === "Refurbished"
          ? "Refurbished"
          : "Original",
        color: p.color || "",
        weight: String(p.weight ?? ""),
        ram: p.ram || "",
        battery: p.battery || "",
        storage: p.storage || "",
        camera: p.camera || "",
        cpu: p.cpu || "",
        gpu: p.gpu || "",
        display: p.display || "",
        os: p.os || "",
        connectivity: p.connectivity || "",
        warranty: p.warranty || "",
        tag: p.tag || "",
        is_flash_deal: !!p.is_flash_deal,
        status: p.status !== false,
        description: p.description || "",
        images: Array.isArray(p.images) ? p.images : [],
        variants: Array.isArray(p.variants)
          ? p.variants.map((v: any) => ({
              id: v.id,
              sku: v.sku || "",
              name: v.name || "",
              color: v.color || "",
              storage: v.storage || "",
              ram: v.ram || "",
              original_price: String(v.original_price ?? ""),
              discount_percentage: String(v.discount_percentage ?? 0),
              price: String(v.price ?? ""),
              stock: String(v.stock ?? 0),
              weight: String(v.weight ?? ""),
              status: v.status !== false,
              images: Array.isArray(v.images) ? v.images : [],
            }))
          : [],
      });

      setShowModal(true);
    } catch (error: any) {
      console.error("Open edit error:", error);
      showMessage(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  };

  const setField = (key: keyof FormState, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const addVariant = () => {
    setForm(prev => ({
      ...prev,
      variants: [...prev.variants, emptyVariant()],
    }));
  };

  const removeVariant = (index: number) => {
    setForm(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const updateVariant = (
    index: number,
    key: keyof Variant,
    value: any
  ) => {
    setForm(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === index ? { ...v, [key]: value } : v
      ),
    }));
  };

  const addImages = (
    files: FileList | null,
    variantIndex?: number
  ) => {
    if (!files?.length) return;

    const selected = Array.from(files);

    if (variantIndex === undefined) {
      setForm(prev => ({
        ...prev,
        images: [...prev.images, ...selected],
      }));
    } else {
      setForm(prev => ({
        ...prev,
        variants: prev.variants.map((v, i) =>
          i === variantIndex
            ? { ...v, images: [...v.images, ...selected] }
            : v
        ),
      }));
    }
  };

  const getImageUrl = (image: any) => {
    if (!image) return "";

    if (image instanceof File) {
      return URL.createObjectURL(image);
    }

    if (typeof image === "string") {
      if (image.startsWith("blob:") || image.startsWith("http")) {
        return image;
      }

      return `${SERVER_URL}/${image.replace(/^\/+/, "")}`;
    }

    const raw =
      image.image_url ||
      image.url ||
      image.path ||
      image.image ||
      "";

    if (!raw) return "";

    if (
      raw.startsWith("http") ||
      raw.startsWith("blob:")
    ) {
      return raw;
    }

    return `${SERVER_URL}/${raw.replace(/^\/+/, "")}`;
  };

  const removeImage = (
    index: number,
    variantIndex?: number
  ) => {
    if (variantIndex === undefined) {
      setForm(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    } else {
      setForm(prev => ({
        ...prev,
        variants: prev.variants.map((v, i) =>
          i === variantIndex
            ? {
                ...v,
                images: v.images.filter((_, x) => x !== index),
              }
            : v
        ),
      }));
    }
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      showMessage("Product name is required.", "error");
      return false;
    }

    if (!form.category_id) {
      showMessage("Please select a category.", "error");
      return false;
    }

    if (!form.brand_id) {
      showMessage("Please select a brand.", "error");
      return false;
    }

    if (!form.price || Number(form.price) < 0) {
      showMessage("Please enter a valid product price.", "error");
      return false;
    }

    for (let i = 0; i < form.variants.length; i++) {
      const v = form.variants[i];

      if (!v.sku.trim()) {
        showMessage(`Variant ${i + 1}: SKU is required.`, "error");
        return false;
      }

      if (!v.price || Number(v.price) < 0) {
        showMessage(
          `Variant ${i + 1}: Please enter a valid price.`,
          "error"
        );
        return false;
      }

      if (v.stock === "" || Number(v.stock) < 0) {
        showMessage(
          `Variant ${i + 1}: Please enter a valid stock quantity.`,
          "error"
        );
        return false;
      }
    }

    return true;
  };

  const appendBoolean = (
    data: FormData,
    key: string,
    value: boolean
  ) => {
    data.append(key, value ? "1" : "0");
  };

  const appendProductFields = (data: FormData) => {
    const fields: (keyof FormState)[] = [
      "sku",
      "name",
      "category_id",
      "brand_id",
      "price",
      "original_price",
      "discount_percentage",
      "stock",
      "model",
      "grade",
      "condition",
      "color",
      "weight",
      "ram",
      "battery",
      "storage",
      "camera",
      "cpu",
      "gpu",
      "display",
      "os",
      "connectivity",
      "warranty",
      "tag",
      "description",
    ];

    fields.forEach(key => {
      const value = form[key];

      if (value !== undefined && value !== null) {
        data.append(key, String(value));
      }
    });

    appendBoolean(data, "is_flash_deal", form.is_flash_deal);
    appendBoolean(data, "status", form.status);
  };

  const appendVariant = (
    data: FormData,
    variant: Variant,
    index: number
  ) => {
    data.append(
      `variants[${index}][sku]`,
      variant.sku.trim()
    );

    data.append(
      `variants[${index}][name]`,
      variant.name.trim()
    );

    data.append(
      `variants[${index}][color]`,
      variant.color.trim()
    );

    data.append(
      `variants[${index}][storage]`,
      variant.storage.trim()
    );

    data.append(
      `variants[${index}][ram]`,
      variant.ram.trim()
    );

    data.append(
      `variants[${index}][original_price]`,
      variant.original_price || ""
    );

    data.append(
      `variants[${index}][discount_percentage]`,
      variant.discount_percentage || "0"
    );

    data.append(
      `variants[${index}][price]`,
      variant.price
    );

    data.append(
      `variants[${index}][stock]`,
      variant.stock
    );

    data.append(
      `variants[${index}][weight]`,
      variant.weight || ""
    );

    data.append(
      `variants[${index}][status]`,
      variant.status ? "1" : "0"
    );

    if (variant.id) {
      data.append(
        `variants[${index}][id]`,
        String(variant.id)
      );
    }
  };

  const calculatePrice = (originalPrice: string, discount: string) => {
    const original = Number(originalPrice);
    const discountPercent = Number(discount);

    if (!original || original <= 0) return "";

    if (!discountPercent || discountPercent <= 0) {
      return String(original);
    }

    return String(
      Math.max(0, original - (original * discountPercent) / 100)
    );
  };

  const saveProduct = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setMessage("");

      if (!editingId) {
        const data = new FormData();

        appendProductFields(data);

        form.images.forEach(image => {
          if (image instanceof File) {
            data.append("images[]", image);
          }
        });

        form.variants.forEach((variant, index) => {
          appendVariant(data, variant, index);

          variant.images.forEach(image => {
            if (image instanceof File) {
              data.append(
                `variant_images[${index}][]`,
                image
              );
            }
          });
        });

        /*
         * IMPORTANT:
         * Do not manually set Content-Type here.
         * Axios/browser automatically adds the multipart boundary.
         */
        const res = await api.post(
          "/admin/products",
          data
        );

        console.log("CREATE PRODUCT RESPONSE:", res.data);

        showMessage(
          res.data?.message ||
            "Product created successfully",
          "success"
        );
      } else {
        /*
         * Update normal product fields.
         */
        const data: Record<string, any> = {};

        const fields: (keyof FormState)[] = [
          "sku",
          "name",
          "category_id",
          "brand_id",
          "price",
          "original_price",
          "discount_percentage",
          "stock",
          "model",
          "grade",
          "condition",
          "color",
          "weight",
          "ram",
          "battery",
          "storage",
          "camera",
          "cpu",
          "gpu",
          "display",
          "os",
          "connectivity",
          "warranty",
          "tag",
          "description",
        ];

        fields.forEach(key => {
          data[key] = form[key];
        });

        data.is_flash_deal = form.is_flash_deal;
        data.status = form.status;

        await api.put(
          `/admin/products/${editingId}`,
          data
        );

        /*
         * Update existing variants or create new variants.
         */
        const existingVariantIds: number[] = [];

        for (const variant of form.variants) {
          const payload = {
            sku: variant.sku.trim(),
            name: variant.name.trim(),
            color: variant.color.trim(),
            storage: variant.storage.trim(),
            ram: variant.ram.trim(),
            original_price:
              variant.original_price || null,
            discount_percentage:
              Number(variant.discount_percentage || 0),
            price: Number(variant.price),
            stock: Number(variant.stock),
            weight: variant.weight || null,
            status: variant.status,
          };

          if (variant.id) {
            await api.put(
              `/admin/products/${editingId}/variants/${variant.id}`,
              payload
            );

            existingVariantIds.push(variant.id);
          } else {
            const createdVariant = await api.post(
              `/admin/products/${editingId}/variants`,
              payload
            );

            const newId =
              createdVariant.data?.data?.id ||
              createdVariant.data?.id;

            if (newId) {
              variant.id = newId;
              existingVariantIds.push(newId);
            }
          }
        }

        /*
         * Upload newly added main product images.
         */
        const mainFiles = form.images.filter(
          image => image instanceof File
        ) as File[];

        if (mainFiles.length) {
          const fd = new FormData();

          mainFiles.forEach(file => {
            fd.append("images[]", file);
          });

          await api.post(
            `/admin/products/${editingId}/images`,
            fd
          );
        }

        /*
         * Upload newly added variant images.
         */
        for (const variant of form.variants) {
          const files = variant.images.filter(
            image => image instanceof File
          ) as File[];

          if (!files.length || !variant.id) continue;

          const fd = new FormData();

          files.forEach(file => {
            fd.append("images[]", file);
          });

          await api.post(
            `/admin/products/${editingId}/variants/${variant.id}/images`,
            fd
          );
        }

        showMessage(
          "Product updated successfully",
          "success"
        );
      }

      resetForm();
      await loadProducts();
    } catch (error: any) {
      console.error(
        "SAVE PRODUCT ERROR:",
        error?.response?.data || error
      );

      showMessage(
        getErrorMessage(error),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: number) => {
    if (
      !confirm(
        "Delete this product and all its variants/images?"
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      await api.delete(`/admin/products/${id}`);

      showMessage(
        "Product deleted successfully",
        "success"
      );

      await loadProducts();
    } catch (error: any) {
      console.error("Delete product error:", error);

      showMessage(
        getErrorMessage(error),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const exportProducts = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        "/admin/products/export",
        {
          responseType: "blob",
        }
      );

      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");

      a.href = url;
      a.download = "products.xlsx";

      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Export error:", error);

      showMessage(
        getErrorMessage(error),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const importProducts = async (file: File) => {
    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("file", file);

      await api.post(
        "/admin/products/import",
        fd
      );

      showMessage(
        "Products imported successfully",
        "success"
      );

      await loadProducts();
    } catch (error: any) {
      console.error(
        "Import error:",
        error?.response?.data || error
      );

      showMessage(
        getErrorMessage(error),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary/20 lg:flex">
      <Sidebar user={user} />

      <main className="min-w-0 flex-1">
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">

            {/* HEADER */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Products
                </h1>

                <p className="text-sm text-slate-500">
                  Manage products, variants, prices and inventory.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <label className="cursor-pointer rounded-xl border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">
                  <Upload className="mr-2 inline h-4 w-4" />
                  Import

                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    hidden
                    onChange={e => {
                      if (e.target.files?.[0]) {
                        importProducts(
                          e.target.files[0]
                        );
                        e.target.value = "";
                      }
                    }}
                  />
                </label>

                <button
                  onClick={exportProducts}
                  className="rounded-xl border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
                >
                  <Download className="mr-2 inline h-4 w-4" />
                  Export
                </button>

                <button
                  onClick={openAdd}
                  className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                >
                  <Plus className="mr-2 inline h-4 w-4" />
                  Add Product
                </button>
              </div>
            </div>

            {/* SEARCH/FILTER */}
            <div className="mb-5 rounded-2xl border bg-white p-3 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    value={search}
                    onChange={e => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search products..."
                    className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none focus:border-green-500"
                  />
                </div>

                <button
                  onClick={() =>
                    setShowFilters(!showFilters)
                  }
                  className="rounded-xl border px-4 py-2.5 text-sm font-medium"
                >
                  <Filter className="mr-2 inline h-4 w-4" />
                  Filter
                </button>
              </div>

              {showFilters && (
                <div className="mt-3 grid gap-3 border-t pt-3 sm:grid-cols-3">
                  <select
                    value={category}
                    onChange={e => {
                      setCategory(e.target.value);
                      setPage(1);
                    }}
                    className="rounded-xl border p-2.5 text-sm"
                  >
                    <option value="">
                      All Categories
                    </option>

                    {categories.map(c => (
                      <option
                        key={c.id}
                        value={c.id}
                      >
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={brand}
                    onChange={e => {
                      setBrand(e.target.value);
                      setPage(1);
                    }}
                    className="rounded-xl border p-2.5 text-sm"
                  >
                    <option value="">
                      All Brands
                    </option>

                    {brands.map(b => (
                      <option
                        key={b.id}
                        value={b.id}
                      >
                        {b.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={condition}
                    onChange={e => {
                      setCondition(e.target.value);
                      setPage(1);
                    }}
                    className="rounded-xl border p-2.5 text-sm"
                  >
                    <option value="">
                      All Conditions
                    </option>

                    <option value="Original">
                      Original
                    </option>

                    <option value="Refurbished">
                      Refurbished
                    </option>
                  </select>
                </div>
              )}
            </div>

            {message && (
              <div
                className={`mb-4 rounded-xl p-3 text-sm ${
                  messageType === "error"
                    ? "bg-red-50 text-red-700"
                    : "bg-green-50 text-green-700"
                }`}
              >
                {message}
              </div>
            )}

            {/* TABLE */}
            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px] text-left text-sm">
                  <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-4">
                        Product
                      </th>

                      <th className="px-5 py-4">
                        Brand
                      </th>

                      <th className="px-5 py-4">
                        Price
                      </th>

                      <th className="px-5 py-4">
                        Tag
                      </th>

                      <th className="px-5 py-4">
                        Stock
                      </th>

                      <th className="px-5 py-4 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {loading ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-10 text-center text-slate-500"
                        >
                          Loading products...
                        </td>
                      </tr>
                    ) : products.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-10 text-center text-slate-500"
                        >
                          No products found.
                        </td>
                      </tr>
                    ) : (
                      products.map(product => {
                        const image =
                          product.images?.[0];

                        return (
                          <tr
                            key={product.id}
                            className="hover:bg-slate-50"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-12 overflow-hidden rounded-xl bg-slate-100">
                                  {image &&
                                  getImageUrl(image) ? (
                                    <img
                                      src={getImageUrl(image)}
                                      alt={product.name}
                                      className="h-full w-full object-cover"
                                      onError={e => {
                                        e.currentTarget.style.display =
                                          "none";
                                      }}
                                    />
                                  ) : (
                                    <Package className="m-3 h-6 w-6 text-slate-400" />
                                  )}
                                </div>

                                <div>
                                  <p className="font-semibold text-slate-900">
                                    {product.name}
                                  </p>

                                  <p className="text-xs text-slate-500">
                                    {product.model ||
                                      product.sku ||
                                      "—"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              {product.brand?.name || "—"}
                            </td>

                            <td className="px-5 py-4 font-semibold">
                              ₦
                              {Number(
                                product.price
                              ).toLocaleString()}
                            </td>

                            <td className="px-5 py-4">
                              {product.tag ? (
                                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                                  {product.tag}
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>

                            <td className="px-5 py-4">
                              {product.stock}
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() =>
                                    setViewProduct(product)
                                  }
                                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                                  title="View"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>

                                <button
                                  onClick={() =>
                                    openEdit(product)
                                  }
                                  className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                                  title="Edit"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>

                                <button
                                  onClick={() =>
                                    deleteProduct(
                                      product.id
                                    )
                                  }
                                  className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="flex items-center justify-between border-t p-4">
                <span className="text-sm text-slate-500">
                  Page {page} of {lastPage}
                </span>

                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() =>
                      setPage(p => p - 1)
                    }
                    className="rounded-lg border p-2 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button
                    disabled={page >= lastPage}
                    onClick={() =>
                      setPage(p => p + 1)
                    }
                    className="rounded-lg border p-2 disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-3 sm:p-5">
          <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-4 sm:p-5">
              <div>
                <h2 className="text-lg font-bold">
                  {editingId
                    ? "Edit Product"
                    : "Add Product"}
                </h2>

                <p className="text-xs text-slate-500">
                  Add product information, variants and images.
                </p>
              </div>

              <button
                onClick={resetForm}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-6">
              {/* BASIC */}
              <section>
                <h3 className="mb-3 font-semibold">Basic Information</h3>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Input
                    label="Product Name"
                    value={form.name}
                    onChange={v => setField("name", v)}
                  />

                  <Input
                    label="SKU"
                    value={form.sku}
                    onChange={v => setField("sku", v)}
                  />

                  <Input
                    label="Model"
                    value={form.model}
                    onChange={v => setField("model", v)}
                  />

                  <Select
                    label="Category"
                    value={form.category_id}
                    onChange={v => setField("category_id", v)}
                    options={categories}
                  />

                  <Select
                    label="Brand"
                    value={form.brand_id}
                    onChange={v => setField("brand_id", v)}
                    options={brands}
                  />

                  <Select
                    label="Condition"
                    value={form.condition}
                    onChange={v => setField("condition", v)}
                    options={[
                      { id: "Original", name: "Original" },
                      { id: "Refurbished", name: "Refurbished" },
                    ]}
                  />

                  <Select
                    label="Grade"
                    value={form.grade}
                    onChange={v => setField("grade", v)}
                    options={[
                      { id: "New", name: "New" },
                      { id: "A", name: "Grade A" },
                      { id: "B", name: "Grade B" },
                      { id: "C", name: "Grade C" },
                    ]}
                  />

                  <Input
                    label="Original Price"
                    type="number"
                    value={form.original_price}
                    onChange={v => {
                      setForm(prev => ({
                        ...prev,
                        original_price: v,
                        price: calculatePrice(v, prev.discount_percentage),
                      }));
                    }}
                  />

                  <Input
                    label="Discount %"
                    type="number"
                    value={form.discount_percentage}
                    onChange={v => {
                      setForm(prev => ({
                        ...prev,
                        discount_percentage: v,
                        price: calculatePrice(prev.original_price, v),
                      }));
                    }}
                  />

                  <Input
                    label="Price"
                    type="number"
                    value={form.price}
                    onChange={() => {}}
                  />

                  <Input
                    label="Stock"
                    type="number"
                    value={form.stock}
                    onChange={v => setField("stock", v)}
                  />

                  <Input
                    label="Color"
                    value={form.color}
                    onChange={v => setField("color", v)}
                  />

                  <Input
                    label="Weight"
                    value={form.weight}
                    onChange={v => setField("weight", v)}
                  />
                </div>
              </section>

              {/* SPECS */}
              <section className="mt-6">
                <h3 className="mb-3 font-semibold">Specifications</h3>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Input
                    label="RAM"
                    value={form.ram}
                    onChange={v => setField("ram", v)}
                  />

                  <Input
                    label="Battery"
                    value={form.battery}
                    onChange={v => setField("battery", v)}
                  />

                  <Input
                    label="Storage"
                    value={form.storage}
                    onChange={v => setField("storage", v)}
                  />

                  <Input
                    label="Camera"
                    value={form.camera}
                    onChange={v => setField("camera", v)}
                  />

                  <Input
                    label="CPU"
                    value={form.cpu}
                    onChange={v => setField("cpu", v)}
                  />

                  <Input
                    label="GPU"
                    value={form.gpu}
                    onChange={v => setField("gpu", v)}
                  />

                  <Input
                    label="Display"
                    value={form.display}
                    onChange={v => setField("display", v)}
                  />

                  <Input
                    label="Operating System"
                    value={form.os}
                    onChange={v => setField("os", v)}
                  />

                  <Input
                    label="Connectivity"
                    value={form.connectivity}
                    onChange={v => setField("connectivity", v)}
                  />

                  <Select
                    label="Warranty"
                    value={form.warranty}
                    onChange={v => setField("warranty", v)}
                    options={[
                      { id: "No Warranty", name: "No Warranty" },
                      { id: "3 Months", name: "3 Months" },
                      { id: "6 Months", name: "6 Months" },
                      { id: "12 Months", name: "12 Months" },
                      { id: "24 Months", name: "24 Months" },
                    ]}
                  />

                  <Select
                    label="Tag"
                    value={form.tag}
                    onChange={v => setField("tag", v)}
                    options={[
                      { id: "New Arrival", name: "New Arrival" },
                      { id: "Best Seller", name: "Best Seller" },
                      { id: "Featured", name: "Featured" },
                      { id: "Hot Deal", name: "Hot Deal" },
                      { id: "Sale", name: "Sale" },
                    ]}
                  />
                </div>

                <textarea
                  value={form.description}
                  onChange={e => setField("description", e.target.value)}
                  placeholder="Product description..."
                  rows={4}
                  className="mt-3 w-full rounded-xl border p-3 text-sm outline-none focus:border-green-500"
                />

                <div className="mt-3 flex flex-wrap gap-5 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.is_flash_deal}
                      onChange={e =>
                        setField("is_flash_deal", e.target.checked)
                      }
                    />
                    Flash Deal
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.status}
                      onChange={e =>
                        setField("status", e.target.checked)
                      }
                    />
                    Active
                  </label>
                </div>
              </section>

              {/* PRODUCT IMAGES */}
              <ImageUploader
                title="Product Images"
                images={form.images}
                onFiles={files =>
                  addImages(files)
                }
                onRemove={i =>
                  removeImage(i)
                }
              />

              {/* VARIANTS */}
              <section className="mt-7">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">
                      Variants
                    </h3>

                    <p className="text-xs text-slate-500">
                      Add different colors, storage sizes, prices and stock.
                    </p>
                  </div>

                  <button
                    onClick={addVariant}
                    type="button"
                    className="rounded-xl bg-green-50 px-3 py-2 text-sm font-semibold text-green-700"
                  >
                    <Plus className="mr-1 inline h-4 w-4" />
                    Add Variant
                  </button>
                </div>

                <div className="space-y-4">
                  {form.variants.map(
                    (variant, i) => (
                      <div
                        key={
                          variant.id ||
                          `variant-${i}`
                        }
                        className="rounded-2xl border bg-slate-50 p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="font-semibold">
                            Variant {i + 1}
                          </h4>

                          <button
                            type="button"
                            onClick={() =>
                              removeVariant(i)
                            }
                            className="text-sm text-red-600"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          {[
                            ["sku", "SKU"],
                            ["name", "Name"],
                            ["color", "Color"],
                            ["storage", "Storage"],
                            ["ram", "RAM"],
                            [
                              "original_price",
                              "Original Price",
                            ],
                            [
                              "discount_percentage",
                              "Discount %",
                            ],
                            ["price", "Price"],
                            ["stock", "Stock"],
                            ["weight", "Weight"],
                          ].map(
                            ([key, label]) => (
                              <Input
                                key={key}
                                label={label}
                                type={
                                  [
                                    "price",
                                    "original_price",
                                    "stock",
                                    "weight",
                                    "discount_percentage",
                                  ].includes(
                                    key
                                  )
                                    ? "number"
                                    : "text"
                                }
                                value={String(
                                  variant[
                                    key as keyof Variant
                                  ] ?? ""
                                )}
                                onChange={v =>
                                  updateVariant(
                                    i,
                                    key as keyof Variant,
                                    v
                                  )
                                }
                              />
                            )
                          )}
                        </div>

                        <ImageUploader
                          title="Variant Images"
                          images={
                            variant.images
                          }
                          onFiles={files =>
                            addImages(
                              files,
                              i
                            )
                          }
                          onRemove={x =>
                            removeImage(
                              x,
                              i
                            )
                          }
                        />
                      </div>
                    )
                  )}
                </div>
              </section>
            </div>

            <div className="flex justify-end gap-2 border-t bg-white p-4">
              <button
                onClick={resetForm}
                className="rounded-xl border px-5 py-2.5 text-sm font-medium"
              >
                Cancel
              </button>

              <button
                disabled={loading}
                onClick={saveProduct}
                className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Save className="mr-2 inline h-4 w-4" />

                {loading
                  ? "Saving..."
                  : editingId
                  ? "Save Changes"
                  : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewProduct && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-xl font-bold">
                  {viewProduct.name}
                </h2>

                <p className="text-sm text-slate-500">
                  {viewProduct.brand?.name} ·{" "}
                  {viewProduct.model ||
                    "Product"}
                </p>
              </div>

              <button
                onClick={() =>
                  setViewProduct(null)
                }
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X />
              </button>
            </div>

            <div className="space-y-6 p-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <Info
                  label="Price"
                  value={`₦${Number(
                    viewProduct.price
                  ).toLocaleString()}`}
                />

                <Info
                  label="Stock"
                  value={viewProduct.stock}
                />

                <Info
                  label="Condition"
                  value={
                    viewProduct.condition ||
                    "—"
                  }
                />

                <Info
                  label="Category"
                  value={
                    viewProduct.category
                      ?.name || "—"
                  }
                />

                <Info
                  label="Brand"
                  value={
                    viewProduct.brand?.name ||
                    "—"
                  }
                />

                <Info
                  label="Warranty"
                  value={
                    viewProduct.warranty ||
                    "—"
                  }
                />
              </div>

              {viewProduct.images?.length ? (
                <div>
                  <h3 className="mb-3 font-semibold">
                    Product Images
                  </h3>

                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                    {viewProduct.images.map(
                      (image, index) => {
                        const url =
                          getImageUrl(image);

                        if (!url) return null;

                        return (
                          <img
                            key={
                              image.id ||
                              `product-image-${index}`
                            }
                            src={url}
                            alt={`${viewProduct.name} image ${
                              index + 1
                            }`}
                            className="aspect-square rounded-xl object-cover"
                          />
                        );
                      }
                    )}
                  </div>
                </div>
              ) : null}

              <div>
                <h3 className="mb-3 font-semibold">
                  Variants (
                  {viewProduct.variants
                    ?.length || 0}
                  )
                </h3>

                <div className="space-y-3">
                  {viewProduct.variants?.map(
                    (v, variantIndex) => (
                      <div
                        key={
                          v.id ||
                          `view-variant-${variantIndex}`
                        }
                        className="rounded-xl border border-slate-200 bg-white p-4"
                      >
                        <div className="flex flex-col justify-between gap-3 sm:flex-row">
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900">
                              {v.name ||
                                [
                                  v.storage,
                                  v.color,
                                  v.ram,
                                ]
                                  .filter(
                                    Boolean
                                  )
                                  .join(
                                    " "
                                  ) ||
                                "Variant"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              SKU:{" "}
                              {v.sku ||
                                "—"}
                            </p>
                          </div>

                          <div className="text-sm sm:text-right">
                            <p className="font-bold text-slate-900">
                              ₦
                              {Number(
                                v.price
                              ).toLocaleString()}
                            </p>

                            <p className="mt-1 text-slate-500">
                              Stock:{" "}
                              {v.stock}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {v.color && (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                              Color:{" "}
                              {v.color}
                            </span>
                          )}

                          {v.storage && (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                              Storage:{" "}
                              {v.storage}
                            </span>
                          )}

                          {v.ram && (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                              RAM: {v.ram}
                            </span>
                          )}

                          {v.status !==
                            undefined && (
                            <span
                              className={`rounded-full px-3 py-1 text-xs ${
                                v.status
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {v.status
                                ? "Active"
                                : "Inactive"}
                            </span>
                          )}
                        </div>

                        {v.images?.length ? (
                          <div className="mt-4">
                            <p className="mb-2 text-xs font-medium text-slate-500">
                              Variant Images
                            </p>

                            <div className="flex gap-2 overflow-x-auto pb-1">
                              {v.images.map(
                                (
                                  image,
                                  index
                                ) => {
                                  const imageUrl =
                                    getImageUrl(
                                      image
                                    );

                                  if (
                                    !imageUrl
                                  )
                                    return null;

                                  return (
                                    <img
                                      key={
                                        (
                                          image as ImageItem
                                        )
                                          .id ||
                                        `${v.id || variantIndex}-image-${index}`
                                      }
                                      src={
                                        imageUrl
                                      }
                                      alt={`${
                                        v.name ||
                                        "Variant"
                                      } image ${
                                        index +
                                        1
                                      }`}
                                      className="h-16 w-16 shrink-0 rounded-lg border border-slate-200 object-cover"
                                      onError={e => {
                                        e.currentTarget.style.display =
                                          "none";
                                      }}
                                    />
                                  );
                                }
                              )}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )
                  )}
                </div>
              </div>

              {viewProduct.description && (
                <div>
                  <h3 className="mb-2 font-semibold">
                    Description
                  </h3>

                  <p className="text-sm leading-6 text-slate-600">
                    {viewProduct.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={e =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-green-500"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: any[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </span>

      <select
        value={value}
        onChange={e =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-green-500"
      >
        <option value=""> Select {label}</option>

        {options.map(option => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function ImageUploader({
  title,
  images,
  onFiles,
  onRemove,
}: {
  title: string;
  images: (File | ImageItem)[];
  onFiles: (
    files: FileList | null
  ) => void;
  onRemove: (index: number) => void;
}) {
  const imageUrl = (image: File | ImageItem) => {
    if (image instanceof File) {
      return URL.createObjectURL(image);
    }

    const raw =
      image.image_url ||
      image.url ||
      image.path ||
      "";

    if (!raw) return "";

    if (
      raw.startsWith("http") ||
      raw.startsWith("blob:")
    ) {
      return raw;
    }

    return `${SERVER_URL}/${raw.replace(
      /^\/+/,
      ""
    )}`;
  };

  return (
    <section className="mt-6">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold">
          {title}
        </h3>

        <label className="cursor-pointer rounded-xl border bg-white px-3 py-2 text-xs font-medium">
          <ImagePlus className="mr-1 inline h-4 w-4" />
          Add Images

          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={e => {
              onFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {images.map((image, index) => {
            const url = imageUrl(image);

            if (!url) return null;

            return (
              <div
                key={
                  image instanceof File
                    ? `${image.name}-${image.lastModified}-${index}`
                    : image.id ||
                      `image-${index}`
                }
                className="group relative"
              >
                <img
                  src={url}
                  alt={`Product image ${
                    index + 1
                  }`}
                  className="aspect-square w-full rounded-xl border object-cover"
                  onError={e => {
                    e.currentTarget.style.display =
                      "none";
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    onRemove(index)
                  }
                  className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white opacity-90"
                >
                  <X className="h-3 w-3" />
                </button>

                {image instanceof File && (
                  <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                    New
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold">
        {value}
      </p>
    </div>
  );
}