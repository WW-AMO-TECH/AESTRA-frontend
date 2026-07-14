import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Admin/Sidebar";

import {
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Bell,
  Search,
  ChevronDown,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const getGreeting = () => {
  const h = new Date().getHours();

  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";

  return "Good Evening";
};

const salesData = [
  { month: "Jan", sales: 4200 },
  { month: "Feb", sales: 6100 },
  { month: "Mar", sales: 5600 },
  { month: "Apr", sales: 7800 },
  { month: "May", sales: 9600 },
  { month: "Jun", sales: 8700 },
  { month: "Jul", sales: 11100 },
  { month: "Aug", sales: 13200 },
];

const stats = [
  {
    title: "Total Revenue",
    value: "$82,430",
    change: "+14%",
    icon: DollarSign,
  },
  {
    title: "Orders",
    value: "1,254",
    change: "+9%",
    icon: ShoppingCart,
  },
  {
    title: "Customers",
    value: "8,921",
    change: "+17%",
    icon: Users,
  },
  {
    title: "Products",
    value: "523",
    change: "+4%",
    icon: Package,
  },
];

const topProducts = [
  {
    name: "iPhone 15 Pro",
    sold: 231,
    amount: "$281,000",
  },
  {
    name: "Samsung S25 Ultra",
    sold: 201,
    amount: "$198,000",
  },
  {
    name: "MacBook Pro M4",
    sold: 156,
    amount: "$345,000",
  },
  {
    name: "AirPods Pro",
    sold: 420,
    amount: "$88,000",
  },
];

const recentOrders = [
  {
    id: "#10325",
    customer: "John Doe",
    total: "$499",
    status: "Delivered",
  },
  {
    id: "#10326",
    customer: "Sarah James",
    total: "$1,299",
    status: "Pending",
  },
  {
    id: "#10327",
    customer: "Michael Lee",
    total: "$799",
    status: "Processing",
  },
  {
    id: "#10328",
    customer: "Aisha Bello",
    total: "$299",
    status: "Delivered",
  },
];

const AdminDashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
  <div className="min-h-screen bg-slate-100 lg:flex">
    <Sidebar user={user} />

    <main className="flex-1 p-3 lg:p-4 lg:py-0 mt-12 lg:mt-0 h-screen overflow-y-auto">
      <div className="p-4 lg:pt-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {getGreeting()}, {user.name.split(" ")[0]}
            </h1>
            <p className="text-slate-500 mt-2">
              Welcome back to your dashboard.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="hidden md:block text-left">
              <p className="font-semibold text-sm"> {user.name} </p>
              <p className="text-xs text-slate-500">
                {user?.role === "super_admin" ? "Super Admin" : "Admin"}
              </p>
            </div>

            <button className="relative bg-white w-11 h-11 rounded-xl shadow-sm flex items-center justify-center">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
            </button>
          </div>
        </div>
      </div>

        {/* STAT CARDS */}

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

          {stats.map((item) => {

            const Icon = item.icon;

            return (

              <div
                key={item.title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
              >

                <div className="flex justify-between">

                  <div>

                    <p className="text-slate-500 text-sm">
                      {item.title}
                    </p>

                    <h2 className="text-3xl font-bold mt-2">
                      {item.value}
                    </h2>

                    <div className="flex items-center gap-1 text-green-600 mt-3">

                      <TrendingUp className="w-4 h-4" />

                      <span className="font-medium text-sm">
                        {item.change}
                      </span>

                    </div>

                  </div>

                  <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center">

                    <Icon className="w-7 h-7 text-primary" />

                  </div>

                </div>

              </div>

            );

          })}

        </div>

        {/* SALES OVERVIEW STARTS BELOW */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">

          {/* SALES OVERVIEW */}

          <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">

            <div className="flex items-center justify-between mb-6">

              <div>

                <h2 className="text-xl font-semibold">
                  Sales Overview
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Revenue generated this year
                </p>

              </div>

              <button className="px-4 py-2 rounded-lg border text-sm hover:bg-slate-50">
                This Year
              </button>

            </div>

            <div className="h-80">

              <ResponsiveContainer width="100%" height="100%">

                <LineChart data={salesData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="hsl(var(--primary))"
                    strokeWidth={4}
                    dot={{
                      r: 4,
                    }}
                    activeDot={{
                      r: 7,
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </div>

          {/* TOP PRODUCTS */}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">

            <div className="flex items-center justify-between mb-6">

              <h2 className="font-semibold text-lg">
                Top Selling Products
              </h2>

              <button className="text-primary text-sm font-medium">
                View All
              </button>

            </div>

            <div className="space-y-5">

              {topProducts.map((product, index) => (

                <div
                  key={index}
                  className="flex items-center justify-between"
                >

                  <div className="flex items-center gap-4">

                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">

                      <Package className="w-6 h-6 text-primary" />

                    </div>

                    <div>

                      <h3 className="font-semibold">
                        {product.name}
                      </h3>

                      <p className="text-sm text-slate-500">
                        {product.sold} Sold
                      </p>

                    </div>

                  </div>

                  <div className="text-right">

                    <p className="font-bold">
                      {product.amount}
                    </p>

                    <div className="flex justify-end mt-1">

                      <ArrowUpRight className="w-4 h-4 text-green-500" />

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>

        {/* RECENT ORDERS */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">

  {/* RECENT ORDERS */}

  <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">

    <div className="flex items-center justify-between mb-6">

      <div>

        <h2 className="text-xl font-semibold">
          Recent Orders
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Latest customer purchases
        </p>

      </div>

      <Link to="/admin/orders" className="text-primary font-medium text-sm">
        View All
      </Link>

    </div>

    <div className="overflow-x-auto">

      <table className="w-full">

        <thead>

          <tr className="border-b">

            <th className="text-left py-3 text-sm text-slate-500 font-medium">
              Order ID
            </th>

            <th className="text-left py-3 text-sm text-slate-500 font-medium">
              Customer
            </th>

            <th className="text-left py-3 text-sm text-slate-500 font-medium">
              Amount
            </th>

            <th className="text-left py-3 text-sm text-slate-500 font-medium">
              Status
            </th>

          </tr>

        </thead>

        <tbody>

          {recentOrders.map((order) => (

            <tr
              key={order.id}
              className="border-b last:border-0 hover:bg-slate-50 transition"
            >

              <td className="py-4 font-semibold">
                {order.id}
              </td>

              <td className="py-4">
                {order.customer}
              </td>

              <td className="py-4 font-medium">
                {order.total}
              </td>

              <td className="py-4">

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold
                  ${
                    order.status === "Delivered"
                      ? "bg-green-100 text-green-700"
                      : order.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {order.status}
                </span>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  </div>

  {/* SALES CATEGORY */}

  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">

    <h2 className="text-xl font-semibold mb-6">
      Sales Summary
    </h2>
    <div className="space-y-5">
      <div>
        <div className="flex justify-between mb-2">
          <span>Phones</span>
          <span className="font-semibold">72%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
          <div className="w-[72%] h-full bg-primary rounded-full"></div>
        </div>
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <span>Laptops</span>
          <span className="font-semibold">61%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
          <div className="w-[61%] h-full bg-green-500 rounded-full"></div>
        </div>

      </div>

      <div>

        <div className="flex justify-between mb-2">

          <span>Accessories</span>

          <span className="font-semibold">48%</span>

        </div>

        <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">

          <div className="w-[48%] h-full bg-orange-500 rounded-full"></div>

        </div>

      </div>

      <div>

        <div className="flex justify-between mb-2">

          <span>Tablets</span>

          <span className="font-semibold">37%</span>

        </div>

        <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">

          <div className="w-[37%] h-full bg-purple-500 rounded-full"></div>

        </div>

      </div>

    </div>

    <div className="mt-10 rounded-xl bg-primary text-white p-5">

      <p className="text-sm opacity-90">
        Monthly Revenue
      </p>

      <h2 className="text-4xl font-bold mt-2">
        $82,430
      </h2>

      <p className="mt-3 text-sm opacity-90">
        ▲ 14% compared to last month
      </p>

    </div>

  </div>
      </div>
    </main>
  </div>
);
};

export default AdminDashboard;