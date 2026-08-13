import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const fullName = t("brand.full");
  return (
    <span
      className={`brand-fermi brand-fermi--${size} brand-fermi--${layout} ${className}`.trim()}
      title={`FerMI — ${fullName}`}
    >
      <span className="brand-fermi__word" aria-label={`FerMI — ${fullName}`}>
        <span className="brand-fermi__fer">Fer</span>
        <span className="brand-fermi__mi">MI</span>
      </span>
      {showFull && <span className="brand-fermi__full">{fullName}</span>}
    </span>
  );
}
