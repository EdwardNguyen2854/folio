import { Star, StarHalf } from '@phosphor-icons/react';

type StarsProps = {
  value: number;
  onChange?: (value: number) => void;
  compact?: boolean;
};

export function Stars({ value, onChange, compact = false }: StarsProps) {
  const rounded = Math.round(value * 2) / 2;

  if (!onChange) {
    return (
      <span className="inline-flex items-center gap-[2px] text-[#b8942e]" aria-label={`${rounded} out of 5`}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= rounded;
          const half = !filled && star - 0.5 === rounded;
          return (
            <span key={star} className={filled || half ? '' : 'opacity-25'}>
              {half ? <StarHalf size={16} weight="fill" /> : <Star size={16} weight={filled ? 'fill' : 'regular'} />}
            </span>
          );
        })}
        {!compact && (
          <span className="ml-[6px] text-xs text-muted">{rounded > 0 ? (rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)) : 'Unrated'}</span>
        )}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          aria-label={`${star} out of 5`}
          className={`border-0 bg-transparent p-0 cursor-pointer transition-transform duration-150 hover:scale-110 ${star <= rounded ? 'text-[#b8942e]' : 'text-faint/40'}`}
        >
          <Star size={18} weight={star <= rounded ? 'fill' : 'regular'} />
        </button>
      ))}
    </span>
  );
}
