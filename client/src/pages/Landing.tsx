import { useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { SquareGridLoader } from "@/components/SquareGridLoader";
import { HelixNav } from "@/components/helix/HelixNav";
import { HelixCursor } from "@/components/helix/HelixCursor";
import { useHelixScroll } from "@/hooks/useHelixScroll";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useLocation, Link } from "wouter";
import yassineImage from "@assets/IMG_8811_1766408856173.jpeg";

const stats = [
  { value: "500", suffix: "+", label: "Athletes trained" },
  { value: "50", suffix: "+", label: "Expert coaches" },
  { value: "4.9", suffix: "", label: "Average rating" },
  { value: "24", suffix: "/7", label: "Support" },
];

const features = [
  {
    label: "Book & pay",
    stat: "1",
    statSuffix: "flow",
    desc: "Pick a slot, checkout with Stripe, coach gets notified instantly.",
  },
  {
    label: "Sync",
    stat: "2",
    statSuffix: "surfaces",
    desc: "Same account on web and mobile — sessions and messages stay aligned.",
  },
  {
    label: "Payouts",
    stat: "97.5",
    statSuffix: "% to coach",
    desc: "Stripe Connect with platform fee built in. No surprise charges.",
  },
];

const steps = [
  {
    num: "Step 01",
    title: "Find your coach",
    text: "Browse by location, skill level, and verified reviews from real sessions.",
  },
  {
    num: "Step 02",
    title: "Book & pay securely",
    text: "Pick an open slot, pay in one checkout, and get instant confirmation.",
  },
  {
    num: "Step 03",
    title: "Train & review",
    text: "Show up, improve your game, and leave feedback that helps the community.",
  },
];

const reviews = [
  {
    score: "[ 5/5 ]",
    quote: "Found my technical coach in a week. Booking and payment just worked.",
    author: "Jordan M.",
    role: "Academy midfielder",
  },
  {
    score: "[ 5/5 ]",
    quote: "Schedule and requests in one place — less admin, more time on the pitch.",
    author: "Sam T.",
    role: "Private coach, DC",
  },
  {
    score: "[ 4.9/5 ]",
    quote: "Reviews after real sessions helped me pick someone I actually trust.",
    author: "Priya K.",
    role: "College recruit",
  },
];

const compareRows = [
  { label: "Best for", athlete: "Training & finding coaches", coach: "Growing your coaching business" },
  { label: "Browse", athlete: "Coaches by skill & location", coach: "Athletes in your area" },
  { label: "Bookings", athlete: "Request & pay sessions", coach: "Accept & manage requests" },
  { label: "Payments", athlete: "Secure Stripe checkout", coach: "Stripe Connect payouts" },
  { label: "Messaging", athlete: "Chat with coaches", coach: "Chat with athletes" },
  { label: "Reviews", athlete: "Rate after sessions", coach: "Build reputation" },
];

