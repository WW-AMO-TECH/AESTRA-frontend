import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SellerSignup from "./pages/Seller/SellerSignup";
import SellerLogin from "./pages/Seller/SellerLogin";
import SuperAdminSignup from "./pages/SuperAdmin/SuperAdminSignup";
import SuperAdminLogin from "./pages/SuperAdmin/SuperAdminLogin";
import GoogleAuthSuccess from "./pages/GoogleAuthSuccess";

import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import AdminOrders from "./pages/Seller/Orders";
import Checkout from "./pages/Checkout";
import PaymentFailed from "@/pages/PaymentFailed";
import PaymentSuccess from "@/pages/PaymentSuccess";
import Dashboard from "./pages/Dashboard";
import Sellers from "./pages/SuperAdmin/Sellers";
import Customers from "./pages/SuperAdmin/Customers";
import PickupLocations from "./pages/Seller/PickupLocations";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Catalog from "./pages/SuperAdmin/Catalog";
import ProtectedRoute from "@/routes/ProtectedRoute";
import SellerRoute from "@/routes/SellerRoute";
import SuperAdminRoute from "@/routes/SuperAdminRoute";
import SellerDashboard from "./pages/Seller/SellerDashboard";

import SellerProductsPage from "./pages/Seller/Products";
import SuperAdminProducts from "./pages/SuperAdmin/Products";

import SellerSignupRequests from "./pages/SuperAdmin/SellerSignupRequests";
import Analytics from "./pages/SuperAdmin/Analytics";
import Reviews from "./pages/Seller/Reviews";
import SuperAdminDashboard from "./pages/SuperAdmin/SuperAdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/contact" element={<Contact />} />
              
              <Route path="/seller/signup" element={<SellerSignup />} />
              <Route path="/seller/login" element={<SellerLogin />} />
              <Route path="/superadmin/signup" element={<SuperAdminSignup />} />
              <Route path="/superadmin/login" element={<SuperAdminLogin />} />
              <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />

              {/* REGISTERED USERS ROUTES */}
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
              <Route path="/payment-failed" element={<ProtectedRoute><PaymentFailed /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />


              {/* SELLER ROUTES */}
              <Route path="/seller/dashboard" element={<SellerRoute><SellerDashboard /></SellerRoute>}/>
              <Route path="/seller/products" element={<SellerRoute><SellerProductsPage /></SellerRoute>}/>
              <Route path="/seller/reviews" element={<SellerRoute><Reviews /></SellerRoute>}/>

              {/* SUPER-ADMIN ROUTES */}
              {/* ADMIN ACCESS */}
              <Route path="/superadmin/dashboard" element={<SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>}/>
              <Route path="/superadmin/orders" element={<SuperAdminRoute><AdminOrders /></SuperAdminRoute>}/>
              <Route path="/superadmin/catalog" element={<SuperAdminRoute><Catalog /></SuperAdminRoute>}/>
              <Route path="/superadmin/products" element={<SuperAdminRoute><SuperAdminProducts /></SuperAdminRoute>}/>
              <Route path="/superadmin/sellers" element={<SuperAdminRoute><Sellers /></SuperAdminRoute>}/>
              <Route path="/superadmin/customers" element={<SuperAdminRoute><Customers /></SuperAdminRoute>}/>
              <Route path="/superadmin/seller-requests" element={<SuperAdminRoute><SellerSignupRequests /></SuperAdminRoute>}/>
              {/* PICKUP LOCATIONS */}
              <Route path="/superadmin/pickup-locations" element={<SuperAdminRoute><PickupLocations /></SuperAdminRoute>}/>

              <Route path="/superadmin/analytics" element={<SuperAdminRoute><Analytics /></SuperAdminRoute>}/>

              {/* <Route path="/superadmin/admins" element={<SuperAdminRoute><Admins /></SuperAdminRoute>}/> */}
              {/* <Route path="/superadmin/admins" element={<SuperAdminRoute><Admins /></SuperAdminRoute>}/> */}


              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
  </QueryClientProvider>
);

export default App;