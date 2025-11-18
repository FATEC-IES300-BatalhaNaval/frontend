import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { resolveCosmeticUrl } from "../../utils";
import { useUser } from "../../hooks/useUser";
import styles from "./Ships.module.css";

const CELL_SIZE = 31.81;

// Backend → Cosmetic Field Name mapping
const shipTypeKeyMap = {
  AIRCRAFT: "enabled_aircraft",
  BATTLESHIP: "enabled_battleship",
  SUBMARINE: "enabled_submarine",
  DESTROYER: ["enabled_destroyer_1", "enabled_destroyer_2"],
};

const normalizeShipType = (rawType, name, size) => {
  if (rawType) return rawType; // se o backend começar a mandar type

  const nameUpper = name?.toUpperCase() || "";

  if (nameUpper.includes("PORTA")) return "AIRCRAFT";
  if (nameUpper.includes("ENCOURA")) return "BATTLESHIP";
  if (nameUpper.includes("SUB")) return "SUBMARINE";
  if (nameUpper.includes("DESTROY")) return "DESTROYER";

  // fallback pelo tamanho caso nomes mudem no futuro
  if (size === 5) return "AIRCRAFT";
  if (size === 4) return "BATTLESHIP";
  if (size === 3) return "SUBMARINE";
  if (size === 2) return "DESTROYER";

  return "DESTROYER";
};



