"use client";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  textColor?: string;
  /** Logo image filter: "dark" (black, for light bg), "blue", "white" (no filter, for dark bg), "auto" (dark/white based on theme) */
  variant?: "dark" | "blue" | "white" | "auto";
}

export default function Logo({ size = "md", showText = true, className = "", textColor, variant = "auto" }: LogoProps) {
  /* logo.png is 3508x2480 (landscape ~1.41:1) — WHITE on transparent */
  const sizes = {
    sm: { h: 28, w: 40, text: "text-base", gap: "gap-2", css: "h-7" },
    md: { h: 36, w: 51, text: "text-xl", gap: "gap-2.5", css: "h-9" },
    lg: { h: 48, w: 68, text: "text-2xl", gap: "gap-3", css: "h-12" },
    xl: { h: 64, w: 90, text: "text-3xl", gap: "gap-3.5", css: "h-16" },
  };

  const s = sizes[size];
  
  // "auto" means dark logo on light bg, white logo on dark bg
  const filterClass = variant === "auto"
    ? "logo-dark dark:logo-white"
    : variant === "dark" ? "logo-dark" 
    : variant === "blue" ? "logo-blue" 
    : "logo-white";

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      <Image
        src="/logo.png"
        alt="Online Usta"
        width={s.w}
        height={s.h}
        className={`object-contain ${s.css} w-auto ${filterClass}`}
        priority
      />
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-extrabold ${s.text} ${textColor || "text-gray-900 dark:text-white"} tracking-tight`}>
            Online<span className="text-blue-600 dark:text-blue-400"> Usta</span>
          </span>
          {size !== "sm" && (
            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 tracking-widest uppercase mt-0.5">
              Ishonchli xizmat
            </span>
          )}
        </div>
      )}
    </div>
  );
}
