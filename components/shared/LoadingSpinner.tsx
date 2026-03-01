import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface Props {
  className?: string;
  text?: string;
}

export function LoadingSpinner({ className, text = "Loading..." }: Props) {
  return (
    <div className={cn("flex items-center justify-center gap-2 py-12 text-muted-foreground", className)}>
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">{text}</span>
    </div>
  );
}
