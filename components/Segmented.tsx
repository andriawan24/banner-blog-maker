export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-line lg:gap-4">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          aria-pressed={value === o}
          className={`relative -mb-px flex min-h-[44px] items-center border-b-2 px-1 text-xs capitalize transition-colors duration-short ease-out cursor-pointer lg:min-h-0 lg:px-0 lg:pb-1.5 ${
            value === o
              ? "border-accent text-fg"
              : "border-transparent text-fg-faint hover:text-fg-muted"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
