import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface SpecCardProps {
  icon: LucideIcon;
  title: string;
  specs: string[];
}

export default function SpecCard({ icon: Icon, title, specs }: SpecCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`card-spec-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-8">
        <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-6">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-medium mb-4 text-foreground">
          {title}
        </h3>
        <ul className="space-y-2">
          {specs.map((spec, index) => (
            <li key={index} className="text-muted-foreground flex items-start">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-3 flex-shrink-0" />
              <span>{spec}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
