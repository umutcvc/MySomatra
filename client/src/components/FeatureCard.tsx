import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  image?: string;
  imagePosition?: "left" | "right";
}

export default function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  image,
  imagePosition = "right"
}: FeatureCardProps) {
  return (
    <div className={`grid lg:grid-cols-2 gap-12 items-center ${imagePosition === 'left' ? 'lg:flex-row-reverse' : ''}`}>
      {imagePosition === 'left' && image && (
        <div className="order-1 lg:order-none">
          <img
            src={image}
            alt={title}
            className="w-full h-64 md:h-80 object-cover rounded-xl"
          />
        </div>
      )}
      
      <div className={imagePosition === 'left' ? 'order-2 lg:order-none' : ''}>
        <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-6">
          <Icon className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-2xl md:text-3xl font-medium mb-4 text-foreground">
          {title}
        </h3>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      {imagePosition === 'right' && image && (
        <div>
          <img
            src={image}
            alt={title}
            className="w-full h-64 md:h-80 object-cover rounded-xl"
          />
        </div>
      )}
    </div>
  );
}
