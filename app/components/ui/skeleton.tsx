import { cn } from "@/lib/utils";

function Skeleton({
  className,
  disabled = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md bg-primary/10",
        className,
        !disabled && "animate-pulse",
      )}
      {...props}
    />
  );
}

export { Skeleton };