export default function Landing() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    setActiveRole,
    hasAthleteProfile,
    hasCoachProfile,
    activeRole,
    isLoading: roleLoading,
  } = useRole();
  const [, setLocation] = useLocation();

  useHelixScroll(true);

  useEffect(() => {
    if (!authLoading && !roleLoading && isAuthenticated && activeRole) {
      if (activeRole === "athlete") setLocation("/athlete/dashboard");
      else if (activeRole === "coach") setLocation("/coach/dashboard");
    }
  }, [authLoading, roleLoading, isAuthenticated, activeRole, setLocation]);

  const handleAthleteClick = async () => {
    if (isAuthenticated && hasAthleteProfile) {
      await setActiveRole("athlete");
      setLocation("/athlete/dashboard");
    } else if (isAuthenticated) {
      setLocation("/auth/onboarding/athlete/step1");
    } else {
      setLocation("/auth/signup");
    }
  };

  const handleCoachClick = async () => {
    if (isAuthenticated && hasCoachProfile) {
      await setActiveRole("coach");
      setLocation("/coach/dashboard");
    } else if (isAuthenticated) {
      setLocation("/auth/onboarding/coach/step1");
    } else {
      setLocation("/auth/signup");
    }
  };

  const isLoading = authLoading || roleLoading;

  return (
    <div className="helix-landing">
      <HelixCursor />
      <HelixNav
        isAuthenticated={isAuthenticated}
        activeRole={activeRole}
        onDashboard={() =>
          setLocation(activeRole === "coach" ? "/coach/dashboard" : "/athlete/dashboard")
        }
      />

      <section id="intro" className="helix-hero" data-testid="section-hero">
        <div className="helix-hero__orbs" aria-hidden>
          <div className="helix-hero__orb helix-orb--1" />
          <div className="helix-hero__orb helix-orb--2" />
        </div>

        <div className="helix-hero__content">
          <p className="helix-mono helix-hero__tag helix-hero__line">
            From pitch to platform
          </p>
          <h1 className="helix-hero__title">
            <span className="helix-hero__line">Training,</span>
            <span className="helix-hero__line">
              <em>elevated.</em>
            </span>
          </h1>
          <p className="helix-hero__lead helix-hero__line">
            The first marketplace that connects athletes with elite coaches — book sessions,
            pay securely, and sync across web and mobile.
          </p>

          {isLoading ? (
            <SquareGridLoader size="lg" />
          ) : (
            <div className="helix-hero__ctas helix-hero__line">
              <button
                type="button"
                className="helix-btn helix-btn--accent"
                onClick={handleAthleteClick}
                data-testid="button-athlete-mode"
              >
                {isAuthenticated && hasAthleteProfile ? "Athlete dashboard" : "I'm an athlete"}
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="helix-btn helix-btn--ghost"
                onClick={handleCoachClick}
                data-testid="button-coach-mode"
              >
                {isAuthenticated && hasCoachProfile ? "Coach dashboard" : "I'm a coach"}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        <span className="helix-scroll-hint">Scroll to continue</span>
      </section>

      <section className="helix-stats helix-stagger" data-testid="section-stats">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="helix-stagger__item"
            data-testid={`stat-${s.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <div
              className="helix-stat__value"
              data-helix-counter={s.value}
              data-suffix={s.suffix}
              data-testid={`text-stat-value-${i}`}
            >
              {s.value}
              {s.suffix && <span>{s.suffix}</span>}
            </div>
            <div className="helix-stat__label">{s.label}</div>
          </div>
        ))}
      </section>

      <section id="features" className="helix-section--dark helix-pin-panel">
        <div className="helix-section__inner">
          <div className="helix-pin-panel__sticky">
            <p className="helix-mono mb-4 text-[var(--helix-green)]">Platform</p>
            <h2 className="helix-headline helix-headline--split helix-reveal">
              <span>isn't just</span>
              <span>a listing.</span>
            </h2>
            <p className="helix-body helix-reveal">
              Bookings, payments, messaging, and reviews — engineered for both sides of the game.
            </p>
          </div>
          <div className="helix-pin-panel__scroll">
            {steps.map((step) => (
              <article key={step.num} className="helix-step-card helix-reveal">
                <p className="helix-mono helix-step-card__num">{step.num}</p>
                <h3 className="helix-step-card__title">{step.title}</h3>
                <p className="helix-step-card__text">{step.text}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="helix-section__inner helix-feature-grid helix-stagger mt-8 pb-16">
          {features.map((f) => (
            <div key={f.label} className="helix-feature-card helix-stagger__item">
              <span className="helix-mono text-[var(--helix-gray-500)]">{f.label}</span>
              <div className="helix-feature-card__stat">
                {f.stat}
                <small> {f.statSuffix}</small>
              </div>
              <p className="text-sm text-[var(--helix-gray-400)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="modes" className="helix-section--light">
        <div className="helix-section__inner">
          <p className="helix-mono mb-4 helix-reveal">Choose your mode</p>
          <h2 className="helix-headline mb-2 helix-reveal">Athlete or coach.</h2>
          <p className="helix-body helix-reveal mb-0">
            One account. Two profiles. Pick how you use the platform.
          </p>

          <table className="helix-compare helix-reveal">
            <thead>
              <tr>
                <th />
                <th>
                  <span className="helix-compare__col-head">Athlete</span>
                </th>
                <th>
                  <span className="helix-compare__col-head">Coach</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {compareRows.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td>{row.athlete}</td>
                  <td>{row.coach}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-wrap gap-3 mt-10 helix-reveal">
            <button
              type="button"
              className="helix-btn helix-btn--accent"
              onClick={handleAthleteClick}
              data-testid="button-for-athletes"
            >
              {isAuthenticated && hasAthleteProfile ? "Athlete dashboard" : "Start as athlete"}
            </button>
            <button
              type="button"
              className="helix-btn"
              onClick={handleCoachClick}
              data-testid="button-for-coaches"
            >
              {isAuthenticated && hasCoachProfile ? "Coach dashboard" : "Start as coach"}
            </button>
          </div>
        </div>
      </section>

      <section id="reviews" className="helix-section">
        <p className="helix-mono mb-4 helix-reveal">Rating & reviews</p>
        <h2 className="helix-headline helix-reveal">
          People actually
          <br />
          use this.
        </h2>
        <p className="helix-body helix-reveal">
          Don't take our word for it — feedback from real sessions.
        </p>
        <div className="helix-reviews-grid helix-stagger">
          {reviews.map((r) => (
            <article key={r.author} className="helix-review-card helix-stagger__item">
              <p className="helix-review-card__score">{r.score}</p>
              <p className="helix-review-card__quote">&ldquo;{r.quote}&rdquo;</p>
              <p className="helix-review-card__author">{r.author}</p>
              <p className="helix-review-card__role">{r.role}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="helix-section--light" data-testid="section-founder">
        <div className="helix-section__inner helix-founder">
          <div className="helix-reveal">
            <img
              src={yassineImage}
              alt="Yassine Rhoumar"
              className="helix-founder__img"
              data-testid="img-founder"
            />
          </div>
          <div className="helix-reveal">
            <p className="helix-mono mb-3">Founder</p>
            <h2 className="helix-headline" data-testid="heading-founder">
              Built by athletes,
              <br />
              for athletes.
            </h2>
            <p className="font-semibold mt-4 text-[var(--helix-black)]" data-testid="text-founder-name">
              Yassine Rhoumar
            </p>
            <p className="helix-mono text-[var(--helix-gray-500)] mt-1" data-testid="text-founder-role">
              Founder & CEO
            </p>
            <p className="helix-body mt-4 max-w-lg text-[var(--helix-gray-600)]">
              Created from a Division I and DC United perspective — connecting players with trusted
              coaches through technical excellence and mentorship nationwide.
            </p>
          </div>
        </div>
      </section>

      <section id="cta" className="helix-section--dark" data-testid="section-cta">
        <div className="helix-section__inner text-center">
          <h2 className="helix-headline mx-auto helix-reveal" data-testid="heading-cta">
            Ready to play
            <br />
            at the next level?
          </h2>
          <p className="helix-body mx-auto mt-4 mb-8 helix-reveal">
            Join athletes and coaches already on CoachConnect.
          </p>
          <div className="flex flex-wrap justify-center gap-3 helix-reveal">
            <Link
              href="/browse"
              className="helix-btn helix-btn--ghost"
              data-testid="button-browse-coaches"
            >
              Browse coaches
            </Link>
            <Link href="/auth/signup" className="helix-btn helix-btn--accent" data-testid="button-get-started">
              Get started
            </Link>
          </div>
        </div>
      </section>

      <footer className="helix-footer">
        <div className="helix-footer__inner">
          <div>
            <p className="helix-footer__brand">CoachConnect</p>
            <p className="text-sm mt-2 text-[var(--helix-gray-500)]">
              © {new Date().getFullYear()} Coach Athlete Connect
            </p>
          </div>
          <div className="helix-footer__links">
            <Link href="/browse" className="helix-footer__link">
              Browse
            </Link>
            <Link href="/terms" className="helix-footer__link">
              Terms
            </Link>
            <Link href="/privacy" className="helix-footer__link">
              Privacy
            </Link>
            <Link href="/auth/login" className="helix-footer__link">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
