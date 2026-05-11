import Image from 'next/image';
import type { ReactNode } from 'react';

type Pillar = {
  readonly id: string;
  readonly title: ReactNode;
  readonly bg: string;
  readonly image: {
    src: string;
    alt: string;
    width: number;
    height: number;
    topOffset: string;
    hideWhiteBg?: boolean;
  };
  readonly body: ReactNode;
};

const PILLARS: readonly Pillar[] = [
  {
    id: 'first-concept',
    title: 'The First Concept',
    bg: 'bg-[#dcc090]',
    image: {
      src: '/assets/about/first-concept.png',
      alt: 'A young plant emerging from soil — the first concept',
      width: 322,
      height: 300,
      topOffset: '-top-[76px]',
      hideWhiteBg: true,
    },
    body: (
      <>
        <p>
          Every strong system starts with a clear idea.
          <br />
          Ours began with a ritual:
          <br />
          the objects people return to — again and again — without thinking, yet never without
          meaning.
        </p>
        <p>
          We call it <strong className="font-black">Covering.</strong>
        </p>
        <p>
          Our first expression is{' '}
          <strong className="font-black">Smoky Covers.</strong>
        </p>
        <p>Covers for cigarette packs — the center of the ritual.</p>
        <p>
          Extended to the objects that move with you — money, documents, cards, and beyond.
        </p>
        <p>
          These are objects you live with.
          <br />
          They should feel right.
          <br />
          They should hold their place.
          <br />
          Covering is where we began.
          <br />
          It is only the beginning.
        </p>
      </>
    ),
  },
  {
    id: 'mission',
    title: 'The Mission',
    bg: 'bg-[#95c48a]',
    image: {
      src: '/assets/about/mission.png',
      alt: 'A floating mountain — the mission',
      width: 373,
      height: 341,
      topOffset: '-top-[117px]',
      hideWhiteBg: true,
    },
    body: (
      <>
        <p>
          We work with rituals and the culture around them — bringing clarity, care, and
          meaning to what people return to.
        </p>
        <p>Our first mission begins within smoking culture.</p>
        <p>Not only for the one holding it, but for everyone around them.</p>
        <p>
          {
            'We protect you and those close to you from visual noise and what\u2019s behind it.'
          }
        </p>
        <p>This approach does not stay in one place.</p>
        <p>
          {
            'Wherever rituals exist, we look for what\u2019s missing — and introduce clarity, beauty, and meaning.'
          }
        </p>
      </>
    ),
  },
  {
    id: 'engineering',
    title: (
      <>
        When Engineering
        <br />
        Meets Craft
      </>
    ),
    bg: 'bg-[#cbcbcb]',
    image: {
      src: '/assets/about/engineering.png',
      alt: 'A precision 3D printer — engineering meets craft',
      width: 300,
      height: 338,
      topOffset: '-top-[114px]',
    },
    body: (
      <>
        <p>We grow objects layer by layer, with precision.</p>
        <p>Structure takes form — controlled, exact, uncompromised.</p>
        <p>
          {'Solutions from the nature, applied through technology, expand what\u2019s possible.'}
        </p>
        <p>In the hands of the creator, it becomes a new brush.</p>
        <p>
          Advanced materials like PETG carbon fiber bring the accuracy required — enabling
          forms beyond the limits of traditional manufacturing.
        </p>
        <p>The result is composed — balanced, intentional, complete.</p>
        <p>Technology gives us freedom.</p>
        <p>Craft gives it soul.</p>
      </>
    ),
  },
];

function PillarCard({ pillar }: { pillar: Pillar }) {
  const imageClassName = pillar.image.hideWhiteBg
    ? 'object-contain object-bottom mix-blend-multiply'
    : 'object-contain object-bottom';

  return (
    <article className="relative pt-[96px] lg:pt-[78px] xl:pt-[86px]">
      <div
        className={`relative ${pillar.bg} rounded-[30px] px-5 pb-6 pt-[168px] sm:px-6 lg:h-[510px] lg:px-6 lg:pt-[173px] xl:h-[615px] xl:w-[408px] xl:rounded-[36px] xl:px-7 xl:pt-[190px]`}
      >
        <div
          className={`pointer-events-none absolute left-1/2 hidden -translate-x-1/2 xl:block xl:scale-[0.78] ${pillar.image.topOffset}`}
          style={{ width: pillar.image.width, height: pillar.image.height }}
        >
          <Image
            src={pillar.image.src}
            alt={pillar.image.alt}
            fill
            sizes={`${pillar.image.width}px`}
            className={imageClassName}
          />
        </div>
        <div className="pointer-events-none absolute -top-[78px] left-1/2 h-[200px] w-[200px] -translate-x-1/2 sm:-top-[86px] sm:h-[230px] sm:w-[230px] xl:hidden">
          <Image
            src={pillar.image.src}
            alt={pillar.image.alt}
            fill
            sizes="300px"
            className={imageClassName}
          />
        </div>

        <h3 className="mt-3 text-center text-[22px] font-extrabold leading-tight tracking-[-0.02em] text-[#122a26] sm:mt-4 sm:text-[24px] lg:text-[26px] xl:mt-5 xl:text-[29px] xl:leading-[1.08]">
          {pillar.title}
        </h3>

        <div className="mt-3 space-y-[9px] text-[11px] font-bold leading-[1.34] tracking-[-0.01em] text-[#122a26] sm:text-[12px] lg:mt-4 lg:space-y-[10px] xl:mt-5 xl:space-y-[12px] xl:text-[13px] xl:leading-[18px]">
          {pillar.body}
        </div>
      </div>
    </article>
  );
}

/**
 * Three-up pillar cards — First Concept / Mission / Engineering.
 * Mirrors Figma node 6466:303 (1680 × 919 desktop block).
 */
export function AboutPillars() {
  return (
    <section className="mt-16 lg:mt-[92px] xl:mt-[120px]">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-9 xl:gap-[72px]">
        {PILLARS.map((pillar) => (
          <PillarCard key={pillar.id} pillar={pillar} />
        ))}
      </div>
    </section>
  );
}
