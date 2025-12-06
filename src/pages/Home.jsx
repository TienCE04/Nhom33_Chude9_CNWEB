import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { 
  Palette, 
  Play, 
  Users, 
  Trophy, 
  Brush, 
  MessageSquare, 
  Zap,
  ArrowRight,
  BookOpen
} from "lucide-react";
import { GameButton } from "@/components/GameButton";
import PageTransition from "@/components/PageTransition";

const Home = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const features = [
    {
      icon: <Brush className="w-8 h-8 text-primary" />,
      title: "Vẽ hình sáng tạo",
      desc: "Thể hiện khả năng hội họa của bạn qua các từ khóa thú vị và hài hước."
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-success" />,
      title: "Đoán từ nhanh tay",
      desc: "Thử thách tư duy và tốc độ gõ phím để đoán đúng từ khóa trước người khác."
    },
    {
      icon: <Trophy className="w-8 h-8 text-yellow-500" />,
      title: "Leo bảng xếp hạng",
      desc: "Tích lũy điểm số qua các ván đấu để trở thành họa sĩ tài ba nhất."
    }
  ];

  const steps = [
    { number: "01", title: "Tạo hoặc Vào phòng", desc: "Tự tạo phòng chơi riêng hoặc tham gia phòng có sẵn." },
    { number: "02", title: "Vẽ và Đoán", desc: "Một người vẽ, những người còn lại đoán. Đơn giản vậy thôi!" },
    { number: "03", title: "Giành chiến thắng", desc: "Người có điểm số cao nhất sau các vòng chơi sẽ thắng cuộc." }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        {isLoggedIn && <Navbar onLogout={() => setIsLoggedIn(false)} />}
        {/* --- HERO SECTION --- */}
        <section className="relative overflow-hidden py-20 px-4 md:px-8 lg:py-32">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-secondary/30 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center justify-center p-3 bg-card rounded-2xl shadow-md mb-4">
            <Palette className="w-12 h-12 text-primary mr-3" />
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight">
              Gartic
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-muted-foreground font-semibold max-w-2xl mx-auto leading-relaxed">
            Nơi những nét vẽ nguệch ngoạc trở thành những tràng cười sảng khoái! 
            <br className="hidden md:block" />
            Vẽ, đoán và kết nối cùng bạn bè ngay hôm nay.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <GameButton 
              variant="primary" 
              size="lg" 
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto min-w-[200px] text-lg shadow-lg shadow-primary/20"
            >
              <Play className="w-6 h-6 mr-2 fill-current" />
              Chơi Ngay
            </GameButton>
            <GameButton 
              variant="secondary" 
              size="lg" 
              onClick={() => navigate("/rooms")}
              className="w-full sm:w-auto min-w-[200px] text-lg shadow-lg shadow-secondary/20"
            >
              <Users className="w-6 h-6 mr-2" />
              Xem Phòng
            </GameButton>
            <GameButton 
              variant="secondary" 
              size="lg" 
              onClick={() => scrollToSection("how-to-play")}
              className="w-full sm:w-auto min-w-[200px] text-lg bg-orange-500 hover:bg-orange-600 text-white border-none shadow-lg shadow-orange-500/20"
            >
              <BookOpen className="w-6 h-6 mr-2" />
              Luật chơi
            </GameButton>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-16 px-4 bg-muted/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 flex items-center justify-center gap-2">
            <Zap className="w-8 h-8 text-secondary" />
            Tại sao nên chơi?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="game-card hover:-translate-y-2 transition-transform duration-300 h-full flex flex-col items-center text-center p-6"
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- HOW TO PLAY SECTION --- */}
      <section id="how-to-play" className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Cách chơi đơn giản</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, idx) => (
              <div key={idx} className="relative group">
                <div className="game-card bg-card border-2 border-border h-full p-6 relative z-10">
                  {/* THAY ĐỔI Ở ĐÂY: text-primary/10 -> text-blue-500 */}
                  <div className="text-6xl font-black text-blue-500 absolute top-2 right-4 opacity-80">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold mb-2 mt-8 group-hover:text-primary transition-colors relative z-20">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm relative z-20">
                    {step.desc}
                  </p>
                </div>
                {/* Arrow connector for desktop */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 z-20 text-muted-foreground transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA FOOTER --- */}
      <section className="py-20 px-4 text-center mt-auto">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl p-10 md:p-16 shadow-lg border-4 border-white">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
            Sẵn sàng để thử thách?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 font-medium">
            Tham gia cùng hàng nghìn người chơi khác và thể hiện tài năng của bạn.
          </p>
          
          <GameButton 
            variant="success" 
            size="lg" 
            onClick={() => navigate("/login")}
            className="min-w-[240px] text-xl py-4 h-auto shadow-lg shadow-success/20 hover:scale-105 inline-flex justify-center items-center"
          >
            Bắt đầu ngay
          </GameButton>
          
        </div>
      </section>

      {/* Simple Footer Text */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © 2025 Gartic Clone - Nhom33_Chude9_CNWEB. All rights reserved.
      </footer>
      </div>
    </PageTransition>
  );
};

export default Home;