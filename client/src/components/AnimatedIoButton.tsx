import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

type AnimatedIoButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  size?: "default" | "sm";
  "data-testid"?: string;
};

export function AnimatedIoButton({
  children,
  href,
  onClick,
  className,
  size = "default",
  "data-testid": testId,
}: AnimatedIoButtonProps) {
  const classes = cn(
    "cta-io-button",
    size === "sm" && "cta-io-button--sm",
    className,
  );

  const inner = (
    <>
      <span className="cta-io-button__label">{children}</span>
      <span className="cta-io-button__icon" aria-hidden>
        <ArrowRight className="cta-io-button__arrow" strokeWidth={2.5} />
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} data-testid={testId}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick} data-testid={testId}>
      {inner}
    </button>
  );
}
