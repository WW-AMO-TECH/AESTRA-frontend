import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Loader2,
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
  status?: boolean | number;
  sort_order?: number;
}

const Categories = () => {
  const { user } = useAuth();

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [deletingCategory, setDeletingCategory] =
    useState<Category | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    status: true,
    sort_order: 0,
  });

  // --------------------------------------------------
  // FETCH CATEGORIES
  // --------------------------------------------------

  const fetchCategories = async () => {
    try {
      const response = await api.get(
        "/categories"
      );

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

      toast.error(
        "Failed to load categories."
      );
    }
  };

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        await fetchCategories();
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const filteredCategories = useMemo(() => {
    const safeCategories = Array.isArray(
      categories
    )
      ? categories
      : [];

    const query = search
      .toLowerCase()
      .trim();

    if (!query) {
      return safeCategories;
    }

    return safeCategories.filter(
      (category) =>
        category.name
          .toLowerCase()
          .includes(query) ||
        category.description
          ?.toLowerCase()
          .includes(query)
    );
  }, [categories, search]);

  // --------------------------------------------------
  // FORM
  // --------------------------------------------------

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      status: true,
      sort_order: 0,
    });

    setEditingCategory(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (
    category: Category
  ) => {
    setEditingCategory(category);

    setForm({
      name: category.name || "",
      description:
        category.description || "",
      status:
        category.status === undefined
          ? true
          : Boolean(category.status),
      sort_order:
        category.sort_order || 0,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };

  // --------------------------------------------------
  // CREATE / UPDATE
  // --------------------------------------------------

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error(
        "Category name is required."
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        description:
          form.description.trim(),
        status: form.status,
        sort_order: form.sort_order,
      };

      if (editingCategory) {
        await api.put(
          `/superadmin/categories/${editingCategory.id}`,
          payload
        );

        toast.success(
          "Category updated successfully."
        );
      } else {
        await api.post(
          "/superadmin/categories",
          payload
        );

        toast.success(
          "Category created successfully."
        );
      }

      setShowModal(false);
      resetForm();

      await fetchCategories();
    } catch (error: any) {
      console.error(
        "Category save error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to save category."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  const openDeleteModal = (
    category: Category
  ) => {
    setDeletingCategory(category);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    setSaving(true);

    try {
      await api.delete(
        `/superadmin/categories/${deletingCategory.id}`
      );

      toast.success(
        "Category deleted successfully."
      );

      setShowDeleteModal(false);
      setDeletingCategory(null);

      await fetchCategories();
    } catch (error: any) {
      console.error(
        "Category delete error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to delete category."
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
                Categories
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage product categories used across your store.
              </p>
            </div>

            <button
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-white transition hover:bg-primary/90"
            >
              <Plus className="h-5 w-5" />
              Add Category
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
                placeholder="Search categories..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary"
              />

            </div>

          </div>

          {/* TABLE */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[750px]">

                <thead className="border-b bg-slate-50">

                  <tr>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Category
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Description
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Order
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredCategories.length ===
                  0 ? (

                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-12 text-center text-sm text-slate-500"
                      >
                        No categories found.
                      </td>
                    </tr>

                  ) : (

                    filteredCategories.map(
                      (category) => (

                        <tr
                          key={category.id}
                          className="transition hover:bg-slate-50"
                        >

                          {/* NAME */}
                          <td className="px-5 py-4">

                            <div>
                              <p className="font-semibold text-slate-900">
                                {category.name}
                              </p>

                              {category.slug && (
                                <p className="text-xs text-slate-400">
                                  {category.slug}
                                </p>
                              )}
                            </div>

                          </td>

                          {/* DESCRIPTION */}
                          <td className="max-w-md px-5 py-4">

                            <p className="line-clamp-2 text-sm text-slate-500">
                              {category.description ||
                                "No description"}
                            </p>

                          </td>

                          {/* STATUS */}
                          <td className="px-5 py-4">

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                category.status ===
                                  undefined ||
                                Boolean(
                                  category.status
                                )
                                  ? "bg-green-100 text-green-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {category.status ===
                                undefined ||
                              Boolean(
                                category.status
                              )
                                ? "Active"
                                : "Inactive"}
                            </span>

                          </td>

                          {/* ORDER */}
                          <td className="px-5 py-4 text-sm text-slate-600">
                            {category.sort_order ??
                              0}
                          </td>

                          {/* ACTIONS */}
                          <td className="px-5 py-4">

                            <div className="flex justify-end gap-2">

                              <button
                                onClick={() =>
                                  openEditModal(
                                    category
                                  )
                                }
                                title="Edit category"
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() =>
                                  openDeleteModal(
                                    category
                                  )
                                }
                                title="Delete category"
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

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

            {/* HEADER */}
            <div className="flex items-center justify-between border-b p-5">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingCategory
                    ? "Edit Category"
                    : "Add Category"}
                </h2>

                <p className="text-sm text-slate-500">
                  {editingCategory
                    ? "Update category information."
                    : "Create a new product category."}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-5"
            >

              {/* NAME */}
              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Category Name *
                </label>

                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g. Phones"
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
                  placeholder="Brief description about this category..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary"
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

                  {editingCategory
                    ? "Save Changes"
                    : "Add Category"}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal &&
        deletingCategory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

              <h2 className="text-lg font-bold text-slate-900">
                Delete Category?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Are you sure you want to delete{" "}
                <strong className="text-slate-700">
                  {deletingCategory.name}
                </strong>
                ?
              </p>

              <p className="mt-2 text-xs text-red-500">
                A category currently being used
                by products may not be allowed
                to be deleted.
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

                  Delete Category

                </button>

              </div>

            </div>

          </div>
        )}

    </div>
  );
};

export default Categories;