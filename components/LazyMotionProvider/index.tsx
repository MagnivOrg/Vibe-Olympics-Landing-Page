"use client";

import { domAnimation, LazyMotion } from "framer-motion";
import { ReactNode } from "react";

interface LazyMotionProviderProps {
  children: ReactNode;
}

export const LazyMotionProvider = ({ children }: LazyMotionProviderProps) => (
  <LazyMotion features={domAnimation} strict>
    {children}
  </LazyMotion>
);
