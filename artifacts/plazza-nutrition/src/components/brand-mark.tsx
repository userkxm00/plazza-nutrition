type BrandMarkProps = {
  className?: string;
  showName?: boolean;
  inverse?: boolean;
  animated?: boolean;
  variant?: 'color' | 'mono';
  lockup?: 'fr' | 'ar';
};

/**
 * The mark has four intentional uses:
 * - color + animated: storefront entry moments on larger screens
 * - color + static: checkout and operations, where motion competes with work
 * - mono: favicon/embeds/one-colour print contexts
 * - lockup: French or Arabic wordmark, selected by the active locale
 */
export function BrandMark({ className = '', showName = false, inverse = false, animated = true, variant = 'color', lockup = 'fr' }: BrandMarkProps) {
  const monochrome = variant === 'mono';
  const square = monochrome ? 'currentColor' : inverse ? 'hsl(var(--primary))' : 'hsl(var(--secondary))';
  const ink = monochrome ? 'currentColor' : inverse ? 'hsl(var(--secondary))' : 'hsl(var(--primary))';
  const name = lockup === 'ar' ? ['بلازا', 'نيوتريشن'] : ['Plazza', 'Nutrition'];
  return (
    <span className={`brand-lockup ${inverse ? 'brand-lockup--inverse' : ''} ${className}`} aria-label={showName ? lockup === 'ar' ? 'بلازا نيوتريشن' : 'Plazza Nutrition' : undefined}>
      <svg
        className={`brand-mark ${monochrome ? 'brand-mark--mono' : ''} ${inverse ? 'brand-mark--inverse' : ''} ${animated ? 'brand-mark--animated' : 'brand-mark--static'}`}
        viewBox="0 0 100 100"
        role={showName ? 'img' : undefined}
        aria-hidden={showName ? undefined : true}
        focusable="false"
      >
        <rect
          className="brand-square"
          x="12"
          y="12"
          width="76"
          height="76"
          fill={monochrome ? 'none' : square}
          stroke={square}
          strokeWidth="2"
        />
        <path
          className="brand-p"
          d="M27 72V28h18c11 0 17 5.1 17 14.5S56 57 45 57H39v15H27Zm12-25h5.1c4.1 0 6.3-1.4 6.3-4.5S48.2 38 44.1 38H39v9Z"
          fill={ink}
        />
        <path
          className="brand-n"
          d="M58 72V28h11l10 25V28h12v44H80L70 47v25H58Z"
          fill={monochrome ? 'currentColor' : 'hsl(var(--background))'}
        />
        <path className="brand-energy" d="M22 36V22H78V78H22V64" fill="none" stroke={monochrome ? 'currentColor' : 'hsl(var(--primary))'} strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
      {showName && (
        <span className="brand-wordmark">
          <span>{name[0]}</span>
          <span>{name[1]}</span>
        </span>
      )}
    </span>
  );
}