import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

const GameButton = forwardRef(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const variants = {
      primary: "bg-primary text-primary-foreground hover:brightness-110",
      secondary: "bg-secondary text-secondary-foreground hover:brightness-110",
      success: "bg-success text-success-foreground hover:brightness-110",
      danger: "bg-danger text-danger-foreground hover:brightness-110",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "game-button",
          variants[variant],
          sizes[size],
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

GameButton.displayName = "GameButton";

export { GameButton };
