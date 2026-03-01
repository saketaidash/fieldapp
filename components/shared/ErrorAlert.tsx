import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  message: string;
  className?: string;
}

export function ErrorAlert({ message, className }: Props) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive",
        className
      )}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
