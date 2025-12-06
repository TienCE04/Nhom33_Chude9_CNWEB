import { GameButton } from "@/components/GameButton";
import { Ban, Check } from "lucide-react";
import { createPortal } from "react-dom";

/**
 * Component pop-up hiển thị luật chơi.
 */
export const PlayRulePopup = ({ topic, onConfirm }) => {
  return createPortal(
    // Lớp phủ (Overlay)
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in">
      
      {/* Thẻ Modal */}
      <div className="game-card w-full max-w-md text-center p-6 relative animate-scale-in">
        
        {/* Tiêu đề */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground font-bold text-2xl px-8 py-2 rounded-full shadow-lg border-4 border-white">
          LUẬT CHƠI
        </div>

        {/* Nội dung */}
        <div className="mt-10 mb-6">
          
          {/* Thông tin game */}
          <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
            <div>
              <h4 className="font-bold text-muted-foreground uppercase">Chủ đề</h4>
              <p className="font-semibold text-lg text-primary">{topic}</p>
            </div>
            <div>
              <h4 className="font-bold text-muted-foreground uppercase">Mục tiêu</h4>
              <p className="font-semibold text-lg">120 các điểm</p>
            </div>
            <div>
              <h4 className="font-bold text-muted-foreground uppercase">Ngôn ngữ</h4>
              <p className="font-semibold text-lg">Tiếng Việt</p>
            </div>
          </div>

          {/* Icon cấm */}
          <div className="my-6 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full bg-yellow-400 flex items-center justify-center border-8 border-yellow-500 relative">
              <Ban className="w-24 h-24 text-white opacity-90" strokeWidth={1.5} />
              {/* Các ký tự mô phỏng như trong ảnh */}
              <div className="absolute top-5 left-6 text-3xl font-bold text-white opacity-80 rotate-[-15deg]">A</div>
              <div className="absolute top-5 right-6 text-3xl font-bold text-white opacity-80 rotate-[15deg]">&</div>
              <div className="absolute bottom-5 left-6 text-3xl font-bold text-white opacity-80 rotate-[-10deg]">#</div>
              <div className="absolute bottom-5 right-6 text-3xl font-bold text-white opacity-80 rotate-[10deg]">7</div>
            </div>
          </div>
          
          {/* Văn bản luật chơi */}
          <p className="text-lg font-semibold text-foreground px-4">
            Không vẽ chữ cái, số, và kí hiệu, ok?
          </p>
        </div>

        {/* Nút xác nhận */}
        <GameButton
          variant="success"
          size="lg"
          onClick={onConfirm}
          className="w-full sm:w-auto mx-auto"
        >
          <Check className="w-5 h-5 mr-2" />
          XÁC NHẬN
        </GameButton>
      </div>
    </div>,
    document.body
  );
};