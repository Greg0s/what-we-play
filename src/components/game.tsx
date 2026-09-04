import { FaUsers } from "react-icons/fa6";
import type { IconType } from "react-icons";

export type GameTag = {
  icon: IconType;
  label: string;
};

type GameProps = {
  name: string;
  description: string;
  playLink: string;
  playerRange: string;
  playerRangeShort: string;
  tags: GameTag[];
};

function getFaviconUrl(link: string) {
  const { hostname } = new URL(link);
  return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
}

export function Game({
  name,
  description,
  playLink,
  playerRange,
  playerRangeShort,
  tags,
}: GameProps) {
  return (
    <a target="_blank" rel="noopener" href={playLink} className="game">
      <img
        className="game__favicon"
        src={getFaviconUrl(playLink)}
        alt=""
        loading="lazy"
      />
      <h2>{name}</h2>
      <p>{description}</p>
      <div className="game__meta">
        <span className="game__range" title={playerRange}>
          <FaUsers />
          {playerRangeShort}
        </span>
        {tags.map(({ icon: Icon, label }) => (
          <span key={label} className="game__tag" title={label}>
            <Icon />
          </span>
        ))}
      </div>
    </a>
  );
}
