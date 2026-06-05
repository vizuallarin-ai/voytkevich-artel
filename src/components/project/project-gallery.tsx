"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export function ProjectGallery({
  images,
  name,
  specs,
}: {
  images: string[];
  name: string;
  specs?: { area: number; material: string };
}) {
  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const prev = () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  const altBase = specs
    ? `Проект дома ${name}, ${specs.area} м², ${specs.material}`
    : name;

  return (
    <>
      <div className="relative aspect-[16/9] overflow-hidden rounded-sm">
        <Image
          src={images[index]}
          alt={`${altBase} — фото ${index + 1}`}
          fill
          className="cursor-zoom-in object-cover"
          onClick={() => setFullscreen(true)}
          sizes="(max-width: 1200px) 100vw, 80vw"
          priority
        />
        <button
          type="button"
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 glass rounded-full p-2"
          aria-label="Предыдущее фото"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 glass rounded-full p-2"
          aria-label="Следующее фото"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {images.map((img, i) => (
          <button
            key={img}
            type="button"
            onClick={() => setIndex(i)}
            className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-sm ${
              i === index ? "ring-2 ring-graphite" : "opacity-60"
            }`}
          >
            <Image src={img} alt={`${altBase} — миниатюра ${i + 1}`} fill className="object-cover" sizes="96px" />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {fullscreen && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-graphite/95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute right-6 top-6 text-background"
              onClick={() => setFullscreen(false)}
              aria-label="Закрыть"
            >
              <X className="h-8 w-8" />
            </button>
            <div className="relative h-[80vh] w-[90vw]">
              <Image src={images[index]} alt={altBase} fill className="object-contain" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
