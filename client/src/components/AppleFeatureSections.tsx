import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  CreditCard,
  Calendar,
  MessageSquare,
  Star,
  Smartphone,
  ChevronRight,
} from "lucide-react";

type SectionProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  href?: string;
  linkLabel?: string;
  variant: "light" | "gray" | "dark";
  visual: React.ReactNode;
  testId: string;
};

function AppleSection({
  eyebrow,
  title,
  subtitle,
  href,
  linkLabel = "Learn more",
  variant,
  visual,
  testId,
}: SectionProps) {
  const bg =
    variant === "dark"
      ? "apple-section apple-section--dark"
      : variant === "gray"
        ? "apple-section apple-section--gray"
        : "apple-section";

  return (
    <section className={bg} data-testid={testId}>
      <motion.div
        className="apple-section__inner"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="apple-section__copy">
          <p className="apple-eyebrow">{eyebrow}</p>
          <h2 className="apple-section__title">{title}</h2>
          <p className="apple-section__subtitle">{subtitle}</p>
          {href && (
            <Link href={href} className="apple-link">
              {linkLabel}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </div>
        <div className="apple-section__visual">{visual}</div>
      </motion.div>
    </section>
  );
}

function MockCheckout() {
  return (
    <div className="apple-mock apple-mock--card" aria-hidden>
      <div className="apple-mock__row">
        <span className="apple-mock__label">Session</span>
        <span className="apple-mock__value">60 min · Technical</span>
      </div>
      <div className="apple-mock__row">
        <span className="apple-mock__label">Coach</span>
        <span className="apple-mock__value">Alex M.</span>
      </div>
      <div className="apple-mock__total">Pay securely with Stripe</div>
    </div>
  );
}

function MockStripe() {
  return (
    <div className="apple-mock apple-mock--dark-card" aria-hidden>
      <CreditCard className="h-10 w-10 text-[#2997ff] mb-4" />
      <p className="text-lg font-semibold text-white">Stripe Connect</p>
      <p className="text-sm text-white/60 mt-1">Payouts · 97.5% to coach</p>
      <div className="apple-mock__pill mt-6">Connected</div>
    </div>
  );
}

function MockSync() {
  return (
    <div className="apple-mock apple-mock--sync" aria-hidden>
      <div className="apple-mock__device">
        <Smartphone className="h-8 w-8 text-[#1d1d1f]" />
        <span>App</span>
      </div>
      <div className="apple-mock__sync-line" />
      <div className="apple-mock__device">
        <span className="text-2xl font-semibold text-[#1d1d1f]">Web</span>
      </div>
    </div>
  );
}

function MockMessages() {
  return (
    <div className="apple-mock apple-mock--messages" aria-hidden>
      <div className="apple-mock__bubble apple-mock__bubble--them">See you at 4pm on the pitch.</div>
      <div className="apple-mock__bubble apple-mock__bubble--me">Booked. Thanks coach!</div>
      <MessageSquare className="h-5 w-5 text-[#86868b] mt-4 mx-auto" />
    </div>
  );
}

function MockSchedule() {
  return (
    <div className="apple-mock apple-mock--schedule" aria-hidden>
      {["Mon", "Wed", "Fri"].map((d) => (
        <div key={d} className="apple-mock__day">
          <Calendar className="h-4 w-4 text-[#0071e3]" />
          <span>{d}</span>
          <span className="apple-mock__slot-open">Open</span>
        </div>
      ))}
    </div>
  );
}

function MockReviews() {
  return (
    <div className="apple-mock apple-mock--reviews" aria-hidden>
      <div className="flex gap-1 justify-center mb-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className="h-6 w-6 fill-[#ff9500] text-[#ff9500]" />
        ))}
      </div>
      <p className="text-center text-2xl font-semibold text-white">4.9</p>
      <p className="text-center text-sm text-white/60 mt-1">Average from completed sessions</p>
    </div>
  );
}

export function AppleFeatureSections() {
  return (
    <div data-testid="section-feature-showcase">
      <AppleSection
        testId="apple-section-book"
        variant="gray"
        eyebrow="Sessions"
        title="Book. Pay. Train."
        subtitle="Athletes pick a slot, pay in one checkout, and coaches get an instant request — on web or in the app."
        href="/browse"
        linkLabel="Browse coaches"
        visual={<MockCheckout />}
      />
      <AppleSection
        testId="apple-section-stripe"
        variant="dark"
        eyebrow="Payments"
        title="Coaches get paid. Automatically."
        subtitle="Stripe Connect onboarding, secure checkout, and payouts with a simple platform fee built in."
        visual={<MockStripe />}
      />
      <AppleSection
        testId="apple-section-sync"
        variant="light"
        eyebrow="Accounts"
        title="One account. Everywhere."
        subtitle="Sign up on the web, sign in on mobile with the same email. Profiles, messages, and sessions stay in sync."
        href="/auth/signup"
        linkLabel="Create account"
        visual={<MockSync />}
      />
      <AppleSection
        testId="apple-section-messages"
        variant="gray"
        eyebrow="Messaging"
        title="Stay in touch."
        subtitle="Athletes and coaches coordinate session details without leaving the platform."
        href="/auth/signup"
        visual={<MockMessages />}
      />
      <AppleSection
        testId="apple-section-schedule"
        variant="light"
        eyebrow="Scheduling"
        title="Real availability."
        subtitle="Coaches set weekly hours. Athletes only see open slots — no back-and-forth."
        visual={<MockSchedule />}
      />
      <AppleSection
        testId="apple-section-reviews"
        variant="dark"
        eyebrow="Trust"
        title="Reviews that matter."
        subtitle="Ratings after completed training help athletes choose coaches and coaches build reputation."
        visual={<MockReviews />}
      />
    </div>
  );
}
