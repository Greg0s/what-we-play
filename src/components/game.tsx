import { FaUsers } from "react-icons/fa6";
import { TbArrowUpRight } from "react-icons/tb";
import type { Game as GameData } from "../games";
import type { CardTag } from "../ui";

function faviconUrl(link: string) {
  const { hostname } = new URL(link);
  return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
}

export function Game({
  name,
  genre,
  genreLabel,
  description,
  playLink,
  playerRange,
  tags,
  playLabel,
}: {
  name: string;
  genre: GameData["genre"];
  genreLabel: string;
  description: string;
  playLink: string;
  playerRange: string;
  tags: CardTag[];
  playLabel: string;
}) {
  return (
    <a target="_blank" rel="noopener" href={playLink} className="game">
      <span className={`game__band gc-${genre}`}>
        <span className="game__genre">{genreLabel}</span>
        <span className="game__range">
          <FaUsers aria-hidden="true" />
          {playerRange}
        </span>
      </span>
      <span className="game__body">
        <span className="game__head">
          <span className="game__fav">
            <img className="game__favicon" src={faviconUrl(playLink)} alt="" loading="lazy" width="24" height="24" />
          </span>
          <h3>{name}</h3>
        </span>
        <span className="game__desc">{description}</span>
        <span className="game__meta">
          {tags.map((tag) => (
            <span key={tag.label} className={`game__tag${tag.warn ? " is-warn" : ""}`}>
              {tag.label}
            </span>
          ))}
          <span className="game__play">
            {playLabel}
            <TbArrowUpRight aria-hidden="true" />
          </span>
        </span>
      </span>
    </a>
  );
}
