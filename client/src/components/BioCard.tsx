import { Card, CardContent } from "@/components/ui/card";

interface BioCardProps {
  name: string;
  subtitle?: string;
  imageSrc: string;
  statement: string;
}

export function BioCard({ name, subtitle, imageSrc, statement }: BioCardProps) {
  return (
    <Card className="overflow-hidden" data-testid={`bio-card-${name.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-primary/20">
              <img
                src={imageSrc}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl md:text-2xl font-bold mb-1" data-testid={`bio-name-${name.toLowerCase().replace(/\s+/g, '-')}`}>
              {name}
            </h3>
            {subtitle && (
              <p className="text-sm text-primary font-medium mb-3">{subtitle}</p>
            )}
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed italic" data-testid={`bio-statement-${name.toLowerCase().replace(/\s+/g, '-')}`}>
              "{statement}"
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BioCard;
