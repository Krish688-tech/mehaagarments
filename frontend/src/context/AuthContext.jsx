import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("userInfo");

      if (storedUser) {
        setUserInfo(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to load user information:", error);
      localStorage.removeItem("userInfo");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (data) => {
    localStorage.setItem("userInfo", JSON.stringify(data));
    setUserInfo(data);
  };

  const updateUser = (updatedUser) => {
    setUserInfo((previous) => {
      if (!previous) {
        return previous;
      }

      const updatedUserInfo = {
        ...previous,
        user: {
          ...previous.user,
          ...updatedUser,
        },
      };

      localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));

      return updatedUserInfo;
    });
  };

  const logout = () => {
  // Remove authentication data
  localStorage.removeItem("userInfo");

  // Clear cart when user logs out
  localStorage.removeItem("cartItems");

  // Clear Buy Now product if one exists
  localStorage.removeItem("buyNowProduct");

  // Update Navbar cart badge immediately
  window.dispatchEvent(new Event("cartUpdated"));

  // Clear React authentication state
  setUserInfo(null);
};

  const value = {
    userInfo,
    user: userInfo?.user || null,
    token: userInfo?.token || null,
    isAuthenticated: !!userInfo?.token,
    loading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
