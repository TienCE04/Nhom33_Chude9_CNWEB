import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout"; // Import Layout mới tạo

import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import Results from "./pages/Results";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import RoomList from "./pages/RoomList";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Route Trang chủ (Login) có thể không cần Navbar hoặc cần Layout riêng */}
          <Route path="/" element={<Home />} />

          {/* Các trang có Navbar */}
          <Route element={<Layout />}>
            <Route path="/rooms" element={<RoomList />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/results" element={<Results />} />
          </Route>

          {/* Trang Game thường full màn hình nên để ngoài Layout Navbar */}
          <Route path="/game" element={<Game />} />

          {/* Trang 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;