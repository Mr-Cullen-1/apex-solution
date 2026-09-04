import type { ComponentPropsWithoutRef } from "react";

type ContainerProps = ComponentPropsWithoutRef<"div">;

export function Container({ className = "", ...props }: ContainerProps) {
  return <div className={`mx-auto w-full max-w-[90rem] px-page ${className}`} {...props} />;
}
