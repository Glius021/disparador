import { createFileRoute } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ShieldCheck, Waves, Waypoints } from "lucide-react";
import { LeadForm } from "@/components/LeadForm";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { PointerGlow } from "@/components/motion/PointerGlow";
import { Reveal } from "@/components/motion/Reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Immerse | Agentes de IA que elevam operações empresariais" },
      {
        name: "description",
        content:
          "A Immerse arquiteta agentes de IA autônomos que se integram silenciosamente à sua operação, entregando escala, precisão e resultados mensuráveis desde o primeiro dia.",
      },
      {
        property: "og:title",
        content: "Immerse | A inteligência que impulsiona o futuro dos negócios",
      },
      {
        property: "og:description",
        content:
          "Arquitetamos agentes de IA que entendem a nuance, a estratégia e o valor do seu negócio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const PILARES = [
  {
    icon: Waypoints,
    t: "Escala inteligente",
    d: "Operações que crescem sem perda de qualidade: a capacidade de atendimento acompanha a demanda, não o tamanho do time.",
  },
  {
    icon: Waves,
    t: "Experiência imersiva",
    d: "Atendimentos que parecem humanos, com a precisão da máquina: contexto, timing e linguagem afiada em cada interação.",
  },
  {
    icon: ShieldCheck,
    t: "Segurança soberana",
    d: "Tecnologia de ponta com conformidade à LGPD e padrões de segurança enterprise como princípio, não como extra.",
  },
] as const;

const NUMEROS = [
  ["+1M", "interações inteligentes processadas pelas nossas arquiteturas."],
  ["24/7", "operação contínua: a IA não dorme e não deixa oportunidade esfriar."],
  ["Desde o dia 1", "resultados mensuráveis, com dados que o seu conselho entende."],
] as const;

const ECOSISTEMA = ["AWS", "Microsoft", "OpenAI", "Anthropic", "Meta", "Google Cloud"] as const;

function WordReveal({ text }: { text: string }) {
  const reduced = useReducedMotion();
  const words = text.split(" ");

  if (reduced) {
    return <>{text}</>;
  }

  return (
    <>
      {words.map((word, i) => (        <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.16em] -mb-[0.16em] align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: 0.25 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? "\u00A0" : null}
        </span>
      ))}
    </>
  );
}

function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <a href="/" className="display text-xl text-foreground" aria-label="Immerse, início">
          Immerse
        </a>
        <nav
          className="hidden items-center gap-8 text-sm text-muted-foreground sm:flex"
          aria-label="Navegação principal"
        >
          <a href="#manifesto" className="transition-colors hover:text-foreground">
            Manifesto
          </a>
          <a href="#visao" className="transition-colors hover:text-foreground">
            Visão
          </a>
          <a href="#contato" className="transition-colors hover:text-foreground">
            Contato
          </a>
        </nav>
        <MagneticButton href="#contato" variant="ghost" className="px-5 py-2.5">
          Fale com um especialista
        </MagneticButton>
      </div>
    </header>
  );
}

