import { useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { SquareGridLoader } from "@/components/SquareGridLoader";
import { AppleNav } from "@/components/AppleNav";
import { AppleFeatureSections } from "@/components/AppleFeatureSections";
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
      if (activeRole === "athlete") {
        setLocation("/athlete/dashboard");
      } else if (activeRole === "coach") {
        setLocation("/coach/dashboard");
      }
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
    <div className="apple-page">
      <AppleNav
        isAuthenticated={isAuthenticated}
        activeRole={activeRole}
        onDashboard={() =>
          setLocation(activeRole === "coach" ? "/coach/dashboard" : "/athlete/dashboard")
        }
      />

      {/* Hero */}
      <section className="apple-hero" data-testid="section-hero">
        <motion.div
          className="apple-hero__content"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <p className="apple-eyebrow apple-eyebrow--hero">Coach Athlete Connect</p>
          <h1 className="apple-hero__title">
            Connect with
            <br />
            elite coaches.
          </h1>
          <p className="apple-hero__subtitle">
            The modern marketplace for personalized soccer training. Book sessions,
            pay securely, and elevate your game — on web and mobile.
          </p>
          <p className="apple-hero__note">
            One account everywhere. Same email on the website and in the app.
          </p>

          {isLoading ? (
            <div className="apple-hero__loader">
              <SquareGridLoader size="lg" />
            </div>
          ) : (
            <div className="apple-hero__ctas">
              <button
                type="button"
                className="apple-link apple-link--lg"
                onClick={handleAthleteClick}
                data-testid="button-athlete-mode"
              >
                {isAuthenticated && hasAthleteProfile ? "Enter as athlete" : "I'm an athlete"}
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
              <button
                type="button"
                className="apple-link apple-link--lg"
                onClick={handleCoachClick}
                data-testid="button-coach-mode"
              >
                {isAuthenticated && hasCoachProfile ? "Enter as coach" : "I'm a coach"}
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
            </div>
          )}
        </motion.div>
      </section>

      {/* Stats */}
      <section className="apple-stats" data-testid="section-stats">
        <div className="apple-stats__grid">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="apple-stats__item"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className="apple-stats__value" data-testid={`text-stat-value-${index}`}>
                {stat.value}
              </div>
              <div className="apple-stats__label">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <AppleFeatureSections />

      {/* Athlete / Coach */}
      <section className="apple-section apple-section--gray" data-testid="section-how-it-works">
        <div className="apple-dual">
          <motion.article
            className="apple-dual__card"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            data-testid="card-for-athletes"
          >
            <p className="apple-eyebrow">Athletes</p>
            <h3 className="apple-dual__title">Find your coach.</h3>
            <p className="apple-dual__text">
              Browse by location and skill. Book with real-time availability and track your progress.
            </p>
            <button type="button" className="apple-link" onClick={handleAthleteClick} data-testid="button-for-athletes">
              {isAuthenticated && hasAthleteProfile ? "Go to dashboard" : "Find a coach"}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </motion.article>

          <motion.article
            className="apple-dual__card"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            data-testid="card-for-coaches"
          >
            <p className="apple-eyebrow">Coaches</p>
            <h3 className="apple-dual__title">Grow your business.</h3>
            <p className="apple-dual__text">
              Build your profile, manage bookings, and earn with Stripe Connect payouts.
            </p>
            <button type="button" className="apple-link" onClick={handleCoachClick} data-testid="button-for-coaches">
              {isAuthenticated && hasCoachProfile ? "Go to dashboard" : "Start coaching"}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </motion.article>
        </div>
      </section>

      {/* Founder */}
      <section className="apple-section" data-testid="section-founder">
        <div className="apple-founder">
          <motion.div
            className="apple-founder__media"
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <img
              src={yassineImage}
              alt="Yassine Rhoumar"
              className="apple-founder__img"
              data-testid="img-founder"
            />
          </motion.div>
          <motion.div
            className="apple-founder__copy"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="apple-eyebrow">Founder</p>
            <h2 className="apple-section__title apple-section__title--left" data-testid="heading-founder">
              Built by athletes,
              <br />
              for athletes.
            </h2>
            <p className="apple-founder__name" data-testid="text-founder-name">
              Yassine Rhoumar
            </p>
            <p className="apple-founder__role" data-testid="text-founder-role">
              Founder & CEO
            </p>
            <p className="apple-section__subtitle apple-section__subtitle--left">
              Created from the perspective of a Division I athlete with experience in the DC United
              system — connecting players with trusted coaches nationwide through technical excellence
              and mentorship.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="apple-cta-band" data-testid="section-cta">
        <motion.div
          className="apple-cta-band__inner"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="apple-cta-band__title" data-testid="heading-cta">
            Ready to level up?
          </h2>
          <p className="apple-cta-band__subtitle">
            Join athletes and coaches already training on CoachConnect.
          </p>
          <div className="apple-cta-band__actions">
            <Link href="/browse" className="apple-link apple-link--on-dark" data-testid="button-browse-coaches">
              Browse coaches
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/auth/signup" className="apple-btn apple-btn--on-dark" data-testid="button-get-started">
              Get started
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="apple-footer">
        <div className="apple-footer__inner">
          <div className="apple-footer__brand">
            <span className="font-semibold">CoachConnect</span>
            <p className="apple-footer__copy">
              © {new Date().getFullYear()} Coach Athlete Connect. All rights reserved.
            </p>
          </div>
          <div className="apple-footer__links">
            <Link href="/browse" className="apple-footer__link">
              Browse
            </Link>
            <Link href="/terms" className="apple-footer__link">
              Terms
            </Link>
            <Link href="/privacy" className="apple-footer__link">
              Privacy
            </Link>
            <Link href="/auth/login" className="apple-footer__link">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
