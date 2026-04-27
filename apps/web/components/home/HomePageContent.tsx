'use client';

import Image from 'next/image';
import Link from 'next/link';

import { HomeActionButton } from './HomeActionButton';
import { CultureVotingSection } from './CultureVotingSection';
import { HomeHeroSection } from './HomeHeroSection';
import { HomeSectionTitle } from './HomeSectionTitle';
import {
  HOME_ASSET_PATHS,
  PACK_FIT_ITEMS,
  RITUAL_STEPS,
  UPCOMING_LINES,
} from './homePage.data';
import { TrendingFeaturedSection } from './TrendingFeaturedSection';
import { UpcomingProductsSection } from '@/components/home/UpcomingProductsSection';
import type { HomeCoverCollectionItem } from './homePage.types';
import type { HomeHeroSlide } from '@/lib/types/home-hero.types';
import { useTranslation } from '@/lib/i18n-client';

function PackFitCard({
  title,
  subtitle,
  heightClassName,
  widthClassName,
  useCompactImage,
}: (typeof PACK_FIT_ITEMS)[number]) {
  return (
    <div className="flex shrink-0 snap-center flex-col items-center gap-3">
      <div className={`relative flex items-end justify-center ${heightClassName} ${widthClassName}`}>
        {useCompactImage ? (
          <>
            <Image
              src={HOME_ASSET_PATHS.compactPack}
              alt={title}
              fill
              className="object-contain"
              sizes="144px"
            />
            <img
              src={HOME_ASSET_PATHS.packMark}
              alt=""
              className="absolute left-1/2 top-[62%] h-8 w-7 -translate-x-1/2 -translate-y-1/2 object-contain opacity-90"
              aria-hidden="true"
            />
          </>
        ) : (
          <div className={`relative overflow-hidden rounded-b-[0.25rem] rounded-t-[0.25rem] bg-[#731818] ${heightClassName} ${widthClassName}`}>
            <div className="h-[28%] rounded-t-[0.25rem] border-b-2 border-white/80 bg-[#731818]" />
            <img
              src={HOME_ASSET_PATHS.packMark}
              alt=""
              className="absolute left-1/2 top-[58%] h-8 w-7 -translate-x-1/2 -translate-y-1/2 object-contain opacity-90"
              aria-hidden="true"
            />
          </div>
        )}
      </div>
      <div className="flex min-h-[2.75rem] flex-col justify-end text-center">
        <h3 className="text-xs font-extrabold leading-none text-[#414141]">{title}</h3>
        {subtitle ? <p className="mt-1 text-[0.5rem] font-medium text-black">{subtitle}</p> : null}
      </div>
    </div>
  );
}

interface UpcomingLineCardProps {
  title: string;
  imageSrc: string;
  emphasizeImage?: boolean;
  /** Pushes the product image lower inside/over the card (e.g. Notebooks in Figma). */
  imageNudgeDown?: boolean;
  /** Slightly larger Keys artwork, nudged right and down (Figma alignment). */
  imageKeysLayout?: boolean;
  /** Larger Phones artwork, nudged up (less top offset via translate). */
  imagePhonesLayout?: boolean;
  /** Smaller Knifes artwork vs default emphasized cards. */
  imageKnifesLayout?: boolean;
  /** Documents: more `top` + gentler float so the image clears the title. */
  imageDocumentsLayout?: boolean;
}

