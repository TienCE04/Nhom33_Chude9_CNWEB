import { useToast } from "@/hooks/use-toast";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { useEffect } from "react";

export function Notification() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <NotificationItem
          key={toast.id}
          toast={toast}
          dismiss={dismiss}
        />
      ))}
    </div>
  );
}

function NotificationItem({ toast, dismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      dismiss(toast.id);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [toast.id, dismiss]);

  const isSuccess = toast.variant === "success";
  const isOpen = toast.open !== false;

  return (
    <div
      className={`
        pointer-events-auto
        flex items-center gap-3 p-4 rounded-lg shadow-lg border transition-all duration-300 transform
        ${
          isOpen
            ? "animate-in slide-in-from-right opacity-100 translate-x-0"
            : "opacity-0 translate-x-full"
        }
        ${
          isSuccess
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
        }
      `}
    >
      {isSuccess ? (
        <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
      )}
      <div className="flex-1 ml-2">
        {toast.title && <h3 className="font-bold text-md">{toast.title}</h3>}
        {toast.description && (
          <p className="text-sm opacity-90 mt-1">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => dismiss(toast.id)}
        className="opacity-70 hover:opacity-100 transition-opacity flex-shrink-0 cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
