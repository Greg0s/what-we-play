import { useState } from "react";
import { FaMagnifyingGlass, FaSliders, FaXmark } from "react-icons/fa6";
import { activeFilterCount, type CatalogueView, type Filters, type GenreChoice } from "../catalogue";
import { GENRES, gameLink } from "../games";
import { useTranslation } from "../i18n";
import { cardTags } from "../ui";
import { Game } from "./game";
import "../stylesheets/games.scss";

const OPTION_KEYS = ["strangers", "screenShare", "mobile", "noAccount"] as const;

/**
 * Everything under the banner: the search, the « Feel like… » genres, the
 * options and the cards. The state lives in App, because the TV reacts to it
 * and « Pick for us » draws from the same list.
 */
export function Games({
  players,
  view,
  query,
  onQuery,
  onSearchFocus,
  genre,
  onGenre,
  filters,
  onFilter,
  onResetFilters,
}: {
  players: number;
  view: CatalogueView;
  query: string;
  onQuery: (query: string) => void;
  /** The search box gained (true) or lost (false) focus: the TV looks down at it. */
  onSearchFocus: (focused: boolean) => void;
  genre: GenreChoice;
  onGenre: (genre: GenreChoice) => void;
  filters: Filters;
  onFilter: (key: keyof Filters) => void;
  onResetFilters: () => void;
}) {
  const { t, language, gameDescription } = useTranslation();
  const [optionsOpen, setOptionsOpen] = useState(false);
  const { base, list, hasQuery } = view;
  const filterCount = activeFilterCount(filters);

  const optionLabel: Record<keyof Filters, string> = {
    strangers: t.catalogue.strangers,
    screenShare: t.catalogue.screenShare,
    mobile: t.catalogue.mobileFriendly,
    noAccount: t.catalogue.noAccountNeeded,
  };

  const genreNote = genre === "all" ? "" : ` · ${t.genres[genre].band}`;
  const scope = hasQuery
    ? t.catalogue.scopeSearch(query.trim())
    : filters.screenShare
      ? t.catalogue.scopeScreenShare
      : `${t.catalogue.scopeForPlayers(players)} · ${t.catalogue.scopeFree}`;

  const chips: { key: GenreChoice; label: string; count: number }[] = [
    { key: "all", label: t.catalogue.allGenres, count: base.length },
    ...GENRES.map((key) => ({
      key,
      label: t.genres[key].chip,
      count: base.filter((game) => game.genre === key).length,
    })),
  ];

  return (
    <div className="catalogue">
      <label className="search">
        <FaMagnifyingGlass className="search__icon" aria-hidden="true" />
        <span className="sr">{t.catalogue.searchLabel}</span>
        <input
          type="text"
          placeholder={t.catalogue.searchPlaceholder}
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          onFocus={() => onSearchFocus(true)}
          onBlur={() => onSearchFocus(false)}
        />
        {query !== "" && (
          <button type="button" className="search__clear" aria-label={t.catalogue.clearSearch} onClick={() => onQuery("")}>
            <FaXmark aria-hidden="true" />
          </button>
        )}
      </label>

      <div className="genres" role="group" aria-labelledby="genres-label">
        <span id="genres-label" className="eyebrow">
          {t.catalogue.genresLabel}
        </span>
        {chips.map((chip) => {
          const on = genre === chip.key;
          return (
            <button
              key={chip.key}
              type="button"
              className={`genre${on ? " is-on" : chip.count === 0 ? " is-off" : ""}`}
              aria-pressed={on}
              onClick={() => onGenre(chip.key)}
            >
              <span className={`genre__dot gc-${chip.key}`} aria-hidden="true" />
              {chip.label}
              <span className="genre__count">{chip.count}</span>
            </button>
          );
        })}
      </div>

      <div className={`options${optionsOpen ? " is-open" : ""}`} role="group" aria-labelledby="options-label" id="options">
        <span id="options-label" className="eyebrow">
          {t.catalogue.optionsLabel}
        </span>
        {OPTION_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className={`opt${filters[key] ? " is-on" : ""}`}
            aria-pressed={filters[key]}
            onClick={() => onFilter(key)}
          >
            {optionLabel[key]}
          </button>
        ))}
        {filterCount > 0 && (
          <button type="button" className="options__reset" onClick={onResetFilters}>
            {t.catalogue.resetFilters}
          </button>
        )}
      </div>

      <div className="count">
        <div className="count__text">
          <h2>{t.catalogue.resultCount(list.length)}</h2>
          <p className="muted">
            {scope}
            {genreNote}
          </p>
        </div>
        <button
          type="button"
          className={`opt options-toggle${optionsOpen ? " is-on" : ""}`}
          aria-expanded={optionsOpen}
          aria-controls="options"
          onClick={() => setOptionsOpen((open) => !open)}
        >
          <FaSliders aria-hidden="true" />
          {t.catalogue.optionsLabel}
          {filterCount > 0 && <span className="options-toggle__count">{filterCount}</span>}
        </button>
      </div>

      <div className="grid">
        {list.map((game) => (
          <Game
            key={game.id}
            name={game.name}
            genre={game.genre}
            genreLabel={t.genres[game.genre].band}
            description={gameDescription(game.id)}
            playLink={gameLink(game, language)}
            playerRange={t.content.playerRange(game.minPlayers, game.maxPlayers)}
            tags={cardTags(game, t)}
            playLabel={t.catalogue.play}
          />
        ))}
      </div>

      {list.length === 0 && (
        <div className="empty">
          <div className="mini" aria-hidden="true">
            <span className="mini-eye l" />
            <span className="mini-eye r" />
            <span className="mini-tear" />
            <span className="glare" />
          </div>
          <p className="empty__title">{hasQuery ? t.catalogue.emptyTitle(query.trim()) : t.catalogue.emptyFilters}</p>
          <p className="empty__hint">{t.catalogue.emptyHint}</p>
          {filterCount > 0 && (
            <button type="button" className="b-btn empty__reset" onClick={onResetFilters}>
              {t.catalogue.resetFilters}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