function UpcomingLineCard({
  title,
  imageSrc,
  emphasizeImage = false,
  imageNudgeDown = false,
  imageKeysLayout = false,
  imagePhonesLayout = false,
  imageKnifesLayout = false,
  imageDocumentsLayout = false,
}: UpcomingLineCardProps) {
  const imageFrameClassName = !emphasizeImage
    ? imageDocumentsLayout
      ? 'pointer-events-none absolute left-1/2 top-3 h-24 w-24 origin-bottom -translate-x-1/2 -translate-y-[26%] sm:top-4 sm:h-36 sm:w-36 sm:-translate-y-[24%] xl:top-5 xl:h-44 xl:w-44 xl:-translate-y-[28%]'
      : 'pointer-events-none absolute left-1/2 top-0 h-24 w-24 origin-bottom -translate-x-1/2 -translate-y-[36%] sm:h-36 sm:w-36 sm:-translate-y-[36%] xl:h-44 xl:w-44 xl:-translate-y-[40%]'
    : imageNudgeDown
      ? 'pointer-events-none absolute left-1/2 top-2 h-28 w-28 origin-bottom -translate-x-1/2 -translate-y-[28%] sm:top-4 sm:h-40 sm:w-40 sm:-translate-y-[24%] xl:top-5 xl:h-48 xl:w-48 xl:-translate-y-[28%]'
      : imageKeysLayout
        ? 'pointer-events-none absolute left-[57%] top-0 h-32 w-32 origin-bottom -translate-x-1/2 -translate-y-[32%] sm:left-[56%] sm:top-0 sm:h-44 sm:w-44 sm:-translate-y-[30%] xl:left-[56%] xl:top-0 xl:h-[13.25rem] xl:w-[13.25rem] xl:-translate-y-[34%]'
        : imagePhonesLayout
          ? 'pointer-events-none absolute left-1/2 top-4 h-44 w-44 origin-bottom -translate-x-1/2 -translate-y-[30%] sm:top-5 sm:h-56 sm:w-56 sm:-translate-y-[26%] xl:top-6 xl:h-[18rem] xl:w-[18rem] xl:-translate-y-[30%]'
          : imageKnifesLayout
            ? 'pointer-events-none absolute left-[68%] top-1.5 h-24 w-24 origin-bottom -translate-x-1/2 -translate-y-[24%] sm:left-[68%] sm:top-2 sm:h-32 sm:w-32 sm:-translate-y-[22%] xl:left-[68%] xl:top-2.5 xl:h-40 xl:w-40 xl:-translate-y-[26%]'
            : 'pointer-events-none absolute left-1/2 top-0 h-28 w-28 origin-bottom -translate-x-1/2 -translate-y-[40%] sm:h-40 sm:w-40 sm:-translate-y-[38%] xl:h-48 xl:w-48 xl:-translate-y-[42%]';
  const imageSizes = imagePhonesLayout
    ? '(max-width: 640px) 160px, (max-width: 1280px) 224px, 288px'
    : imageKeysLayout
      ? '(max-width: 640px) 112px, (max-width: 1280px) 176px, 212px'
      : imageKnifesLayout
        ? '(max-width: 640px) 88px, (max-width: 1280px) 128px, 160px'
        : '(max-width: 640px) 96px, (max-width: 1280px) 160px, 192px';
  const imageClassName = emphasizeImage
    ? 'object-contain object-center [filter:blur(1px)_brightness(1.02)_drop-shadow(0_10px_16px_rgba(18,42,38,0.16))] sm:[filter:blur(2px)_brightness(0.95)_drop-shadow(0_12px_22px_rgba(18,42,38,0.18))]'
    : imageDocumentsLayout
      ? 'object-contain object-center origin-center rotate-[19deg] [filter:blur(1.5px)_brightness(1.03)_drop-shadow(0_8px_14px_rgba(18,42,38,0.12))] sm:[filter:blur(3px)_brightness(0.95)_drop-shadow(0_10px_20px_rgba(18,42,38,0.16))]'
      : 'object-contain object-center [filter:blur(1.5px)_brightness(1.03)_drop-shadow(0_8px_14px_rgba(18,42,38,0.12))] sm:[filter:blur(3px)_brightness(0.95)_drop-shadow(0_10px_20px_rgba(18,42,38,0.16))]';

  return (
    <div className="relative flex h-full flex-col overflow-visible pt-6 sm:pt-8">
      <div className="relative flex min-h-[7.6rem] flex-1 flex-col justify-end rounded-[1.2rem] bg-[#f3f3f3] px-3 pb-2.5 pt-10 sm:min-h-[11.5rem] sm:rounded-[2rem] sm:bg-white sm:px-6 sm:pb-6 sm:pt-14 xl:min-h-0">
        <div className={imageFrameClassName}>
          <Image
            src={imageSrc}
            alt={title}
            fill
            className={imageClassName}
            sizes={imageSizes}
          />
        </div>
        <h3 className="text-[1.25rem] font-extrabold leading-none text-[#36373a] sm:text-3xl">{title}</h3>
      </div>
    </div>
  );
}

/**
 * Full static homepage assembled from Figma-derived assets.
 */
interface HomePageContentProps {
  coverCollections: HomeCoverCollectionItem[];
  heroSlides: HomeHeroSlide[];
}

