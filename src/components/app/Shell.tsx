import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeft,
  ClipboardList,
  CreditCard,
  Home,
  Inbox,
  Layers,
  type LucideIcon,
  User,
  Wand2,
} from "lucide-react";
import { type ReactNode, useEffect } from "react";
import { actions } from "@/lib/demo/store";
import { useApp } from "@/lib/useApp";
import { cn } from "@/lib/utils";
import { Pill } from "./ui";

type NavItem = { to: string; icon: LucideIcon; label: string };

const SHARED_PATHS = ["/demo", "/about"];

/** The route decides the role; shared utility pages fall back to the stored role. */
export function useRouteRole(): "seller" | "supplier" {
  const { s } = useApp();
  const path = useRouterState({ select: (st) => st.location.pathname });
  if (path.startsWith("/supplier")) return "supplier";
  if (SHARED_PATHS.some((p) => path.startsWith(p))) return s.role;
  return "seller";
}

function useNav(): NavItem[] {
  const { s, t } = useApp();
  const role = useRouteRole();
  useEffect(() => {
    if (role !== s.role) actions.setRole(role);
  }, [role, s.role]);
  if (role === "supplier") {
    return [
      { to: "/supplier", icon: Home, label: t("nav_home") },
      { to: "/supplier/demand", icon: Inbox, label: t("nav_demand") },
      { to: "/supplier/orders", icon: ClipboardList, label: t("nav_orders") },
      { to: "/supplier/payments", icon: CreditCard, label: t("nav_payments") },
      { to: "/supplier/account", icon: User, label: t("nav_account") },
    ];
  }
  return [
    { to: "/", icon: Home, label: t("nav_home") },
    { to: "/sourcing", icon: Layers, label: t("nav_sourcing") },
    { to: "/orders", icon: ClipboardList, label: t("nav_orders") },
    { to: "/payments", icon: CreditCard, label: t("nav_payments") },
    { to: "/account", icon: User, label: t("nav_account") },
  ];
}

export function AppHeader({
  title,
  back,
  subtitle,
  right,
}: {
  title: string;
  back?: boolean;
  subtitle?: string;
  right?: ReactNode;
}) {
  const router = useRouter();
  const { s, t } = useApp();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-3 py-2.5">
        {back ? (
          <button
            onClick={() => router.history.back()}
            aria-label={t("back")}
            className="tap -ml-1 grid shrink-0 place-items-center rounded-lg text-foreground hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </button>
        ) : (
          <span aria-hidden className="h-6 w-1 shrink-0 rounded-full bg-primary" />
        )}
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-foreground">{title}</h1>
          {subtitle ? <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {right}
          <button
            onClick={() => actions.setLang(s.lang === "en" ? "hi" : "en")}
            aria-label={s.lang === "en" ? "हिन्दी में देखें" : "View in English"}
            className="tap grid place-items-center rounded-lg px-1.5 text-xs font-semibold text-foreground hover:bg-secondary"
          >
            {s.lang === "en" ? "हि" : "EN"}
          </button>
          <Link
            to="/demo"
            aria-label={t("demoControls")}
            className="tap flex items-center gap-1 rounded-lg px-1.5 text-xs font-semibold text-primary hover:bg-primary-soft"
          >
            <Wand2 className="h-4 w-4" aria-hidden />
            <span>Demo</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const items = useNav();
  return (
    <nav
      aria-label="Main"
      className="fixed bottom-0 left-1/2 z-30 w-full max-w-[420px] -translate-x-1/2 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] shadow-sticky"
    >
      <ul className="grid grid-cols-5">
        {items.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              activeOptions={{ exact: item.to === "/" || item.to === "/supplier" }}
              className="tap flex flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-medium text-muted-foreground"
              activeProps={{ className: "text-primary" }}
            >
              <item.icon className="h-5 w-5" aria-hidden />
              <span className="max-w-full truncate px-0.5">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Screen({
  title,
  subtitle,
  back,
  right,
  children,
  nav = true,
  sticky,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
  children: ReactNode;
  nav?: boolean;
  sticky?: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader title={title} subtitle={subtitle} back={back} right={right} />
      <main className={cn("flex-1", nav ? "pb-24" : "pb-6", sticky && "pb-40")}>{children}</main>
      {sticky ? (
        <div
          className={cn(
            "fixed left-1/2 z-30 w-full max-w-[420px] -translate-x-1/2 border-t border-border bg-card p-3 shadow-sticky",
            nav ? "bottom-[62px]" : "bottom-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))]",
          )}
        >
          {sticky}
        </div>
      ) : null}
      {nav ? <BottomNav /> : null}
    </div>
  );
}

export function DemoBadge() {
  const { t } = useApp();
  return <Pill tone="brand">{t("conceptDemo")}</Pill>;
}
