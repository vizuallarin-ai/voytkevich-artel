import Image from "next/image";
import { cn } from "@/lib/utils";

type HomeSectionImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

export function HomeSectionImage({ src, alt, className, priority }: HomeSectionImageProps) {
  return (
    <div
      className={cn(
        "relative aspect-[16/10] w-full overflow-hidden rounded-sm border border-graphite/10",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 50vw"
        priority={priority}
      />
    </div>
  );
}
