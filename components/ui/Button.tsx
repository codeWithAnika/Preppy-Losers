import { type ComponentProps } from "react";
import { MagneticGlitchCTA } from "@/components/ui/MagneticGlitchCTA";

interface ButtonProps extends Omit<ComponentProps<typeof MagneticGlitchCTA>, "variant"> {
  variant?: "outline" | "solid";
}

export function Button({
  variant = "outline",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <MagneticGlitchCTA variant="outline" className={className} {...props}>
      {children}
    </MagneticGlitchCTA>
  );
}