function Index() {
  return (
    <main className="relative">
      <PointerGlow />
      <SiteHeader />

      {/* 1. Hero */}
      <section className="relative border-b border-line">
        <div className="mx-auto flex min-h-svh max-w-5xl flex-col justify-center px-6 pb-24 pt-32">
          <motion.p
            className="eyebrow text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.1 }}
          >
            Agentes de IA autônomos para empresas líderes
          </motion.p>
          <h1 className="display mt-8 max-w-4xl text-5xl sm:text-6xl lg:text-7xl">
            <WordReveal text="A inteligência que impulsiona o futuro dos negócios no Brasil." />
          </h1>
          <motion.p
            className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            A Immerse desenvolve agentes de IA autônomos que redefinem padrões de excelência, escala
            e inovação para empresas que não aceitam operar no piloto automático.
          </motion.p>
          <motion.div
            className="mt-12 flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <MagneticButton href="#contato">
              Fale com um especialista
              <ArrowRight className="h-4 w-4" aria-hidden />
            </MagneticButton>
            <MagneticButton href="#manifesto" variant="ghost">
              Conheça nossa visão
            </MagneticButton>
          </motion.div>
        </div>
      </section>

      {/* 2. Manifesto */}
      <section id="manifesto" className="border-b border-line">
        <div className="mx-auto max-w-4xl px-6 py-28 sm:py-36">
          <Reveal>
            <p className="eyebrow text-glow-violet">Manifesto</p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="display mt-10 text-3xl leading-snug text-foreground sm:text-4xl">
              Acreditamos que a IA não veio para substituir o humano, mas para elevá-lo. Na Immerse,
              não vendemos bots.{" "}
              <span className="text-muted-foreground">
                Arquitetamos parceiros digitais que entendem a nuance, a estratégia e o valor do seu
                negócio.
              </span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* 3. Visão de impacto */}
      <section id="visao" className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-28 sm:py-36">
          <Reveal>
            <p className="eyebrow text-muted-foreground">A visão de impacto</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display mt-6 max-w-3xl text-4xl sm:text-5xl">
              Transformações, não funcionalidades.
            </h2>
          </Reveal>
          <div className="mt-16 grid gap-px border border-line lg:grid-cols-3">
            {PILARES.map((pilar, i) => (
              <Reveal key={pilar.t} delay={0.1 + i * 0.1} className="h-full">
                <article className="spotlight-card spotlight-card-hover flex h-full flex-col p-10">
                  <pilar.icon className="h-6 w-6 text-glow-cyan" strokeWidth={1.5} aria-hidden />
                  <h3 className="mt-8 text-xl font-medium tracking-tight">{pilar.t}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{pilar.d}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Prova de autoridade */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-28 sm:py-36">
          <Reveal>
            <blockquote className="display mx-auto max-w-4xl text-center text-3xl leading-snug sm:text-4xl">
              “Inovação é a capacidade de enxergar a mudança como uma oportunidade, não como uma
              ameaça.”
            </blockquote>
            <p className="eyebrow mt-8 text-center text-muted-foreground">Steve Jobs</p>
          </Reveal>

          <div className="mt-24 grid gap-px border border-line sm:grid-cols-3">
            {NUMEROS.map(([k, d], i) => (
              <Reveal
                key={k}
                delay={i * 0.1}
                className="h-full sm:border-l sm:border-line sm:first:border-l-0"
              >
                <div className="flex h-full flex-col p-10 text-center sm:text-left">
                  <p className="display text-gradient text-4xl sm:text-5xl">{k}</p>
                  <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <p className="eyebrow mt-24 text-center text-muted-foreground">
              Construído sobre um ecossistema de ponta
            </p>
            <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {ECOSISTEMA.map((nome) => (
                <li
                  key={nome}
                  className="display text-xl text-muted-foreground/70 transition-colors duration-300 hover:text-foreground sm:text-2xl"
                >
                  {nome}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* 5. O convite */}
      <section id="contato" className="relative">
        <div className="mx-auto max-w-4xl px-6 py-28 sm:py-36">
          <Reveal>
            <h2 className="display max-w-3xl text-4xl sm:text-5xl">
              O futuro não espera. <span className="text-gradient">Vamos construí-lo juntos.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
              Conte o desafio da sua operação. Nosso time responde com um caminho concreto: sem
              apresentação genérica, sem compromisso.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-16">
              <LeadForm />
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="display text-2xl text-foreground">Immerse</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Agentes de IA autônomos para empresas que pensam o futuro, hoje.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <a
              href="mailto:contato@assessoriaimmerse.com.br"
              className="transition-colors hover:text-foreground"
            >
              contato@assessoriaimmerse.com.br
            </a>
            <a
              href="https://www.linkedin.com/company/immerse-ia"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
            >
              LinkedIn
            </a>
          </div>
        </div>
        <div className="border-t border-line">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-xs text-muted-foreground/60 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Immerse. Todos os direitos reservados.</span>
            <span>Dados tratados conforme a LGPD.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
