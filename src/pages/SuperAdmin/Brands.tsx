import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Loader2,
  Tags,
} from "lucide-react";
import { toast } from "sonner";

import api from "@/api/axios";
import Sidebar from "@/components/Admin/Sidebar";
import { useAuth } from "@/context/AuthContext";

interface Category {
  id: number;
  name: string;
  description?: string | null;
  slug?: string;
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

const Brands = () => {
  const { user } = useAuth();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] =
    useState(false);

  const [editingBrand, setEditingBrand] =
    useState<Brand | null>(null);

  const [deletingBrand, setDeletingBrand] =
    useState<Brand | null>(null);

  const [categoryBrand, setCategoryBrand] =
    useState<Brand | null>(null);

  const [selectedCategories, setSelectedCategories] =
    useState<number[]>([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    logo: null as File | null,
    logoPreview: "",
    website: "",
    status: true,
    sort_order: 0,
  });

  // --------------------------------------------------
  // FETCH BRANDS
  // --------------------------------------------------

  const fetchBrands = async () => {
    try {
      const response = await api.get("/brands");

      console.log("Brands API response:", response.data);

      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      setBrands(data);
    } catch (error) {
      console.error("Failed to load brands:", error);

      setBrands([]);

      toast.error("Failed to load brands.");
    }
  };

  // --------------------------------------------------
  // FETCH CATEGORIES
  // --------------------------------------------------

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");

