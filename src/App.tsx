import { useState } from "react";
import "./App.scss";
import { Games, LanguageSwitcher } from "./components/";
import { FaPlus, FaMinus } from "react-icons/fa6";
import { useTranslation } from "./i18n";

function App() {
  const [players, setPlayers] = useState(4);
  const { t, playersLabel } = useTranslation();

  const handleChange = (value: number) => {
    if (value < 1) return;
    setPlayers(value);
  };

  return (
    <>
      <header>
        <LanguageSwitcher />
        <h1>{t.header.title}</h1>
        <div className="how-many">
          <div className="how-many__buttons">
            <button
              aria-label={t.header.addPlayer}
              onClick={() => handleChange(players + 1)}
              type="button"
              className="how-many__buttons__plus"
            >
              <FaPlus />
            </button>
            <input
              type="number"
              min={1}
              max={99}
              aria-label={t.header.playerCount}
              value={players}
              onChange={(e) => handleChange(Number(e.target.value))}
            />
            <button
              aria-label={t.header.removePlayer}
              onClick={() => handleChange(players - 1)}
              type="button"
              className="how-many__buttons__minus"
            >
              <FaMinus />
            </button>
          </div>
          {playersLabel(players)}
        </div>
      </header>

      <Games players={players} />
    </>
  );
}

export default App;
