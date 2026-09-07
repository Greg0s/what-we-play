import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { FaCheck } from "react-icons/fa6";
import { TbChevronDown, TbWorld } from "react-icons/tb";
import "../stylesheets/languageSwitcher.scss";
import { LANGUAGES, LANGUAGE_NAMES, useTranslation, type Language } from "../i18n";

/** Matches the CSS transition duration, so the menu unmounts only once it has closed. */
const CLOSE_ANIMATION_MS = 180;

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation();
  const [rendered, setRendered] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimeout = useRef<number | undefined>(undefined);

  const show = () => {
    window.clearTimeout(closeTimeout.current);
    setRendered(true);
    // Mount closed first, then flip to open on the next frame so the browser
    // has something to transition from instead of jumping straight to open.
    requestAnimationFrame(() => setOpen(true));
  };

  const hide = useCallback((refocusTrigger = true) => {
    setOpen(false);
    closeTimeout.current = window.setTimeout(() => setRendered(false), CLOSE_ANIMATION_MS);
    if (refocusTrigger) triggerRef.current?.focus();
  }, []);

  const choose = (code: Language) => {
    setLanguage(code);
    hide();
  };

  useEffect(() => {
    if (!open) return;

    menuRef.current
      ?.querySelector<HTMLButtonElement>('[role="option"][aria-selected="true"]')
      ?.focus();

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") hide();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) hide(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, hide]);

  useEffect(() => () => window.clearTimeout(closeTimeout.current), []);

  const moveFocus = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const delta = event.key === "ArrowDown" ? 1 : -1;
    const next = (index + delta + LANGUAGES.length) % LANGUAGES.length;
    const options = menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]');
    options?.item(next)?.focus();
  };

  return (
    <div className="language-switcher" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        className="language-switcher__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.language.label}
        onClick={() => (open ? hide() : show())}
      >
        <TbWorld className="language-switcher__icon" />
        <span className="language-switcher__label">{LANGUAGE_NAMES[language]}</span>
        <TbChevronDown className="language-switcher__chevron" />
      </button>

      {rendered && (
        <div
          ref={menuRef}
          className={`language-switcher__menu${open ? " is-open" : ""}`}
          role="listbox"
          aria-label={t.language.label}
        >
          {LANGUAGES.map((code, index) => (
            <button
              key={code}
              type="button"
              role="option"
              aria-selected={code === language}
              className={`language-switcher__option${
                code === language ? " is-selected" : ""
              }`}
              onClick={() => choose(code)}
              onKeyDown={(event) => moveFocus(event, index)}
            >
              <span>{LANGUAGE_NAMES[code]}</span>
              {code === language && (
                <FaCheck className="language-switcher__check" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
