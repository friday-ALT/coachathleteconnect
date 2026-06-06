import type { ReactNode } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function HelixAuthLayout({
  title,
  lead,
  children,
  backHref = "/",
  className,
}: {
  title: string;
  lead?: string;
  children: ReactNode;
  backHref?: string;
  className?: string;
}) {
  const [, setLocation] = useLocation();

  return (
    <div className={cn("helix-auth", className)}>
      <header className="helix-auth__header">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation(backHref)}
          className="rounded-full text-[var(--helix-gray-200)]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="helix-auth__title">{title}</h1>
        <div className="w-10" />
      </header>
      <div className="helix-auth__body">
        {lead && <p className="helix-auth__lead">{lead}</p>}
        {children}
      </div>
    </div>
  );
}

export function HelixOnboardingProgress({
  step,
  total,
  onBack,
}: {
  step: number;
  total: number;
  onBack: () => void;
}) {
  return (
    <div className="helix-onboarding-progress">
      <div className="helix-onboarding-progress__row">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-[var(--helix-gray-400)]">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="helix-mono text-[var(--helix-gray-500)]">
          Step {step} of {total}
        </span>
        <div className="w-10" />
      </div>
      <div className="helix-onboarding-progress__bars">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "helix-onboarding-progress__bar",
              i < step && "helix-onboarding-progress__bar--active",
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function HelixRoleCard({
  icon: Icon,
  title,
  description,
  done,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  done?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className={cn("helix-role-card", done && "helix-role-card--done")}
      onClick={onClick}
      disabled={done}
    >
      <div className="helix-role-card__icon">
        <Icon className="h-6 w-6" />
      </div>
      <div className="helix-role-card__copy">
        <p className="helix-role-card__title">{title}</p>
        <p className="helix-role-card__desc">{description}</p>
      </div>
      {done ? (
        <span className="helix-role-card__badge">Done</span>
      ) : (
        <ArrowLeft className="h-4 w-4 rotate-180 text-[var(--helix-gray-500)]" />
      )}
    </button>
  );
}

export function HelixOnboardingStep({
  label,
  title,
  lead,
  step,
  total,
  onBack,
  children,
}: {
  label: string;
  title: string;
  lead: string;
  step: number;
  total: number;
  onBack: () => void;
  children: ReactNode;
}) {
  return (
    <div className="helix-auth">
      <HelixOnboardingProgress step={step} total={total} onBack={onBack} />
      <div className="helix-auth__body">
        <p className="helix-mono text-[var(--helix-green)] mb-2">{label}</p>
        <h2 className="helix-onboarding-step__title">{title}</h2>
        <p className="helix-auth__lead">{lead}</p>
        {children}
      </div>
    </div>
  );
}
