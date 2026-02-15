import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TierSectionProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function TierSection({
  id,
  title,
  icon,
  badge,
  defaultOpen = false,
  children,
  className,
  "data-testid": testId,
}: TierSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = `tier-section-content-${id}`;
  const triggerId = `tier-section-trigger-${id}`;

  return (
    <div
      className={cn("border border-border rounded-lg overflow-hidden", className)}
      data-testid={testId}
    >
      <button
        id={triggerId}
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={contentId}
        className={cn(
          "w-full flex items-center justify-between px-6 py-4 text-left",
          "hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "min-h-[44px]"
        )}
        data-testid={testId ? `${testId}-trigger` : undefined}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-muted-foreground shrink-0">{icon}</span>}
          <h2 className="font-header font-bold text-base text-foreground">{title}</h2>
          {badge}
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200",
            "motion-reduce:transition-none",
            open && "rotate-180"
          )}
        />
      </button>
      <div
        id={contentId}
        role="region"
        aria-labelledby={triggerId}
        className={cn(
          "grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6 pt-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
