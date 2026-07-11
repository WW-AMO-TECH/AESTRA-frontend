import { useEffect, useState } from "react";
import axios from "@/api/axios";
import Sidebar from "@/components/Admin/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { DollarSign, ShoppingCart, Users, TrendingUp, Calendar, Download, } from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = [
  "#4f46e5",
  "#8b5cf6",
  "#22c55e",
  "#f97316",
  "#ef4444",
];

type DashboardStats = {
  revenue: number;
  orders: number;
  customers: number;
  conversion_rate: number;
};

const Analytics = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState<DashboardStats>({
    revenue: 0,
    orders: 0,
    customers: 0,
    conversion_rate: 0,
  });

  const [revenueChart, setRevenueChart] = useState<any[]>([]);
  const [ordersChart, setOrdersChart] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const response = await axios.get("/superadmin/analytics");
      console.log(response.data);

      const data = response.data;

      setStats({
        revenue: data.revenue ?? 0,
        orders: data.orders ?? 0,
        customers: data.customers ?? 0,
        conversion_rate: data.conversion_rate ?? 0,
      });

      setRevenueChart(data.revenue_chart ?? []);
      setOrdersChart(data.orders_chart ?? []);
      setCategories(data.categories ?? []);
      setCountries(data.countries ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const cards = [
    {
      title: "Revenue",
      value: `₦${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Orders",
      value: stats.orders.toLocaleString(),
      icon: ShoppingCart,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Customers",
      value: stats.customers.toLocaleString(),
      icon: Users,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Conversion",
      value: `${stats.conversion_rate}%`,
      icon: TrendingUp,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      <Sidebar user={user} />

      <main className="flex-1 mx-1 h-screen overflow-y-auto lg:ml-2 bg-slate-50">
        <div className="w-full max-w-[1800px] mx-auto px-6 py-5 pt-20 lg:pt-6">
            <div className="flex flex-col lg:flex-row justify-between gap-5 mb-8">

            <div>
                <p className="text-sm text-gray-500">
                Dashboard / Analytics
                </p>

                <h1 className="text-3xl font-bold mt-1">
                Analytics Overview
                </h1>
            </div>

            <div className="flex gap-3">

                <button className="border rounded-xl px-4 py-2 flex items-center gap-2 hover:bg-gray-100">
                <Calendar size={18} />
                This Month
                </button>

                <button className="bg-primary text-white rounded-xl px-4 py-2 flex items-center gap-2">
                <Download size={18} />
                Export
                </button>

            </div>

            </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="bg-white rounded-2xl shadow-sm border p-6"
              >
                <div className="flex justify-between">

                  <div>

                    <p className="text-gray-500 text-sm">
                      {card.title}
                    </p>

                    <h2 className="text-3xl font-bold mt-3">
                      {card.value}
                    </h2>

                  </div>

                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center ${card.color}`}
                  >
                    <Icon size={28} />
                  </div>

                </div>
              </div>
            );
          })}
                  </div>

        {/* Charts */}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">

          {/* Revenue Chart */}

          <div className="xl:col-span-2 bg-white rounded-2xl border shadow-sm p-6">

            <div className="flex items-center justify-between mb-6">

              <div>

                <h2 className="text-lg font-semibold">
                  Revenue Overview
                </h2>

                <p className="text-sm text-muted-foreground">
                  Revenue generated over time
                </p>

              </div>

            </div>

            <div className="h-[350px]">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart data={revenueChart}>

                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#16a34a"
                    strokeWidth={4}
                    dot={{
                      r: 4,
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </div>

          {/* Orders Chart */}

          <div className="bg-white rounded-2xl border shadow-sm p-6">

            <div className="mb-6">

              <h2 className="text-lg font-semibold">
                Orders
              </h2>

              <p className="text-sm text-muted-foreground">
                Monthly Orders
              </p>

            </div>

            <div className="h-[350px]">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart data={ordersChart}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="orders"
                    fill="#3b82f6"
                    radius={[8, 8, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>

        </div>
                {/* Bottom Section */}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Top Categories */}

          <div className="bg-white rounded-2xl border shadow-sm p-6">

            <div className="mb-5">

              <h2 className="text-lg font-semibold">
                Top Categories
              </h2>

              <p className="text-sm text-muted-foreground">
                Best performing categories
              </p>

            </div>

            <div className="h-[300px]">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={categories}
                    dataKey="sales"
                    nameKey="name"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={3}
                  >

                    {categories.map((_, index) => (

                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                      />

                    ))}

                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            </div>

          </div>

          {/* Sales by Country */}

          <div className="xl:col-span-2 bg-white rounded-2xl border shadow-sm p-6">

            <div className="flex justify-between items-center mb-6">

              <div>

                <h2 className="text-lg font-semibold">
                  Sales by Country
                </h2>

                <p className="text-sm text-muted-foreground">
                  Performance by customer location
                </p>

              </div>

            </div>

            <div className="space-y-5">

              {countries.length === 0 ? (

                <div className="text-center text-muted-foreground py-16">
                  No sales data available.
                </div>

              ) : (

                countries.map((country: any, index: number) => (

                  <div
                    key={index}
                    className="space-y-2"
                  >

                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-semibold">
                          {country.country}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {country.orders} Orders
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          ₦{Number(country.sales).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {country.percent}%
                        </p>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${country.percent}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
export default Analytics;