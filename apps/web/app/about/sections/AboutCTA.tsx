import Link from 'next/link';

/**
 * "Now You Know" — large heading + closing copy and primary CTA.
 * Mirrors Figma node 6466:390.
 */
export function AboutCTA() {
  return (
    <section className="mx-auto mt-16 grid max-w-[980px] grid-cols-1 gap-8 pb-16 text-[#414141] lg:mt-[118px] lg:grid-cols-[320px_1fr] lg:items-start lg:gap-[28px] lg:pb-[92px]">
      <h2 className="text-[42px] font-extrabold leading-[0.96] tracking-[-0.02em] sm:text-[52px] lg:text-[68px]">
        Now You
        <br />
        Know
      </h2>

      <div className="flex max-w-[520px] flex-col gap-4 lg:gap-6">
        <div className="space-y-1.5 text-[13px] font-semibold leading-[21px] tracking-[-0.01em] sm:text-[15px] sm:leading-[23px] lg:text-[18px] lg:leading-[30px]">
          <p>What you carry speaks for you. What you keep defines you. Make both worth it.</p>
          <p>Welcome to Smoky Concepts. We Bring Concepts to Life.</p>
        </div>

        <Link
          href="/products"
          className="inline-flex h-10 w-full max-w-[320px] items-center justify-center rounded-[8px] bg-[#dcc090] px-5 text-[13px] font-semibold tracking-[0.1em] text-[#122a26] transition-opacity hover:opacity-90 sm:text-[14px] lg:h-11 lg:max-w-[372px] lg:text-[20px]"
        >
          {'SEE WHAT WE\u2019VE BUILT'}
        </Link>
      </div>
    </section>
  );
}
