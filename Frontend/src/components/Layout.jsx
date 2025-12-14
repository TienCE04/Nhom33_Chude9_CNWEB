import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import PageTransition from "./PageTransition";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      {/* Phần nội dung chính sẽ hiển thị ở đây */}
      <main className="flex-1 w-full">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  );
};

export default Layout;