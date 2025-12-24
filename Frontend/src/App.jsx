import { useEffect } from "react"; // 1. Import useEffect
import { Notification } from "@/components/Notification";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";

import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import Results from "./pages/Results";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import RoomList from "./pages/RoomList";
import NotFound from "./pages/NotFound";
import CreateRoom from "./pages/CreateRoom";
import CreateTheme from "./pages/CreateTheme";
import Topics from "./pages/Topics";
import Rank from "./pages/Rank";
import Login from "./pages/Login";
import Register from "./pages/Register";

const queryClient = new QueryClient();

const App = () => {
  // Thiết lập theme khi ứng dụng khởi động
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Notification />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<Layout />}>
              <Route path="/rooms" element={<ProtectedRoute element={<RoomList />} />} />
              <Route path="/rank" element={<ProtectedRoute element={<Rank />} />} />
              <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
              <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />
              <Route path="/results/:roomId" element={<ProtectedRoute element={<Results />} />} />
              <Route path="/create/room" element={<ProtectedRoute element={<CreateRoom />} />} />
              <Route path="/create/theme" element={<ProtectedRoute element={<CreateTheme />} />} />
              <Route path="/topics" element={<ProtectedRoute element={<Topics />} />} />
            </Route>

            <Route path="/lobby/:roomId" element={<ProtectedRoute element={<Lobby />} />} />
            <Route path="/game" element={<ProtectedRoute element={<Game />} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;