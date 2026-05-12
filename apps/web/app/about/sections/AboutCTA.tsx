import Link from 'next/link';

/**
 * "Now You Know" — large heading + closing copy and primary CTA.
 * Mirrors Figma node 6466:390.
 */
export function AboutCTA() {
  return (
    <section className="mx-auto mt-20 grid max-w-[980px] grid-cols-1 gap-4 pb-16 text-[#414141] lg:mt-[118px] lg:grid-cols-[320px_1fr] lg:items-start lg:gap-[28px] lg:pb-[92px]">
      <h2 className="text-center text-[42px] font-black leading-[0.92] tracking-[-0.025em] sm:text-[46px] lg:text-left lg:text-[68px] lg:font-extrabold">
        <span className="whitespace-nowrap lg:hidden">Now You Know</span>
        <span className="hidden lg:inline">
          Now You
          <br />
          Know
        </span>
      </h2>

      <div className="flex max-w-[520px] flex-col items-center gap-5 text-center lg:items-start lg:gap-6 lg:text-left">
        <div className="max-w-[420px] space-y-1.5 text-[14px] font-bold leading-[1.45] tracking-[-0.01em] sm:text-[15px] sm:leading-[23px] lg:max-w-[520px] lg:text-[18px] lg:font-semibold lg:leading-[30px]">
          <p>
            What you carry speaks for you. What you
            <br className="sm:hidden" />
            {' '}
            keep defines you. Make both worth it.
          </p>
          <p>
            Welcome to Smoky Concepts.
            <br className="sm:hidden" />
            {' '}
            <span className="whitespace-nowrap">We Bring Concepts to Life.</span>
          </p>
        </div>

        <Link
          href="/products"
          className="mx-auto inline-flex h-[42px] w-full max-w-[286px] items-center justify-center whitespace-nowrap rounded-[10px] bg-[#dcc090] px-5 text-[14px] font-bold tracking-[0.1em] text-[#122a26] transition-opacity hover:opacity-90 sm:text-[14px] lg:mx-0 lg:h-11 lg:max-w-[372px] lg:text-[20px] lg:font-semibold"
        >
          {'SEE WHAT WE\u2019VE BUILT'}
        </Link>
      </div>
    </section>
  );
}
