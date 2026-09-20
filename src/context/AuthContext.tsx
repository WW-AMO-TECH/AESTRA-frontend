import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { toast } from "sonner";
import api from "@/api/axios";

export interface User {
  id: number;
  name: string;
  store_name?: string;
  email: string;
  phone?: string;
  address?: string;
  business_address?: string;
  contact_information?: string;
  avatar?: string;
  role: "user" | "seller" | "super_admin";
  status?: "active" | "pending" | "rejected";
  verification_status?: "unverified" | "pending" | "verified" | "rejected";
}

interface SellerSignupForm {
  name: string;
  store_name: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  business_address: string;
  contact_information: string;
}

interface AuthContextType {
  user: User | null;
  setAuthUser: (token: string, user: User) => void;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<boolean>;
  signup: (
    name: string,
    email: string,
    phone: string,
    password: string
  ) => Promise<boolean>;
  sellerLogin: (
    email: string,
    password: string
  ) => Promise<User>;
  sellerSignup: (
    form: SellerSignupForm
  ) => Promise<boolean>;
  superAdminLogin: (
    email: string,
    password: string
  ) => Promise<User>;
  superAdminSignup: (
    name: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  googleLogin: (type: "user" | "seller") => void;
  cart: any[];
  addToCart: (
    product: any,
    options?: any
  ) => Promise<void>;
  fetchCart: () => Promise<void>;
  removeFromCart: (
    cartId: number
  ) => Promise<void>;
  updateQuantity: (
    cartId: number,
    quantity: number
  ) => Promise<void>;
  clearCart: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return ctx;
};

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
    Accept: "application/json",
  },
});

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any[]>([]);

  const setAuthUser = (
    token: string,
    authenticatedUser: User
  ) => {
    localStorage.setItem("token", token);
    localStorage.setItem(
      "user",
      JSON.stringify(authenticatedUser)
    );
    setUser(authenticatedUser);
  };

  // RESTORE AUTHENTICATION
  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const token = getToken();

      if (!token) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }

        return;
      }

      try {
        const savedUser = localStorage.getItem("user");

        let storedUser: User | null = null;

        if (savedUser) {
          try {
            storedUser = JSON.parse(savedUser);
          } catch {
            localStorage.removeItem("user");
          }
        }

        const endpoint =
          storedUser?.role === "super_admin"
            ? "/superadmin/me"
            : storedUser?.role === "seller"
            ? "/seller/me"
            : "/user/me";

        const response = await api.get(
          endpoint,
          authHeaders()
        );

        const currentUser =
          response.data?.user || response.data;

        if (!currentUser?.id || !currentUser?.role) {
          throw new Error(
            "Invalid authentication response."
          );
        }

        if (!mounted) return;

        setUser(currentUser);

        localStorage.setItem(
          "user",
          JSON.stringify(currentUser)
        );
      } catch (error: any) {
        const status = error?.response?.status;

        console.error(
          "Authentication restore failed:",
          error
        );

        if (
          status === 401 ||
          status === 403
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          if (mounted) {
            setUser(null);
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  // GOOGLE AUTH
  const googleLogin = (
    type: "user" | "seller"
  ) => {
    window.location.href = `${
      import.meta.env.VITE_BACKEND_URL
    }/auth/google/${type}`;
  };

  // CUSTOMER LOGIN
  const login = async (
    email: string,
    password: string
  ) => {
    const res = await api.post(
      "/login",
      {
        email,
        password,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    setAuthUser(
      res.data.token,
      res.data.user
    );

    toast.success("Login successful");

    return true;
  };

  // CUSTOMER SIGNUP
  const signup = async (
    name: string,
    email: string,
    phone: string,
    password: string
  ) => {
    const res = await api.post(
      "/signup",
      {
        name,
        email,
        phone,
        password,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    setAuthUser(
      res.data.token,
      res.data.user
    );

    toast.success("Account created");

    return true;
  };

  // SELLER SIGNUP
  const sellerSignup = async (
    form: SellerSignupForm
  ) => {
    const res = await api.post(
      "/seller/signup",
      form,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    toast.success(
      "Seller request submitted successfully"
    );

    return !!res.data;
  };

  // SELLER LOGIN
  const sellerLogin = async (
    email: string,
    password: string
  ) => {
    const res = await api.post(
      "/seller/login",
      {
        email,
        password,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    setAuthUser(
      res.data.token,
      res.data.user
    );

    toast.success(
      "Seller login successful"
    );

    return res.data.user;
  };

  // SUPER ADMIN LOGIN
  const superAdminLogin = async (
    email: string,
    password: string
  ) => {
    const res = await api.post(
      "/superadmin/login",
      {
        email,
        password,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    setAuthUser(
      res.data.token,
      res.data.user
    );

    toast.success(
      "Super Admin login successful"
    );

    return res.data.user;
  };

  // SUPER ADMIN SIGNUP
  const superAdminSignup = async (
    name: string,
    email: string,
    password: string
  ) => {
    const res = await api.post(
      "/superadmin/signup",
      {
        name,
        email,
        password,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    toast.success(
      "Super Admin created successfully"
    );

    return !!res.data;
  };

  // FETCH CART
  const fetchCart = async () => {
    if (
      !getToken() ||
      user?.role !== "user"
    ) {
      return;
    }

    try {
      const res = await api.get(
        "/cart",
        authHeaders()
      );

      setCart(
        Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to fetch cart:",
        error
      );

      setCart([]);
    }
  };

  // ADD TO CART
  const addToCart = async (
    product: any,
    options?: any
  ) => {
    await api.post(
      "/cart",
      {
        product_id: product.id,
        quantity: 1,
        options,
      },
      authHeaders()
    );

    await fetchCart();
  };

  // UPDATE CART QUANTITY
  const updateQuantity = async (
    cartId: number,
    quantity: number
  ) => {
    if (quantity < 1) return;

    await api.put(
      `/cart/${cartId}`,
      {
        quantity,
      },
      authHeaders()
    );

    await fetchCart();
  };

  // REMOVE FROM CART
  const removeFromCart = async (
    cartId: number
  ) => {
    await api.delete(
      `/cart/${cartId}`,
      authHeaders()
    );

    await fetchCart();

    toast.success(
      "Removed from cart"
    );
  };

  // CLEAR CART
  const clearCart = async () => {
    try {
      if (
        getToken() &&
        user?.role === "user"
      ) {
        await api.delete(
          "/cart/clear",
          authHeaders()
        );
      }
    } catch (error) {
      console.error(
        "Failed to clear server cart:",
        error
      );
    } finally {
      setCart([]);
      localStorage.removeItem("cart");
    }
  };

  // CART AUTO LOAD
  useEffect(() => {
    if (user?.role === "user") {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [user]);

  // CART LOCAL STORAGE SYNC
  useEffect(() => {
    localStorage.setItem(
      "cart",
      JSON.stringify(cart)
    );
  }, [cart]);

  // LOGOUT
  const logout = async () => {
    const role = user?.role;

    try {
      if (getToken()) {
        const endpoint =
          role === "super_admin"
            ? "/superadmin/logout"
            : role === "seller"
            ? "/seller/logout"
            : "/user/logout";

        await api.post(
          endpoint,
          {},
          authHeaders()
        );
      }
    } catch (error) {
      console.warn(
        "Logout request failed:",
        error
      );
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("cart");

      setUser(null);
      setCart([]);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        sellerLogin,
        sellerSignup,
        superAdminLogin,
        superAdminSignup,
        googleLogin,
        setAuthUser,
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