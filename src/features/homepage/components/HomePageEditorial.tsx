import { ArrowRight, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PROJECT_IDENTITY } from "@/lib/projectIdentity";

import { CardGrid, HOME_FEATURES, HOME_WORKFLOW, SectionHeading, WorkflowGrid } from "./EditorialShared";
import { PhotoAtlasAperture } from "./PhotoAtlasAperture";

export const homePageMetadata: Metadata = {
  title: "PhotoAtlas — Trouver où, quand et pourquoi photographier",
  description:
    "PhotoAtlas aide les photographes à trouver où aller, quand partir et dans quelles conditions photographier, en croisant lieux, météo, lumière et astronomie.",
  openGraph: {
    title: "PhotoAtlas — Trouver où, quand et pourquoi photographier",
    description:
      "Un point d’entrée éditorial et photographique vers l’outil de préparation PhotoAtlas.",
    type: "website",
  },
};

export function HomePageEditorial() {
  return (
    <main id="main-content" className="bg-background flex-1 overflow-y-auto" tabIndex={-1}>
      <section className="border-border relative isolate overflow-hidden border-b px-6 py-24 sm:py-32">
        <PhotoAtlasAperture />

        <div className="mx-auto max-w-5xl text-center">
          <p className="text-info mb-5 text-sm font-black tracking-[0.18em] uppercase">
            {PROJECT_IDENTITY.name}
          </p>
          <h1 className="text-foreground text-balance text-5xl leading-tight font-black tracking-tight sm:text-6xl lg:text-7xl">
            Et si votre prochaine photo était déjà là, quelque part ?
          </h1>
          <p className="text-foreground mx-auto mt-6 max-w-3xl text-xl font-bold sm:text-2xl">
            PhotoAtlas aide les photographes à trouver où aller, quand partir et dans quelles conditions photographier.
          </p>
          <p className="text-muted-foreground mx-auto mt-6 max-w-3xl text-lg leading-relaxed">
            Lieux, météo, lumière, astronomie et conditions photographiques sont réunis dans une seule expérience pour préparer une sortie sans disperser votre attention.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/map"
              className="bg-primary text-primary-foreground inline-flex min-h-12 items-center gap-2 rounded-xl px-6 py-3 text-base font-bold transition-transform hover:-translate-y-0.5"
            >
              Ouvrir la carte <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="story-reveal border-border/70 bg-card/70 mx-auto -mt-10 max-w-4xl rounded-3xl border px-6 py-8 shadow-sm backdrop-blur-sm sm:px-8 sm:py-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-info mb-3 text-sm font-black tracking-[0.18em] uppercase">
            L’atlas commence ici
          </p>
          <p className="text-foreground text-balance text-xl font-bold sm:text-2xl">
            PhotoAtlas est actuellement disponible en <span className="text-foreground">Aquitaine</span> et en <span className="text-foreground">Bretagne</span>.
          </p>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base leading-relaxed sm:text-lg">
            Deux régions déjà explorables. D&apos;autres territoires suivront.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <section className="story-reveal mb-24">
          <SectionHeading
            eyebrow="Le constat"
            title="Toutes les informations existent. Elles sont simplement dispersées."
          >
            <p>
              Windy, PhotoPills, Light Pollution Map, RainViewer, Meteoblue, Stellarium, Google Maps… chacun excelle dans son domaine. Mais sur le terrain, le photographe doit encore assembler lui-même toutes les pièces.
            </p>
          </SectionHeading>
          <blockquote className="border-info/30 bg-info/10 text-foreground mx-auto max-w-5xl rounded-3xl border px-7 py-10 text-center text-3xl leading-tight font-black tracking-tight sm:px-12 sm:text-4xl">
            « Le monde n’est pas banal. Nous avons simplement arrêté de le regarder. »
          </blockquote>
        </section>

        <section className="story-reveal mb-24">
          <SectionHeading
            eyebrow="La promesse"
            title="Un copilote pour préparer une vraie sortie photo, pas seulement consulter une carte."
          >
            <p>
              PhotoAtlas ne remplace pas le regard du photographe. Il l’aide à décider plus clairement où aller, quel moment attendre et pourquoi une fenêtre mérite d’être tentée.
            </p>
          </SectionHeading>
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <article className="border-border bg-card rounded-3xl border p-8 shadow-sm">
              <h3 className="text-foreground text-2xl font-black tracking-tight">Ce que PhotoAtlas apporte</h3>
              <ul className="text-muted-foreground mt-6 space-y-3 text-base leading-relaxed">
                <li>Trouver un lieu.</li>
                <li>Comprendre les conditions.</li>
                <li>Identifier les bons moments.</li>
                <li>Préparer une sortie photo avec plus de lisibilité.</li>
              </ul>
            </article>
            <article className="border-primary/20 bg-card rounded-3xl border p-8 shadow-sm">
              <h3 className="text-foreground text-2xl font-black tracking-tight">Pourquoi c’est utile</h3>
              <p className="text-muted-foreground mt-6 text-base leading-relaxed">
                Une donnée météo ou astronomique n’est utile que si elle aide à agir. Le rôle de PhotoAtlas est de relier les signaux utiles à une décision photographique concrète.
              </p>
            </article>
          </div>
        </section>

        <section className="story-reveal mb-24">
          <SectionHeading eyebrow="Comment ça fonctionne" title="Une progression simple, pensée pour le terrain.">
            <p>De l’intuition initiale à la sortie photo, l’outil organise les informations autour du moment de décision.</p>
          </SectionHeading>
          <WorkflowGrid steps={HOME_WORKFLOW} />
        </section>

        <section className="story-reveal mb-24">
          <SectionHeading eyebrow="Déjà disponible" title="Des briques concrètes déjà en place dans l’outil.">
            <p>PhotoAtlas relie déjà plusieurs modules utiles à la préparation photo, sans vous obliger à passer d’un service à un autre.</p>
          </SectionHeading>
          <CardGrid cards={HOME_FEATURES} />
        </section>

        <section className="story-reveal border-primary/25 bg-card mb-24 overflow-hidden rounded-3xl border p-8 sm:p-12 lg:p-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <p className="text-info mb-3 text-sm font-black tracking-[0.16em] uppercase">Vision photographique</p>
              <h2 className="text-4xl font-black tracking-tight">Des conditions lisibles pour retrouver les instants rares.</h2>
            </div>
            <div className="text-muted-foreground space-y-5 text-lg leading-relaxed">
              <p>
                PhotoAtlas est imaginé et développé par {PROJECT_IDENTITY.creator}, photographe de paysage et d’astrophotographie. Le projet ne part pas d’une liste abstraite de fonctionnalités, mais des hésitations réelles qui précèdent une sortie.
              </p>
              <p>
                Certains paysages ne se contemplent que quelques minutes dans une vie. La vocation de PhotoAtlas est d’aider à reconnaître ces fenêtres avant qu’elles ne disparaissent.
              </p>
            </div>
          </div>
        </section>

        <section className="story-reveal pb-12 text-center">
          <Sparkles className="text-astro mx-auto h-12 w-12" aria-hidden="true" />
          <blockquote className="text-foreground mx-auto mt-8 max-w-5xl text-4xl leading-tight font-black tracking-tight sm:text-5xl">
            « Certains paysages ne se contemplent que quelques minutes dans une vie. »
          </blockquote>
          <p className="text-muted-foreground mx-auto mt-8 max-w-3xl text-xl leading-relaxed">
            PhotoAtlas est là pour vous aider à retrouver ces instants où la lumière, le ciel et le lieu s’alignent enfin.
          </p>
          <Link
            href="/map"
            className="bg-primary text-primary-foreground mt-10 inline-flex min-h-12 items-center gap-2 rounded-xl px-6 py-3 text-base font-bold transition-transform hover:-translate-y-0.5"
          >
            Ouvrir la carte <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </main>
  );
}