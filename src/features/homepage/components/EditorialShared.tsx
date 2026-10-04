import type { LucideIcon } from "lucide-react";
import {
  CloudRain,
  Compass,
  Layers3,
  MapPinned,
  Search,
  Sparkles,
  Telescope,
  Timeline,
  WandSparkles,
} from "lucide-react";

export interface StoryCard {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface WorkflowStep {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const AVAILABLE: StoryCard[] = [
  {
    icon: MapPinned,
    title: "Carte interactive",
    description: "Tous les signaux utiles réunis autour du lieu choisi.",
  },
  {
    icon: Search,
    title: "Recherche de lieux",
    description: "Passer d’une idée à un terrain concret en quelques secondes.",
  },
  {
    icon: Layers3,
    title: "Pollution lumineuse",
    description: "Repérer les zones favorables à un ciel réellement sombre.",
  },
  {
    icon: CloudRain,
    title: "Nuages et radar",
    description: "Lire les conditions présentes sans quitter la carte.",
  },
  {
    icon: Telescope,
    title: "Astronomie",
    description: "Soleil, Lune, crépuscules et nuit astronomique au même endroit.",
  },
  {
    icon: Sparkles,
    title: "Voie Lactée",
    description: "Comprendre la direction et le passage du noyau galactique.",
  },
  {
    icon: Timeline,
    title: "Timeline photo",
    description: "Voir immédiatement les moments importants de la journée.",
  },
  {
    icon: WandSparkles,
    title: "Photo Advisor",
    description: "Transformer les données en recommandations compréhensibles.",
  },
  {
    icon: Compass,
    title: "Guides photographiques",
    description: "Préparer le cadrage directement depuis la carte.",
  },
];

export const HOME_FEATURES = AVAILABLE.filter(({ title }) =>
  [
    "Recherche de lieux",
    "Pollution lumineuse",
    "Astronomie",
    "Timeline photo",
    "Photo Advisor",
    "Guides photographiques",
  ].includes(title),
);

export const HOME_WORKFLOW: WorkflowStep[] = [
  {
    icon: Search,
    title: "Choisissez un lieu",
    description: "Partez d’un nom, d’une intuition ou d’une zone à explorer.",
  },
  {
    icon: Layers3,
    title: "Explorez les conditions",
    description: "Croisez météo, lumière, pollution lumineuse et contexte du terrain.",
  },
  {
    icon: Sparkles,
    title: "Trouvez votre opportunité",
    description: "Repérez les moments qui méritent vraiment une image.",
  },
  {
    icon: MapPinned,
    title: "Préparez votre sortie",
    description: "Passez de l’idée à une décision concrète, claire et photographique.",
  },
];

export function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center">
      <p className="text-info mb-3 text-sm font-black tracking-[0.16em] uppercase">{eyebrow}</p>
      <h2 className="text-foreground text-3xl font-black tracking-tight sm:text-4xl">{title}</h2>
      {children && (
        <div className="text-muted-foreground mt-5 text-base leading-relaxed sm:text-lg">
          {children}
        </div>
      )}
    </div>
  );
}

export function CardGrid({
  cards,
  muted = false,
}: {
  cards: StoryCard[];
  muted?: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map(({ icon: Icon, title, description }) => (
        <article
          key={title}
          className={`story-card border-border rounded-2xl border p-6 ${muted ? "bg-muted/35" : "bg-card"}`}
        >
          <span className="bg-info/10 text-info mb-5 grid h-12 w-12 place-items-center rounded-xl">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </span>
          <h3 className="text-foreground text-xl font-bold">{title}</h3>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">{description}</p>
        </article>
      ))}
    </div>
  );
}

export function WorkflowGrid({ steps }: { steps: WorkflowStep[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {steps.map(({ icon: Icon, title, description }, index) => (
        <article key={title} className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <span className="bg-info/10 text-info grid h-12 w-12 place-items-center rounded-xl">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="text-muted-foreground text-sm font-black tracking-[0.14em] uppercase">
              {index + 1}
            </span>
          </div>
          <h3 className="text-foreground text-xl font-bold">{title}</h3>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">{description}</p>
        </article>
      ))}
    </div>
  );
}