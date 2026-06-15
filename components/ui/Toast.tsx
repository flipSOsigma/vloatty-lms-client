import React, { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

interface ToastItemProps {
  id: string;
  message: string;
  type: "success" | "error";
  onRemove: (id: string) => void;
}

const toastStyles = `
@keyframes toast-slide-in {
  0% {
    transform: translateX(120%) scale(0.95);
    opacity: 0;
  }
  70% {
    transform: translateX(-8px) scale(1.01);
    opacity: 1;
  }
  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

@keyframes toast-slide-out {
  0% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateX(120%) scale(0.95);
    opacity: 0;
  }
}

@keyframes badge-pop {
  0% {
    transform: translateY(-50%) scale(0) rotate(-45deg);
    opacity: 0;
  }
  75% {
    transform: translateY(-50%) scale(1.25) rotate(10deg);
    opacity: 1;
  }
  100% {
    transform: translateY(-50%) scale(1) rotate(0);
    opacity: 1;
  }
}

.animate-toast-in {
  animation: toast-slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-toast-out {
  animation: toast-slide-out 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-badge-pop {
  animation: badge-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s forwards;
}
`;

export const ToastStyles: React.FC = () => {
  return <style dangerouslySetInnerHTML={{ __html: toastStyles }} />;
};

export const ToastItem: React.FC<ToastItemProps> = ({ id, message, type, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 3600);

    const removeTimer = setTimeout(() => {
      onRemove(id);
    }, 4000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [id, onRemove]);

  return (
    <div
      className={`relative pl-8 pr-6 py-3.5 bg-[#111214] border border-[#222326] rounded-[20px] shadow-[0_15px_35px_rgba(0,0,0,0.45)] flex items-center justify-between min-w-[320px] max-w-sm pointer-events-auto overflow-visible select-none transition-all duration-300 ${
        isExiting ? "animate-toast-out" : "animate-toast-in"
      }`}
    >
      {/* Overlapping Left Badge */}
      <div
        className={`absolute -left-4.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white border-2 border-[#111214] scale-0 animate-badge-pop ${
          type === "success"
            ? "bg-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.35)]"
            : "bg-[#f43f5e] shadow-[0_0_15px_rgba(244,63,94,0.35)]"
        }`}
      >
        {type === "success" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      </div>

      {/* Info Block */}
      <div className="flex flex-col gap-0.5 text-left pl-2.5">
        <span
          className={`text-[10px] font-extrabold uppercase tracking-wider leading-tight ${
            type === "success" ? "text-[#10b981]" : "text-[#f43f5e]"
          }`}
        >
          {type === "success" ? "Success" : "Error"}
        </span>
        <span className="text-[12px] text-zinc-300 font-semibold leading-snug">
          {message}
        </span>
      </div>

      {/* Close Button */}
      <button
        onClick={() => setIsExiting(true)}
        className="ml-4 p-1 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800/50 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
