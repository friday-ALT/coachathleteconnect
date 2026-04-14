import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Star, MapPin, DollarSign } from "lucide-react";
import type { CoachProfile } from "@shared/schema";
import RequestTimeSlotModal from "./RequestTimeSlotModal";

interface CoachCardProps {
  coach: CoachProfile;
}

export default function CoachCard({ coach }: CoachCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} className="h-4 w-4 fill-yellow-500/50 text-yellow-500" />
        );
      } else {
        stars.push(
          <Star key={i} className="h-4 w-4 text-gray-300" />
        );
      }
    }
    return stars;
  };

  const priceInDollars = (coach.pricePerHour / 100).toFixed(0);

  return (
    <>
      <Card className="hover-elevate transition-all" data-testid={`card-coach-${coach.id}`}>
        <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={coach.avatarUrl || `https://source.unsplash.com/100x100/?portrait,${coach.id}`}
              alt={coach.name}
            />
            <AvatarFallback>{coach.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-lg font-semibold" data-testid={`text-coach-name-${coach.id}`}>
              {coach.name}
            </h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span data-testid={`text-coach-location-${coach.id}`}>
                {coach.locationCity}, {coach.locationState}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex">{renderStars(coach.ratingAvg || 0)}</div>
            <span className="text-sm text-muted-foreground" data-testid={`text-coach-rating-${coach.id}`}>
              {coach.ratingAvg ? coach.ratingAvg.toFixed(1) : "0.0"} ({coach.ratingCount || 0})
            </span>
          </div>

          <p className="line-clamp-2 text-sm text-muted-foreground" data-testid={`text-coach-experience-${coach.id}`}>
            {coach.experience}
          </p>

          <div className="flex items-center gap-1 text-xl font-bold text-primary">
            <DollarSign className="h-5 w-5" />
            <span data-testid={`text-coach-price-${coach.id}`}>{priceInDollars}/hr</span>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            className="w-full md:w-auto"
            onClick={() => setIsModalOpen(true)}
            data-testid={`button-request-${coach.id}`}
          >
            Request Time Slot
          </Button>
        </CardFooter>
      </Card>

      <RequestTimeSlotModal
        coach={coach}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
