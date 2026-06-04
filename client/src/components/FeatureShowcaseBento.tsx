import { motion } from "framer-motion";
import {
  CreditCard,
  Calendar,
  MessageSquare,
  Star,
  Smartphone,
  Users,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "wouter";

type TileSize = "hero" | "tall" | "wide" | "standard";

type BentoTile = {
  id: string;
  size: TileSize;
  eyebrow: string;
  title: string;
  description: string;
  href?: string;
  accent: "teal" | "blue" | "violet" | "amber" | "dark";
  visual: "checkout" | "stripe" | "sync" | "messages" | "reviews" | "schedule";
};

const tiles: BentoTile[] = [
  {
    id: "book",
    size: "hero",
    eyebrow: "Sessions",
    title: "Book & pay in one flow",
    description:
      "Athletes pick a time, pay securely with Stripe, and coaches get an instant request — on web or mobile.",
    href: "/browse",
    accent: "dark",
    visual: "checkout",
  },
  {
    id: "stripe",
    size: "tall",
    eyebrow: "Payments",
    title: "Stripe Connect for coaches",
    description: "Coaches onboard once and receive payouts automatically. Platform fee built in.",
    accent: "teal",
    visual: "stripe",
  },
  {
    id: "sync",
    size: "standard",
    eyebrow: "Accounts",
    title: "One login everywhere",
    description: "Same email on website and app. Profiles, messages, and sessions stay in sync.",
    accent: "blue",
    visual: "sync",
  },
  {
    id: "messages",
    size: "standard",
    eyebrow: "Messaging",
    title: "Direct chat",
    description: "Athletes and coaches coordinate details without leaving the platform.",
    href: "/auth/signup",
    accent: "violet",
    visual: "messages",
  },
  {
    id: "schedule",
    size: "standard",
    eyebrow: "Scheduling",
    title: "Live availability",
    description: "Coaches set weekly hours; athletes only see open slots.",
    accent: "teal",
    visual: "schedule",
  },
  {
    id: "reviews",
    size: "wide",
    eyebrow: "Trust",
    title: "Verified reviews from real sessions",
    description:
      "Ratings after completed training help athletes choose coaches and help coaches build reputation.",
    accent: "amber",
    visual: "reviews",
  },
];

function TileVisual({ type }: { type: BentoTile["visual"] }) {
  if (type === "checkout") {
    return (
      <div className="bento-mock bento-mock--checkout" aria-hidden>
        <div className="bento-mock__chrome">
          <span /><span /><span />
        </div>
        <div className="bento-mock__body">
          <div className="bento-mock__line w-3/4" />
          <div className="bento-mock__slot" />
          <div className="bento-mock__pay">Pay £44</div>
        </div>
      </div>
    );
  }
  if (type === "stripe") {
    return (
      <div className="bento-mock bento-mock--stripe" aria-hidden>
        <CreditCard className="h-10 w-10 text-teal-600 opacity-90" />
        <div className="bento-mock__pill">Connected</div>
        <div className="bento-mock__line w-full mt-3" />
        <div className="bento-mock__line w-2/3" />
      </div>
    );
  }
  if (type === "sync") {
    return (
      <div className="bento-mock bento-mock--sync" aria-hidden>
        <Smartphone className="h-8 w-8 text-blue-600" />
        <span className="bento-mock__sync-arrow">↔</span>
        <Users className="h-8 w-8 text-teal-600" />
      </div>
    );
  }
  if (type === "messages") {
    return (
      <div className="bento-mock bento-mock--messages" aria-hidden>
        <div className="bento-mock__bubble bento-mock__bubble--left">See you at 4pm!</div>
        <div className="bento-mock__bubble bento-mock__bubble--right">Perfect — booked ✓</div>
      </div>
    );
  }
  if (type === "schedule") {
    return (
      <div className="bento-mock bento-mock--schedule" aria-hidden>
        {["Mon", "Tue", "Wed"].map((d) => (
          <div key={d} className="bento-mock__day">
            <span>{d}</span>
            <div className="bento-mock__dot" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="bento-mock bento-mock--reviews" aria-hidden>
      {[5, 5, 4, 5, 5].map((n, i) => (
        <Star key={i} className={`h-4 w-4 ${i < n ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
      ))}
      <p className="text-xs font-semibold mt-2 text-foreground/80">4.9 avg · 120+ reviews</p>
    </div>
  );
}

function BentoCard({ tile, index }: { tile: BentoTile; index: number }) {
  const sizeClass = {
    hero: "bento-tile--hero",
    tall: "bento-tile--tall",
    wide: "bento-tile--wide",
    standard: "bento-tile--standard",
  }[tile.size];

  const content = (
    <motion.article
      className={`bento-tile bento-tile--${tile.accent} ${sizeClass}`}
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      data-testid={`bento-tile-${tile.id}`}
    >
      <div className="bento-tile__glow" aria-hidden />
      <div className="bento-tile__content">
        <p className="bento-tile__eyebrow">{tile.eyebrow}</p>
        <h3 className="bento-tile__title">{tile.title}</h3>
        <p className="bento-tile__desc">{tile.description}</p>
        {tile.href && (
          <span className="bento-tile__link">
            Explore <ArrowUpRight className="h-4 w-4" />
          </span>
        )}
      </div>
      <div className="bento-tile__visual">
        <TileVisual type={tile.visual} />
      </div>
    </motion.article>
  );

  if (tile.href) {
    return (
      <Link href={tile.href} className="bento-tile-link">
        {content}
      </Link>
    );
  }
  return content;
}

/** Shopify Editions–style asymmetric feature bento (Mobbin reference layout). */
export function FeatureShowcaseBento() {
  return (
    <section className="bento-showcase py-16 md:py-24" data-testid="section-feature-showcase">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          className="bento-showcase__header"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="bento-showcase__badge">
            <Sparkles className="h-4 w-4" />
            <span>Platform highlights</span>
          </div>
          <h2 className="bento-showcase__title" data-testid="heading-feature-showcase">
            Everything built for
            <span className="bento-showcase__title-accent"> coach & athlete</span>
          </h2>
          <p className="bento-showcase__subtitle">
            A modular showcase of what CoachConnect ships today — bookings, payments, messaging,
            and trust, in one place.
          </p>
        </motion.div>

        <div className="bento-showcase__grid">
          {tiles.map((tile, i) => (
            <BentoCard key={tile.id} tile={tile} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
