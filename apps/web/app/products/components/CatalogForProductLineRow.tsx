import Image from 'next/image';

/** Figma: Group 1321315375 — “For” row (Smoky Covers product line). */
const CATALOG_FOR_CIGARETTE_PACK_IMAGE = '/assets/home/products/compact-figma.svg';
const CATALOG_FOR_CIGARETTE_MARK_IMAGE = '/assets/products/catalog-for/cigarette-pack-mark.png';
const CATALOG_FOR_MONEY_IMAGE = '/assets/products/catalog-for/money-wallet.png';
const CATALOG_FOR_PHONE_CASE_IMAGE = '/assets/products/catalog-for/phone-case.png';

function CatalogForCigarettePacksCard() {
  return (
    <div className="flex h-[129px] w-[126px] shrink-0 flex-col items-center rounded-[14px] border-[3px] border-solid border-[#dcc090] bg-white px-1 pt-[10px]">
      <div className="relative h-[74px] w-[38.542px] shrink-0">
        <Image
          src={CATALOG_FOR_CIGARETTE_PACK_IMAGE}
          alt=""
          width={39}
          height={74}
          className="h-[74px] w-[39px] object-contain"
          unoptimized
        />
        <div className="pointer-events-none absolute left-[14px] top-[43px] h-[12px] w-[11px]">
          <Image
            src={CATALOG_FOR_CIGARETTE_MARK_IMAGE}
            alt=""
            width={11}
            height={12}
            className="h-[12px] w-[11px] object-contain"
            unoptimized
            aria-hidden
          />
        </div>
      </div>
      <p className="mt-auto mb-3 w-[86px] text-center text-[12px] font-medium leading-tight text-[#414141]">
        For Cigarette
        <br />
        Packs
      </p>
    </div>
  );
}

function CatalogForMoneyCard() {
  return (
    <div className="flex h-[129px] w-[126px] shrink-0 flex-col items-center rounded-[14px] bg-white/50 px-1 pt-[17px]">
      <div className="flex h-[61px] w-[90px] shrink-0 items-center justify-center">
        <div className="flex-none [transform:scaleY(-1)]">
          <div className="relative h-[61px] w-[90px] overflow-hidden blur-[2px] opacity-50">
            {/* eslint-disable-next-line @next/next/no-img-element -- Figma crop + blur match */}
            <img
              alt=""
              src={CATALOG_FOR_MONEY_IMAGE}
              className="pointer-events-none absolute left-[-38.17%] top-[-81.52%] h-[263.04%] w-[178.78%] max-w-none select-none"
              draggable={false}
            />
          </div>
        </div>
      </div>
      <p className="mt-auto mb-3 w-[86px] text-center text-[12px] font-medium leading-none text-[#414141] opacity-50">
        Money
      </p>
    </div>
  );
}

function CatalogForPhoneCasesCard() {
  return (
    <div className="flex h-[129px] w-[126px] shrink-0 flex-col items-center rounded-[14px] bg-white/50 px-1 pt-[10px]">
      <div className="relative h-[74px] w-[58px] shrink-0 overflow-hidden blur-[2px] opacity-50">
        {/* eslint-disable-next-line @next/next/no-img-element -- Figma crop + blur match */}
        <img
          alt=""
          src={CATALOG_FOR_PHONE_CASE_IMAGE}
          className="pointer-events-none absolute left-[-26.92%] top-[-10.51%] h-[119.11%] w-[151.42%] max-w-none select-none"
          draggable={false}
        />
      </div>
      <p className="mt-auto mb-3 w-[86px] text-center text-[12px] font-medium leading-none text-[#414141] opacity-50">
        Phone Cases
      </p>
    </div>
  );
}

export function CatalogForProductLineRow() {
  return (
    <div className="flex flex-wrap items-start gap-4" aria-label="Product line for">
      <CatalogForCigarettePacksCard />
      <CatalogForMoneyCard />
      <CatalogForPhoneCasesCard />
    </div>
  );
}
