import { useEffect, useRef, useState } from "react";
import { FaXmark } from "react-icons/fa6";
import type { IconType } from "react-icons";
import "../stylesheets/filterSheet.scss";
import { useTranslation } from "../i18n";

/** Matches the CSS transition duration, so the sheet unmounts only once it has slid away. */
const CLOSE_ANIMATION_MS = 220;

export type FilterDefinition = {
  key: string;
  label: string;
  /** Shown under the label when the filter needs explaining, e.g. screen share. */
  description?: string;
  icon: IconType;
  active: boolean;
  onToggle: () => void;
};

type FilterSheetProps = {
  open: boolean;
  onClose: () => void;
  filters: FilterDefinition[];
  resultCount: number;
};

export function FilterSheet({ open, onClose, filters, resultCount }: FilterSheetProps) {
  const { t } = useTranslation();
  const [rendered, setRendered] = useState(false);
  const [animatedOpen, setAnimatedOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimeout = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!open) return;
    window.clearTimeout(closeTimeout.current);
    setRendered(true);
    // Mount closed first, then flip to open on the next frame so the browser
    // has something to transition from instead of jumping straight to open.
    const raf = requestAnimationFrame(() => setAnimatedOpen(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  useEffect(() => {
    if (open || !rendered) return;
    setAnimatedOpen(false);
    closeTimeout.current = window.setTimeout(() => setRendered(false), CLOSE_ANIMATION_MS);
  }, [open, rendered]);

  useEffect(() => {
    if (!animatedOpen) return;
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [animatedOpen, onClose]);

  useEffect(() => () => window.clearTimeout(closeTimeout.current), []);

  if (!rendered) return null;

  return (
    <div className={`filter-sheet-overlay${animatedOpen ? " is-open" : ""}`} onClick={onClose}>
      <div
        className="filter-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={t.catalogue.filtersButton}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="filter-sheet__handle" aria-hidden="true" />
        <div className="filter-sheet__header">
          <h2>{t.catalogue.filtersButton}</h2>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label={t.howItWorks.close}
            className="filter-sheet__close"
            onClick={onClose}
          >
            <FaXmark />
          </button>
        </div>

        {filters.map(({ key, label, description, icon: Icon, active, onToggle }) => (
          <button
            key={key}
            type="button"
            className={`filter-sheet__row${active ? " filter-sheet__row--active" : ""}${
              description ? " filter-sheet__row--with-description" : ""
            }`}
            onClick={onToggle}
          >
            <Icon className="filter-sheet__row-icon" />
            <span className="filter-sheet__row-text">
              <span className="filter-sheet__row-label">{label}</span>
              {description && (
                <span className="filter-sheet__row-description">{description}</span>
              )}
            </span>
            <span className="filter-sheet__checkbox">
              {active && <FaXmark className="filter-sheet__check" />}
            </span>
          </button>
        ))}

        <button type="button" className="filter-sheet__submit" onClick={onClose}>
          {t.catalogue.showResults(resultCount)}
        </button>
      </div>
    </div>
  );
}
