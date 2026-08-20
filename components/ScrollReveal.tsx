"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

type AnimationType = "fade-up" | "fade-left" | "fade-right" | "scale" | "fade";

interface ScrollRevealProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
}

export function ScrollReveal({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 0.5,
  className = "",
  threshold = 0.1
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, prefersReducedMotion]);

  const animationStyles = prefersReducedMotion
    ? {}
    : {
        opacity: isVisible ? 1 : 0,
        transform: getTransform(animation, isVisible),
        transition: `opacity ${duration}s ease-out ${delay}s, transform ${duration}s ease-out ${delay}s`
      };

  return (
    <div ref={ref} className={className} style={animationStyles}>
      {children}
    </div>
  );
}

function getTransform(animation: AnimationType, isVisible: boolean): string {
  if (isVisible) return "none";
  
  switch (animation) {
    case "fade-up":
      return "translateY(20px)";
    case "fade-left":
      return "translateX(-20px)";
    case "fade-right":
      return "translateX(20px)";
    case "scale":
      return "scale(0.95)";
    case "fade":
    default:
      return "none";
  }
}

interface StaggerChildrenProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function StaggerChildren({
  children,
  staggerDelay = 0.1,
  className = ""
}: StaggerChildrenProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <div
              key={i}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "none" : "translateY(20px)",
                transition: prefersReducedMotion
                  ? "none"
                  : `opacity 0.5s ease-out ${i * staggerDelay}s, transform 0.5s ease-out ${i * staggerDelay}s`
              }}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  );
}
