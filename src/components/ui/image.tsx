import { cn } from "@/lib/utils";

interface ImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "width" | "height"> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  unoptimized?: boolean;
}

/** Drop-in replacement for next/image on the Vite/TanStack stack. */
export default function Image({
  fill,
  priority,
  quality: _quality,
  unoptimized: _unoptimized,
  className,
  alt,
  ...props
}: ImageProps) {
  return (
    <img
      {...props}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn(fill && "absolute inset-0 h-full w-full", className)}
    />
  );
}
