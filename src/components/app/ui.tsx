import { cva, type VariantProps } from "class-variance-authority";
import { Anchor, Box, CircleDot, Layers, Link2, type LucideIcon, Ribbon, Shirt, Spool, Tag } from "lucide-react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import bagImg from "@/assets/courier-bags-grey.webp.asset.json";
import fabricImg from "@/assets/fabric-jersey-black.webp.asset.json";
import jewelImg from "@/assets/jewellery-components.webp.asset.json";
import zipImg from "@/assets/zipper-black.webp.asset.json";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "tap inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        soft: "bg-primary-soft text-primary hover:bg-primary-soft/70",
        outline: "border border-border bg-card text-foreground hover:bg-secondary",
        ghost: "text-primary hover:bg-primary-soft",
        positive: "bg-positive text-primary-foreground hover:bg-positive/90",
        danger: "border border-destructive/40 bg-card text-destructive hover:bg-destructive/5",
      },
      size: {
        md: "px-4 py-2.5",
        lg: "w-full px-4 py-3 text-base",
        sm: "px-3 py-2 text-xs",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export function Card({
  className,
  children,
  as: As = "div",
}: {
  className?: string;
  children: ReactNode;
  as?: "div" | "section" | "li";
}) {
  return (
    <As className={cn("rounded-xl border border-border bg-card p-3 shadow-app", className)}>
      {children}
    </As>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 pb-2 pt-4">
      <h2 className="truncate text-sm font-bold text-foreground">{children}</h2>
      {action}
    </div>
  );
}

const pill = cva("inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold", {
  variants: {
    tone: {
      neutral: "bg-secondary text-muted-foreground",
      brand: "bg-primary-soft text-primary",
      positive: "bg-positive-soft text-positive",
      warning: "bg-warning-soft text-warning",
      danger: "bg-destructive/10 text-destructive",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export function Pill({
  children,
  tone,
  className,
}: { children: ReactNode; className?: string } & VariantProps<typeof pill>) {
  return <span className={cn(pill({ tone }), className)}>{children}</span>;
}

export function Row({
  label,
  value,
  strong,
  tone,
}: {
  label: ReactNode;
  value: ReactNode;
  strong?: boolean;
  tone?: "positive" | "muted";
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-sm">
      <span className="min-w-0 text-muted-foreground">{label}</span>
      <span
        className={cn(
          "num shrink-0 text-right",
          strong ? "font-bold text-foreground" : "font-medium text-foreground",
          tone === "positive" && "text-positive",
          tone === "muted" && "text-muted-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
  id,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  id: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-foreground">
        {label}
      </label>
      {children}
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
      {error ? (
        <p role="alert" className="text-[11px] font-semibold text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "tap w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "tap w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({
  className,
  ...props
}: InputHTMLAttributes<HTMLTextAreaElement> & { rows?: number }) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground",
        className,
      )}
      {...(props as object)}
    />
  );
}

/** Accessible bottom sheet. */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40"
        tabIndex={-1}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="sheet-in relative z-10 max-h-[86dvh] w-full max-w-[420px] overflow-y-auto rounded-t-2xl bg-card pb-[env(safe-area-inset-bottom)]"
      >
        <div className="sticky top-0 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card px-4 py-3">
          <h2 className="truncate text-sm font-bold text-foreground">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="px-4 py-3">{children}</div>
        {footer ? <div className="sticky bottom-0 border-t border-border bg-card p-3">{footer}</div> : null}
      </div>
    </div>
  );
}

export function Note({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "warning" | "brand" }) {
  return (
    <p
      className={cn(
        "rounded-lg px-3 py-2 text-[11px] leading-relaxed",
        tone === "muted" && "bg-secondary text-muted-foreground",
        tone === "warning" && "bg-warning-soft text-warning",
        tone === "brand" && "bg-primary-soft text-primary",
      )}
    >
      {children}
    </p>
  );
}

const PHOTOS: Record<string, string> = {
  "sw-jersey-black": fabricImg.url,
  "sw-fabric": fabricImg.url,
  "sw-zip": zipImg.url,
  "sw-trim": zipImg.url,
  "sw-bag": bagImg.url,
  "sw-pack": bagImg.url,
  "sw-jewel": jewelImg.url,
};

/** Honest category illustrations for SKUs without a matching photo. */
const ILLUSTRATIONS: Record<string, { icon: LucideIcon; tone: string }> = {
  "sw-woven": { icon: Shirt, tone: "ill-cream" },
  "sw-lining": { icon: Layers, tone: "ill-grey" },
  "sw-elastic": { icon: Ribbon, tone: "ill-cream" },
  "sw-thread": { icon: Spool, tone: "ill-dark" },
  "sw-box": { icon: Box, tone: "ill-kraft" },
  "sw-label": { icon: Tag, tone: "ill-cream" },
  "sw-beads": { icon: CircleDot, tone: "ill-rose" },
  "sw-chain": { icon: Link2, tone: "ill-gold" },
  "sw-clasp": { icon: Anchor, tone: "ill-gold" },
};

export function MaterialTile({
  swatch,
  className,
  label,
}: {
  swatch: string;
  className?: string;
  label: string;
}) {
  const photo = PHOTOS[swatch];
  if (photo) {
    return (
      <div className={cn("overflow-hidden rounded-lg bg-warm", className)}>
        <img
          src={photo}
          alt={`${label} (illustrative image)`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain p-1"
        />
      </div>
    );
  }
  const ill = ILLUSTRATIONS[swatch] ?? { icon: Box, tone: "ill-cream" };
  const Icon = ill.icon;
  return (
    <div
      role="img"
      aria-label={`${label} (illustration)`}
      className={cn("grid place-items-center rounded-lg", ill.tone, className)}
    >
      <Icon className="h-1/3 max-h-16 w-1/3 max-w-16" strokeWidth={1.5} aria-hidden />
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-xs text-muted-foreground">
      {children}
    </div>
  );
}
