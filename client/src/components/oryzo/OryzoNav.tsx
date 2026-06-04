import { Link } from "wouter";
import { ThemeToggle } from "../ThemeToggle";
import { Button } from "../ui/button";

type OryzoNavProps = {
  isAuthenticated?: boolean;
  activeRole?: "athlete" | "coach" | null;
  onDashboard?: () => void;
};

export function OryzoNav({ isAuthenticated, activeRole, onDashboard }: OryzoNavProps) {
  return (
    <nav className="oryzo-nav" data-testid="oryzo-nav">
      <div className="oryzo-nav__inner">
        <Link href="/" className="oryzo-nav__logo">
          CoachConnect
        </Link>

        <div className="oryzo-nav__links">
          <a href="#intro" className="oryzo-nav__link">
            Intro
          </a>
          <a href="#features" className="oryzo-nav__link">
            Features
          </a>
          <a href="#modes" className="oryzo-nav__link">
            Modes
          </a>
          <a href="#reviews" className="oryzo-nav__link">
            Reviews
          </a>
          <Link href="/browse" className="oryzo-nav__link">
            Browse
          </Link>
        </div>

        <div className="oryzo-nav__actions">
          <ThemeToggle />
          {!isAuthenticated ? (
            <>
              <Link href="/auth/login">
                <button type="button" className="oryzo-btn oryzo-btn--ghost">
                  Sign in
                </button>
              </Link>
              <Link href="/auth/signup">
                <button type="button" className="oryzo-btn oryzo-btn--accent">
                  Get started
                </button>
              </Link>
            </>
          ) : activeRole && onDashboard ? (
            <Button className="oryzo-btn oryzo-btn--accent h-9 px-4" size="sm" onClick={onDashboard}>
              Dashboard
            </Button>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
