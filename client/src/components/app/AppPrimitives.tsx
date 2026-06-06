import type { ReactNode } from "react";
import { Link } from "wouter";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppPageHeader({
  label,
  title,
  subtitle,
  actions,
}: {
  label?: string;
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="app-page-header">
      <div className="app-page-header__copy">
        {label && <p className="helix-mono text-[var(--helix-green)] mb-2">{label}</p>}
        <h1 className="app-page-header__title">{title}</h1>
        {subtitle && <p className="app-page-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="app-page-header__actions">{actions}</div>}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  href,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  href?: string;
  icon?: LucideIcon;
}) {
  const inner = (
    <div className="app-metric-card">
      {Icon && (
        <div className="app-metric-card__icon">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="app-metric-card__value">{value}</div>
      <div className="app-metric-card__label">{label}</div>
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="app-metric-card-link">
        {inner}
      </Link>
    );
  }
  return inner;
}

export function ActionBanner({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="app-action-banner">
      <div className="app-action-banner__accent" aria-hidden />
      <div className="app-action-banner__body">
        <p className="app-action-banner__title">{title}</p>
        {description && <p className="app-action-banner__desc">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export function ActionBannerLink({
  title,
  description,
  href,
  actionLabel,
}: {
  title: string;
  description?: string;
  href: string;
  actionLabel: string;
}) {
  return (
    <div className="app-action-banner">
      <div className="app-action-banner__accent" aria-hidden />
      <div className="app-action-banner__body">
        <p className="app-action-banner__title">{title}</p>
        {description && <p className="app-action-banner__desc">{description}</p>}
      </div>
      <Link href={href}>
        <span className="helix-btn helix-btn--accent text-xs">{actionLabel}</span>
      </Link>
    </div>
  );
}

export function PageSection({
  title,
  href,
  linkLabel = "View all",
  badge,
  children,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  badge?: number;
  children: ReactNode;
}) {
  return (
    <section className="app-page-section">
      <div className="app-page-section__head">
        <div className="flex items-center gap-2">
          <h2 className="app-page-section__title">{title}</h2>
          {badge != null && badge > 0 && (
            <span className="app-badge">{badge > 9 ? "9+" : badge}</span>
          )}
        </div>
        {href && (
          <Link href={href} className="app-page-section__link">
            {linkLabel}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      <div className="app-page-section__body">{children}</div>
    </section>
  );
}

export function DataRow({
  avatar,
  title,
  subtitle,
  meta,
  actions,
}: {
  avatar?: ReactNode;
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="app-data-row">
      {avatar}
      <div className="app-data-row__main">
        <p className="app-data-row__title">{title}</p>
        {subtitle && <p className="app-data-row__subtitle">{subtitle}</p>}
      </div>
      {meta && <div className="app-data-row__meta">{meta}</div>}
      {actions && <div className="app-data-row__actions">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="app-empty-state">
      <Icon className="h-10 w-10 text-[var(--helix-gray-500)] mb-3" />
      <p className="app-empty-state__title">{title}</p>
      {description && <p className="app-empty-state__desc">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function AppPanel({ children, className, highlight }: { children: ReactNode; className?: string; highlight?: boolean }) {
  return (
    <div className={cn("app-panel", highlight && "app-panel--highlight", className)}>{children}</div>
  );
}

export function StatusPill({ label, variant = "default" }: { label: string; variant?: "default" | "success" | "warning" | "danger" }) {
  return <span className={cn("app-status-pill", `app-status-pill--${variant}`)}>{label}</span>;
}
