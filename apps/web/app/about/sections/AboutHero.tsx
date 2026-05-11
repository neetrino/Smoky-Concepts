import Image from 'next/image';

const HERO_BANNERS = [
  { src: '/assets/about/banner-1.png', alt: 'Premium leather rolls in earthy tones' },
  { src: '/assets/about/banner-2.png', alt: 'Studio precision tooling' },
  { src: '/assets/about/banner-3.png', alt: 'Smoky Concepts artisan workshop' },
] as const;

const HERO_TITLE = 'We build objects with a reason to exist.';

const HERO_PARAGRAPHS: readonly string[] = [
  'Smoky Concepts is a premium accessories brand shaped by intention, precision, and material honesty. We work with leather, carbon fiber, natural wood, gold and silver hardware — and anything else the concept demands. There is no fixed palette. There is only the right choice.',
  'We don\u2019t create to fill categories. We create to define them.',
  'Every object begins with a single question: what should it feel like in the hand, how should it be carried, what should it say without words?',
  'The answer defines everything — form, material, balance, weight, and presence.',
  'We build with clarity. We release with purpose.',
];

/**
 * Hero — three vertical banners on the left, white "ritual" card on the right.
 * Mirrors Figma node 6466:286 (1680 × 648 desktop block).
 */
export function AboutHero() {
  return (
    <section className="mx-auto mt-8 grid max-w-[1460px] grid-cols-1 gap-4 lg:mt-[56px] lg:grid-cols-2 lg:gap-3 xl:gap-4 lg:h-[500px]">
      <div className="grid grid-cols-3 gap-2 lg:gap-[9px]">
        {HERO_BANNERS.map((banner) => (
          <div
            key={banner.src}
            className="relative h-[200px] overflow-hidden rounded-[12px] sm:h-[280px] lg:h-[500px]"
          >
            <Image
              src={banner.src}
              alt={banner.alt}
              fill
              priority
              sizes="(min-width: 1024px) 272px, 33vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col rounded-[12px] bg-white p-5 sm:p-8 lg:rounded-[12px_28px_28px_12px] lg:p-[38px]">
        <h2 className="text-[22px] font-extrabold leading-tight text-[#414141] sm:text-[28px] lg:text-[30px]">
          {HERO_TITLE}
        </h2>
        <div className="mt-3 space-y-2.5 text-[13px] font-medium leading-[21px] text-[#414141] sm:text-[15px] lg:mt-4 lg:space-y-3 lg:text-[15px] lg:leading-[22px]">
          {HERO_PARAGRAPHS.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
