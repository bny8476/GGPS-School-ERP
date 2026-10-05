"use client";

import React, { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import { User, ImageIcon, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveImageUrl, getInitials } from "@/lib/imageUtils";

export type FallbackType = "avatar" | "initials" | "image" | "school";

export interface AppImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
  src?: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  fallbackSrc?: string;
  fallbackType?: FallbackType;
  initials?: string;
  name?: string;
  containerClassName?: string;
  showSkeleton?: boolean;
  unoptimized?: boolean;
}

export const AppImage: React.FC<AppImageProps> = ({
  src,
  alt,
  fill,
  width,
  height,
  priority = false,
  quality,
  sizes,
  fallbackSrc,
  fallbackType = "image",
  initials,
  name,
  className,
  containerClassName,
  showSkeleton = true,
  unoptimized,
  onLoad,
  onError,
  style,
  ...rest
}) => {
  const resolvedPrimarySrc = resolveImageUrl(src);
  const [currentSrc, setCurrentSrc] = useState<string | null>(resolvedPrimarySrc);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(!resolvedPrimarySrc);
  const [triedFallbackSrc, setTriedFallbackSrc] = useState<boolean>(false);

  // Keep currentSrc in sync when src prop changes
  useEffect(() => {
    const nextResolved = resolveImageUrl(src);
    setCurrentSrc(nextResolved);
    setIsLoading(true);
    setHasError(!nextResolved);
    setTriedFallbackSrc(false);
  }, [src]);

  const handleLoadingComplete = (e?: any) => {
    setIsLoading(false);
    if (onLoad) onLoad(e);
  };

  const handleImageError = (e?: any) => {
    // If we have a fallbackSrc and haven't tried it yet, attempt loading fallbackSrc
    if (fallbackSrc && !triedFallbackSrc) {
      const resolvedFallback = resolveImageUrl(fallbackSrc);
      if (resolvedFallback && resolvedFallback !== currentSrc) {
        setTriedFallbackSrc(true);
        setCurrentSrc(resolvedFallback);
        setIsLoading(true);
        return;
      }
    }

    setIsLoading(false);
    setHasError(true);
    if (onError) onError(e);
  };

  // If there's an error or no valid URL, render the clean fallback UI
  if (hasError || !currentSrc) {
    const computedInitials = initials || (name ? getInitials(name) : (alt ? getInitials(alt) : ""));

    if (fallbackType === "avatar" || fallbackType === "initials") {
      return (
        <div
          role="img"
          aria-label={alt}
          className={cn(
            "flex items-center justify-center font-extrabold select-none text-white bg-gradient-to-tr from-[#0050CB] via-[#0060E5] to-[#2563EB] shadow-xs shrink-0 overflow-hidden",
            fill ? "w-full h-full" : "",
            className,
            containerClassName
          )}
          style={{ ...style, colorScheme: "light" }}
        >
          {computedInitials ? (
            <span className="text-xs uppercase tracking-wider">{computedInitials}</span>
          ) : (
            <User className="w-1/2 h-1/2 text-white/90" />
          )}
        </div>
      );
    }

    if (fallbackType === "school") {
      return (
        <div
          role="img"
          aria-label={alt}
          className={cn(
            "flex items-center justify-center bg-[#E5EEFF] dark:bg-[#001844] text-[#0050CB] dark:text-[#38BDF8] border border-blue-200/60 dark:border-blue-800/50 shadow-xs shrink-0 overflow-hidden",
            fill ? "w-full h-full" : "",
            className,
            containerClassName
          )}
          style={{ ...style, colorScheme: "light" }}
        >
          <GraduationCap className="w-1/2 h-1/2 stroke-[2.2]" />
        </div>
      );
    }

    // Default "image" placeholder
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex items-center justify-center bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-slate-400 dark:text-slate-500 overflow-hidden shrink-0",
          fill ? "w-full h-full" : "",
          className,
          containerClassName
        )}
        style={{ ...style, colorScheme: "light" }}
      >
        <ImageIcon className="w-1/3 h-1/3 stroke-[1.8]" />
      </div>
    );
  }

  // Render using Next.js Image if fill is specified or both width and height are provided
  const useNextImage = Boolean(fill || (width && height));

  const imageStyles: React.CSSProperties = {
    colorScheme: "light",
    ...style,
  };

  if (useNextImage) {
    const nextImageProps: ImageProps = {
      src: currentSrc,
      alt,
      priority,
      quality,
      sizes: sizes || (fill ? "100vw" : undefined),
      unoptimized: unoptimized ?? (currentSrc.startsWith("data:") || currentSrc.startsWith("blob:") || currentSrc.endsWith(".svg")),
      onLoad: handleLoadingComplete,
      onError: handleImageError,
      className: cn(
        "transition-opacity duration-300",
        isLoading && showSkeleton ? "opacity-0" : "opacity-100",
        className
      ),
      style: imageStyles,
      ...(fill ? { fill: true } : { width: width!, height: height! }),
    };

    if (fill) {
      return (
        <div className={cn("relative w-full h-full overflow-hidden", containerClassName)}>
          {isLoading && showSkeleton && (
            <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800/80 animate-pulse pointer-events-none rounded-[inherit]" />
          )}
          <Image {...nextImageProps} />
        </div>
      );
    }

    const isWFull = className?.includes("w-full");
    return (
      <div
        className={cn(
          "relative overflow-hidden",
          isWFull ? "w-full" : "inline-block",
          containerClassName
        )}
      >
        {isLoading && showSkeleton && (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800/80 animate-pulse pointer-events-none rounded-[inherit]" />
        )}
        <Image {...nextImageProps} />
      </div>
    );
  }

  // Standard responsive <img> tag for arbitrary sizing classes (e.g. w-12 h-12 object-cover)
  return (
    <img
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      onLoad={handleLoadingComplete}
      onError={handleImageError}
      className={cn(
        "transition-opacity duration-200",
        isLoading && showSkeleton ? "opacity-60" : "opacity-100",
        className
      )}
      style={imageStyles}
      {...rest}
    />
  );
};

export default AppImage;
