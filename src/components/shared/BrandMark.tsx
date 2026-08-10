type BrandMarkProps = {
  className?: string;
  /** Visual size of the wordmark */
  size?: "sm" | "md" | "lg";
  /** Show “Fergana Medical Institute” under the mark */
  showFull?: boolean;
  /** Stack full name under mark (nav) vs inline */
  layout?: "stack" | "inline";
};

/**
 * FerMI wordmark — Fergana Medical Institute
 */
export default function BrandMark({
  className = "",
  size = "md",
  showFull = false,
  layout = "stack",
}: BrandMarkProps) {
  return (
    <span
      className={`brand-fermi brand-fermi--${size} brand-fermi--${layout} ${className}`.trim()}
      title="FerMI — Fergana Medical Institute"
    >
      <span className="brand-fermi__word" aria-label="FerMI — Fergana Medical Institute">
        <span className="brand-fermi__fer">Fer</span>
        <span className="brand-fermi__mi">MI</span>
      </span>
      {showFull && <span className="brand-fermi__full">Fergana Medical Institute</span>}
    </span>
  );
}
