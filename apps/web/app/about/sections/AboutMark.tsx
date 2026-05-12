import Image from 'next/image';

type Shield = {
  readonly id: string;
  readonly icon: string;
  readonly tag: string;
  readonly title: string;
  readonly body: string;
};

const SHIELDS: readonly Shield[] = [
  {
    id: 'shield',
    icon: '/assets/about/shield-1.svg',
    tag: 'Shield',
    title: 'Care. Protection',
    body:
      'Care and protection come from the same place. The form is a shield — because protection is not added. It is built into the structure.',
  },
  {
    id: 's-c',
    icon: '/assets/about/shield-2.svg',
    tag: 'S + C',
    title: 'The identity within',
    body:
      'Smoky Concepts lives inside the shield. Our ideas carry meaning — and stand protected.',
  },
  {
    id: 'crown',
    icon: '/assets/about/shield-3.svg',
    tag: 'Crown',
    title: 'Power. Standard. Identity',
    body:
      'At the top — a crown. A mark of authority and identity. Not claimed. Built in. It holds another meaning. The battlements exist to protect the crown. Everything is intentional. Nothing exists without purpose.',
  },
];

function ShieldCard({ shield }: { shield: Shield }) {
  return (
    <article className="flex flex-col items-center text-center text-[#414141]">
      <div className="relative h-[116px] w-[108px] lg:h-[128px] lg:w-[118px]">
        <Image src={shield.icon} alt="" fill className="object-contain" />
      </div>
      <p className="mt-4 text-[26px] font-extrabold leading-[1.1] sm:text-[30px] lg:text-[36px]">
        <span className="font-medium">[</span>
        <span>{` ${shield.tag} `}</span>
        <span className="font-medium">]</span>
      </p>
      <p className="text-[20px] font-extrabold leading-[1.1] sm:text-[22px] lg:text-[27px]">
        {shield.title}
      </p>
      <p className="mt-4 max-w-[380px] text-[13px] font-bold leading-[22px] sm:text-[14px] lg:text-[15px] lg:font-semibold lg:leading-[23px]">
        {shield.body}
      </p>
    </article>
  );
}

/**
 * "The Mark" — three shields explaining the logo philosophy.
 * Mirrors Figma node 6466:320.
 */
export function AboutMark() {
  return (
    <section className="mx-auto mt-16 max-w-[1500px] text-center text-[#414141] lg:mt-[110px]">
      <h2 className="text-[22px] font-extrabold sm:text-[26px] lg:text-[30px]">The Mark</h2>
      <p className="mt-2 text-[13px] font-bold leading-[22px] sm:text-[15px] lg:text-[15px] lg:font-semibold lg:leading-[23px]">
        Look at our logo and you will see everything we are.
      </p>

      <div className="mt-7 h-px w-full bg-[#cbcbcb] lg:mt-7" />

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-8 lg:grid-cols-3 lg:gap-6">
        {SHIELDS.map((shield) => (
          <ShieldCard key={shield.id} shield={shield} />
        ))}
      </div>
    </section>
  );
}
