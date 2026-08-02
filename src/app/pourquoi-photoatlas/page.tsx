import {
  ArrowRight,
  Binoculars,
  CloudRain,
  Compass,
  History,
  Layers3,
  MapPinned,
  Moon,
  Radar,
  Search,
  Sparkles,
  Star,
  Sun,
  Telescope,
  Timeline,
  UserRound,
  Users,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pourquoi PhotoAtlas ? — PhotoAtlas",
  description:
    "Découvrez pourquoi PhotoAtlas réunit météo, astronomie et cartographie dans un assistant pensé par un photographe pour les photographes.",
};

interface StoryCard {
  icon: LucideIcon;
  title: string;
  description: string;
}

const AVAILABLE: StoryCard[] = [
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

const FUTURE: StoryCard[] = [
  {
    icon: MapPinned,
    title: "Spots personnels",
    description: "Construire son propre atlas de repérages.",
  },
  {
    icon: Users,
    title: "Synchronisation",
    description: "Retrouver sa préparation sur tous ses appareils.",
  },
  {
    icon: Binoculars,
    title: "Composition avancée",
    description: "Anticiper le champ de vision et les alignements.",
  },
  {
    icon: Sun,
    title: "Alignements Soleil",
    description: "Positionner précisément lumière, sujet et horizon.",
  },
  {
    icon: Moon,
    title: "Alignements Lune",
    description: "Préparer les levers et couchers derrière un sujet.",
  },
  {
    icon: History,
    title: "Historique des sorties",
    description: "Apprendre de ses conditions et de ses images.",
  },
  {
    icon: Star,
    title: "Advisor avancé",
    description: "Affiner les conseils avec davantage de signaux.",
  },
  {
    icon: UserRound,
    title: "Communauté",
    description: "Partager l’expérience sans transformer les lieux en produits.",
  },
];

function SectionHeading({
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

function CardGrid({ cards, muted = false }: { cards: StoryCard[]; muted?: boolean }) {
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

export default function WhyPhotoAtlasPage() {
  return (
    <main id="main-content" className="bg-background flex-1 overflow-y-auto" tabIndex={-1}>
      <section className="border-border relative isolate overflow-hidden border-b px-6 py-24 sm:py-32">
        <div
          className="story-orbit border-info/20 pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border"
          aria-hidden="true"
        >
          <div className="border-astro/20 absolute inset-16 rounded-full border" />
          <div className="border-sunrise/25 absolute inset-32 rounded-full border" />
        </div>
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-info mb-5 text-sm font-black tracking-[0.18em] uppercase">
            Un projet né sur le terrain
          </p>
          <h1 className="text-foreground text-5xl leading-tight font-black tracking-tight sm:text-6xl lg:text-7xl">
            Pourquoi PhotoAtlas&nbsp;?
          </h1>
          <p className="text-foreground mx-auto mt-6 max-w-3xl text-2xl font-bold sm:text-3xl">
            Le copilote intelligent des photographes.
          </p>
          <p className="text-muted-foreground mx-auto mt-7 max-w-3xl text-lg leading-relaxed">
            Préparer une sortie impose encore de passer d’une carte à une météo, puis d’un
            éphéméride à un radar. PhotoAtlas est né pour réunir ces informations dans un seul outil
            réellement pensé pour photographier.
          </p>
          <Link
            href="/"
            className="bg-primary text-primary-foreground mt-10 inline-flex min-h-12 items-center gap-2 rounded-xl px-6 py-3 text-base font-bold transition-transform hover:-translate-y-0.5"
          >
            Ouvrir la carte <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <section className="story-reveal mb-28">
          <SectionHeading
            eyebrow="Le constat"
            title="Toutes les informations existent. Elles sont simplement dispersées."
          >
            <p>
              Windy, PhotoPills, Light Pollution Map, RainViewer, Meteoblue, Stellarium, Google
              Maps… chacun excelle dans son domaine. Mais sur le terrain, le photographe doit encore
              assembler lui-même toutes les pièces.
            </p>
          </SectionHeading>
          <blockquote className="border-info/30 bg-info/10 text-foreground mx-auto max-w-5xl rounded-3xl border px-7 py-10 text-center text-3xl leading-tight font-black tracking-tight sm:px-12 sm:text-4xl">
            « Où dois-je aller photographier aujourd’hui, à quelle heure, et pourquoi ? »
          </blockquote>
        </section>

        <section className="story-reveal mb-28 grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="border-astro/30 bg-astro/10 mx-auto grid h-52 w-52 place-items-center rounded-full border">
            <div className="bg-card grid h-28 w-28 place-items-center rounded-full shadow-2xl">
              <UserRound className="text-astro h-14 w-14" aria-hidden="true" />
            </div>
          </div>
          <div>
            <p className="text-astro mb-3 text-sm font-black tracking-[0.16em] uppercase">
              La démarche
            </p>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Un photographe avant un produit.
            </h2>
            <div className="text-muted-foreground mt-6 space-y-4 text-lg leading-relaxed">
              <p>
                PhotoAtlas est développé par un photographe de paysage et d’astrophotographie. Il ne
                vient pas d’une liste abstraite de fonctionnalités, mais des hésitations très
                concrètes qui précèdent une sortie.
              </p>
              <p>
                Chaque module cherche à résoudre un problème rencontré sur le terrain : choisir un
                lieu, comprendre une fenêtre de lumière, anticiper le ciel ou préparer une
                composition.
              </p>
            </div>
          </div>
        </section>

        <section className="story-reveal mb-28">
          <SectionHeading eyebrow="Aujourd’hui" title="Ce que PhotoAtlas propose déjà">
            <p>
              Des outils reliés entre eux, organisés autour du lieu et de la décision
              photographique.
            </p>
          </SectionHeading>
          <CardGrid cards={AVAILABLE} />
        </section>

        <section className="story-reveal mb-28">
          <SectionHeading eyebrow="La vision" title="Ce qui arrive progressivement">
            <p>Pas de dates artificielles : une direction claire, développée étape après étape.</p>
          </SectionHeading>
          <CardGrid cards={FUTURE} muted />
        </section>

        <section className="story-reveal border-primary/25 bg-card mb-28 overflow-hidden rounded-3xl border p-8 sm:p-12 lg:p-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <p className="text-info mb-3 text-sm font-black tracking-[0.16em] uppercase">
                Notre philosophie
              </p>
              <h2 className="text-4xl font-black tracking-tight">
                Afficher moins de données. Aider à prendre une meilleure décision.
              </h2>
            </div>
            <div className="text-muted-foreground space-y-5 text-lg leading-relaxed">
              <p>
                PhotoAtlas n’a pas vocation à remplacer les excellents outils qui existent déjà. Il
                cherche à réunir leurs signaux essentiels dans une interface cohérente, construite
                autour des besoins du photographe.
              </p>
              <p>
                Une donnée météo ou astronomique n’est utile que si elle aide à agir. Le rôle de
                PhotoAtlas est donc de traduire, hiérarchiser et expliquer : ce qui mérite d’être
                photographié, où se placer et à quel moment partir.
              </p>
            </div>
          </div>
        </section>

        <section className="story-reveal mb-28 text-center">
          <Radar className="text-success mx-auto h-12 w-12" aria-hidden="true" />
          <h2 className="mt-6 text-3xl font-black sm:text-4xl">Un projet vivant</h2>
          <p className="text-muted-foreground mx-auto mt-5 max-w-3xl text-lg leading-relaxed">
            PhotoAtlas évolue en permanence. Les fonctionnalités sont développées progressivement,
            confrontées à de vrais besoins et améliorées à mesure que le terrain révèle de nouvelles
            questions.
          </p>
        </section>

        <section className="story-reveal pb-12 text-center">
          <Sparkles className="text-astro mx-auto h-12 w-12" aria-hidden="true" />
          <blockquote className="text-foreground mx-auto mt-8 max-w-5xl text-4xl leading-tight font-black tracking-tight sm:text-5xl">
            « Le monde n’est pas banal.
            <br />
            Nous avons simplement arrêté de le regarder. »
          </blockquote>
          <p className="text-muted-foreground mx-auto mt-8 max-w-3xl text-xl leading-relaxed">
            PhotoAtlas est là pour vous aider à retrouver ces instants où la nature devient
            exceptionnelle.
          </p>
        </section>
      </div>
    </main>
  );
}
