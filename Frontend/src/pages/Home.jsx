import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { 
  Palette, Play, Users, Trophy, Brush, MessageSquare, Zap, 
  ChevronLeft, ChevronRight, BookOpen
} from "lucide-react";
import { GameButton } from "@/components/GameButton";
import PageTransition from "@/components/PageTransition";

const Home = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
  }, []);

  // --- NỘI DUNG CÁC THẺ (SLIDES) ---
  const slides = [
    {
      id: "intro",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
          <div className="inline-flex items-center justify-center p-4 bg-card/50 backdrop-blur-md rounded-3xl shadow-xl border border-white/10">
            <Palette className="w-16 h-16 text-primary mr-4" />
            <h1 className="text-5xl md:text-7xl font-extrabold text-foreground tracking-tight drop-shadow-lg">
              Gartic
            </h1>
          </div>
          <p className="text-xl md:text-2xl font-bold max-w-xl leading-relaxed drop-shadow-md text-foreground">
            Vẽ, đoán và cười thả ga! <br />
            Kết nối bạn bè qua những nét vẽ nguệch ngoạc ngay hôm nay.
          </p>
          <div className="flex gap-4 pt-2">
             <GameButton variant="primary" size="lg" onClick={() => navigate("/login")}>
                <Play className="w-5 h-5 mr-2 fill-current" /> Chơi Ngay
             </GameButton>
             <GameButton variant="secondary" size="lg" onClick={() => navigate("/rooms")}>
                <Users className="w-5 h-5 mr-2" /> Xem Phòng
             </GameButton>
          </div>
        </div>
      ),
    },
    {
      id: "features",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-2 drop-shadow-md">
            <Zap className="w-8 h-8 text-yellow-400 fill-yellow-400" />
            Tại sao nên chơi?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {[
              { icon: <Brush className="w-8 h-8 text-primary" />, title: "Vẽ sáng tạo", desc: "Thỏa sức hội họa" },
              { icon: <MessageSquare className="w-8 h-8 text-success" />, title: "Đoán từ nhanh", desc: "Thử thách tốc độ" },
              { icon: <Trophy className="w-8 h-8 text-yellow-500" />, title: "Leo Rank", desc: "Tranh tài cao thấp" }
            ].map((item, idx) => (
              <div key={idx} className="bg-black/20 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="w-12 h-12 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-3">
                  {item.icon}
                </div>
                <h3 className="font-bold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-white/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "howto",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-2 drop-shadow-md">
            <BookOpen className="w-8 h-8 text-orange-400" />
            Cách chơi đơn giản
          </h2>
          <div className="flex flex-col md:flex-row gap-4 w-full justify-center items-stretch">
            {[
              { num: "01", title: "Vào phòng", desc: "Tạo hoặc tham gia" },
              { num: "02", title: "Vẽ & Đoán", desc: "Luân phiên trổ tài" },
              { num: "03", title: "Chiến thắng", desc: "Ghi điểm cao nhất" }
            ].map((step, idx) => (
              <div key={idx} className="relative group flex-1 bg-black/20 p-4 rounded-2xl border border-white/10 backdrop-blur-sm text-left">
                <div className="text-4xl font-black text-white/10 absolute top-2 right-4 group-hover:text-primary/20 transition-colors">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-white mt-4">{step.title}</h3>
                <p className="text-sm text-white/70">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    }
  ];

  // --- LOGIC ĐIỀU HƯỚNG ---
  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  // Hàm tính toán style cho từng thẻ dựa trên vị trí
  const getSlideStyle = (index) => {
    if (index === activeIndex) {
      // THẺ GIỮA: Rõ ràng, to nhất, nằm trên cùng
      return "opacity-100 scale-100 blur-0 z-20 translate-x-0 bg-white/10 border-white/20";
    } else if (
      index === activeIndex - 1 || 
      (activeIndex === 0 && index === slides.length - 1)
    ) {
      // THẺ TRÁI: Mờ, nhỏ hơn, nằm dưới, lệch trái
      return "opacity-40 scale-90 blur-[2px] z-10 -translate-x-[15%] md:-translate-x-[60%] bg-white/5 border-transparent cursor-pointer hover:opacity-60";
    } else {
      // THẺ PHẢI: Mờ, nhỏ hơn, nằm dưới, lệch phải
      return "opacity-40 scale-90 blur-[2px] z-10 translate-x-[15%] md:translate-x-[60%] bg-white/5 border-transparent cursor-pointer hover:opacity-60";
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
        {isLoggedIn && <Navbar onLogout={() => setIsLoggedIn(false)} />}

        {/* --- CAROUSEL SECTION (3 THẺ NGANG) --- */}
        <div className="relative flex-1 flex flex-col justify-center py-10 md:py-20 overflow-hidden">
          
          {/* Background Decor */}
          <div className="absolute inset-0 overflow-hidden -z-10 opacity-30 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/40 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/40 rounded-full blur-[100px] animate-pulse"></div>
          </div>

          <div className="relative w-full max-w-6xl mx-auto h-[500px] flex items-center justify-center perspective-1000">
            {slides.map((slide, index) => {
              const styleClass = getSlideStyle(index);
              const isCenter = index === activeIndex;
              
              return (
                <div
                  key={slide.id}
                  onClick={() => !isCenter && setActiveIndex(index)}
                  className={`
                    absolute top-0 w-[90%] md:w-[60%] h-full 
                    rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-md border 
                    transition-all duration-500 ease-in-out transform
                    flex items-center justify-center
                    ${styleClass}
                  `}
                >
                  {slide.content}
                </div>
              );
            })}
          </div>

          {/* --- NÚT ĐIỀU HƯỚNG (ARROWS) --- */}
          {/* Thay đổi: Dùng max-w-[85%] hoặc 7xl để đẩy 2 mũi tên ra xa thẻ giữa */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[95%] md:max-w-[85%] lg:max-w-7xl flex justify-between items-center pointer-events-none z-30">
            <button 
              onClick={handlePrev}
              className="pointer-events-auto w-24 h-24 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 shadow-lg group"
            >
              <ChevronLeft className="w-12 h-12 group-hover:-translate-x-1 transition-transform" />
            </button>
            
            <button 
              onClick={handleNext}
              className="pointer-events-auto w-24 h-24 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 shadow-lg group"
            >
              <ChevronRight className="w-12 h-12 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-3 mt-8 z-30">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-3 rounded-full transition-all duration-300 ${
                  activeIndex === idx ? "w-8 bg-primary" : "w-3 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* --- BOTTOM COMPONENT (SẴN SÀNG THỬ THÁCH) --- */}
        <section className="py-12 px-4 text-center z-20 relative">
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-3xl p-10 md:p-14 shadow-2xl border border-white/10 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-white drop-shadow-sm">
              Sẵn sàng để thử thách?
            </h2>
            <p className="text-lg text-gray-300 mb-8 font-medium">
              Tham gia cùng hàng nghìn người chơi khác và thể hiện tài năng của bạn.
            </p>
            
            <GameButton 
              variant="success" 
              size="lg" 
              onClick={() => navigate("/login")}
              className="min-w-[200px] text-xl py-6 h-auto shadow-xl shadow-success/20 hover:scale-105 inline-flex justify-center items-center"
            >
              Bắt đầu ngay
            </GameButton>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-6 text-center text-sm text-muted-foreground relative z-10">
          © 2025 Gartic Clone - Nhom33_Chude9_CNWEB. All rights reserved.
        </footer>
      </div>
    </PageTransition>
  );
};

export default Home;