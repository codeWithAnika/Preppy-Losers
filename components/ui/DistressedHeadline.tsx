import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from "react";

type DistressedHeadlineProps = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLElement>;

export const DistressedHeadline = forwardRef<HTMLElement, DistressedHeadlineProps>(
  function DistressedHeadline({ as: Tag = "h2", className = "", children, ...props }, ref) {
    return (
      <Tag
        ref={ref}
        className={`distressed-headline font-display ${className}`.trim()}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);
