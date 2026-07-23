import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-md bg-black/5 dark:bg-white/5 relative overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
