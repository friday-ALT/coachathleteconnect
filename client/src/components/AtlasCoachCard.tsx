import { Link } from "wouter";
import { MapPin, Star, ChevronRight, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import type { CoachProfile } from "@shared/schema";

type CoachWithMeta = CoachProfile & {
  userId: string;
  ratingAvg?: number;
  ratingCount?: number;
};

interface AtlasCoachCardProps {
  coach: CoachWithMeta;
  gradientVariant?: number;
  onRequest: () => void;
}

const HERO_GRADIENTS = [
  "from-[#E8F0FA] via-[#D4E4F7] to-[#C8DCF2]",
  "from-[#EEEBF7] via-[#E0DAF4] to-[#D4CBF0]",
  "from-[#EEF1F6] via-[#E2E8F0] to-[#D5DEE8]",
];

export function AtlasCoachCard({ coach, gradientVariant = 0, onRequest }: AtlasCoachCardProps) {
  const heroClass = HERO_GRADIENTS[gradientVariant % HERO_GRADIENTS.length];
  const price = (coach.pricePerHour / 100).toFixed(0);
  const initials = coach.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <article
      className="atlas-coach-card group"
      data-testid={`card-coach-${coach.id}`}
    >
      <div className={`atlas-coach-card__hero bg-gradient-to-br ${heroClass}`}>
        {coach.skillLevel && (
          <span className="atlas-coach-card__badge">{coach.skillLevel}</span>
        )}
        <div className="atlas-coach-card__chip">
          <div className="atlas-coach-card__chip-shine" aria-hidden />
          <p className="atlas-coach-card__chip-label">Coach</p>
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-white/20">
              <AvatarImage src={coach.avatarUrl || undefined} alt={coach.name} />
              <AvatarFallback className="bg-white/20 text-white text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{coach.name.split(" ")[0]}</p>
              <p className="text-xs text-white/70 truncate">{coach.locationCity}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="atlas-coach-card__body">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-semibold tracking-tight text-[#1d1d1f] leading-tight">
            {coach.name}
          </h3>
          <div className="text-right shrink-0">
            <span className="text-xl font-semibold tracking-tight text-[#1d1d1f]">£{price}</span>
            <span className="block text-xs text-[#86868b]">/hr</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-[#86868b] mb-2">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {coach.locationCity}, {coach.locationState}
          </span>
        </div>

        <div className="flex items-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${
                i <= Math.floor(coach.ratingAvg || 0)
                  ? "fill-[#FF9500] text-[#FF9500]"
                  : "text-[#d2d2d7]"
              }`}
            />
          ))}
          <span className="text-xs text-[#86868b] ml-1">({coach.ratingCount || 0})</span>
        </div>

        <p className="text-sm text-[#424245] line-clamp-2 leading-relaxed mb-4 min-h-[2.5rem]">
          {coach.experience}
        </p>

        <div className="flex gap-2">
          <Link href={`/coach/${coach.userId}`} className="flex-1">
            <Button variant="outline" className="w-full rounded-full h-10 text-sm font-medium border-[#d2d2d7]">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              Profile
            </Button>
          </Link>
          <Button
            className="flex-1 rounded-full h-10 text-sm font-medium bg-[#1d1d1f] hover:bg-[#333336] text-white"
            onClick={onRequest}
          >
            Request
          </Button>
        </div>

        <Link
          href={`/coach/${coach.userId}`}
          className="atlas-coach-card__link mt-3 inline-flex items-center gap-0.5 text-sm font-medium text-[#0066CC] group-hover:underline"
        >
          Learn more
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
