import clsx from "clsx";
import { Loader2 } from "lucide-react";

interface TxButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
}

export function TxButton({
  children,
  isLoading,
  loadingText,
  variant = "primary",
  className,
  disabled,
  ...props
}: TxButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-mono text-sm uppercase tracking-widest px-5 py-2.5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-ember text-bone hover:bg-ember/90 active:scale-[0.98]",
    secondary: "border border-bone/20 text-bone hover:bg-bone/5 active:scale-[0.98]",
    danger: "bg-red-900/60 text-red-300 border border-red-700/40 hover:bg-red-900/80",
    ghost: "text-muted hover:text-bone transition-colors",
  };

  return (
    <button
      disabled={isLoading || disabled}
      className={clsx(base, variants[variant], className)}
      {...props}
    >
      {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {isLoading ? (loadingText ?? "Processing...") : children}
    </button>
  );
}
