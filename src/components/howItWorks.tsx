import { useCallback, useEffect, useRef, useState } from "react";
import { FaCircleQuestion, FaXmark } from "react-icons/fa6";
import "../stylesheets/howItWorks.scss";
import { useTranslation } from "../i18n";

const PORTFOLIO_URL = "https://gregoiretinn.es";

/** Matches the CSS transition duration, so the dialog unmounts only once it has faded out. */
const CLOSE_ANIMATION_MS = 220;

export function HowItWorks() {
  const { t } = useTranslation();
  const [rendered, setRendered] = useState(false);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closeTimeout = useRef<number | undefined>(undefined);

  const show = () => {
    window.clearTimeout(closeTimeout.current);
    setRendered(true);
    // Mount closed first, then flip to open on the next frame so the browser
    // has something to transition from instead of jumping straight to open.
    requestAnimationFrame(() => setOpen(true));
  };

  const hide = useCallback(() => {
    setOpen(false);
    closeTimeout.current = window.setTimeout(() => setRendered(false), CLOSE_ANIMATION_MS);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, hide]);

  useEffect(() => () => window.clearTimeout(closeTimeout.current), []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="how-it-works-trigger"
        onClick={show}
        aria-label={t.howItWorks.trigger}
      >
        <FaCircleQuestion className="how-it-works-trigger__icon" />
        <span className="how-it-works-trigger__label">{t.howItWorks.trigger}</span>
      </button>

      {rendered && (
        <div
          className={`how-it-works-overlay${open ? " is-open" : ""}`}
          onClick={hide}
        >
          <div
            className="how-it-works-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="how-it-works-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              ref={closeRef}
              type="button"
              className="how-it-works-dialog__close"
              aria-label={t.howItWorks.close}
              onClick={hide}
            >
              <FaXmark />
            </button>
            <h2 id="how-it-works-title">{t.howItWorks.title}</h2>
            <p>
              {t.howItWorks.paragraph1.before}
              <a href={PORTFOLIO_URL} target="_blank" rel="noopener noreferrer">
                {t.howItWorks.paragraph1.linkText}
              </a>
              {t.howItWorks.paragraph1.after}
            </p>
            <p>{t.howItWorks.paragraph2}</p>
          </div>
        </div>
      )}
    </>
  );
}
