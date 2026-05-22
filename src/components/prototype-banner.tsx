import { Badge } from "@/components/ui/badge";

export function PrototypeBanner({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      className={`border-amber-500/40 bg-amber-500/10 text-amber-200/90 ${className ?? ""}`}
    >
      Prototype mode · data simulates locally in your browser
    </Badge>
  );
}
