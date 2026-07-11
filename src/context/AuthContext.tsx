import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";
import api from "@/api/axios";
import axios from "axios";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "admin" | "super_admin";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;

  login: (email: string, password: string) => Promise<boolean>;
  signup: (
    name: string,
    email: string,
    phone: string,
    password: string
  ) => Promise<boolean>;

  adminLogin: (email: string, password: string) => Promise<User>;
  adminSignup: (
    name: string,
    email: string,
    phone: string,
    password: string,
    role: "admin" | "super_admin"
  ) => Promise<boolean>;

  cart: any[];
  addToCart: (product: any, options?: any) => Promise<void>;
  fetchCart: () => Promise<void>;
  removeFromCart: (cartId: number) => Promise<void>;
  updateQuantity: (cartId: number, quantity: number) => Promise<void>;
  clearCart: () => void;

  logout: () => Promise<void>;
}

/*
|--------------------------------------------------------------------------
| CONTEXT
|--------------------------------------------------------------------------
*/
const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

/*
|--------------------------------------------------------------------------
| AXIOS HELPERS (CRITICAL FIX)
|--------------------------------------------------------------------------
*/
const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
    Accept: "application/json",
  },
});

/*
|--------------------------------------------------------------------------
| PROVIDER
|--------------------------------------------------------------------------
*/
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any[]>([]);
  const [initialized, setInitialized] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | AUTO AUTH RESTORE (FIXED)
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    const token = getToken();
    const savedUser = localStorage.getItem("user");

    if (!token) {
      setLoading(false);
      setInitialized(true);
      return;
    }

    const loadUser = async () => {
      try {
        const res = await api.get("/user/me", authHeaders());

        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch (err: any) {
        if (err?.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    loadUser();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | AUTH: LOGIN
  |--------------------------------------------------------------------------
  */
  const login = async (email: string, password: string) => {
    const res = await api.post(
      "/login",
      { email, password },
      { headers: { Accept: "application/json" } }
    );

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    setUser(res.data.user);

    toast.success("Login successful");
    return true;
  };

  /*
  |--------------------------------------------------------------------------
  | AUTH: SIGNUP
  |--------------------------------------------------------------------------
  */
  const signup = async (
    name: string,
    email: string,
    phone: string,
    password: string
  ) => {
    const res = await api.post(
      "/signup",
      { name, email, phone, password },
      { headers: { Accept: "application/json" } }
    );

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    setUser(res.data.user);

    toast.success("Account created");
    return true;
  };

  /*
  |--------------------------------------------------------------------------
  | ADMIN LOGIN
  |--------------------------------------------------------------------------
  */
  const adminLogin = async (email: string, password: string) => {
    const res = await api.post(
      "/admin/login",
      { email, password },
      { headers: { Accept: "application/json" } }
    );

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    setUser(res.data.user);

    toast.success("Admin login successful");
    return res.data.user;
  };

  /*
  |--------------------------------------------------------------------------
  | ADMIN SIGNUP
  |--------------------------------------------------------------------------
  */
  const adminSignup = async (
    name: string,
    email: string,
    phone: string,
    password: string,
    role: "admin" | "super_admin"
  ) => {
    await api.post(
      "/admin/signup-request",
      { name, email, phone, password, role },
      { headers: { Accept: "application/json" } }
    );

    toast.success("Request sent");
    return true;
  };

  /*
  |--------------------------------------------------------------------------
  | CART (FIXED + CONSISTENT)
  |--------------------------------------------------------------------------
  */
  const fetchCart = async () => {
    const res = await api.get("/cart", authHeaders());
    setCart(res.data);
  };

  const addToCart = async (product: any, options?: any) => {
    const res = await api.post(
      "/cart",
      {
        product_id: product.id,
        quantity: 1,
        ...options,
      },
      authHeaders()
    );

    setCart(res.data.cart);
    toast.success("Added to cart");
  };

  const updateQuantity = async (cartId: number, quantity: number) => {
    if (quantity < 1) return;

    await api.put(
      `/cart/${cartId}`,
      { quantity },
      authHeaders()
    );

    fetchCart();
  };

  const removeFromCart = async (cartId: number) => {
    await api.delete(`/cart/${cartId}`, authHeaders());

    fetchCart();
    toast.success("Removed from cart");
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  /*
  |--------------------------------------------------------------------------
  | CART AUTO LOAD
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    if (getToken()) fetchCart();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | SYNC CART STORAGE
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */
  const logout = async () => {
    try {
      await api.post("/user/logout", {}, authHeaders());
    } catch {}

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setCart([]);
  };

  /*
  |--------------------------------------------------------------------------
  | PROVIDER
  |--------------------------------------------------------------------------
  */
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        adminLogin,
        adminSignup,
        cart,
        addToCart,
        fetchCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};