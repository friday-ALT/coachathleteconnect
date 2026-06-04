import { motion } from "framer-motion";
import { Link } from "wouter";
import { ChevronRight, Search, Calendar, Wallet } from "lucide-react";

const cards = [
  {
    id: "find",
    eyebrow: "Discover",
    title: "Find the right coach.",
    description: "Browse verified coaches by location, skill level, and reviews.",
    href: "/browse",
    gradient: "atlas-promo-card--blue",
    icon: Search,
  },
  {
    id: "book",
    eyebrow: "Sessions",
    title: "Book in minutes.",
    description: "Pick a slot, pay securely, and get instant confirmation.",
    href: "/auth/signup",
    gradient: "atlas-promo-card--lavender",
    icon: Calendar,
  },
  {
    id: "pay",
    eyebrow: "Payments",
    title: "Coaches get paid.",
    description: "Stripe Connect payouts with platform fees handled for you.",
    href: "/auth/signup",
    gradient: "atlas-promo-card--slate",
    icon: Wallet,
  },
];

/** Atlas Card–style content card grid (Mobbin section reference). */
export function AtlasCardSection() {
  return (
    <section className="atlas-card-section" data-testid="section-atlas-cards">
      <motion.div
        className="atlas-card-section__header"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <p className="apple-eyebrow">Platform</p>
        <h2 className="atlas-card-section__title">
          Everything you need.
          <br />
          In one place.
        </h2>
        <p className="atlas-card-section__subtitle">
          Spacious cards, clear actions — designed for athletes and coaches on web and mobile.
        </p>
      </motion.div>

      <div className="atlas-card-section__grid">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: index * 0.08, duration: 0.55 }}
          >
            <Link href={card.href} className={`atlas-promo-card ${card.gradient}`}>
              <div className="atlas-promo-card__visual" aria-hidden>
                <div className="atlas-promo-card__chip">
                  <card.icon className="h-6 w-6 text-white" strokeWidth={1.75} />
                </div>
              </div>
              <div className="atlas-promo-card__body">
                <p className="atlas-promo-card__eyebrow">{card.eyebrow}</p>
                <h3 className="atlas-promo-card__title">{card.title}</h3>
                <p className="atlas-promo-card__desc">{card.description}</p>
                <span className="atlas-promo-card__link">
                  Learn more
                  <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