const Ships = forwardRef(
  ({ boardRef, isLocked = false, areShipsHidden = false, shipDefinitions = [] }, ref) => {

    const { config } = useUser();

    // Resolve image URL based on config + ship definition
    const resolveShipImage = useCallback((shipDef, localIndex) => {

      if (!config) {
        console.warn("⚠ config ainda não carregado");
        return "/skins/F00001.png";
      }

      const normalized = normalizeShipType(shipDef.type, shipDef.name, shipDef.size);
      const keyMap = shipTypeKeyMap[normalized];

      if (!keyMap) {
        console.error("❌ Nenhum cosmetic encontrado para o tipo:", normalized);
        return "/skins/F00001.png";
      }

      let cosmetic = null;

      // Se destroyer (2 unidades)
      if (Array.isArray(keyMap)) {
        cosmetic = config[keyMap[localIndex % 2]];
      } else {
        cosmetic = config[keyMap];
      }

      const finalUrl = resolveCosmeticUrl(cosmetic?.link, "/skins/F00001.png");

      return finalUrl;
    }, [config]);

    const [ships, setShips] = useState(() =>
      shipDefinitions.map((s, index) => ({
        id: `ship_${index}`,
        ship_id: s.ship_id,
        type: s.type,
        name: s.name,
        size: s.length,
        img: null, // updated when config loads
        rotation: 0,
        top: index * 40,
        left: 0,
        gridX: null,
        gridY: null,
        isDragging: false,
        isPlaced: false,
        isHidden: areShipsHidden,
        hits: [],
        isSunk: false,
      }))
    );

    // Update skins when config loads
    useEffect(() => {
      if (!config) return;

      setShips(prev =>
        prev.map((s, i) => ({
          ...s,
          img: resolveShipImage(s, i),
        }))
      );
    }, [config, resolveShipImage]);

    const [selectedShipId, setSelectedShipId] = useState(null);
    
    const isOverlapping = (a, b) => {
      const aRight = a.gridX + (a.rotation === 0 ? a.size : 1);
      const aBottom = a.gridY + (a.rotation === 0 ? 1 : a.size);
      const bRight = b.gridX + (b.rotation === 0 ? b.size : 1);
      const bBottom = b.gridY + (b.rotation === 0 ? 1 : b.size);
      return (
        a.gridX < bRight &&
        aRight > b.gridX &&
        a.gridY < bBottom &&
        aBottom > b.gridY
      );
    };

    const isPositionValid = useCallback((ship, allShips) => {
      const w = ship.rotation === 0 ? ship.size : 1;
      const h = ship.rotation === 0 ? 1 : ship.size;

      if (ship.gridX < 0 || ship.gridY < 0 || ship.gridX + w > 10 || ship.gridY + h > 10) {
        return false;
      }

      return !allShips.some(o => {
        if (o.id === ship.id || !o.isPlaced) return false;
        return isOverlapping(ship, o);
      });
    }, []);

    const handleShipClick = (e, shipId) => {
      if (isLocked || e.button !== 0) return;

      const ship = ships.find(s => s.id === shipId);
      if (!ship) return;

      setSelectedShipId(shipId);
      e.preventDefault();
    };    

    const handleKeyDown = useCallback((e) => {
      if (isLocked || !selectedShipId) return;

      const ship = ships.find(s => s.id === selectedShipId);
      if (!ship || !ship.isPlaced) return;

      const move = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
      }[e.key];

      if (move) {
        e.preventDefault();

        const newX = ship.gridX + move.x;
        const newY = ship.gridY + move.y;

        const newPos = { ...ship, gridX: newX, gridY: newY };

        if (isPositionValid(newPos, ships)) {
          setShips(prev =>
            prev.map(s =>
              s.id === selectedShipId
                ? {
                    ...s,
                    gridX: newX,
                    gridY: newY,
                    top: newY * CELL_SIZE + CELL_SIZE,
                    left: newX * CELL_SIZE + CELL_SIZE,
                  }
                : s
            )
          );
        }
      }

      if (e.key === "Enter") {
        e.preventDefault();
        const newRot = (ship.rotation + 90) % 180;
        const rotated = { ...ship, rotation: newRot };

        if (isPositionValid(rotated, ships)) {
          setShips(prev =>
            prev.map(s => (s.id === selectedShipId ? rotated : s))
          );
        }
      }
    }, [ships, isLocked, selectedShipId, isPositionValid]);

    const placeShipsRandomly = useCallback(() => {
      if (!boardRef.current) return;

      setShips(prev => {
        const placed = [];
        return prev.map(ship => {
          let attempt = 0;
          let valid = false;
          let pos = ship;

          while (!valid && attempt < 100) {
            attempt++;
            const rot = Math.random() < 0.5 ? 0 : 90;
            const w = rot === 0 ? ship.size : 1;
            const h = rot === 0 ? 1 : ship.size;

            const gx = Math.floor(Math.random() * (10 - w));
            const gy = Math.floor(Math.random() * (10 - h));

            const temp = { ...ship, rotation: rot, gridX: gx, gridY: gy };

            if (!placed.some(p => isOverlapping(temp, p))) {
              valid = true;
              pos = {
                ...temp,
                isPlaced: true,
                top: gy * CELL_SIZE + CELL_SIZE,
                left: gx * CELL_SIZE + CELL_SIZE,
              };
              placed.push(pos);
            }
          }
          return pos;
        });
      });
    }, [boardRef]);

    useEffect(() => {
      placeShipsRandomly();
    }, [placeShipsRandomly]);

    useEffect(() => {
      const keyHandler = e => handleKeyDown(e);
      window.addEventListener("keydown", keyHandler);

      return () => {
        window.removeEventListener("keydown", keyHandler);
      };
    }, [handleKeyDown]);

    useImperativeHandle(ref, () => ({
      randomize: placeShipsRandomly,
      getFleetForBackend: () =>
        ships
          .filter(s => s.isPlaced)
          .map(s => ({
            ship_id: s.ship_id,
            head_coord_x: s.gridX,
            head_coord_y: s.gridY,
            orientation: s.rotation === 0 ? "HORIZONTAL" : "VERTICAL",
          })),
      setFleetFromBackend: (fleetArray) => {
        if (!Array.isArray(fleetArray)) return;
        setShips(prev =>
          prev.map(s => {
            const placed = fleetArray.find(f => f.ship_id === s.ship_id);
            if (!placed) return s;
            const rot = placed.orientation === "HORIZONTAL" ? 0 : 90;
            return {
              ...s,
              gridX: placed.head_coord_x,
              gridY: placed.head_coord_y,
              rotation: rot,
              isPlaced: true,
              top: placed.head_coord_y * CELL_SIZE + CELL_SIZE,
              left: placed.head_coord_x * CELL_SIZE + CELL_SIZE,
            };
          })
        );
      },
      getShips: () => ships,
    }));

    return (
      <div className={styles.ships}>
        {ships.map(ship =>
          !ship.isHidden || ship.isSunk ? (
            <div
              key={ship.id}
              id={ship.id}
              className={`${styles.ship}                
                ${ship.isSunk ? styles.sunk : ""}
                ${ship.id === selectedShipId && !isLocked ? styles.selected : ""}
                ${isLocked ? styles.locked : ""}`}
              style={{
                top: ship.top,
                left: ship.left,
                "--ship-size": ship.size,
                transform: `rotate(${ship.rotation}deg)`,
              }}
              onClick={e => handleShipClick(e, ship.id)}
            >
              {ship.img && (
                <img src={ship.img} alt="ship" className={styles.shipImage} />
              )}
            </div>
          ) : null
        )}
      </div>
    );
  }
);

export default Ships;
