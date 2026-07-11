import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, Users, User,
  Star, BarChart3, Settings, MapPin, ChevronDown,
  ChevronRight, UserCog, Clock, Menu, X, Building2 } from "lucide-react";

interface SidebarProps {
  user: {
    name?: string;
    role?: string;
  } | null;
}

const sidebarItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
    roles: ["admin", "super_admin"],
  },
  {
    label: "Products",
    icon: Package,
    path: "/admin/products",
    roles: ["admin", "super_admin"],
  },
  {
    label: "Orders",
    icon: ShoppingCart,
    path: "/admin/orders",
    roles: ["admin", "super_admin"],
  },
  {
    label: "Tracking",
    icon: MapPin,
    path: "/admin/tracking",
    roles: ["admin", "super_admin"],
  },
  {
    label: "Reviews",
    icon: Star,
    path: "/admin/reviews",
    roles: ["admin", "super_admin"],
  },
  {
    label: "Customers",
    icon: Users,
    path: "/superadmin/customers",
    roles: ["super_admin"],
  },
  {
    label: "Pickup Locations",
    icon: Building2,
    roles: ["super_admin"],
    subLinks: [
      {
        label: "Countries",
        icon: Building2,
        path: "/superadmin/countries",
        roles: ["super_admin"],
      },
      {
        label: "States",
        icon: Building2,
        path: "/superadmin/states",
        roles: ["super_admin"],
      },
      {
        label: "Addresses",
        icon: Building2,
        path: "/superadmin/pickup-locations",
        roles: ["super_admin"],
      },
    ],
  },
  {
    label: "Admins",
    icon: Users,
    roles: ["super_admin"],
    subLinks: [
      {
        label: "Admins",
        icon: UserCog,
        path: "/superadmin/admins",
        roles: ["super_admin"],
      },
      {
        label: "Admin Requests",
        icon: User,
        path: "/superadmin/admin-requests",
        roles: ["super_admin"],
      },
    ],
  },
  {
    label: "Analytics",
    icon: BarChart3,
    path: "/admin/analytics",
    roles: ["admin", "super_admin"],
  },
];

const Sidebar = ({ user }: SidebarProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const location = useLocation();

  const toggleSubMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const initial = user?.name?.charAt(0).toUpperCase() || "A";

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b px-4 py-3 flex items-center justify-between z-30">
        <button onClick={() => setSidebarOpen(true)}>
          <Menu className="w-7 h-7" />
        </button>

        <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
          {initial}
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r shadow-sm
          transform transition-transform duration-300
          flex flex-col
          lg:translate-x-0 lg:static
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <Link
            to="/"
            className="font-display text-lg font-bold tracking-tight flex items-center gap-2"
          >
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-black">
                A
              </span>
            </div>

            AESTRA-TECH
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Links */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {sidebarItems
            .filter((item) =>
              item.roles.includes(user?.role || "")
            )
            .map((item) => {
              const Icon = item.icon;
              const isOpen = openMenus.includes(item.label);

              // MAIN LINKS
              if (!item.subLinks) {
                const isActive =
                  location.pathname === item.path;

                return (
                  <Link
                    key={item.label}
                    to={item.path!}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3
                      px-4 py-2 rounded-xl transition
                      hover:bg-primary/10
                      ${
                        isActive
                          ? "bg-primary text-white hover:bg-primary/75"
                          : "text-gray-700"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />

                    <span className="font-medium">
                      {item.label}
                    </span>
                  </Link>
                );
              }

              // FILTER SUBLINKS
              const allowedSubLinks = item.subLinks.filter(
                (sub) =>
                  sub.roles.includes(user?.role || "")
              );

              // HIDE ENTIRE SECTION IF NO SUBLINKS ALLOWED
              if (allowedSubLinks.length === 0) {
                return null;
              }

              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleSubMenu(item.label)}
                    className="
                      w-full flex items-center justify-between
                      px-4 py-2 rounded-xl transition
                      hover:bg-primary/10 text-gray-700
                    "
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />

                      <span className="font-medium">
                        {item.label}
                      </span>
                    </div>

                    {isOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  {/* Sublinks */}
                  {isOpen && (
                    <div className="ml-6 mt-2 space-y-1">
                      {allowedSubLinks.map((sub) => {
                        const SubIcon = sub.icon;

                        const isActive =
                          location.pathname === sub.path;

                        return (
                          <Link
                            key={sub.label}
                            to={sub.path}
                            onClick={() =>
                              setSidebarOpen(false)
                            }
                            className={`
                              flex items-center gap-3
                              px-4 py-2 rounded-lg text-sm transition
                              hover:bg-primary/10
                              ${
                                isActive
                                  ? "bg-primary text-white"
                                  : "text-gray-600"
                              }
                            `}
                          >
                            <SubIcon className="w-4 h-4" />

                            {sub.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* Bottom Settings */}
        <div className="border-t p-1">
          <Link
            to="/admin/settings"
            className="
              w-full flex items-center justify-between
              px-4 py-2 rounded-xl
              hover:bg-primary/10 transition
            "
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5" />

              <span className="font-medium">
                Settings
              </span>
            </div>

            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
              {initial}
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;