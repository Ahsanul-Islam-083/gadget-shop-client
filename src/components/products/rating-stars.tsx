function Star({ filled, size = 14 }: { filled: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={filled ? "fill-amber-400" : "fill-neutral-300 dark:fill-neutral-700"}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function RatingStars({
  value,
  size = 14,
  className = "",
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  const rounded = Math.round(value);
  return (
    <span
      aria-label={`${value.toFixed(1)} out of 5 stars`}
      className={`inline-flex items-center gap-0.5 ${className}`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} filled={i <= rounded} size={size} />
      ))}
    </span>
  );
}