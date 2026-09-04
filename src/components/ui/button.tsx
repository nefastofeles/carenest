import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md";
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "default", size = "md", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-colors disabled:opacity-50",
        size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm",
        variant === "default" && "bg-nest-magenta text-white hover:bg-nest-magentadark",
        variant === "secondary" && "bg-nest-peach/60 text-nest-ink hover:bg-nest-peach",
        variant === "outline" && "border border-nest-peach bg-white hover:bg-nest-cream",
        variant === "ghost" && "hover:bg-nest-peach/50",
        variant === "danger" && "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50",
        className
      )}
      {...props}
    />
  );
});
