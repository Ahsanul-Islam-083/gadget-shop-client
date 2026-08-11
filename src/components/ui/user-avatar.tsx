"use client";

import { useState } from "react";

interface UserAvatarProps {
  image?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-xs",
  lg: "h-12 w-12 text-sm",
  xl: "h-20 w-20 text-2xl",
};

export function UserAvatar({
  image,
  name = "User",
  size = "md",
  className = "",
}: UserAvatarProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const sizeClass = SIZES[size] ?? SIZES.md;
  const initial = name ? name.trim().charAt(0).toUpperCase() : "U";

  const hasValidImage =
    typeof image === "string" &&
    image.trim().length > 0 &&
    image !== failedUrl;

  return (
    <div
      className={`relative flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-cyan-500/60 bg-slate-100 shadow-sm transition-transform dark:border-cyan-400/60 dark:bg-slate-800 ${sizeClass} ${className}`}
    >
      {hasValidImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={image}
          src={image}
          alt={name}
          onError={() => setFailedUrl(image)}
          className="h-full w-full object-cover"
          loading="eager"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="flex h-full w-full select-none items-center justify-center bg-gradient-to-br from-cyan-500 via-purple-600 to-amber-500 font-heading font-extrabold text-white shadow-inner">
          {initial}
        </span>
      )}
    </div>
  );
}
