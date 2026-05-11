import Link from 'next/link';

/**
 * "Now You Know" — large heading + closing copy and primary CTA.
 * Mirrors Figma node 6466:390.
 */
export function AboutCTA() {
  return (
    <section className="mt-14 grid grid-cols-1 gap-8 pb-16 text-[#414141] lg:mt-[100px] lg:grid-cols-[auto_1fr] lg:gap-[72px] lg:pb-[90px]">
      <h2 className="text-[34px] font-extrabold leading-[1] sm:text-[42px] lg:text-[56px] lg:leading-[1.05]">
        Now You
        <br />
        Know
      </h2>

      <div className="flex max-w-[460px] flex-col gap-5 lg:gap-8">
        <div className="space-y-1.5 text-[14px] font-medium leading-[23px] sm:text-[16px] lg:text-[16px] lg:leading-[24px]">
          <p>What you carry speaks for you. What you keep defines you. Make both worth it.</p>
          <p>Welcome to Smoky Concepts. We Bring Concepts to Life.</p>
        </div>

        <Link
          href="/products"
          className="inline-flex h-10 w-full max-w-[330px] items-center justify-center rounded-md bg-[#dcc090] px-6 text-[15px] font-medium tracking-[0.09em] text-[#122a26] transition-opacity hover:opacity-90 sm:text-[16px] lg:h-11 lg:max-w-[360px] lg:text-[18px]"
        >
          {'SEE WHAT WE\u2019VE BUILT'}
        </Link>
      </div>
    </section>
  );
}
