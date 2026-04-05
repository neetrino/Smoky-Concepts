interface HomeSectionTitleProps {
  title: string;
  /** When set, shown below `sm` with `whitespace-pre-line`; `title` is used from `sm` up (natural wrap). */
  titleMobile?: string;
  description?: string;
  centered?: boolean;
  className?: string;
  titleClassName?: string;
}

/**
 * Shared heading block for homepage sections.
 */
export function HomeSectionTitle({
  title,
  titleMobile,
  description,
  centered = true,
  className = '',
  titleClassName = '',
}: HomeSectionTitleProps) {
  const alignmentClassName = centered ? 'text-center items-center' : 'text-left items-start';
  const titleClass = `whitespace-pre-line text-[2.125rem] font-extrabold leading-[1.235] text-[#414141] sm:text-4xl sm:leading-tight ${titleClassName}`.trim();

  return (
    <div className={`flex flex-col gap-4 ${alignmentClassName} ${className}`.trim()}>
      <h2 className={titleClass} aria-label={titleMobile ? title : undefined}>
        {titleMobile ? (
          <>
            <span className="sm:hidden">{titleMobile}</span>
            <span className="hidden sm:inline">{title}</span>
          </>
        ) : (
          title
        )}
      </h2>
      {description ? (
        <p className="max-w-[52rem] whitespace-pre-line text-base font-medium leading-[1.375] text-[#414141] sm:leading-relaxed">
          {description}
        </p>
      ) : null}
    </div>
  );
}
