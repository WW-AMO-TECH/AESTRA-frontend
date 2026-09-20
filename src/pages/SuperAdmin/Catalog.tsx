import { useEffect, useMemo, useState } from "react";
import axios from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Plus, Pencil, Trash2, Search, X, Tags, FolderTree, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import Sidebar from "@/components/SuperAdmin/Sidebar";

interface Category {
  id: number;
  name: string;
  description?: string | null;
  slug?: string;
  image?: string | null;
  status?: boolean | number;
  sort_order?: number;
  parent_id?: number | null;
}

interface Brand {
  id: number;
  name: string;
  description?: string | null;
  logo?: string | null;
  website?: string | null;
  status?: boolean | number;
  sort_order?: number;
  categories?: Category[];
}

type Tab = "subcategories" | "categories" | "brands";

const Catalog = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("subcategories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBrandCategoriesModal, setShowBrandCategoriesModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Category | null>(null);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deleteItem, setDeleteItem] = useState<{ type: "category" | "subcategory" | "brand"; id: number; name: string } | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    image: null as File | null,
    imagePreview: "",
    status: true,
    sort_order: 0
  });

  const [subcategoryForm, setSubcategoryForm] = useState({
    name: "",
    description: "",
    parent_id: "",
    image: null as File | null,
    imagePreview: "",
    status: true,
    sort_order: 0
  });

  const [brandForm, setBrandForm] = useState({
    name: "",
    description: "",
    logo: null as File | null,
    logoPreview: "",
    website: "",
    status: true,
    sort_order: 0
  });

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const [categoriesRes, brandsRes] = await Promise.all([axios.get("/categories"), axios.get("/brands")]);
      const categoryData = Array.isArray(categoriesRes.data) ? categoriesRes.data : categoriesRes.data?.data || [];
      const brandData = Array.isArray(brandsRes.data) ? brandsRes.data : brandsRes.data?.data || [];
      setCategories(categoryData);
      setBrands(brandData);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to load catalog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const parentCategories = useMemo(() => categories.filter(category => !category.parent_id), [categories]);
  const subcategories = useMemo(() => categories.filter(category => category.parent_id), [categories]);

  const filteredCategories = useMemo(() => {
    const value = search.toLowerCase().trim();
    if (!value) return parentCategories;

    return parentCategories.filter(category =>
      category.name.toLowerCase().includes(value) ||
      category.slug?.toLowerCase().includes(value) ||
      category.description?.toLowerCase().includes(value)
    );
  }, [parentCategories, search]);

  const filteredSubcategories = useMemo(() => {
    const value = search.toLowerCase().trim();
    if (!value) return subcategories;

    return subcategories.filter(subcategory => {
      const parent = categories.find(category => category.id === subcategory.parent_id);
      return subcategory.name.toLowerCase().includes(value) ||
        subcategory.slug?.toLowerCase().includes(value) ||
        parent?.name.toLowerCase().includes(value);
    });
  }, [subcategories, categories, search]);

  const filteredBrands = useMemo(() => {
    const value = search.toLowerCase().trim();
    if (!value) return brands;

    return brands.filter(brand => {
      const categoryNames = brand.categories?.map(category => category.name).join(" ") || "";
      return brand.name.toLowerCase().includes(value) ||
        brand.description?.toLowerCase().includes(value) ||
        categoryNames.toLowerCase().includes(value);
    });
  }, [brands, search]);

  const getImageUrl = (path?: string | null) => {
    if (!path) return "";
    if (path.startsWith("blob:") || path.startsWith("http")) return path;
    return `http://127.0.0.1:8000/storage/${path.replace(/^\/+/, "")}`;
  };

  const getParentName = (parentId?: number | null) => {
    if (!parentId) return "No parent";
    return categories.find(category => category.id === parentId)?.name || "Unknown";
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: "", description: "", image: null, imagePreview: "", status: true, sort_order: 0 });
    setEditingCategory(null);
  };

  const resetSubcategoryForm = () => {
    setSubcategoryForm({ name: "", description: "", parent_id: "", image: null, imagePreview: "", status: true, sort_order: 0 });
    setEditingSubcategory(null);
  };

  const resetBrandForm = () => {
    setBrandForm({ name: "", description: "", logo: null, logoPreview: "", website: "", status: true, sort_order: 0 });
    setEditingBrand(null);
  };

  const openCreateCategory = () => {
    resetCategoryForm();
    setShowCategoryModal(true);
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name || "",
      description: category.description || "",
      image: null,
      imagePreview: getImageUrl(category.image),
      status: Boolean(category.status),
      sort_order: category.sort_order || 0
    });
    setShowCategoryModal(true);
  };

  const openCreateSubcategory = () => {
    resetSubcategoryForm();
    setShowSubcategoryModal(true);
  };

  const openEditSubcategory = (subcategory: Category) => {
    setEditingSubcategory(subcategory);
    setSubcategoryForm({
      name: subcategory.name || "",
      description: subcategory.description || "",
      parent_id: subcategory.parent_id ? String(subcategory.parent_id) : "",
      image: null,
      imagePreview: getImageUrl(subcategory.image),
      status: Boolean(subcategory.status),
      sort_order: subcategory.sort_order || 0
    });
    setShowSubcategoryModal(true);
  };

  const openCreateBrand = () => {
    resetBrandForm();
    setShowBrandModal(true);
  };

  const openEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setBrandForm({
      name: brand.name || "",
      description: brand.description || "",
      logo: null,
      logoPreview: getImageUrl(brand.logo),
      website: brand.website || "",
      status: Boolean(brand.status),
      sort_order: brand.sort_order || 0
    });
    setShowBrandModal(true);
  };

  const handleCategoryImage = (file: File | null, type: "category" | "subcategory") => {
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    const preview = URL.createObjectURL(file);

    if (type === "category") {
      setCategoryForm(prev => ({ ...prev, image: file, imagePreview: preview }));
    } else {
      setSubcategoryForm(prev => ({ ...prev, image: file, imagePreview: preview }));
    }
  };

  const handleBrandLogo = (file: File | null) => {
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be less than 2MB");
      return;
    }

    setBrandForm(prev => ({ ...prev, logo: file, logoPreview: URL.createObjectURL(file) }));
  };

  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryForm.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("name", categoryForm.name);
      formData.append("description", categoryForm.description);
      formData.append("status", categoryForm.status ? "1" : "0");
      formData.append("sort_order", String(categoryForm.sort_order));

      if (categoryForm.image) formData.append("image", categoryForm.image);

      if (editingCategory) {
        formData.append("_method", "PUT");
        await axios.post(`/superadmin/categories/${editingCategory.id}`, formData);
        toast.success("Category updated successfully");
      } else {
        await axios.post("/superadmin/categories", formData);
        toast.success("Category created successfully");
      }

      setShowCategoryModal(false);
      resetCategoryForm();
      fetchCatalog();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const saveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subcategoryForm.name.trim()) {
      toast.error("Subcategory name is required");
      return;
    }

    if (!subcategoryForm.parent_id) {
      toast.error("Please select a parent category");
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("name", subcategoryForm.name);
      formData.append("description", subcategoryForm.description);
      formData.append("parent_id", subcategoryForm.parent_id);
      formData.append("status", subcategoryForm.status ? "1" : "0");
      formData.append("sort_order", String(subcategoryForm.sort_order));

      if (subcategoryForm.image) formData.append("image", subcategoryForm.image);

      if (editingSubcategory) {
        formData.append("_method", "PUT");
        await axios.post(`/superadmin/categories/${editingSubcategory.id}`, formData);
        toast.success("Subcategory updated successfully");
      } else {
        await axios.post("/superadmin/categories", formData);
        toast.success("Subcategory created successfully");
      }

      setShowSubcategoryModal(false);
      resetSubcategoryForm();
      fetchCatalog();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to save subcategory");
    } finally {
      setSaving(false);
    }
  };

  const saveBrand = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!brandForm.name.trim()) {
      toast.error("Brand name is required");
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("name", brandForm.name);
      formData.append("description", brandForm.description);
      formData.append("website", brandForm.website);
      formData.append("status", brandForm.status ? "1" : "0");
      formData.append("sort_order", String(brandForm.sort_order));

      if (brandForm.logo) formData.append("logo", brandForm.logo);

      if (editingBrand) {
        formData.append("_method", "PUT");
        await axios.post(`/superadmin/brands/${editingBrand.id}`, formData);
        toast.success("Brand updated successfully");
      } else {
        await axios.post("/superadmin/brands", formData);
        toast.success("Brand created successfully");
      }

      setShowBrandModal(false);
      resetBrandForm();
      fetchCatalog();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to save brand");
    } finally {
      setSaving(false);
    }
  };

  const openDelete = (type: "category" | "subcategory" | "brand", id: number, name: string) => {
    setDeleteItem({ type, id, name });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;

    try {
      setSaving(true);

      if (deleteItem.type === "brand") {
        await axios.delete(`/superadmin/brands/${deleteItem.id}`);
      } else {
        await axios.delete(`/superadmin/categories/${deleteItem.id}`);
      }

      toast.success(`${deleteItem.type === "brand" ? "Brand" : deleteItem.type === "subcategory" ? "Subcategory" : "Category"} deleted successfully`);
      setShowDeleteModal(false);
      setDeleteItem(null);
      fetchCatalog();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  const openBrandCategories = (brand: Brand) => {
    setSelectedBrand(brand);
    setSelectedCategories(brand.categories?.map(category => category.id) || []);
    setShowBrandCategoriesModal(true);
  };

  const toggleBrandCategory = (id: number) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(categoryId => categoryId !== id) : [...prev, id]
    );
  };

  const saveBrandCategories = async () => {
    if (!selectedBrand) return;

    try {
      setSaving(true);
      await axios.put(`/superadmin/brands/${selectedBrand.id}/categories`, { category_ids: selectedCategories });
      toast.success("Brand categories updated");
      setShowBrandCategoriesModal(false);
      setSelectedBrand(null);
      fetchCatalog();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to update categories");
    } finally {
      setSaving(false);
    }
  };

  const stats = [
    { value: "subcategories" as Tab, label: "Subcategories", count: subcategories.length, icon: <FolderTree className="w-5 h-5" />, color: "bg-blue-100 text-blue-800" },
    { value: "categories" as Tab, label: "Categories", count: parentCategories.length, icon: <FolderTree className="w-5 h-5" />, color: "bg-primary/10 text-primary" },
    { value: "brands" as Tab, label: "Brands", count: brands.length, icon: <Tags className="w-5 h-5" />, color: "bg-purple-100 text-purple-800" }
  ];

  const activeCount = categories.filter(category => Boolean(category.status)).length + brands.filter(brand => Boolean(brand.status)).length;

  const currentTitle = tab === "subcategories" ? "Subcategories" : tab === "categories" ? "Categories" : "Brands";

  const currentDescription = tab === "subcategories"
    ? "Manage your product subcategories and their parent categories."
    : tab === "categories"
      ? "Manage your main marketplace categories."
      : "Manage your marketplace brands.";

  const handleTabChange = (value: Tab) => {
    setTab(value);
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-primary/20 lg:flex">
      <Sidebar user={user} />

      <main className="flex-1 p-3 lg:p-3 mt-14 lg:mt-0 h-screen overflow-y-auto">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="lg:text-2xl text-lg font-bold">Catalog</h1>
              <p className="text-xs text-muted-foreground mt-1">Manage categories, subcategories and brands.</p>
            </div>

            <button onClick={tab === "subcategories" ? openCreateSubcategory : tab === "categories" ? openCreateCategory : openCreateBrand} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground">
              <Plus className="w-4 h-4" />
              {tab === "subcategories" ? "Add Subcategory" : tab === "categories" ? "Add Category" : "Add Brand"}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map(stat => (
              <button key={stat.value} onClick={() => handleTabChange(stat.value)} className={`glass-card p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${tab === stat.value ? "ring-2 ring-primary/30" : ""}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>{stat.icon}</span>
                  <div className="text-right">
                    <p className="text-xl font-bold">{stat.count}</p>
                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </button>
            ))}

            <div className="glass-card p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800"><Tags className="w-5 h-5" /></span>
                <div className="text-right">
                  <p className="text-xl font-bold">{activeCount}</p>
                  <p className="text-[10px] text-muted-foreground">Active</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-sm">{currentTitle}</h2>
              <p className="text-[11px] text-muted-foreground">{currentDescription}</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${tab}...`} className="w-full rounded-xl border bg-background py-2.5 pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>

          {tab === "subcategories" && (
            <div className="glass-card overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-secondary/50">
                    <th className="p-3 text-left">Subcategory</th>
                    <th className="p-3 text-left">Parent Category</th>
                    <th className="p-3 text-left">Description</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Order</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-10 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></td>
                    </tr>
                  ) : filteredSubcategories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">No subcategories found.</td>
                    </tr>
                  ) : (
                    filteredSubcategories.map(subcategory => (
                      <tr key={subcategory.id} className="border-b border-border hover:bg-secondary/30">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-lg overflow-hidden bg-secondary flex items-center justify-center">
                              {subcategory.image ? <img src={getImageUrl(subcategory.image)} alt={subcategory.name} className="w-full h-full object-cover" /> : <FolderTree className="w-4 h-4 text-muted-foreground" />}
                            </div>
                            <div>
                              <p className="font-semibold">{subcategory.name}</p>
                              <p className="text-[10px] text-muted-foreground">{subcategory.slug}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">{getParentName(subcategory.parent_id)}</span>
                        </td>

                        <td className="p-3 max-w-xs"><p className="truncate text-muted-foreground">{subcategory.description || "No description"}</p></td>

                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${Boolean(subcategory.status) ? "bg-emerald-100 text-emerald-800" : "bg-secondary text-muted-foreground"}`}>
                            {Boolean(subcategory.status) ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="p-3">{subcategory.sort_order ?? 0}</td>

                        <td className="p-3">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openEditSubcategory(subcategory)}><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => openDelete("subcategory", subcategory.id, subcategory.name)}><Trash2 className="w-4 h-4 text-red-500" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === "categories" && (
            <div className="glass-card overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-secondary/50">
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-left">Description</th>
                    <th className="p-3 text-left">Subcategories</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Order</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-10 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></td>
                    </tr>
                  ) : filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">No categories found.</td>
                    </tr>
                  ) : (
                    filteredCategories.map(category => {
                      const children = subcategories.filter(item => item.parent_id === category.id);

                      return (
                        <tr key={category.id} className="border-b border-border hover:bg-secondary/30">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-9 h-9 rounded-lg overflow-hidden bg-secondary flex items-center justify-center">
                                {category.image ? <img src={getImageUrl(category.image)} alt={category.name} className="w-full h-full object-cover" /> : <FolderTree className="w-4 h-4 text-muted-foreground" />}
                              </div>
                              <div>
                                <p className="font-semibold">{category.name}</p>
                                <p className="text-[10px] text-muted-foreground">{category.slug}</p>
                              </div>
                            </div>
                          </td>

                          <td className="p-3 max-w-xs"><p className="truncate text-muted-foreground">{category.description || "No description"}</p></td>

                          <td className="p-3">
                            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                              {children.length} {children.length === 1 ? "subcategory" : "subcategories"}
                            </span>
                          </td>

                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${Boolean(category.status) ? "bg-emerald-100 text-emerald-800" : "bg-secondary text-muted-foreground"}`}>
                              {Boolean(category.status) ? "Active" : "Inactive"}
                            </span>
                          </td>

                          <td className="p-3">{category.sort_order ?? 0}</td>

                          <td className="p-3">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => openEditCategory(category)}><Pencil className="w-4 h-4" /></button>
                              <button onClick={() => openDelete("category", category.id, category.name)}><Trash2 className="w-4 h-4 text-red-500" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === "brands" && (
            <div className="glass-card overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-secondary/50">
                    <th className="p-3 text-left">Brand</th>
                    <th className="p-3 text-left">Website</th>
                    <th className="p-3 text-left">Categories</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Order</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-10 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></td>
                    </tr>
                  ) : filteredBrands.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">No brands found.</td>
                    </tr>
                  ) : (
                    filteredBrands.map(brand => (
                      <tr key={brand.id} className="border-b border-border hover:bg-secondary/30">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-lg overflow-hidden bg-secondary flex items-center justify-center">
                              {brand.logo ? <img src={getImageUrl(brand.logo)} alt={brand.name} className="w-full h-full object-contain p-1" /> : <Tags className="w-4 h-4 text-muted-foreground" />}
                            </div>
                            <div>
                              <p className="font-semibold">{brand.name}</p>
                              <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">{brand.description || "No description"}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          {brand.website ? (
                            <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{brand.website}</a>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </td>

                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {brand.categories?.length ? (
                              brand.categories.slice(0, 3).map(category => (
                                <span key={category.id} className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px]">{category.name}</span>
                              ))
                            ) : (
                              <span className="text-muted-foreground">None</span>
                            )}

                            {(brand.categories?.length || 0) > 3 && (
                              <span className="px-2 py-1 rounded-full bg-secondary text-[10px]">+{brand.categories!.length - 3}</span>
                            )}
                          </div>
                        </td>

                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${Boolean(brand.status) ? "bg-emerald-100 text-emerald-800" : "bg-secondary text-muted-foreground"}`}>
                            {Boolean(brand.status) ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="p-3">{brand.sort_order ?? 0}</td>

                        <td className="p-3">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openBrandCategories(brand)} className="text-[10px] font-semibold text-primary">Categories</button>
                            <button onClick={() => openEditBrand(brand)}><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => openDelete("brand", brand.id, brand.name)}><Trash2 className="w-4 h-4 text-red-500" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto glass-card">
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <h2 className="font-bold">{editingCategory ? "Edit Category" : "Create Category"}</h2>
                <p className="text-[11px] text-muted-foreground mt-1">Create a top-level marketplace category.</p>
              </div>
              <button onClick={() => { setShowCategoryModal(false); resetCategoryForm(); }}><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={saveCategory} className="p-4 space-y-4">
              <div>
                <label className="text-xs font-semibold">Category Name</label>
                <input value={categoryForm.name} onChange={e => setCategoryForm(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. Electronics" className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              <div>
                <label className="text-xs font-semibold">Description</label>
                <textarea value={categoryForm.description} onChange={e => setCategoryForm(prev => ({ ...prev, description: e.target.value }))} rows={3} placeholder="Describe this category..." className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              <div>
                <label className="text-xs font-semibold">Category Image</label>
                <label className="mt-1.5 flex h-28 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-secondary/30">
                  {categoryForm.imagePreview ? (
                    <img src={categoryForm.imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <ImagePlus className="mx-auto w-5 h-5 text-muted-foreground" />
                      <p className="mt-1 text-[11px] text-muted-foreground">Upload image</p>
                    </div>
                  )}
                  <input type="file" accept="image/jpeg,image/png,image/jpg,image/webp" onChange={e => handleCategoryImage(e.target.files?.[0] || null, "category")} className="hidden" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Sort Order</label>
                  <input type="number" min="0" value={categoryForm.sort_order} onChange={e => setCategoryForm(prev => ({ ...prev, sort_order: Number(e.target.value) }))} className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-xs outline-none" />
                </div>

                <label className="flex items-center justify-between rounded-xl border px-3">
                  <span className="text-xs font-semibold">Active</span>
                  <input type="checkbox" checked={categoryForm.status} onChange={e => setCategoryForm(prev => ({ ...prev, status: e.target.checked }))} className="h-4 w-4" />
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <button type="button" onClick={() => { setShowCategoryModal(false); resetCategoryForm(); }} className="rounded-xl border px-4 py-2.5 text-xs font-medium">Cancel</button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-60">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingCategory ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSubcategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto glass-card">
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <h2 className="font-bold">{editingSubcategory ? "Edit Subcategory" : "Create Subcategory"}</h2>
                <p className="text-[11px] text-muted-foreground mt-1">Create a subcategory under an existing category.</p>
              </div>
              <button onClick={() => { setShowSubcategoryModal(false); resetSubcategoryForm(); }}><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={saveSubcategory} className="p-4 space-y-4">
              <div>
                <label className="text-xs font-semibold">Parent Category</label>
                <select value={subcategoryForm.parent_id} onChange={e => setSubcategoryForm(prev => ({ ...prev, parent_id: e.target.value }))} className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">Select parent category</option>
                  {parentCategories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold">Subcategory Name</label>
                <input value={subcategoryForm.name} onChange={e => setSubcategoryForm(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. Smartphones" className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              <div>
                <label className="text-xs font-semibold">Description</label>
                <textarea value={subcategoryForm.description} onChange={e => setSubcategoryForm(prev => ({ ...prev, description: e.target.value }))} rows={3} placeholder="Describe this subcategory..." className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              <div>
                <label className="text-xs font-semibold">Subcategory Image</label>
                <label className="mt-1.5 flex h-28 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-secondary/30">
                  {subcategoryForm.imagePreview ? (
                    <img src={subcategoryForm.imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <ImagePlus className="mx-auto w-5 h-5 text-muted-foreground" />
                      <p className="mt-1 text-[11px] text-muted-foreground">Upload image</p>
                    </div>
                  )}
                  <input type="file" accept="image/jpeg,image/png,image/jpg,image/webp" onChange={e => handleCategoryImage(e.target.files?.[0] || null, "subcategory")} className="hidden" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Sort Order</label>
                  <input type="number" min="0" value={subcategoryForm.sort_order} onChange={e => setSubcategoryForm(prev => ({ ...prev, sort_order: Number(e.target.value) }))} className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-xs outline-none" />
                </div>

                <label className="flex items-center justify-between rounded-xl border px-3">
                  <span className="text-xs font-semibold">Active</span>
                  <input type="checkbox" checked={subcategoryForm.status} onChange={e => setSubcategoryForm(prev => ({ ...prev, status: e.target.checked }))} className="h-4 w-4" />
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <button type="button" onClick={() => { setShowSubcategoryModal(false); resetSubcategoryForm(); }} className="rounded-xl border px-4 py-2.5 text-xs font-medium">Cancel</button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-60">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingSubcategory ? "Update Subcategory" : "Create Subcategory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBrandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto glass-card">
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <h2 className="font-bold">{editingBrand ? "Edit Brand" : "Create Brand"}</h2>
                <p className="text-[11px] text-muted-foreground mt-1">Add a marketplace brand.</p>
              </div>
              <button onClick={() => { setShowBrandModal(false); resetBrandForm(); }}><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={saveBrand} className="p-4 space-y-4">
              <div>
                <label className="text-xs font-semibold">Brand Name</label>
                <input value={brandForm.name} onChange={e => setBrandForm(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. Apple" className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              <div>
                <label className="text-xs font-semibold">Description</label>
                <textarea value={brandForm.description} onChange={e => setBrandForm(prev => ({ ...prev, description: e.target.value }))} rows={3} placeholder="Describe this brand..." className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              <div>
                <label className="text-xs font-semibold">Brand Logo</label>
                <label className="mt-1.5 flex h-28 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-secondary/30">
                  {brandForm.logoPreview ? (
                    <img src={brandForm.logoPreview} alt="Preview" className="h-full w-full object-contain p-4" />
                  ) : (
                    <div className="text-center">
                      <ImagePlus className="mx-auto w-5 h-5 text-muted-foreground" />
                      <p className="mt-1 text-[11px] text-muted-foreground">Upload logo</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={e => handleBrandLogo(e.target.files?.[0] || null)} className="hidden" />
                </label>
              </div>

              <div>
                <label className="text-xs font-semibold">Website</label>
                <input type="url" value={brandForm.website} onChange={e => setBrandForm(prev => ({ ...prev, website: e.target.value }))} placeholder="https://example.com" className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Sort Order</label>
                  <input type="number" min="0" value={brandForm.sort_order} onChange={e => setBrandForm(prev => ({ ...prev, sort_order: Number(e.target.value) }))} className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-xs outline-none" />
                </div>

                <label className="flex items-center justify-between rounded-xl border px-3">
                  <span className="text-xs font-semibold">Active</span>
                  <input type="checkbox" checked={brandForm.status} onChange={e => setBrandForm(prev => ({ ...prev, status: e.target.checked }))} className="h-4 w-4" />
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <button type="button" onClick={() => { setShowBrandModal(false); resetBrandForm(); }} className="rounded-xl border px-4 py-2.5 text-xs font-medium">Cancel</button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-60">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingBrand ? "Update Brand" : "Create Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBrandCategoriesModal && selectedBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
          <div className="w-full max-w-lg max-h-[90vh] overflow-hidden glass-card">
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <h2 className="font-bold">Assign Categories</h2>
                <p className="text-[11px] text-muted-foreground mt-1">{selectedBrand.name}</p>
              </div>
              <button onClick={() => setShowBrandCategoriesModal(false)}><X className="w-5 h-5" /></button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-4 space-y-2">
              {parentCategories.map(category => {
                const children = subcategories.filter(subcategory => subcategory.parent_id === category.id);

                return (
                  <div key={category.id} className="rounded-xl border">
                    <label className="flex cursor-pointer items-center gap-3 p-3">
                      <input type="checkbox" checked={selectedCategories.includes(category.id)} onChange={() => toggleBrandCategory(category.id)} className="h-4 w-4 rounded" />
                      <span className="text-xs font-semibold">{category.name}</span>
                    </label>

                    {children.map(child => (
                      <label key={child.id} className="flex cursor-pointer items-center gap-3 border-t bg-secondary/20 px-3 py-2.5 pl-9">
                        <input type="checkbox" checked={selectedCategories.includes(child.id)} onChange={() => toggleBrandCategory(child.id)} className="h-4 w-4 rounded" />
                        <span className="text-xs text-muted-foreground">{child.name}</span>
                      </label>
                    ))}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 border-t p-4">
              <button onClick={() => setShowBrandCategoriesModal(false)} className="rounded-xl border px-4 py-2.5 text-xs font-medium">Cancel</button>
              <button onClick={saveBrandCategories} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-60">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Categories
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && deleteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
          <div className="w-full max-w-sm glass-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Delete {deleteItem.type}</h2>
              <button onClick={() => setShowDeleteModal(false)}><X className="w-5 h-5" /></button>
            </div>

            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Are you sure you want to delete <strong className="text-foreground">{deleteItem.name}</strong>? This action cannot be undone.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowDeleteModal(false)} className="rounded-xl border px-4 py-2.5 text-xs font-medium">Cancel</button>
              <button onClick={confirmDelete} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-60">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;