import { Link } from "wouter";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";

type AppleNavProps = {
  isAuthenticated?: boolean;
  activeRole?: "athlete" | "coach" | null;
  onDashboard?: () => void;
};

export function AppleNav({ isAuthenticated, activeRole, onDashboard }: AppleNavProps) {
  return (
    <nav className="apple-nav" data-testid="apple-nav">
      <div className="apple-nav__inner">
        <Link href="/" className="apple-nav__logo" data-testid="link-home">
          CoachConnect
        </Link>

        <div className="apple-nav__links">
          <Link href="/browse" className="apple-nav__link">
            Browse
          </Link>
          {!isAuthenticated ? (
            <>
              <Link href="/auth/login" className="apple-nav__link">
                Sign in
              </Link>
              <Link href="/auth/signup">
                <Button className="apple-btn apple-btn--sm" size="sm">
                  Get started
                </Button>
              </Link>
            </>
          ) : activeRole && onDashboard ? (
            <Button className="apple-btn apple-btn--sm" size="sm" onClick={onDashboard}>
              Dashboard
            </Button>
          ) : null}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
