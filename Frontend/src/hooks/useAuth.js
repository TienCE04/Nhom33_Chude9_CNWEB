import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/lib/api";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Load user info từ localStorage khi component mount
    const savedToken = authApi.getToken();
    const savedUser = authApi.getUser();

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    }

    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const result = await authApi.login(username, password);

      if (result.success) {
        setToken(result.token);
        setUser(result.user);
        localStorage.setItem("authToken", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        return { success: true, message: "Login successful" };
      }

      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (username, password, email, nickname) => {
    setIsLoading(true);
    try {
      const result = await authApi.signup(username, password, email, nickname);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    authApi.logout();
    navigate("/login");
  };

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!token,
    login,
    signup,
    logout,
  };
};

export default useAuth;
