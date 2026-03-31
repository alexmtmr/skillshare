import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean;
}

export function Card({
  padding = true,
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-surface rounded-lg shadow-card border border-divider/50 ${
        padding ? "p-6" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
