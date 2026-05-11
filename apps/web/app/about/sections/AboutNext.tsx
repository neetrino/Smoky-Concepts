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
      className={`relative ${card.bg} flex h-[240px] flex-col justify-end rounded-[30px] p-5 text-white sm:h-[270px] lg:h-[300px] lg:rounded-[32px] lg:p-6`}
    >
      <div className="absolute right-5 top-5 h-[82px] w-[82px] sm:h-[96px] sm:w-[96px] lg:h-[112px] lg:w-[112px]">
        <Image src={card.icon} alt="" fill className="object-contain" />
      </div>
      <p className="text-[16px] font-extrabold tracking-[0.08em] sm:text-[18px] lg:text-[20px]">
        {card.tag}
      </p>
      <p className="mt-1.5 max-w-[260px] text-[13px] font-medium leading-[19px] sm:text-[14px] lg:text-[15px] lg:leading-[22px]">
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
      <div className="mx-auto max-w-[1120px] text-center">
        <h2 className="text-left text-[24px] font-extrabold sm:text-[28px] lg:text-[34px]">
          What Comes Next
        </h2>
        <div className="mt-5 space-y-3 text-[14px] font-medium leading-[23px] sm:text-[16px] lg:mt-6 lg:text-[16px] lg:leading-[24px]">
          {INTRO_PARAGRAPHS.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-9 lg:grid-cols-4 lg:gap-5">
        {NEXT_CARDS.map((card) => (
          <NextTile key={card.id} card={card} />
        ))}
      </div>

      <div className="mx-auto mt-7 max-w-[1120px] space-y-1.5 text-center text-[14px] font-medium leading-[23px] sm:text-[16px] lg:mt-8 lg:text-[16px] lg:leading-[24px]">
        <p>We build with patience. We release when the concept is complete.</p>
        <p>Every object we bring into the world is one we would carry ourselves.</p>
      </div>
    </section>
  );
}
