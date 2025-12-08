import { useState } from "react";
import "./App.scss";
import { Games } from "./components/";
import { FaPlus, FaMinus } from "react-icons/fa6";

function App() {
  const [players, setPlayers] = useState(4);

  const handleChange = (value: number) => {
    if (value < 1) return;
    setPlayers(value);
  };

  return (
    <>
      <header>
        <h1>What we play?</h1>
        <div className="how-many">
          <div className="how-many__buttons">
            <button
              aria-label="Add player"
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
              value={players}
              onChange={(e) => handleChange(Number(e.target.value))}
            />
            <button
              aria-label="Remove player"
              onClick={() => handleChange(players - 1)}
              type="button"
              className="how-many__buttons__minus"
            >
              <FaMinus />
            </button>
          </div>
          players
        </div>
      </header>

      <Games players={players} />
    </>
  );
}

export default App;
