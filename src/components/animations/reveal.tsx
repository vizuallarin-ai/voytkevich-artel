"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePreferStaticReveal } from "@/lib/motion-safe";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Сохранено для совместимости API; анимация без скрытия контента */
  direction?: "up" | "down" | "left" | "right" | "none";
  /** @deprecated blur отключён — ломал отрисовку в Opera/Safari */
  blur?: boolean;
};

export function Reveal({
  children,
  className,
  delay = 0,
}: RevealProps) {
  const preferStatic = usePreferStaticReveal();

  if (preferStatic) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial={false}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, amount: 0.01, margin: "0px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className,
  stagger = 0.08,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}) {
  const preferStatic = usePreferStaticReveal();

  if (preferStatic) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={false}
      whileInView="visible"
      viewport={{ once: true, amount: 0.01, margin: "0px" }}
      variants={{
        visible: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const preferStatic = usePreferStaticReveal();

  if (preferStatic) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={false}
      variants={{
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
