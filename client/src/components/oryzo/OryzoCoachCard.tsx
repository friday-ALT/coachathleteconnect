import { Link } from "wouter";
import { MapPin, Star, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import type { CoachProfile } from "@shared/schema";

type CoachWithMeta = CoachProfile & {
  userId: string;
  ratingAvg?: number;
  ratingCount?: number;
};

interface OryzoCoachCardProps {
  coach: CoachWithMeta;
  onRequest: () => void;
}

export function OryzoCoachCard({ coach, onRequest }: OryzoCoachCardProps) {
  const price = (coach.pricePerHour / 100).toFixed(0);
  const initials = coach.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <article className="oryzo-coach-card" data-testid={`card-coach-${coach.id}`}>
      <div className="oryzo-coach-card__hero relative">
        {coach.skillLevel && (
          <span className="oryzo-mono absolute top-4 right-4 text-[#6f6a63]">{coach.skillLevel}</span>
        )}
        <div className="oryzo-coach-card__chip">
          <Avatar className="h-8 w-8">
            <AvatarImage src={coach.avatarUrl || undefined} alt={coach.name} />
            <AvatarFallback className="text-xs bg-white/20 text-white">{initials}</AvatarFallback>
          </Avatar>
          <span>{coach.name.split(" ")[0]}</span>
        </div>
      </div>

      <div className="oryzo-coach-card__body">
        <div className="flex justify-between gap-2 mb-2">
          <h3 className="text-lg font-semibold tracking-tight">{coach.name}</h3>
          <div className="text-right shrink-0">
            <span className="text-xl font-semibold">£{price}</span>
            <span className="block text-xs text-[#6f6a63]">/hr</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-[#6f6a63] mb-2">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">
            {coach.locationCity}, {coach.locationState}
          </span>
        </div>

        <div className="flex items-center gap-0.5 mb-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${
                i <= Math.floor(coach.ratingAvg || 0)
                  ? "fill-[#b85c38] text-[#b85c38]"
                  : "text-[#d8cfc2]"
              }`}
            />
          ))}
          <span className="text-xs text-[#6f6a63] ml-1">({coach.ratingCount || 0})</span>
        </div>

        <p className="text-sm text-[#6f6a63] line-clamp-2 mb-4 min-h-[2.5rem]">{coach.experience}</p>

        <div className="flex gap-2">
          <Link href={`/coach/${coach.userId}`} className="flex-1">
            <Button variant="outline" className="w-full rounded-full h-10 border-[#d8cfc2]">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              Profile
            </Button>
          </Link>
          <Button
            className="flex-1 rounded-full h-10 bg-[#0f0f0f] hover:bg-[#2a2826] text-[#f5f2ec]"
            onClick={onRequest}
          >
            Request
          </Button>
        </div>
      </div>
    </article>
  );
}
