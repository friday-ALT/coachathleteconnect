import { Link } from "wouter";
import { ThemeToggle } from "../ThemeToggle";
import { Button } from "../ui/button";

type HelixNavProps = {
  isAuthenticated?: boolean;
  activeRole?: "athlete" | "coach" | null;
  onDashboard?: () => void;
};

export function HelixNav({ isAuthenticated, activeRole, onDashboard }: HelixNavProps) {
  return (
    <nav className="helix-nav" data-testid="helix-nav">
      <div className="helix-nav__inner">
        <Link href="/" className="helix-nav__logo">
          CoachConnect
        </Link>

        <div className="helix-nav__links">
          <a href="#intro" className="helix-nav__link">
            Intro
          </a>
          <a href="#features" className="helix-nav__link">
            Features
          </a>
          <a href="#modes" className="helix-nav__link">
            Modes
          </a>
          <a href="#reviews" className="helix-nav__link">
            Reviews
          </a>
          <Link href="/browse" className="helix-nav__link">
            Browse
          </Link>
        </div>

        <div className="helix-nav__actions">
          <ThemeToggle />
          {!isAuthenticated ? (
            <>
              <Link href="/auth/login">
                <button type="button" className="helix-btn helix-btn--ghost">
                  Sign in
                </button>
              </Link>
              <Link href="/auth/signup">
                <button type="button" className="helix-btn helix-btn--accent">
                  Get started
                </button>
              </Link>
            </>
          ) : activeRole && onDashboard ? (
            <Button className="helix-btn helix-btn--accent h-9 px-4" size="sm" onClick={onDashboard}>
              Dashboard
            </Button>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
