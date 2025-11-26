import { ScrollFade } from "@/components/ScrollFade";
import vagusImage from "@assets/generated_images/vagus_nerve_relaxation_scene.png";
import sleepImage from "@assets/generated_images/sleep_therapy_scene.png";
import yogaImage from "@assets/generated_images/activity_tracking_yoga_scene.png";

const useCases = [
  {
    title: "Vagus Nerve Therapy",
    description: "Place on your neck to stimulate the vagus nerve for deep relaxation and stress relief",
    image: vagusImage,
  },
  {
    title: "Sleep Enhancement",
    description: "Gentle vibrations that guide your nervous system into restful sleep states",
    image: sleepImage,
  },
  {
    title: "Activity Intelligence",
    description: "TinyML-powered motion tracking that recognizes and adapts to your activities",
    image: yogaImage,
  },
];

export default function UseCasesSection() {
  return (
    <section className="py-32 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <ScrollFade direction="up" duration={0.7}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-semibold mb-6 text-foreground tracking-tight">
              Your Body, Your Therapy
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Designed for every moment of wellness
            </p>
          </div>
        </ScrollFade>

        <div className="space-y-24">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className={`grid lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <ScrollFade 
                direction={index % 2 === 0 ? 'left' : 'right'} 
                delay={0} 
                duration={0.8}
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="overflow-hidden rounded-3xl shadow-2xl">
                    <img
                      src={useCase.image}
                      alt={useCase.title}
                      className="w-full h-80 object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
              </ScrollFade>
              <ScrollFade 
                direction={index % 2 === 0 ? 'right' : 'left'} 
                delay={0.15} 
                duration={0.8}
              >
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <h3 className="text-3xl md:text-4xl font-semibold text-foreground mb-6">
                    {useCase.title}
                  </h3>
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    {useCase.description}
                  </p>
                </div>
              </ScrollFade>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
