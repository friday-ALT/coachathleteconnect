import { useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { SquareGridLoader } from "@/components/SquareGridLoader";
import { OryzoNav } from "@/components/oryzo/OryzoNav";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import yassineImage from "@assets/IMG_8811_1766408856173.jpeg";

const stats = [
  { value: "500+", label: "Athletes trained" },
  { value: "50+", label: "Expert coaches" },
  { value: "4.9", label: "Average rating" },
  { value: "24/7", label: "Support" },
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
    stat: "97.5%",
    statSuffix: "to coach",
    desc: "Stripe Connect with platform fee built in. No surprise charges.",
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
    quote: "Schedule and requests in one place — I spend less time on admin, more on the pitch.",
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
    <div className="oryzo-landing">
      <OryzoNav
        isAuthenticated={isAuthenticated}
        activeRole={activeRole}
        onDashboard={() =>
          setLocation(activeRole === "coach" ? "/coach/dashboard" : "/athlete/dashboard")
        }
      />

      <section id="intro" className="oryzo-hero" data-testid="section-hero">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className="oryzo-mono oryzo-hero__tag">Made for athletes. Built for coaches.</p>
          <h1 className="oryzo-hero__title">
            Training,
            <br />
            <em>elevated.</em>
          </h1>
          <p className="oryzo-hero__lead">
            Coach Athlete Connect makes finding coaches, booking sessions, and getting paid feel
            considered — on web and in the app.
          </p>

          {isLoading ? (
            <SquareGridLoader size="lg" />
          ) : (
            <div className="oryzo-hero__ctas">
              <button type="button" className="oryzo-btn oryzo-btn--accent" onClick={handleAthleteClick} data-testid="button-athlete-mode">
                {isAuthenticated && hasAthleteProfile ? "Athlete dashboard" : "I'm an athlete"}
                <ChevronRight className="h-4 w-4" />
              </button>
              <button type="button" className="oryzo-btn" onClick={handleCoachClick} data-testid="button-coach-mode">
                {isAuthenticated && hasCoachProfile ? "Coach dashboard" : "I'm a coach"}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </motion.div>
        <span className="oryzo-scroll-hint">Scroll to continue</span>
      </section>

      <section className="oryzo-stats" data-testid="section-stats">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            data-testid={`stat-${s.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <div className="oryzo-stat__value" data-testid={`text-stat-value-${i}`}>
              {s.value}
            </div>
            <div className="oryzo-stat__label">{s.label}</div>
          </motion.div>
        ))}
      </section>

      <section id="features" className="oryzo-section--dark">
        <div className="oryzo-section__inner">
          <p className="oryzo-mono mb-4 text-[rgba(245,242,236,0.5)]">Powered by the platform</p>
          <h2 className="oryzo-headline oryzo-headline--split">
            <span>isn't just</span>
            <span>a listing.</span>
          </h2>
          <p className="oryzo-body">
            Bookings, payments, messaging, and reviews — engineered for both sides of the game.
          </p>
          <div className="oryzo-feature-grid">
            {features.map((f) => (
              <div key={f.label} className="oryzo-feature-card">
                <span className="oryzo-mono text-[rgba(245,242,236,0.45)]">{f.label}</span>
                <div className="oryzo-feature-card__stat">
                  {f.stat}
                  <span className="text-lg font-medium opacity-60"> {f.statSuffix}</span>
                </div>
                <p className="text-sm opacity-70 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="modes" className="oryzo-section--light">
        <div className="oryzo-section__inner">
          <p className="oryzo-mono mb-4">Choose your mode</p>
          <h2 className="oryzo-headline mb-2">Athlete or coach.</h2>
          <p className="oryzo-body mb-0">One account. Two profiles. Pick how you use the platform.</p>

          <table className="oryzo-compare">
            <thead>
              <tr>
                <th />
                <th>
                  <span className="oryzo-compare__col-head">Athlete</span>
                </th>
                <th>
                  <span className="oryzo-compare__col-head">Coach</span>
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

          <div className="flex flex-wrap gap-3 mt-10">
            <button type="button" className="oryzo-btn oryzo-btn--accent" onClick={handleAthleteClick} data-testid="button-for-athletes">
              {isAuthenticated && hasAthleteProfile ? "Athlete dashboard" : "Start as athlete"}
            </button>
            <button type="button" className="oryzo-btn" onClick={handleCoachClick} data-testid="button-for-coaches">
              {isAuthenticated && hasCoachProfile ? "Coach dashboard" : "Start as coach"}
            </button>
          </div>
        </div>
      </section>

      <section id="reviews" className="oryzo-section">
        <p className="oryzo-mono mb-4">Rating & reviews</p>
        <h2 className="oryzo-headline">
          People actually
          <br />
          use this.
        </h2>
        <p className="oryzo-body">Don't take our word for it — feedback from real sessions.</p>
        <div className="oryzo-reviews-grid">
          {reviews.map((r) => (
            <article key={r.author} className="oryzo-review-card">
              <p className="oryzo-review-card__score">{r.score}</p>
              <p className="oryzo-review-card__quote">&ldquo;{r.quote}&rdquo;</p>
              <p className="oryzo-review-card__author">{r.author}</p>
              <p className="oryzo-review-card__role">{r.role}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="oryzo-section--light" data-testid="section-founder">
        <div className="oryzo-section__inner oryzo-founder">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <img src={yassineImage} alt="Yassine Rhoumar" className="oryzo-founder__img" data-testid="img-founder" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="oryzo-mono mb-3">Founder</p>
            <h2 className="oryzo-headline" data-testid="heading-founder">
              Built by athletes,
              <br />
              for athletes.
            </h2>
            <p className="font-semibold mt-4" data-testid="text-founder-name">
              Yassine Rhoumar
            </p>
            <p className="oryzo-mono text-[#6f6a63] mt-1" data-testid="text-founder-role">
              Founder & CEO
            </p>
            <p className="oryzo-body mt-4 max-w-lg">
              Created from a Division I and DC United perspective — connecting players with trusted
              coaches through technical excellence and mentorship nationwide.
            </p>
          </motion.div>
        </div>
      </section>

      <section id="cta" className="oryzo-section--dark" data-testid="section-cta">
        <div className="oryzo-section__inner text-center">
          <h2 className="oryzo-headline mx-auto" data-testid="heading-cta">
            Ready to play
            <br />
            at the next level?
          </h2>
          <p className="oryzo-body mx-auto mt-4 mb-8">
            Join athletes and coaches already on CoachConnect.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/browse" className="oryzo-btn oryzo-btn--ghost border-[rgba(245,242,236,0.3)] text-[#f5f2ec]" data-testid="button-browse-coaches">
              Browse coaches
            </Link>
            <Link href="/auth/signup" className="oryzo-btn oryzo-btn--accent" data-testid="button-get-started">
              Get started
            </Link>
          </div>
        </div>
      </section>

      <footer className="oryzo-footer">
        <div className="oryzo-footer__inner">
          <div>
            <p className="oryzo-footer__brand">CoachConnect</p>
            <p className="text-sm mt-2 opacity-60">
              © {new Date().getFullYear()} Coach Athlete Connect
            </p>
          </div>
          <div className="oryzo-footer__links">
            <Link href="/browse" className="oryzo-footer__link">
              Browse
            </Link>
            <Link href="/terms" className="oryzo-footer__link">
              Terms
            </Link>
            <Link href="/privacy" className="oryzo-footer__link">
              Privacy
            </Link>
            <Link href="/auth/login" className="oryzo-footer__link">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