      console.log(
        "Categories API response:",
        response.data
      );

      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      setCategories(data);
    } catch (error) {
      console.error(
        "Failed to load categories:",
        error
      );

      setCategories([]);

      toast.error("Failed to load categories.");
    }
  };

  // --------------------------------------------------
  // LOAD DATA
  // --------------------------------------------------

  const loadData = async () => {
    setLoading(true);

    try {
      await Promise.all([
        fetchBrands(),
        fetchCategories(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const filteredBrands = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return Array.isArray(brands) ? brands : [];
    }

    return (Array.isArray(brands) ? brands : []).filter(
      (brand) =>
        brand.name
          .toLowerCase()
          .includes(query) ||
        brand.description
          ?.toLowerCase()
          .includes(query)
    );
  }, [brands, search]);

  // --------------------------------------------------
  const getLogoUrl = (logo?: string | null) => {
    if (!logo) return "";

    // Browser preview URL
    if (logo.startsWith("blob:")) {
        return logo;
    }

    // Already a complete URL
    if (
        logo.startsWith("http://") ||
        logo.startsWith("https://")
    ) {
        return logo;
    }

    // Laravel storage path
    const cleanPath = logo.replace(/^\/+/, "");

    return `http://127.0.0.1:8000/storage/${cleanPath}`;
    };

  // --------------------------------------------------
  // FORM
  // --------------------------------------------------

  const resetForm = () => {
    setForm({
        name: "",
        description: "",
        logo: null,
        logoPreview: "",
        website: "",
        status: true,
        sort_order: 0,
    });

    setEditingBrand(null);
    };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand);

    setForm({
        name: brand.name || "",
        description: brand.description || "",
        logo: null,
        logoPreview: brand.logo || "",
        website: brand.website || "",
        status:
        brand.status === undefined
            ? true
            : Boolean(brand.status),
        sort_order: brand.sort_order || 0,
    });

    setShowModal(true);
    };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };

  // --------------------------------------------------
  // CREATE / UPDATE BRAND
  // --------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
        toast.error("Brand name is required.");
        return;
    }

    setSaving(true);

    try {
        const formData = new FormData();

        formData.append("name", form.name.trim());
        formData.append("description", form.description.trim());
        formData.append("website", form.website.trim());
        formData.append("status", form.status ? "1" : "0");
        formData.append("sort_order", String(form.sort_order));

        if (form.logo) {
        formData.append("logo", form.logo);
        }

        if (editingBrand) {
        // Laravel PUT + multipart can sometimes be problematic,
        // so use POST with method spoofing.
        formData.append("_method", "PUT");

        await api.post(
            `/superadmin/brands/${editingBrand.id}`,
            formData,
            {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            }
        );

        toast.success("Brand updated successfully.");
        } else {
        await api.post(
            "/superadmin/brands",
            formData,
            {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            }
        );

        toast.success("Brand created successfully.");
        }

        setShowModal(false);
        resetForm();

        await fetchBrands();
    } catch (error: any) {
        console.error("Brand save error:", error);

        toast.error(
        error?.response?.data?.message ||
            "Failed to save brand."
        );
    } finally {
        setSaving(false);
    }
    };

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  const openDeleteModal = (brand: Brand) => {
    setDeletingBrand(brand);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deletingBrand) return;

    setSaving(true);

    try {
      await api.delete(
        `/superadmin/brands/${deletingBrand.id}`
      );

      toast.success(
        "Brand deleted successfully."
      );

      setShowDeleteModal(false);
      setDeletingBrand(null);

      await fetchBrands();
    } catch (error: any) {
      console.error(
        "Brand delete error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to delete brand."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // CATEGORY ASSIGNMENT
  // --------------------------------------------------

  const openCategoriesModal = (
    brand: Brand
  ) => {
    setCategoryBrand(brand);

    const existingCategoryIds =
      Array.isArray(brand.categories)
        ? brand.categories.map(
            (category) => category.id
          )
        : [];

    setSelectedCategories(
      existingCategoryIds
    );

    setShowCategoriesModal(true);
  };

  const toggleCategory = (
    categoryId: number
  ) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter(
            (id) => id !== categoryId
          )
        : [...prev, categoryId]
    );
  };

  const handleSaveCategories = async () => {
    if (!categoryBrand) return;

    setSaving(true);

    try {
      await api.put(
        `/superadmin/brands/${categoryBrand.id}/categories`,
        {
          category_ids: selectedCategories,
        }
      );

      toast.success(
        "Brand categories updated successfully."
      );

      setShowCategoriesModal(false);
      setCategoryBrand(null);

      await fetchBrands();
    } catch (error: any) {
      console.error(
        "Category assignment error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to update categories."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-primary/20 lg:flex">
        <Sidebar user={user} />

        <main className="flex-1 min-w-0">
          <div className="flex min-h-[70vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-primary/20 lg:flex">
      <Sidebar user={user} />

      <main className="min-w-0 flex-1">
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">

          {/* HEADER */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Brands
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage product brands and their categories.
              </p>
            </div>

            <button
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-white transition hover:bg-primary/90"
            >
              <Plus className="h-5 w-5" />
              Add Brand
            </button>

          </div>

          {/* SEARCH */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <div className="relative max-w-md">

              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search brands..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary"
              />

            </div>

          </div>

          {/* BRANDS */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px]">

                <thead className="border-b bg-slate-50">

                  <tr>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Brand
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Description
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Categories
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredBrands.length === 0 ? (

                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-12 text-center text-sm text-slate-500"
                      >
                        No brands found.
                      </td>
                    </tr>

                  ) : (

                    filteredBrands.map(
                      (brand) => (

                        <tr
                          key={brand.id}
                          className="transition hover:bg-slate-50"
                        >

                          {/* BRAND */}
                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-slate-50">

                                {brand.logo ? (
                                  <img
                                    src={getLogoUrl(brand.logo)}
                                    alt={brand.name}
                                    className="h-full w-full object-contain"
                                    onError={(e) => {
                                      e.currentTarget.style.display =
                                        "none";
                                    }}
                                  />
                                ) : (
                                  <span className="font-bold text-primary">
                                    {brand.name
                                      .charAt(0)
                                      .toUpperCase()}
                                  </span>
                                )}

                              </div>

                              <div>
                                <p className="font-semibold text-slate-900">
                                  {brand.name}
                                </p>

                                {brand.website && (
                                  <p className="text-xs text-slate-400">
                                    {brand.website}
                                  </p>
                                )}
                              </div>

                            </div>

                          </td>

                          {/* DESCRIPTION */}
                          <td className="max-w-sm px-5 py-4">

                            <p className="line-clamp-2 text-sm text-slate-500">
                              {brand.description ||
                                "No description"}
                            </p>

                          </td>

                          {/* CATEGORIES */}
                          <td className="px-5 py-4">

                            <div className="flex max-w-xs flex-wrap gap-1.5">

                              {Array.isArray(
                                brand.categories
                              ) &&
                              brand.categories.length > 0 ? (

                                brand.categories.map(
                                  (category) => (
                                    <span
                                      key={
                                        category.id
                                      }
                                      className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                                    >
                                      {category.name}
                                    </span>
                                  )
                                )

                              ) : (
                                <span className="text-sm text-slate-400">
                                  No categories
                                </span>
                              )}

                            </div>

                          </td>

                          {/* STATUS */}
                          <td className="px-5 py-4">

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                brand.status ===
                                  undefined ||
                                Boolean(
                                  brand.status
                                )
                                  ? "bg-green-100 text-green-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {brand.status ===
                                undefined ||
                              Boolean(
                                brand.status
                              )
                                ? "Active"
                                : "Inactive"}
                            </span>

                          </td>

                          {/* ACTIONS */}
                          <td className="px-5 py-4">

                            <div className="flex justify-end gap-2">

                              <button
                                onClick={() =>
                                  openCategoriesModal(
                                    brand
                                  )
                                }
                                title="Manage categories"
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-primary/10 hover:text-primary"
                              >
                                <Tags className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() =>
                                  openEditModal(
                                    brand
                                  )
                                }
                                title="Edit brand"
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() =>
                                  openDeleteModal(
                                    brand
                                  )
                                }
                                title="Delete brand"
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>
      </main>

      {/* ADD / EDIT BRAND MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">

            <div className="flex items-center justify-between border-b p-5">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingBrand
                    ? "Edit Brand"
                    : "Add Brand"}
                </h2>

                <p className="text-sm text-slate-500">
                  {editingBrand
                    ? "Update brand information."
                    : "Create a new product brand."}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-5"
            >

              {/* NAME */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Brand Name *
                </label>

                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g. Apple"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description:
                        e.target.value,
                    })
                  }
                  rows={4}
                  placeholder="Brief description about this brand..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary"
                />
              </div>

              {/* BRAND LOGO */}
            <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
                Brand Logo
            </label>

            <div className="flex items-center gap-4">

                {/* IMAGE PREVIEW */}
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {form.logoPreview ? (
                <img
                    src={getLogoUrl(form.logoPreview)}
                    alt="Brand logo preview"
                    className="h-full w-full object-contain"
                    onError={(e) => {
                    console.error(
                        "Logo preview failed:",
                        getLogoUrl(form.logoPreview)
                    );
                    e.currentTarget.style.display = "none";
                    }}
                />
                ) : (
                <span className="text-xs text-slate-400">
                    No logo
                </span>
                )}
                </div>

                {/* UPLOAD */}
                <div>
                <label
                    htmlFor="brand-logo"
                    className="inline-flex cursor-pointer items-center rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white transition hover:bg-primary/90"
                >
                    Choose Logo
                </label>

                <input
                    id="brand-logo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                    const file = e.target.files?.[0];

                    console.log("Selected file:", file);

                    if (!file) return;

                    if (!file.type.startsWith("image/")) {
                        toast.error("Please select an image file.");
                        return;
                    }

                    if (file.size > 2 * 1024 * 1024) {
                        toast.error("Logo must be less than 2MB.");
                        return;
                    }

                    const previewUrl = URL.createObjectURL(file);

                    console.log("Preview URL:", previewUrl);

                    setForm((prev) => ({
                        ...prev,
                        logo: file,
                        logoPreview: previewUrl,
                    }));
                    }}
                />

                <p className="mt-2 text-xs text-slate-400">
                    PNG, JPG, JPEG, WEBP or SVG • Max 2MB
                </p>
                </div>
            </div>
            </div>

              {/* WEBSITE */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Website
                </label>

                <input
                  value={form.website}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      website:
                        e.target.value,
                    })
                  }
                  placeholder="https://www.apple.com"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary"
                />
              </div>

              {/* STATUS + ORDER */}
              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Status
                  </label>

                  <select
                    value={
                      form.status
                        ? "1"
                        : "0"
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status:
                          e.target.value ===
                          "1",
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary"
                  >
                    <option value="1">
                      Active
                    </option>

                    <option value="0">
                      Inactive
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Display Order
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      form.sort_order
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        sort_order:
                          Number(
                            e.target.value
                          ) || 0,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary"
                  />
                </div>

              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 border-t pt-5">

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-white disabled:opacity-60"
                >
                  {saving && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {editingBrand
                    ? "Save Changes"
                    : "Add Brand"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* CATEGORY ASSIGNMENT MODAL */}
      {showCategoriesModal &&
        categoryBrand && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

              <div className="flex items-center justify-between border-b p-5">

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Manage Categories
                  </h2>

                  <p className="text-sm text-slate-500">
                    Select categories for{" "}
                    <strong>
                      {categoryBrand.name}
                    </strong>
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowCategoriesModal(
                      false
                    )
                  }
                  className="rounded-lg p-2 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>

              </div>

              <div className="max-h-[50vh] overflow-y-auto p-5">

                {categories.length === 0 ? (

                  <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                    No categories available.
                  </div>

                ) : (

                  <div className="space-y-2">

                    {categories.map(
                      (category) => {
                        const checked =
                          selectedCategories.includes(
                            category.id
                          );

                        return (
                          <label
                            key={
                              category.id
                            }
                            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                              checked
                                ? "border-primary bg-primary/5"
                                : "border-slate-200 hover:bg-slate-50"
                            }`}
                          >

                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                toggleCategory(
                                  category.id
                                )
                              }
                              className="h-4 w-4 accent-primary"
                            />

                            <div>
                              <p className="font-medium text-slate-900">
                                {category.name}
                              </p>

                              {category.description && (
                                <p className="text-xs text-slate-500">
                                  {
                                    category.description
                                  }
                                </p>
                              )}
                            </div>

                          </label>
                        );
                      }
                    )}

                  </div>

                )}

              </div>

              <div className="flex justify-end gap-3 border-t p-5">

                <button
                  onClick={() =>
                    setShowCategoriesModal(
                      false
                    )
                  }
                  className="rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-700"
                >
                  Cancel
                </button>

                <button
                  onClick={
                    handleSaveCategories
                  }
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-white disabled:opacity-60"
                >
                  {saving && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  Save Categories
                </button>

              </div>

            </div>

          </div>
        )}

      {/* DELETE MODAL */}
      {showDeleteModal &&
        deletingBrand && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

              <h2 className="text-lg font-bold text-slate-900">
                Delete Brand?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Are you sure you want to delete{" "}
                <strong className="text-slate-700">
                  {deletingBrand.name}
                </strong>
                ?
              </p>

              <p className="mt-2 text-xs text-red-500">
                A brand that is currently being
                used by products may not be
                allowed to be deleted.
              </p>

              <div className="mt-6 flex justify-end gap-3">

                <button
                  onClick={() =>
                    setShowDeleteModal(
                      false
                    )
                  }
                  className="rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-700"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-medium text-white disabled:opacity-60"
                >
                  {saving && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  Delete Brand
                </button>

              </div>

            </div>

          </div>
        )}

    </div>
  );
};

export default Brands;