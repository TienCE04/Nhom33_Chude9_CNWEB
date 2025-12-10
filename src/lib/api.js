const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

// Auth API calls
export const authApi = {
  login: async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Đăng nhập thất bại",
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message: error.message || "Lỗi kết nối",
      };
    }
  },

  googleLogin: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Đăng nhập Google thất bại",
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message: error.message || "Lỗi kết nối",
      };
    }
  },

  signup: async (username, password, email, nickname) => {
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, email, nickname }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Đăng ký thất bại",
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message: error.message || "Lỗi kết nối",
      };
    }
  },

  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
  },

  getToken: () => {
    return localStorage.getItem("authToken");
  },

  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("authToken");
  },

  getGoogleClientId: () => {
    return GOOGLE_CLIENT_ID;
  },
};

export const roomApi = {
  getRooms: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add Authorization header if needed, though listRooms seems public based on router
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Không thể tải danh sách phòng",
          rooms: [],
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message: error.message || "Lỗi kết nối",
        rooms: [],
      };
    }
  },

  createRoom: async (roomData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roomData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Không thể tạo phòng",
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message: error.message || "Lỗi kết nối",
      };
    }
  },
};

export const topicApi = {
  getDefaultTopics: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/topic/default`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Failed to fetch default topics",
          data: [],
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message: error.message || "Connection error",
        data: [],
      };
    }
  },

  getUserTopics: async (username) => {
    try {
      const response = await fetch(`${API_BASE_URL}/topic/${username}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Failed to fetch user topics",
          data: [],
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message: error.message || "Connection error",
        data: [],
      };
    }
  },
};

export default authApi;
