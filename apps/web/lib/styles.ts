import clsx from "clsx";

export type Variant = "primary" | "secondary" | "outline" | "text" | "danger" | "light" | "ghost-light";
export type Size = "md" | "lg" | "sm";

const variants: Record<Variant, string> = {
  primary: "bg-accent-solid text-on-accent shadow-soft hover:brightness-105 hover:shadow-lift active:brightness-95",
  secondary: "bg-ink text-white hover:bg-ink/90 dark:bg-white dark:text-ink dark:hover:bg-white/90",
  outline: "border border-border bg-surface text-fg hover:border-accent hover:text-accent-fg",
  text: "text-accent-fg hover:bg-info-bg",
  danger: "bg-danger text-white hover:opacity-90 dark:text-ink",
  light: "bg-white text-ink shadow-soft hover:bg-white/90",
  "ghost-light": "border border-white/50 text-white hover:border-white hover:bg-white/10",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-[15px] gap-2",
  lg: "h-13 px-6 text-base gap-2",
};

export const buttonClass = (variant: Variant = "primary", size: Size = "md", className?: string) =>
  clsx(
    "inline-flex select-none items-center justify-center rounded-[var(--radius-control)] font-semibold whitespace-nowrap",
    "transition-[background-color,color,border-color,transform,box-shadow] duration-150 ease-out active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );


export const inputClass = (error?: boolean, withIcon?: boolean) =>
  clsx(
    "h-12 w-full rounded-[var(--radius-control)] border bg-surface px-3.5 text-[15px] text-fg placeholder:text-muted/80",
    "transition-[border-color,box-shadow] duration-150 outline-none",
    "focus:border-accent focus:ring-4 focus:ring-accent/15",
    "disabled:cursor-not-allowed disabled:opacity-60",
    error ? "border-danger" : "border-border",
    withIcon && "pl-10",
  );

