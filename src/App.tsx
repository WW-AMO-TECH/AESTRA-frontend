import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
// import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminLogin from "./pages/Admin/AdminLogin";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import AdminOrders from "./pages/Admin/Orders";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "@/pages/PaymentSuccess";
import Dashboard from "./pages/Dashboard";
import Admins from "./pages/SuperAdmin/Admins";
import Users from "./pages/SuperAdmin/Users";
import PickupLocations from "./pages/Admin/PickupLocations";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import ProtectedRoute from "@/routes/ProtectedRoute";
import AdminRoute from "@/routes/AdminRoute";
import SuperAdminRoute from "@/routes/SuperAdminRoute";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminProducts from "./pages/Admin/Products";
import AdminRequest from "./pages/Admin/AdminRequest";
import Requests from "./pages/SuperAdmin/Requests";
import Countries from "./pages/SuperAdmin/Countries";
import States from "./pages/SuperAdmin/States";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />

            {/* REGISTERED USERS ROUTES */}
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />


            {/* ADMIN ROUTES */}
            <Route path="/admin/signup" element={<AdminRequest />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>}/>
            <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>}/>
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>}/>

            {/* SUPER-ADMIN ROUTES */}
            {/* ADMIN ACCESS */}
            <Route path="/superadmin/admins" element={<SuperAdminRoute><Admins /></SuperAdminRoute>}/>
            <Route path="/superadmin/customers" element={<SuperAdminRoute><Users /></SuperAdminRoute>}/>
            <Route path="/superadmin/admin-requests" element={<SuperAdminRoute><Requests /></SuperAdminRoute>}/>
            {/* PICKUP LOCATIONS */}
            <Route path="/superadmin/countries" element={<SuperAdminRoute><Countries /></SuperAdminRoute>}/>
            <Route path="/superadmin/states" element={<SuperAdminRoute><States /></SuperAdminRoute>}/>
            <Route path="/superadmin/pickup-locations" element={<SuperAdminRoute><PickupLocations /></SuperAdminRoute>}/>
            {/* <Route path="/superadmin/admins" element={<SuperAdminRoute><Admins /></SuperAdminRoute>}/> */}
            {/* <Route path="/superadmin/admins" element={<SuperAdminRoute><Admins /></SuperAdminRoute>}/> */}


            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
  </QueryClientProvider>
);

export default App;