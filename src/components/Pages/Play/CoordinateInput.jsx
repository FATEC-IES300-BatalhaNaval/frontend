// src/components/Play/CoordinateInput/CoordinateInput.jsx
import { useState } from "react";
import styles from "./CoordinateInput.module.css";

const COLS = ["A","B","C","D","E","F","G","H","I","J"];

export default function CoordinateInput({ onShoot, disabled }) {
  const [value, setValue] = useState("");

  function parseCoordinate(coord) {
    const trimmed = coord.trim().toUpperCase();

    // Formato A1..J10
    const match = trimmed.match(/^([A-J])([1-9]|10)$/);
    if (!match) return null;

    const colLetter = match[1];
    const rowNumber = Number(match[2]);

    const x = COLS.indexOf(colLetter); // 0..9
    const y = rowNumber - 1;           // 0..9

    if (x < 0 || x > 9 || y < 0 || y > 9) return null;
    return { x, y };
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (disabled) return;

    const parsed = parseCoordinate(value);
    if (!parsed) {
      alert("Coordenada inválida. Use A1 até J10.");
      return;
    }

    if (onShoot) {
      onShoot(parsed.x, parsed.y);
    }

    setValue("");
  };

  return (
    <form className={styles.coordinateInputContainer} onSubmit={handleSubmit}>
      <div className={styles.coordinateRow}>
        <input
          className={styles.coordinateInput}
          type="text"
          placeholder="Ex: A1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={3}
          disabled={disabled}
        />
        <button
          type="submit"
          className={styles.coordinateButton}
          disabled={disabled}
        >
          Atirar
        </button>
      </div>
    </form>
  );
}
