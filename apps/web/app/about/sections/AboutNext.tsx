import Image from 'next/image';

type NextCard = {
  readonly id: string;
  readonly bg: string;
  readonly icon: string;
  readonly tag: string;
  readonly body: string;
};

const NEXT_CARDS: readonly NextCard[] = [
  {
    id: 'now',
    bg: 'bg-[#414141]',
    icon: '/assets/about/icon-now.svg',
    tag: 'NOW',
    body: 'Smoky Covers: The ritual that started everything.',
  },
  {
    id: 'expanding',
    bg: 'bg-[#b79c75]',
    icon: '/assets/about/icon-expanding.svg',
    tag: 'EXPANDING',
    body: 'The Covers Line — money, documents, cards, laptops — wherever the first concept leads.',
  },
  {
    id: 'next',
    bg: 'bg-[#2a574f]',
    icon: '/assets/about/icon-next.svg',
    tag: 'NEXT',
    body: 'New Concepts. Different ideas. Different worlds. The same DNA.',
  },
  {
    id: 'always',
    bg: 'bg-[#122a26]',
    icon: '/assets/about/icon-always.svg',
    tag: 'ALWAYS',
    body: 'One Approach. If it is not extraordinary, it is not ready.',
  },
];

const INTRO_PARAGRAPHS: readonly string[] = [
  'Covering was the proof. The concept is limitless. We started with a simple idea — take something used every day, and make it extraordinary.',
  'Smoky Covers exist. They are held. They are lived with. The concept is real. But Smoky Concepts was never about covering alone.',
  'It is about bringing concepts to life. Covering is the first expression. What follows is different in form — but identical in standard, material, and intent. We don\u2019t ask what category comes next. We ask: what idea is ready to become something real? The answer changes. The approach does not.',
];

function NextTile({ card }: { card: NextCard }) {
  return (
    <article
      className={`relative ${card.bg} flex h-[182px] flex-col justify-end rounded-[18px] p-3 text-white sm:h-[298px] sm:rounded-[30px] sm:p-5 lg:h-[344px] lg:rounded-[34px] lg:p-6`}
    >
      <div className="absolute right-3 top-3 h-[34px] w-[34px] sm:right-5 sm:top-5 sm:h-[110px] sm:w-[110px] lg:h-[133px] lg:w-[133px]">
        <Image src={card.icon} alt="" fill className="object-contain" />
      </div>
      <p className="text-[22px] font-extrabold tracking-[0.08em] sm:text-[18px] lg:text-[21px]">
        {card.tag}
      </p>
      <p className="mt-1 max-w-[150px] text-[11px] font-semibold leading-[15px] sm:mt-1.5 sm:max-w-[280px] sm:text-[14px] sm:leading-[19px] lg:text-[16px] lg:leading-[22px]">
        {card.body}
      </p>
    </article>
  );
}

/**
 * "What Comes Next" intro + four tiles.
 * Mirrors Figma node 6466:346.
 */
export function AboutNext() {
  return (
    <section className="mt-16 text-[#414141] lg:mt-[110px]">
      <div className="mx-auto max-w-[1260px] text-left lg:text-center">
        <h2 className="text-left text-[22px] font-extrabold tracking-[-0.02em] sm:text-[24px] lg:text-[30px] lg:text-center">
          What Comes Next
        </h2>
        <div className="mt-3 max-w-[1180px] space-y-1.5 text-left text-[12px] font-bold leading-[20px] tracking-[-0.01em] sm:mt-5 sm:space-y-2.5 sm:text-[14px] sm:leading-[22px] lg:mx-auto lg:mt-6 lg:text-center lg:text-[15px] lg:font-semibold lg:leading-[23px]">
          {INTRO_PARAGRAPHS.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-6 grid max-w-[1260px] grid-cols-2 gap-3 sm:mt-7 sm:gap-4 lg:mt-9 lg:grid-cols-4 lg:gap-6">
        {NEXT_CARDS.map((card) => (
          <NextTile key={card.id} card={card} />
        ))}
      </div>

      <div className="mx-auto mt-6 max-w-[1260px] space-y-1 text-left text-[12px] font-bold leading-[20px] sm:mt-7 sm:space-y-1.5 sm:text-[15px] sm:leading-[23px] lg:mt-8 lg:text-center lg:text-[15px] lg:font-semibold lg:leading-[23px]">
        <p>We build with patience. We release when the concept is complete.</p>
        <p>Every object we bring into the world is one we would carry ourselves.</p>
      </div>
    </section>
  );
}
