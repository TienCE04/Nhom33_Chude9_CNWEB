import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper to handle axios errors
const handleApiError = (error, defaultMessage) => {
  if (error.response) {
    return {
      success: false,
      message: error.response.data.message || defaultMessage,
      ...error.response.data
    };
  } else if (error.request) {
    return {
      success: false,
      message: "Không có phản hồi từ máy chủ",
    };
  } else {
    return {
      success: false,
      message: error.message || "Lỗi kết nối",
    };
  }
};

// Auth API calls
export const authApi = {
  login: async (username, password) => {
    try {
      const response = await api.post("/login", { username, password });
      return response.data;
    } catch (error) {
      return handleApiError(error, "Đăng nhập thất bại");
    }
  },

  googleLogin: async (token) => {
    try {
      const response = await api.post("/auth/google-login", { token });
      return response.data;
    } catch (error) {
      return handleApiError(error, "Đăng nhập Google thất bại");
    }
  },

  signup: async (username, password, email, nickname) => {
    try {
      const response = await api.post("/signup", { username, password, email, nickname });
      return response.data;
    } catch (error) {
      return handleApiError(error, "Đăng ký thất bại");
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

  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await api.post("/change-password", { oldPassword, newPassword });
      return response.data;
    } catch (error) {
      return handleApiError(error, "Đổi mật khẩu thất bại");
    }
  },
};

export const roomApi = {
  getRooms: async () => {
    try {
      const response = await api.get("/rooms");
      return response.data;
    } catch (error) {
      const errorResult = handleApiError(error, "Không thể tải danh sách phòng");
      return { ...errorResult, rooms: [] };
    }
  },

  getRoomById: async (roomId) => {
    try {
      const response = await api.get(`/rooms/${roomId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Không thể lấy thông tin phòng");
    }
  },

  createRoom: async (roomData) => {
    try {
      const response = await api.post("/rooms", roomData);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Không thể tạo phòng");
    }
  },
};

export const topicApi = {
  getDefaultTopics: async () => {
    try {
      const response = await api.get("/topic/default");
      return response.data;
    } catch (error) {
      const errorResult = handleApiError(error, "Failed to fetch default topics");
      return { ...errorResult, data: [] };
    }
  },

  getUserTopics: async (username) => {
    try {
      const response = await api.get(`/topic/${username}`);
      return response.data;
    } catch (error) {
      const errorResult = handleApiError(error, "Failed to fetch user topics");
      return { ...errorResult, data: [] };
    }
  },

  createTopic: async (topicData) => {
    try {
      const response = await api.post("/create/topic", topicData);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to create topic");
    }
  },

  deleteTopic: async (topicId) => {
    try {
      const response = await api.delete(`/topic/${topicId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to delete topic");
    }
  },

  updateTopic: async (topicId, topicData) => {
    try {
      const response = await api.put(`/topic/${topicId}`, topicData);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to update topic");
    }
  },
};

export const playerApi = {
  getPlayer: async (username) => {
    try {
      const response = await api.get(`/player/${username}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch player data");
    }
  },
};

export default authApi;
