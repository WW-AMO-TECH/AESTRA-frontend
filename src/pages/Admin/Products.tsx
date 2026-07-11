import { Navigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { Eye, Pencil, Trash2, X } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Admin/Sidebar";
import { grades, warranties, tags } from "@/data/productOptions";

type Product = {
  id: number;
  name: string;
  original_price: number;
  discount_percentage: number;
  price: number;
  category_id: string;
  brand_id: string;
  model?: string;
  grade?: string;
  condition?: string;
  stock?: number;
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
  is_flash_deal?: boolean | string;
  description?: string;
  category?: { id: number; name: string };
  brand?: { id: number; name: string };
  images?: { id: number; image_url: string }[];
};

type Category = { id: number; name: string };
type Brand = { id: number; name: string };

const initialProductState = {
  name: "",
  original_price: "",
  discount_percentage: "",
  price: "",
  category_id: "",
  brand_id: "",
  model: "",
  grade: "",
  condition: "Original",
  stock: "",
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
  is_flash_deal: "yes",
  description: ""
};

const AdminProducts = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [selected, setSelected] = useState<Product | null>(null);
  const [mode, setMode] = useState<"view" | "edit" | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [images, setImages] = useState<FileList | null>(null);

  const [newProduct, setNewProduct] = useState(initialProductState);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    category_id: "",
    brand_id: "",
    grade: "",
    condition: "",
    min_price: "",
    max_price: "",
    sort: "newest"
  });
  const [showFilters, setShowFilters] = useState(false);

  const [form, setForm] = useState({
    name: "",
    original_price: "",
    discount_percentage: "",
    price: "",
    category_id: "",
    brand_id: "",
    model: "",
    grade: "",
    condition: "",
    stock: "",
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
    is_flash_deal: "yes",
    description: ""
  });

  useEffect(() => {
    const original = Number(newProduct.original_price);
    const discount = Number(newProduct.discount_percentage);
    if (original > 0) {
      const finalPrice = original - (original * discount) / 100;
      setNewProduct((prev) => ({ ...prev, price: String(finalPrice) }));
    }
  }, [newProduct.original_price, newProduct.discount_percentage]);

  const fetchProducts = async (pageNumber = 1, searchValue = "") => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://127.0.0.1:8000/api/admin/products",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page: pageNumber,
            per_page: 10,
            search: searchValue,

            // FILTERS
            sort: filters.sort,
            category_id: filters.category_id,
            brand_id: filters.brand_id,
            grade: filters.grade,
            condition: filters.condition,
            min_price: filters.min_price,
            max_price: filters.max_price,
          },
        }
      );

      setProducts(res.data.data);
      setPage(res.data.meta.current_page);
      setLastPage(res.data.meta.last_page);
    } catch (error) {
      console.error(error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const res = await axios.get("http://127.0.0.1:8000/api/admin/products/categories", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setCategories(res.data || []);
  };

  const fetchBrands = async () => {
    const res = await axios.get("http://127.0.0.1:8000/api/admin/products/brands", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setBrands(res.data || []);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchProducts(1, search);
    }, 400);
    return () => clearTimeout(delay);
  }, [search, filters]);

  const handleDelete = async (id: number) => {
    await axios.delete(`http://127.0.0.1:8000/api/admin/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchProducts();
  };

  const handleAddProduct = async () => {
    try {
      const formData = new FormData();

      Object.entries(newProduct).forEach(([key, value]) => {
        if (key !== "images") {
          formData.append(key, String(value ?? ""));
        }
      });

      formData.set(
        "is_flash_deal",
        newProduct.is_flash_deal === "yes" ? "1" : "0"
      );

      if (images) {
        Array.from(images).forEach((img) => {
          formData.append("images[]", img);
        });
      }

      await axios.post(
        "http://127.0.0.1:8000/api/admin/products",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setNewProduct(initialProductState);
      setImages(null);
      setShowAddModal(false);
      fetchProducts(1, search);
    } catch (err) {
      console.log("ADD PRODUCT ERROR:", err);
    }
  };

  const openView = (product: Product) => {
    setSelected(product);
    setMode("view");
  };

  const openEdit = (product: Product) => {
    setSelected(product);
    setMode("edit");
    setForm({
      name: product.name || "",
      original_price: String(product.original_price || ""),
      discount_percentage: String(product.discount_percentage || ""),
      price: String(product.price || ""),
      category_id: String(product.category_id || ""),
      brand_id: String(product.brand_id || ""),
      model: product.model || "",
      grade: product.grade || "",
      condition: product.condition || "Original",
      stock: String(product.stock || ""),
      ram: product.ram || "",
      battery: product.battery || "",
      storage: product.storage || "",
      camera: product.camera || "",
      cpu: product.cpu || "",
      gpu: product.gpu || "",
      display: product.display || "",
      os: product.os || "",
      connectivity: product.connectivity || "",
      warranty: product.warranty || "",
      tag: product.tag || "",
      is_flash_deal:
        product.is_flash_deal === true || product.is_flash_deal === "1"
          ? "yes"
          : "no",
      description: product.description || ""
    });
  };

  const saveEdit = async () => {
    if (!selected) return;

    try {
      const formData = new FormData();

      formData.append("_method", "PUT");

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, String(value ?? ""));
      });

      formData.set(
        "is_flash_deal",
        form.is_flash_deal === "yes" ? "1" : "0"
      );

      if (images) {
        Array.from(images).forEach((img) => {
          formData.append("images[]", img);
        });
      }

      await axios.post(
        `http://127.0.0.1:8000/api/admin/products/${selected.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      await fetchProducts(page, search);

      setMode("view");
    } catch (err) {
      console.log("SAVE ERROR:", err);
    }
  };

  const filteredProducts = useMemo(() => {
    return products;
  }, [products]);

  if (!user) return <Navigate to="/admin/login" replace />;

  const renderFilters = () => (
    <div className="flex flex-wrap gap-2 items-end">
      {/* SORT */}
      <select
        value={filters.sort}
        onChange={(e) =>
          setFilters({ ...filters, sort: e.target.value })
        }
        className="w-36 border p-2 rounded text-sm"
      >
        <option value="">Price</option>
        <option value="newest">Newest</option>
        <option value="price_asc">Low → High</option>
        <option value="price_desc">High → Low</option>
      </select>

      {/* CATEGORY */}
      <select
        value={filters.category_id}
        onChange={(e) =>
          setFilters({ ...filters, category_id: e.target.value })
        }
        className="w-40 border p-2 rounded text-sm"
      >
        <option value="">Category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* BRAND */}
      <select
        value={filters.brand_id}
        onChange={(e) =>
          setFilters({ ...filters, brand_id: e.target.value })
        }
        className="w-40 border p-2 rounded text-sm"
      >
        <option value="">Brand</option>
        {brands.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>

      {/* GRADE */}
      <select
        value={filters.grade}
        onChange={(e) =>
          setFilters({ ...filters, grade: e.target.value })
        }
        className="w-32 border p-2 rounded text-sm"
      >
        <option value="">Grade</option>
        {grades.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>

      {/* CONDITION */}
      <select
        value={filters.condition}
        onChange={(e) =>
          setFilters({ ...filters, condition: e.target.value })
        }
        className="w-36 border p-2 rounded text-sm"
      >
        <option value="">Condition</option>
        <option value="Original">Original</option>
        <option value="Refurbished">Refurbished</option>
      </select>

      {/* MIN PRICE */}
      <input
        type="number"
        placeholder="Min ₦"
        value={filters.min_price}
        onChange={(e) =>
          setFilters({ ...filters, min_price: e.target.value })
        }
        className="w-28 border p-2 rounded text-sm"
      />

      {/* MAX PRICE */}
      <input
        type="number"
        placeholder="Max ₦"
        value={filters.max_price}
        onChange={(e) =>
          setFilters({ ...filters, max_price: e.target.value })
        }
        className="w-28 border p-2 rounded text-sm"
      />

      {/* APPLY + CLEAR */}
      <div className="flex gap-2 ml-auto">

        {/* APPLY */}
        <button
          onClick={() => {
            fetchProducts(1, search);
            setShowFilters(false);
          }}
          className="px-3 py-2 bg-primary text-white rounded text-sm"
        >
          Apply
        </button>

        {/* CLEAR */}
        <button
          onClick={() => {
            setFilters({
              category_id: "",
              brand_id: "",
              grade: "",
              condition: "",
              min_price: "",
              max_price: "",
              sort: "newest",
            });

            fetchProducts(1, search);
            setShowFilters(false);
          }}
          className="px-3 py-2 border rounded text-sm bg-gray-100 hover:bg-gray-200"
        >
          Clear
        </button>

      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background lg:flex">
      <Sidebar user={user} />

      <div className="flex-1 p-4 lg:p-10 mt-14 lg:mt-0">

        {/* HEADER */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">Manage Products</h1>

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary text-white px-4 py-2 rounded-lg"
            >
              + Add Product
            </button>
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 border rounded-lg px-3 py-2"
            />

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="border px-3 py-2 rounded-lg flex items-center gap-2"
            >
              Filter
            </button>
          </div>
        </div>

        {/* FILTER PANEL */}
        {showFilters && (
          <div className="bg-white p-4 rounded shadow mb-4">
            {renderFilters()}
          </div>
        )}

        {/* TABLE */}
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Image</th>
                <th className="p-3 text-left">Brand</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Tag</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse border-t">
                    <td className="p-3"><div className="h-4 bg-gray-200 w-32"></div></td>
                    <td className="p-3"><div className="h-10 w-10 bg-gray-200"></div></td>
                    <td className="p-3"><div className="h-4 bg-gray-200 w-20"></div></td>
                    <td className="p-3"><div className="h-4 bg-gray-200 w-16"></div></td>
                    <td className="p-3"><div className="h-4 bg-gray-200 w-16"></div></td>
                    <td className="p-3 text-right"><div className="h-4 bg-gray-200 w-20 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{p.name}</td>
                    <td className="p-3">
                      <img
                        src={
                          p.images?.[0]?.image_url
                            ? `http://127.0.0.1:8000${p.images[0].image_url}`
                            : "/placeholder.png"
                        }
                        className="w-12 h-12 object-cover rounded"
                      />
                    </td>
                    <td className="p-3">{p.brand?.name || "-"}</td>
                    <td className="p-3">₦{p.price}</td>
                    <td className="p-3">{p.tag}</td>
                    <td className="p-3 text-right space-x-2">
                      <button onClick={() => openView(p)} className="p-2 rounded-lg hover:bg-gray-100" ><Eye size={16} /></button>
                      <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-blue-100 text-blue-600" ><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-100 text-red-600" ><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-gray-500">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm">Page {page} of {lastPage}</p>

          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => fetchProducts(page - 1, search)}
              className="border px-3 py-1 rounded disabled:opacity-50"
            >
              Prev
            </button>

            <button
              onClick={() => fetchProducts(1, search)}
              className="border px-3 py-1 rounded"
            >
              1
            </button>

            <button
              disabled={page === lastPage}
              onClick={() => fetchProducts(page + 1, search)}
              className="border px-3 py-1 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* ADD PRODUCT MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-6xl rounded-2xl max-h-[95vh] overflow-y-auto">
              {/* HEADER */}
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold"> Add Product </h2>
                  <p className="text-sm text-muted-foreground"> Create a new product </p>
                </div>
                <button
                  onClick={() =>
                    setShowAddModal(false)
                  }
                >
                  <X />
                </button>
              </div>

              {/* BODY */}
              <div className="p-6 space-y-6">
                {/* PRODUCT NAME */}
                <div>
                  <label className="text-base font-semibold"> Product Name </label>
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        name: e.target.value,
                      })
                    }
                    className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                  />
                </div>

                {/* PRICES */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {/* ORIGINAL PRICE */}
                  <div>
                    <label className="text-base font-semibold">
                      Original Price (₦)
                    </label>

                    <input
                      type="number"
                      value={
                        newProduct.original_price
                      }
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          original_price:
                            e.target.value,
                        })
                      }
                      className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                    />
                  </div>

                  {/* DISCOUNT PERCENTAGE */}
                  <div>
                    <label className="text-base font-semibold">
                      Discount %
                    </label>
                    <input
                      type="number"
                      value={
                        newProduct.discount_percentage
                      }
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          discount_percentage:
                            e.target.value,
                        })
                      }
                      className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                    />
                  </div>

                  {/* FINAL PRICE */}
                  <div>
                    <label className="text-base font-semibold">
                      Final Price (₦)
                    </label>
                    <input
                      type="text"
                      value={newProduct.price}
                      readOnly
                      className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary bg-gray-100"
                    />
                  </div>

                </div>

                {/* CATEGORY + BRAND + MODEL */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {/* CATEGORY */}
                  <div>
                    <label className="text-base font-semibold">
                      Category
                    </label>

                    <select
                      value={
                        newProduct.category_id
                      }
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          category_id:
                            e.target.value,
                        })
                      }
                      className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                    >

                      <option value="">
                        Select Category
                      </option>

                      {categories.map((category) => (

                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>

                      ))}

                    </select>
                  </div>

                  {/* BRAND */}
                  <div>
                    <label className="text-base font-semibold">
                      Brand
                    </label>

                    <select
                      value={
                        newProduct.brand_id
                      }
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          brand_id:
                            e.target.value,
                        })
                      }
                      className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                    >

                      <option value="">
                        Select Brand
                      </option>

                      {brands.map((brand) => (

                        <option
                          key={brand.id}
                          value={brand.id}
                        >
                          {brand.name}
                        </option>

                      ))}

                    </select>
                  </div>

                  {/* MODEL */}
                  <div>
                    <label className="text-base font-semibold">
                      Model
                    </label>
                    
                    <input
                      type="text"
                      placeholder="e.g. iPhone 14 Pro Max"
                      value={newProduct.model || ""}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          model:
                            e.target.value,
                        })
                      }
                      className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                    />
                  </div>

                </div>

                {/* GRADE + CONDITION + STOCK */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {/* GRADE */}
                  <div>
                    <label className="text-base font-semibold">
                      Grade
                    </label>
                    <select
                      value={
                        newProduct.grade
                      }
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          grade:
                            e.target.value,
                        })
                      }
                      className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                    >

                      <option value="">
                        Select Grade
                      </option>

                      {grades.map((grade) => (

                        <option
                          key={grade}
                          value={grade}
                        >
                          {grade}
                        </option>

                      ))}

                    </select>
                  </div>

                  {/* CONDITION */}
                  <div>
                    <label className="text-base font-semibold">
                      Condition
                    </label>
                    <select
                      value={
                        newProduct.condition
                      }
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          condition:
                            e.target.value,
                        })
                      }
                      className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                    >

                      <option value="original">
                        Original
                      </option>

                      <option value="refurbished">
                        Refurbished
                      </option>

                    </select>
                  </div>

                  {/* STOCK */}
                  <div>
                    <label className="text-base font-semibold">
                      Stock
                    </label>
                    <input
                      type="number"
                      placeholder="Stock"
                      value={newProduct.stock}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          stock:
                            e.target.value,
                        })
                      }
                      className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                    />
                  </div>

                </div>
                
                <hr className="border-t-2 border-black my-2" />

                {/* SPECIFICATIONS */}
                <h2 className="text-xl font-bold">Specifications</h2>

                {/* RAM + BATTERY + STORAGE */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {/* RAM */}
                  <div>
                    <label className="text-base font-semibold">
                      RAM
                    </label>
                    
                    <input
                      type="text"
                      placeholder="e.g. 128GB"
                      value={newProduct.ram || ""}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          ram:
                            e.target.value,
                        })
                      }
                      className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                    />
                  </div>

                  {/* BATTERY */}
                  <div>
                    <label className="text-base font-semibold">
                      Battery
                    </label>
                    
                    <input
                      type="text"
                      placeholder="e.g. 5000mAh"
                      value={newProduct.battery || ""}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          battery:
                            e.target.value,
                        })
                      }
                      className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                    />
                  </div>

                  {/* STORAGE */}
                  <div>
                    <label className="text-base font-semibold">
                      Storage
                    </label>
                    
                    <input
                      type="text"
                      placeholder="e.g. 256GB"
                      value={newProduct.storage || ""}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          storage:
                            e.target.value,
                        })
                      }
                      className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                    />
                  </div>

                </div>

                {/* CAMERA + CPU + GPU */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {/* CAMERA */}
                  <div>
                    <label className="text-base font-semibold">
                      Camera
                    </label>
                    
                    <input
                      type="text"
                      placeholder="e.g. 128MP"
                      value={newProduct.camera || ""}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          camera:
                            e.target.value,
                        })
                      }
                      className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                    />
                  </div>

                  {/* CPU */}
                  <div>
                    <label className="text-base font-semibold">
                      CPU
                    </label>
                    
                    <input
                      type="text"
                      placeholder="e.g. Intel Core i7"
                      value={newProduct.cpu || ""}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          cpu:
                            e.target.value,
                        })
                      }
                      className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                    />
                  </div>

                  {/* GPU */}
                  <div>
                    <label className="text-base font-semibold">
                      GPU
                    </label>
                    
                    <input
                      type="text"
                      placeholder="e.g. NVIDIA GeForce RTX 3080"
                      value={newProduct.gpu || ""}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          gpu:
                            e.target.value,
                        })
                      }
                      className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                    />
                  </div>

                </div>
                
                {/* DISPLAY + OS + CONNECTIVITY */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {/* DISPLAY */}
                  <div>
                    <label className="text-base font-semibold">
                      Display
                    </label>
                    
                    <input
                      type="text"
                      placeholder="e.g. 6.7-inch AMOLED"
                      value={newProduct.display || ""}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          display:
                            e.target.value,
                        })
                      }
                      className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                    />
                  </div>

                  {/* OS */}
                  <div>
                    <label className="text-base font-semibold">
                      OS
                    </label>
                    
                    <input
                      type="text"
                      placeholder="e.g. Windows 10"
                      value={newProduct.os || ""}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          os:
                            e.target.value,
                        })
                      }
                      className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                    />
                  </div>

                  {/* CONNECTIVITY */}
                  <div>
                    <label className="text-base font-semibold">
                      Connectivity
                    </label>
                    
                    <input
                      type="text"
                      placeholder="e.g. Wi-Fi 6, Bluetooth 5.0"
                      value={newProduct.connectivity || ""}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          connectivity:
                            e.target.value,
                        })
                      }
                      className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                    />
                  </div>

                </div>
                
                <hr className="border-t-2 border-black my-2" />

                {/* WARRANTY + TAG + FLASH DEAL */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {/* WARRANTY */}
                  <div>
                    <label className="text-base font-semibold">
                      Warranty
                    </label>
                    <select
                      value={
                        newProduct.warranty
                      } 
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          warranty:
                            e.target.value,
                        })
                      }
                      className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                    >

                      <option value="">
                        Select Warranty
                      </option>

                      {warranties.map((warranty) => (

                        <option
                          key={warranty}
                          value={warranty}
                        >
                          {warranty}
                        </option>

                      ))}

                    </select>
                  </div>

                  {/* TAG */}
                  <div>
                    <label className="text-base font-semibold">
                      Tag
                    </label>
                    <select
                      value={
                        newProduct.tag
                      } 
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          tag:
                            e.target.value,
                        })
                      }
                      className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                    >

                      <option value="">
                        Select Tag
                      </option>

                      {tags.map((tag) => (

                        <option
                          key={tag}
                          value={tag}
                        >
                          {tag}
                        </option>

                      ))}

                    </select>
                  </div>

                  {/* FLASH DEAL */}
                  <div>
                    <label className="text-base font-semibold">
                      Flash Deal
                    </label>
                    <select
                      value={
                        newProduct.is_flash_deal
                      }
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          is_flash_deal:
                            e.target.value,
                        })
                      }
                      className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                    >
                      <option value="yes">
                        Yes
                      </option>

                      <option value="no">
                        No
                      </option>
                    </select>
                  </div>

                </div>

                {/* DESCRIPTION */}
                <textarea
                  rows={5}
                  placeholder="Description"
                  value={
                    newProduct.description || ""
                  }
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description:
                        e.target.value,
                    })
                  }
                  className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                />

                {/* IMAGES */}
                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    setImages(
                      e.target.files
                    )
                  }
                  className="w-full border rounded-xl p-3"
                />

              </div>

              {/* FOOTER */}
              <div className="p-6 border-t flex justify-end gap-3">

                <button
                  onClick={() =>
                    setShowAddModal(false)
                  }
                  className="px-5 py-2 border rounded-xl"
                >
                  Cancel
                </button>

                <button
                  onClick={handleAddProduct}
                  className="px-5 py-2 bg-primary text-white rounded-xl"
                >
                  Add Product
                </button>

              </div>

            </div>

          </div>

        )}

        {/* VIEW / EDIT PRODUCT MODAL */}
        {selected && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-6xl rounded-2xl max-h-[95vh] overflow-y-auto">
              {/* HEADER */}
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {mode === "edit"
                      ? "Edit Product"
                      : "View Product"}
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    {mode === "edit"
                      ? "Update product information"
                      : "Product details"}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelected(null);
                    setMode(null);
                  }}
                >
                  <X />
                </button>

              </div>

              {/* BODY */}
              <div className="p-6 space-y-6">

                {/* PRODUCT IMAGE */}
                <div>
                  <img
                    src={
                      selected.images?.[0]?.image_url
                        ? `http://127.0.0.1:8000${selected.images[0].image_url}`
                        : "/placeholder.png"
                    }
                    alt={selected.name}
                    className="w-full h-80 rounded-2xl object-cover border"
                  />
                </div>

                {/* PRODUCT NAME */}
                <div>
                  <label className="text-base font-semibold">
                    Product Name
                  </label>

                  {mode === "edit" ? (

                    <input
                      type="text"
                      value={form.name || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          name: e.target.value,
                        })
                      }
                      className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                    />

                  ) : (

                    <p className="mt-2 text-base">
                      {selected.name}
                    </p>

                  )}
                </div>

                {/* PRICES */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {/* ORIGINAL PRICE */}
                  <div>
                    <label className="text-base font-semibold">
                      Original Price (₦)
                    </label>

                    {mode === "edit" ? (

                      <input
                        type="number"
                        value={form.original_price || ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            original_price:
                              e.target.value,
                          })
                        }
                        className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                      />

                    ) : (

                      <p className="mt-2">
                        ₦{selected.original_price}
                      </p>

                    )}
                  </div>

                  {/* DISCOUNT */}
                  <div>
                    <label className="text-base font-semibold">
                      Discount %
                    </label>

                    {mode === "edit" ? (

                      <input
                        type="number"
                        value={
                          form.discount_percentage || ""
                        }
                        onChange={(e) =>
                          setForm({
                            ...form,
                            discount_percentage:
                              e.target.value,
                          })
                        }
                        className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                      />

                    ) : (

                      <p className="mt-2">
                        {selected.discount_percentage}%
                      </p>

                    )}
                  </div>

                  {/* FINAL PRICE */}
                  <div>
                    <label className="text-base font-semibold">
                      Final Price
                    </label>

                    {mode === "edit" ? (

                      <input
                        type="number"
                        value={form.price || ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            price: e.target.value,
                          })
                        }
                        className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                      />

                    ) : (

                      <p className="mt-2">
                        ₦{selected.price}
                      </p>

                    )}
                  </div>

                </div>

                {/* CATEGORY + BRAND + MODEL */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {/* CATEGORY */}
                  <div>
                    <label className="text-base font-semibold">
                      Category
                    </label>

                    {mode === "edit" ? (

                      <select
                        value={form.category_id || ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            category_id:
                              e.target.value,
                          })
                        }
                        className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                      >

                        <option value="">
                          Select Category
                        </option>

                        {categories.map((category) => (

                          <option
                            key={category.id}
                            value={category.id}
                          >
                            {category.name}
                          </option>

                        ))}

                      </select>

                    ) : (

                      <p className="mt-2">
                        {selected.category?.name || "-"}
                      </p>

                    )}
                  </div>

                  {/* BRAND */}
                  <div>
                    <label className="text-base font-semibold">
                      Brand
                    </label>

                    {mode === "edit" ? (

                      <select
                        value={form.brand_id || ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            brand_id:
                              e.target.value,
                          })
                        }
                        className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                      >

                        <option value="">
                          Select Brand
                        </option>

                        {brands.map((brand) => (

                          <option
                            key={brand.id}
                            value={brand.id}
                          >
                            {brand.name}
                          </option>

                        ))}

                      </select>

                    ) : (

                      <p className="mt-2">
                        {selected.brand?.name || "-"}
                      </p>

                    )}
                  </div>

                  {/* MODEL */}
                  <div>
                    <label className="text-base font-semibold">
                      Model
                    </label>

                    {mode === "edit" ? (

                      <input
                        type="text"
                        value={form.model || ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            model:
                              e.target.value,
                          })
                        }
                        className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                      />

                    ) : (

                      <p className="mt-2">
                        {selected.model}
                      </p>

                    )}
                  </div>

                </div>

                {/* GRADE + CONDITION + STOCK */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {/* GRADE */}
                  <div>
                    <label className="text-base font-semibold">
                      Grade
                    </label>

                    {mode === "edit" ? (

                      <select
                        value={form.grade || ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            grade:
                              e.target.value,
                          })
                        }
                        className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                      >

                        <option value="">
                          Select Grade
                        </option>

                        {grades.map((grade) => (

                          <option
                            key={grade}
                            value={grade}
                          >
                            {grade}
                          </option>

                        ))}

                      </select>

                    ) : (

                      <p className="mt-2">
                        {selected.grade}
                      </p>

                    )}
                  </div>

                  {/* CONDITION */}
                  <div>
                    <label className="text-base font-semibold">
                      Condition
                    </label>

                    {mode === "edit" ? (

                      <select
                        value={form.condition || ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            condition:
                              e.target.value,
                          })
                        }
                        className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                      >

                        <option value="original">
                          Original
                        </option>

                        <option value="refurbished">
                          Refurbished
                        </option>

                      </select>

                    ) : (

                      <p className="mt-2">
                        {selected.condition}
                      </p>

                    )}
                  </div>

                  {/* STOCK */}
                  <div>
                    <label className="text-base font-semibold">
                      Stock
                    </label>

                    {mode === "edit" ? (

                      <input
                        type="number"
                        value={form.stock || ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            stock:
                              e.target.value,
                          })
                        }
                        className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                      />

                    ) : (

                      <p className="mt-2">
                        {selected.stock}
                      </p>

                    )}
                  </div>

                </div>

                <hr className="border-t-2 border-black my-2" />

                {/* SPECIFICATIONS */}
                <div>

                  <h2 className="text-xl font-bold mb-4">
                    Specifications
                  </h2>
                    
                  {/* RAM + BATTERY + STORAGE */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* RAM */}
                    <div>
                      <label className="text-base font-semibold">
                        RAM
                      </label>

                      {mode === "edit" ? (

                        <input
                          type="text"
                          value={form.ram || ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              ram:
                                e.target.value,
                            })
                          }
                          className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                        />

                      ) : (

                        <p className="mt-2">
                          {selected.ram}
                        </p>

                      )}
                    </div>
                    
                    {/* BATTERY */}
                    <div>
                      <label className="text-base font-semibold">
                        Battery
                      </label>

                      {mode === "edit" ? (

                        <input
                          type="text"
                          value={form.battery || ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              battery:
                                e.target.value,
                            })
                          }
                          className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                        />

                      ) : (

                        <p className="mt-2">
                          {selected.battery}
                        </p>

                      )}
                    </div>
                    
                    {/* STORAGE */}
                    <div>
                      <label className="text-base font-semibold">
                        Storage
                      </label>

                      {mode === "edit" ? (

                        <input
                          type="text"
                          value={form.storage || ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              storage:
                                e.target.value,
                            })
                          }
                          className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                        />

                      ) : (
                        <p className="mt-2">
                          {selected.storage}
                        </p>
                      )}
                    </div>

                  </div>
                    
                  {/* CAMERA + CPU + GPU */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* CAMERA */}
                    <div>
                      <label className="text-base font-semibold">
                        Camera
                      </label>

                      {mode === "edit" ? (

                        <input
                          type="text"
                          value={form.camera || ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              camera:
                                e.target.value,
                            })
                          }
                          className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                        />

                      ) : (

                        <p className="mt-2">
                          {selected.camera}
                        </p>

                      )}
                    </div>
                    
                    {/* CPU */}
                    <div>
                      <label className="text-base font-semibold">
                        CPU
                      </label>

                      {mode === "edit" ? (

                        <input
                          type="text"
                          value={form.cpu || ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              cpu:
                                e.target.value,
                            })
                          }
                          className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                        />

                      ) : (

                        <p className="mt-2">
                          {selected.cpu}
                        </p>

                      )}
                    </div>
                    
                    {/* GPU */}
                    <div>
                      <label className="text-base font-semibold">
                        GPU
                      </label>

                      {mode === "edit" ? (

                        <input
                          type="text"
                          value={form.gpu || ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              gpu:
                                e.target.value,
                            })
                          }
                          className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                        />

                      ) : (
                        <p className="mt-2">
                          {selected.gpu}
                        </p>
                      )}
                    </div>

                  </div>
                    
                  {/* DISPLAY + OS + CONNECTIVITY */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* DISPLAY */}
                    <div>
                      <label className="text-base font-semibold">
                        Display
                      </label>

                      {mode === "edit" ? (

                        <input
                          type="text"
                          value={form.display || ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              display:
                                e.target.value,
                            })
                          }
                          className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                        />

                      ) : (

                        <p className="mt-2">
                          {selected.display}
                        </p>

                      )}
                    </div>
                    
                    {/* OS */}
                    <div>
                      <label className="text-base font-semibold">
                        OS
                      </label>

                      {mode === "edit" ? (

                        <input
                          type="text"
                          value={form.os || ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              os:
                                e.target.value,
                            })
                          }
                          className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                        />

                      ) : (

                        <p className="mt-2">
                          {selected.os}
                        </p>

                      )}
                    </div>
                    
                    {/* CONNECTIVITY */}
                    <div>
                      <label className="text-base font-semibold">
                        Connectivity
                      </label>

                      {mode === "edit" ? (

                        <input
                          type="text"
                          value={form.connectivity || ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              connectivity:
                                e.target.value,
                            })
                          }
                          className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                        />

                      ) : (
                        <p className="mt-2">
                          {selected.connectivity}
                        </p>
                      )}
                    </div>

                  </div>

                </div>

                <hr className="border-t-2 border-black my-2" />

                {/* WARRANTY + TAG + FLASH DEAL */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {/* WARRANTY */}
                  <div>
                    <label className="text-base font-semibold">
                      Warranty
                    </label>

                    {mode === "edit" ? (

                      <select
                        value={form.warranty || ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            warranty:
                              e.target.value,
                          })
                        }
                        className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                      >

                        <option value="">
                          Select Warranty
                        </option>

                        {warranties.map((warranty) => (

                          <option
                            key={warranty}
                            value={warranty}
                          >
                            {warranty}
                          </option>

                        ))}

                      </select>

                    ) : (

                      <p className="mt-2">
                        {selected.warranty || "-"}
                      </p>

                    )}
                  </div>

                  {/* TAG */}
                  <div>
                    <label className="text-base font-semibold">
                      Tag
                    </label>

                    {mode === "edit" ? (

                      <select
                        value={form.tag || ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            tag:
                              e.target.value,
                          })
                        }
                        className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                      >

                        <option value="">
                          Select Tag
                        </option>

                        {tags.map((tag) => (

                          <option
                            key={tag}
                            value={tag}
                          >
                            {tag}
                          </option>

                        ))}

                      </select>

                    ) : (

                      <p className="mt-2">
                        {selected.tag || "-"}
                      </p>

                    )}
                  </div>

                  {/* FLASH DEAL */}
                  <div>
                    <label className="text-base font-semibold">
                      Flash Deal
                    </label>

                    {mode === "edit" ? (

                      <select
                        value={
                          form.is_flash_deal
                        }
                        onChange={(e) =>
                          setForm({
                            ...form,
                            is_flash_deal:
                              e.target.value,
                          })
                        }
                        className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                      >
                        <option value="yes">
                          Yes
                        </option>

                        <option value="no">
                          No
                        </option>

                      </select>

                    ) : (

                      <p className="mt-2">
                        {selected.is_flash_deal ? "Yes" : "No"}
                      </p>

                    )}
                  </div>

                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="text-base font-semibold">
                    Description
                  </label>

                  {mode === "edit" ? (

                    <input
                      type="text"
                      value={form.description || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          description:
                            e.target.value,
                        })
                      }
                      className="w-full border rounded-xl p-3 outline-none focus:border-2 focus:border-primary"
                    />

                  ) : (

                    <p className="mt-2">
                      {selected.description || "-"}
                    </p>

                  )}
                </div>

                {/* IMAGES */}
                {mode === "edit" && (

                  <div>
                    <label className="text-base font-semibold">
                      Product Images
                    </label>

                    <input
                      type="file"
                      multiple
                      onChange={(e) =>
                        setImages(e.target.files)
                      }
                      className="w-full border rounded-xl p-3"
                    />
                  </div>

                )}

              </div>

              {/* FOOTER */}
              <div className="p-6 border-t flex justify-end gap-3">

                <button
                  onClick={() => {
                    setSelected(null);
                    setMode(null);
                  }}
                  className="px-5 py-2 border rounded-xl"
                >
                  Close
                </button>

                {mode === "view" && (

                  <button
                    onClick={() => {
                      if (selected) {
                        openEdit(selected);
                      }
                    }}
                    className="px-5 py-2 bg-black text-white rounded-xl"
                  >
                    Edit
                  </button>

                )}

                {mode === "edit" && (

                  <button
                    onClick={saveEdit}
                    className="px-5 py-2 bg-primary text-white rounded-xl"
                  >
                    Save Changes
                  </button>

                )}

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default AdminProducts;