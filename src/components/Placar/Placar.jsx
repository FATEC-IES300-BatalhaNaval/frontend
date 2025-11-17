import styles from "./Placar.module.css";

function Placar({ titulo, ships = [], shipDefs = [] }) {
  function getShipName(shipId) {
    const def = shipDefs.find(s => s.ship_id === shipId);
    return def?.name || "Navio";
  }

  return (
    <div className={styles.placar}>
      <h2>{titulo}</h2>
      <ul className={styles.listaEmbarcacoes}>
        {ships.map((ship, index) => (
          <li
            key={`${ship.ship_id}-${index}`}
            className={`${styles.embarcacao} ${ship.is_sunk ? styles.sunk : ""}`}
          >
            {getShipName(ship.ship_id)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Placar;
