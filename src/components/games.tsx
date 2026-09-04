import { useState } from "react";
import {
  FaDisplay,
  FaMagnifyingGlass,
  FaMobileScreenButton,
  FaPeopleGroup,
  FaSliders,
  FaUser,
  FaUserSecret,
  FaUserSlash,
  FaXmark,
} from "react-icons/fa6";
import { Game, type GameTag } from "./game";
import { FilterSheet, type FilterDefinition } from "./filterSheet";
import { games, gamesForPlayerCount, playerRangeShort, type Game as GameData } from "../games";
import "../App.scss";
import "../stylesheets/games.scss";
import "../stylesheets/search.scss";
import { useTranslation } from "../i18n";
import type { Translation } from "../i18n";

function buildTags(game: GameData, t: Translation): GameTag[] {
  const tags: GameTag[] = [];
  if (game.solo) tags.push({ icon: FaUser, label: t.catalogue.tagSolo });
  if (game.soloWithStrangers) {
    tags.push({ icon: FaUserSecret, label: t.catalogue.tagSoloWithStrangers });
  }
  if (game.multiplayer) {
    tags.push({ icon: FaPeopleGroup, label: t.catalogue.tagMultiplayer });
  }
  if (game.screenShare) {
    tags.push({ icon: FaDisplay, label: t.catalogue.tagScreenShare });
  }
  return tags;
}

function matchesQuery(game: GameData, description: string, t: Translation, query: string): boolean {
  const haystack = [
    game.name,
    description,
    game.solo ? t.catalogue.tagSolo : "",
    game.soloWithStrangers ? t.catalogue.tagSoloWithStrangers : "",
    game.multiplayer ? t.catalogue.tagMultiplayer : "",
    game.screenShare ? t.catalogue.tagScreenShare : "",
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export function Games({ players }: { players: number }) {
  const { gameDescription, t } = useTranslation();
  const [query, setQuery] = useState("");
  const [screenShare, setScreenShare] = useState(false);
  const [mobileFriendly, setMobileFriendly] = useState(false);
  const [noAccountNeeded, setNoAccountNeeded] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filters: FilterDefinition[] = [
    {
      key: "screenShare",
      label: t.catalogue.screenShareLabel,
      description: t.catalogue.screenShareDescription,
      icon: FaDisplay,
      active: screenShare,
      onToggle: () => setScreenShare((value) => !value),
    },
    {
      key: "mobileFriendly",
      label: t.catalogue.mobileFriendly,
      icon: FaMobileScreenButton,
      active: mobileFriendly,
      onToggle: () => setMobileFriendly((value) => !value),
    },
    {
      key: "noAccountNeeded",
      label: t.catalogue.noAccountNeeded,
      icon: FaUserSlash,
      active: noAccountNeeded,
      onToggle: () => setNoAccountNeeded((value) => !value),
    },
  ];
  const activeFilters = filters.filter((filter) => filter.active);

  const trimmedQuery = query.trim().toLowerCase();
  const hasQuery = trimmedQuery.length > 0;
  // Screen share is meant to surface games you wouldn't otherwise see at this
  // player count (one person hosts, everyone else just watches), so — like
  // search — it looks across the whole catalogue instead of the player-count
  // subset.
  const ignoresPlayerCount = hasQuery || screenShare;

  let list = ignoresPlayerCount ? games : gamesForPlayerCount(players);
  if (hasQuery) {
    list = list.filter((game) => matchesQuery(game, gameDescription(game.id), t, trimmedQuery));
  }
  if (screenShare) list = list.filter((game) => game.screenShare);
  if (mobileFriendly) list = list.filter((game) => game.mobileFriendly);
  if (noAccountNeeded) list = list.filter((game) => !game.accountNeeded);

  const resultLine = `${t.catalogue.resultCount(list.length)} ${
    ignoresPlayerCount ? t.catalogue.scopeAll(games.length) : t.catalogue.scopeForPlayers(players)
  }${activeFilters.length ? ` · ${activeFilters.map((filter) => filter.label).join(", ")}` : ""}`;

  return (
    <div className="catalogue">
      <label className="search">
        <FaMagnifyingGlass className="search__icon" />
        <input
          type="text"
          placeholder={t.catalogue.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {hasQuery && (
          <button
            type="button"
            aria-label={t.catalogue.clearSearch}
            className="search__clear"
            onClick={() => setQuery("")}
          >
            <FaXmark />
          </button>
        )}
      </label>

      <div className="toolbar">
        {filters.map(({ key, label, description, icon: Icon, active, onToggle }) =>
          description ? (
            <span key={key} className="filter-chip-wrap">
              <button
                type="button"
                className={`filter-chip${active ? " filter-chip--active" : ""}`}
                onClick={onToggle}
              >
                <Icon />
                {label}
                {active && <FaXmark className="filter-chip__clear" />}
              </button>
              <span role="tooltip" className="filter-tooltip">
                {description}
              </span>
            </span>
          ) : (
            <button
              key={key}
              type="button"
              className={`filter-chip${active ? " filter-chip--active" : ""}`}
              onClick={onToggle}
            >
              <Icon />
              {label}
              {active && <FaXmark className="filter-chip__clear" />}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        className={`filters-button${activeFilters.length ? " filters-button--active" : ""}`}
        onClick={() => setSheetOpen(true)}
      >
        <FaSliders />
        {t.catalogue.filtersButton}
        {activeFilters.length > 0 && (
          <span className="filters-button__count">{activeFilters.length}</span>
        )}
      </button>

      <p className="result-line">{resultLine}</p>

      {hasQuery && (
        <div className="query-banner">
          <p>{t.catalogue.searchingWholeCatalogue}</p>
          <button type="button" onClick={() => setQuery("")}>
            {t.catalogue.backTo(players)}
          </button>
        </div>
      )}

      <div className="grid">
        {list.map((game) => (
          <Game
            key={game.id}
            name={game.name}
            description={gameDescription(game.id)}
            playLink={game.link}
            playerRange={t.content.playerRange(game.minPlayers, game.maxPlayers)}
            playerRangeShort={playerRangeShort(game.minPlayers, game.maxPlayers)}
            tags={buildTags(game, t)}
          />
        ))}
        {list.length === 0 && (
          <div className="empty">
            <p className="empty__title">{t.catalogue.emptyTitle(query)}</p>
            <p className="empty__hint">{t.catalogue.emptyHint}</p>
          </div>
        )}
      </div>

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filters={filters}
        resultCount={list.length}
      />
    </div>
  );
}
