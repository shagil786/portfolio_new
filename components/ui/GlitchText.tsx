"use client";

import type { ElementType } from "react";
import { cn } from "@/lib/cn";

interface GlitchTextProps {
  text: string;
  as?: ElementType;
  className?: string;
}

export default function GlitchText({ text, as, className }: GlitchTextProps) {
  const Tag: ElementType = as ?? "span";
  return (
    <Tag className={cn("glitch neon-text", className)} data-text={text}>
      {text}
    </Tag>
  );
}
