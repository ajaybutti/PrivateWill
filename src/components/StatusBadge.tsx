import clsx from "clsx";

interface StatusBadgeProps {
  status: "active" | "triggered" | "overdue" | "inactive";
}

const config = {
  active: { label: "Active", className: "bg-sage/20 text-sage border-sage/30" },
  triggered: { label: "Triggered", className: "bg-ember/20 text-ember border-ember/30" },
  overdue: { label: "Overdue", className: "bg-gold/20 text-gold border-gold/30 animate-pulse" },
  inactive: { label: "Inactive", className: "bg-muted/20 text-muted border-muted/30" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = config[status];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest border px-2.5 py-1",
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