export function HomePageContent({ coverCollections, heroSlides }: HomePageContentProps) {
  const { t } = useTranslation();
  const upcomingLineOrder: Record<string, number> = {
    Phones: 0,
    Notebooks: 1,
    Knifes: 2,
    Keys: 3,
    Documents: 4,
    Wallets: 5,
  };
  const orderedUpcomingLines = [...UPCOMING_LINES].sort((a, b) => {
    const aOrder = upcomingLineOrder[a.title] ?? Number.MAX_SAFE_INTEGER;
    const bOrder = upcomingLineOrder[b.title] ?? Number.MAX_SAFE_INTEGER;
    return aOrder - bOrder;
  });
  const packFitKeyByIndex = ['ultraSlims', 'compact', 'superSlims', 'slims', 'kingSize', 'sticks'] as const;
  const ritualStepKeys = ['apply', 'consultation', 'designAndMaterials', 'packagingAndDelivery'] as const;
  const upcomingLineKeyByTitle: Record<string, string> = {
    Notebooks: 'notebooks',
    Knifes: 'knifes',
    Phones: 'phones',
    Wallets: 'wallets',
    Documents: 'documents',
    Keys: 'keys',
  };
  const upcomingLineByTitle: Record<string, (typeof UPCOMING_LINES)[number]> = Object.fromEntries(
    UPCOMING_LINES.map((it) => [it.title, it]),
  );
  const renderUpcomingLineCard = (lineTitle: string) => {
    const item = upcomingLineByTitle[lineTitle];
    if (!item) return null;
    return (
      <UpcomingLineCard
        {...item}
        emphasizeImage={
          item.title === 'Notebooks' ||
          item.title === 'Knifes' ||
          item.title === 'Phones' ||
          item.title === 'Keys' ||
          item.title === 'Wallets'
        }
        imageNudgeDown={item.title === 'Notebooks'}
        imageKeysLayout={item.title === 'Keys'}
        imagePhonesLayout={item.title === 'Phones'}
        imageKnifesLayout={item.title === 'Knifes'}
        imageDocumentsLayout={item.title === 'Documents'}
        title={t(`home.homepage.upcomingLines.cards.${upcomingLineKeyByTitle[item.title] ?? 'documents'}`)}
      />
    );
  };

  return (
    <div className="overflow-x-hidden overflow-y-hidden bg-[#efefef] text-[#414141]">
      <div className="mx-auto flex max-w-[120rem] flex-col gap-16 overflow-x-hidden overflow-y-hidden px-6 pb-20 pt-8 sm:gap-24 sm:px-8 sm:pb-24 sm:pt-10 lg:px-[7.5rem]">
        <section className="flex flex-col gap-8 sm:gap-10">
          <HomeSectionTitle
            title={t('home.homepage.hero.title')}
            titleMobile={t('home.homepage.hero.titleMobile')}
            descriptionEmphasis={{
              lead: t('home.homepage.hero.tagline.lead'),
              bold1: t('home.homepage.hero.tagline.bold1'),
              mid: t('home.homepage.hero.tagline.mid'),
              bold2: t('home.homepage.hero.tagline.bold2'),
              tail: t('home.homepage.hero.tagline.tail'),
            }}
          />
          <HomeHeroSection slides={heroSlides} />
        </section>

        <section className="-mt-10 flex flex-col gap-8 pb-8 sm:-mt-12 sm:gap-10 sm:pb-10">
          <HomeSectionTitle
            title={t('home.homepage.packFit.title')}
            description={t('home.homepage.packFit.description')}
          />
          <div className="sm:hidden">
            <div className="-mx-6 overflow-x-auto px-6 pb-2 scrollbar-hide">
              <div className="flex min-w-max snap-x snap-mandatory items-end gap-x-6">
                {PACK_FIT_ITEMS.map((item, index) => (
                  <PackFitCard
                    key={item.title}
                    {...item}
                    title={t(`home.homepage.packFit.items.${packFitKeyByIndex[index]}.title`)}
                    subtitle={
                      packFitKeyByIndex[index] === 'kingSize' ||
                      packFitKeyByIndex[index] === 'sticks'
                        ? ''
                        : t(`home.homepage.packFit.items.${packFitKeyByIndex[index]}.subtitle`)
                    }
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="hidden flex-wrap items-end justify-center gap-x-6 gap-y-6 sm:flex">
            {PACK_FIT_ITEMS.map((item, index) => (
              <PackFitCard
                key={item.title}
                {...item}
                title={t(`home.homepage.packFit.items.${packFitKeyByIndex[index]}.title`)}
                subtitle={
                  packFitKeyByIndex[index] === 'kingSize' ||
                  packFitKeyByIndex[index] === 'sticks'
                    ? ''
                    : t(`home.homepage.packFit.items.${packFitKeyByIndex[index]}.subtitle`)
                }
              />
            ))}
          </div>
          <div className="flex justify-center pt-1 sm:pt-2">
            <HomeActionButton
              href="/products"
              label={t('home.homepage.packFit.cta')}
              className="min-w-[19rem] font-semibold sm:font-black"
            />
          </div>
        </section>

        {coverCollections.length > 0 ? (
          <section className="flex flex-col gap-8 overflow-visible pt-3 sm:gap-10 sm:pt-6">
            <HomeSectionTitle
              title={t('home.homepage.coverCollections.title')}
              className="-translate-y-6 sm:-translate-y-8"
            />
            <div className="mt-12 grid grid-cols-2 items-start gap-x-2 gap-y-20 overflow-visible sm:mt-0 sm:grid-cols-4 sm:gap-8">
              {coverCollections.map((item) => (
                <Link
                  key={item.slug}
                  href={`/products?category=${item.slug}`}
                  className="group relative z-0 mt-5 -translate-y-2 flex min-h-0 w-full min-w-0 justify-self-center flex-col overflow-visible rounded-[1rem] bg-transparent px-2.5 pb-1 pt-0 shadow-[0_6px_24px_rgba(18,42,38,0.05)] transition-shadow duration-200 hover:z-10 hover:shadow-[0_12px_32px_rgba(18,42,38,0.12)] focus-visible:z-10 focus-within:z-10 sm:mt-8 sm:w-full sm:translate-y-0 sm:rounded-[2rem] sm:bg-white sm:px-6 sm:pb-8"
                >
                  <div className="relative -mt-16 translate-y-2 h-44 w-[94%] self-center shrink-0 overflow-visible sm:-mt-28 sm:translate-y-0 sm:h-[22rem] sm:w-full">
                    {item.imageSrc ? (
                      <img
                        src={item.imageSrc}
                        alt={item.title}
                        className="h-full w-full origin-bottom object-contain object-top transition-transform duration-300 ease-out translate-y-10 scale-x-[1.92] scale-y-[1.72] sm:translate-y-[8.25rem] sm:scale-x-[1.45] sm:scale-y-[1.42] sm:group-hover:translate-y-[7.75rem] sm:group-hover:scale-x-[1.55] sm:group-hover:scale-y-[1.52]"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <img
                          src={HOME_ASSET_PATHS.packMark}
                          alt=""
                          className="h-20 w-16 origin-bottom object-contain opacity-60 transition-transform duration-300 ease-out scale-x-[1.34] scale-y-[1.2] sm:h-24 sm:w-[4.5rem] sm:group-hover:-translate-y-2 sm:group-hover:scale-[1.3]"
                          aria-hidden="true"
                        />
                      </div>
                    )}
                  </div>
                  <h3
                    className={`mt-6 text-lg font-black leading-tight text-[#414141] sm:mt-12 sm:text-2xl lg:text-3xl ${
                      item.slug === 'special-edition' ? 'line-clamp-1 whitespace-nowrap' : 'line-clamp-2'
                    }`}
                  >
                    {item.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="flex flex-col gap-8 sm:gap-10">
          <HomeSectionTitle
            title={t('home.homepage.ritual.title')}
            descriptionTwoLine={{
              line1Bold: t('home.homepage.ritual.description.line1Bold'),
              line1Rest: t('home.homepage.ritual.description.line1Rest'),
              line2: t('home.homepage.ritual.description.line2'),
            }}
            titleClassName="sm:whitespace-normal !font-black"
          />
          <div className="overflow-hidden rounded-[1.5rem] sm:rounded-[2.25rem]">
            <div className="relative h-[24rem] sm:h-[30rem]">
              <Image src={HOME_ASSET_PATHS.ritualBanner} alt={t('home.homepage.ritual.bannerAlt')} fill className="object-cover" sizes="1680px" />
            </div>
          </div>
          <div className="-mt-5 rounded-[1.5rem] rounded-t-xl bg-white px-5 pb-6 pt-5 font-montserrat shadow-[0_8px_30px_rgba(18,42,38,0.06)] sm:-mt-7 sm:rounded-[2.25rem] sm:px-8 sm:pb-7 sm:pt-6">
            <div className="grid gap-6 xl:grid-cols-4">
              {RITUAL_STEPS.map((step, index) => (
                <div
                  key={step.step}
                  className={`flex gap-3 ${index < RITUAL_STEPS.length - 1 ? 'xl:border-r xl:border-[#eeeeee] xl:pr-6' : ''}`}
                >
                  <span className="shrink-0 text-5xl font-bold leading-none tracking-tight text-[#dcc49a] sm:text-6xl">
                    {step.step}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <h3 className="text-base font-bold leading-snug text-[#333333] sm:text-lg">
                      {t(`home.homepage.ritual.steps.${ritualStepKeys[index]}.title`)}
                    </h3>
                    <p className="mt-0.5 text-xs font-normal leading-relaxed text-[#333333] sm:text-sm">
                      {t(`home.homepage.ritual.steps.${ritualStepKeys[index]}.description`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-start sm:mt-6 lg:justify-center">
              <HomeActionButton href="/contact" label={t('home.homepage.ritual.cta')} className="font-semibold" />
            </div>
          </div>
        </section>

        <TrendingFeaturedSection />

        <section className="grid gap-y-6 sm:gap-y-8 lg:gap-x-2 lg:grid-cols-[minmax(0,1.28fr)_minmax(30rem,33.5rem)_minmax(0,1.28fr)]">
          <div className="relative min-h-[20.5rem] overflow-hidden rounded-t-[2rem] rounded-b-[1rem] sm:min-h-[32rem] sm:rounded-[2rem] lg:rounded-r-[0.625rem]">
            <Image src={HOME_ASSET_PATHS.craftTools} alt={t('home.homepage.bringing.imageAltLeft')} fill className="object-cover object-left" sizes="472px" />
          </div>
          <div className="flex h-full min-h-[23rem] flex-col bg-[#f2f2f2] px-5 py-7 shadow-[0_8px_30px_rgba(18,42,38,0.08)] sm:min-h-[32rem] sm:px-8 sm:py-9 lg:px-9 rounded-[1.5rem] sm:rounded-[1rem]">
            <h2 className="max-w-[20rem] whitespace-pre-line text-[1.82rem] font-black leading-[1.04] tracking-[-0.01em] text-[#434347] sm:text-[2.4rem]">
              {t('home.homepage.bringing.title')}
            </h2>
            <div className="mt-5 space-y-4 text-[0.84rem] font-semibold leading-[1.48] text-[#434347] sm:mt-7 sm:space-y-5 sm:text-[0.95rem] sm:leading-[1.48] lg:text-[1rem]">
              <p>{t('home.homepage.bringing.paragraphs.first')}</p>
              <p>{t('home.homepage.bringing.paragraphs.second')}</p>
              <p>{t('home.homepage.bringing.paragraphs.third')}</p>
              <p>
                {t('home.homepage.bringing.paragraphs.fourthPrefix')}{' '}
                <Link
                  href="/about"
                  className="text-[#dcc090] underline-offset-2 transition-opacity hover:opacity-90 hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dcc090]"
                >
                  {t('home.homepage.bringing.moreLabel')}
                </Link>
              </p>
              <p>{t('home.homepage.bringing.paragraphs.fifth')}</p>
            </div>
          </div>
          <div className="relative hidden min-h-[20.5rem] overflow-hidden rounded-t-[2rem] rounded-b-[1rem] sm:min-h-[32rem] sm:rounded-[2rem] lg:block lg:rounded-l-[0.625rem]">
            <Image src={HOME_ASSET_PATHS.craftTools} alt={t('home.homepage.bringing.imageAltRight')} fill className="object-cover object-right" sizes="472px" />
          </div>
        </section>

        <UpcomingProductsSection />

        <section className="flex flex-col gap-6 sm:gap-7">
          <div className="mx-auto w-full max-w-4xl">
            <HomeSectionTitle
              title={t('home.homepage.behindCreation.title')}
              description={t('home.homepage.behindCreation.description')}
              className="gap-3 [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_p]:text-sm [&_p]:sm:text-base"
            />
            <div className="relative mt-4 sm:mt-5">
              <div className="overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]">
                <div className="relative h-[170.812px] sm:h-[26rem] lg:h-[28rem]">
                  <Image
                    src="/assets/home/concepts/behind-creation.png"
                    alt={t('home.homepage.behindCreation.imageAlt')}
                    fill
                    className="object-cover"
                    sizes="(max-width: 896px) 100vw, 896px"
                  />
                  <div className="absolute inset-0 bg-black/15" />
                </div>
              </div>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  className="pointer-events-auto flex min-h-[4rem] min-w-[4rem] items-center justify-center rounded-full bg-transparent p-2 transition-transform hover:scale-105 sm:min-h-[6rem] sm:min-w-[6rem] sm:p-4"
                >
                  <img
                    src={HOME_ASSET_PATHS.youtubeIcon}
                    alt={t('home.homepage.behindCreation.youtubeAlt')}
                    className="h-10 w-10 max-h-none max-w-none object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] sm:h-16 sm:w-16"
                  />
                </button>
              </div>
            </div>
            <div className="mt-4 flex justify-center sm:mt-5">
              <HomeActionButton href="/about" label={t('home.homepage.behindCreation.cta')} />
            </div>
          </div>
        </section>

        <CultureVotingSection />

        <section className="grid gap-8 overflow-visible sm:gap-10 xl:grid-cols-[minmax(0,32rem)_minmax(0,1fr)]">
          <div className="flex flex-col justify-center gap-6 sm:gap-8">
            <HomeSectionTitle
              title={t('home.homepage.upcomingLines.title')}
              description={t('home.homepage.upcomingLines.description')}
              centered={false}
              className="gap-4 text-center sm:gap-5 sm:text-left [&_h2]:text-[2.125rem] [&_h2]:leading-[1.18] [&_h2]:sm:text-6xl [&_p]:text-sm [&_p]:sm:text-base [&_p]:leading-relaxed"
            />
            <HomeActionButton
              href="/contact"
              label={t('home.homepage.upcomingLines.cta')}
              className="mx-auto hidden w-fit !rounded-xl sm:inline-flex sm:mx-0"
            />
          </div>
          <div className="overflow-visible pt-3 sm:pt-10">
            <div className="grid grid-cols-2 gap-x-3 gap-y-3 sm:gap-x-4 sm:gap-y-10 xl:hidden">
              {orderedUpcomingLines.map((item) => (
                <UpcomingLineCard
                  key={item.title}
                  {...item}
                  emphasizeImage={
                    item.title === 'Notebooks' ||
                    item.title === 'Knifes' ||
                    item.title === 'Phones' ||
                    item.title === 'Keys' ||
                    item.title === 'Wallets'
                  }
                  imageNudgeDown={item.title === 'Notebooks'}
                  imageKeysLayout={item.title === 'Keys'}
                  imagePhonesLayout={item.title === 'Phones'}
                  imageKnifesLayout={item.title === 'Knifes'}
                  imageDocumentsLayout={item.title === 'Documents'}
                  title={t(`home.homepage.upcomingLines.cards.${upcomingLineKeyByTitle[item.title] ?? 'documents'}`)}
                />
              ))}
            </div>
            <div className="hidden xl:grid xl:h-[26rem] xl:w-full xl:grid-cols-3 xl:gap-x-4 2xl:h-[30rem]">
              <div className="grid h-full xl:[grid-template-rows:350fr_32fr_186fr]">
                {renderUpcomingLineCard('Notebooks')}
                <div aria-hidden="true" />
                {renderUpcomingLineCard('Wallets')}
              </div>
              <div className="grid h-full xl:[grid-template-rows:234fr_32fr_302fr]">
                {renderUpcomingLineCard('Knifes')}
                <div aria-hidden="true" />
                {renderUpcomingLineCard('Documents')}
              </div>
              <div className="grid h-full xl:[grid-template-rows:350fr_32fr_186fr]">
                {renderUpcomingLineCard('Phones')}
                <div aria-hidden="true" />
                {renderUpcomingLineCard('Keys')}
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-center sm:hidden">
          <HomeActionButton
            href="/contact"
            label={t('home.homepage.upcomingLines.cta')}
            className="w-fit !rounded-xl"
          />
        </div>

        <section className="flex flex-col items-center gap-8">
          <HomeSectionTitle
            title={t('home.homepage.sayHi.title')}
            description={t('home.homepage.sayHi.description')}
          />
          <HomeActionButton
            href="/contact"
            label={t('home.homepage.sayHi.cta')}
            className="min-w-[13.75rem] !min-h-11 sm:!min-h-12 font-semibold"
          />
        </section>
      </div>
    </div>
  );
}
