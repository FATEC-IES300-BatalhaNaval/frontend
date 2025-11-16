import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import styles from "./Ships.module.css";

// Local images
import ship5Img from "../../assets/cosmetic/ships/aircraftCarrier/H00001.png";
import ship4Img from "../../assets/cosmetic/ships/battleship/G00001.png";
import ship3Img from "../../assets/cosmetic/ships/submarine/I00001.png";
import ship2Img from "../../assets/cosmetic/ships/destroyer/F00001.png";
import ship1Img from "../../assets/cosmetic/ships/destroyer/F00002.png";

const CELL_SIZE = 31.81;

// Map backend.ship_id → local image
const backendShipImageMap = {
  "d8ae41a8-bac7-4cf7-9371-df8a6f04971f": ship5Img,
  "8c95f21f-57cf-4205-b9d7-5e61497d1d3e": ship4Img,
  "e1422080-0bd6-43be-910a-2943ce6cf76c": ship3Img,
  "f64e1b0a-8d7d-4a53-a1f9-aafe94541da7": ship2Img,
  "482172b6-0dad-47f3-8998-a9131035b0de": ship1Img,
};

const Ships = forwardRef(
  ({ boardRef, isLocked = false, areShipsHidden = false, shipDefinitions = [] }, ref) => {
    // ---------------------------------------------------------
    // Initial ships mapped from backend definitions
    // ---------------------------------------------------------
    const [ships, setShips] = useState(() =>
      shipDefinitions.map((s, index) => ({
        id: `ship_${index}`,
        ship_id: s.ship_id,
        name: s.name,
        size: s.length,
        img: backendShipImageMap[s.ship_id] || ship1Img,
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

    const [draggingShip, setDraggingShip] = useState(null);
    const [selectedShipId, setSelectedShipId] = useState(null);

    // ✔ FIX: Correct state declaration
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const [originalPosition, setOriginalPosition] = useState({
      top: 0,
      left: 0,
    });

    // ---------------------------------------------------------
    // Collision helpers
    // ---------------------------------------------------------

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

      if (
        ship.gridX < 0 ||
        ship.gridY < 0 ||
        ship.gridX + w > 10 ||
        ship.gridY + h > 10
      ) {
        return false;
      }

      return !allShips.some((o) => {
        if (o.id === ship.id || !o.isPlaced) return false;
        return isOverlapping(ship, o);
      });
    }, []);

    // ---------------------------------------------------------
    // Drag & Drop
    // ---------------------------------------------------------

    const handleMouseDown = (e, shipId) => {
      if (isLocked || e.button !== 0) return;

      const ship = ships.find((s) => s.id === shipId);
      if (!ship) return;

      setSelectedShipId(shipId);
      setDraggingShip(shipId);

      // offset = where user clicked relative to ship
      const rect = e.target.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });

      setOriginalPosition({ top: ship.top, left: ship.left });
      e.preventDefault();
    };

    const handleMouseMove = useCallback(
      (e) => {
        if (!draggingShip || isLocked) return;

        const board = boardRef.current;
        if (!board) return;

        const rect = board.getBoundingClientRect();

        setShips((prev) =>
          prev.map((s) =>
            s.id === draggingShip
              ? {
                  ...s,
                  isDragging: true,
                  top: e.clientY - rect.top - dragOffset.y,
                  left: e.clientX - rect.left - dragOffset.x,
                }
              : s
          )
        );
      },
      [draggingShip, dragOffset, isLocked, boardRef]
    );

    const handleMouseUp = useCallback(
      (e) => {
        if (!draggingShip || isLocked) return;

        setShips((prev) =>
          prev.map((s) => {
            if (s.id !== draggingShip) return s;

            const board = boardRef.current;
            if (!board) return { ...s, isDragging: false };

            const rect = board.getBoundingClientRect();

            const relX = e.clientX - rect.left - CELL_SIZE;
            const relY = e.clientY - rect.top - CELL_SIZE;

            const gx = Math.round(relX / CELL_SIZE);
            const gy = Math.round(relY / CELL_SIZE);

            const newPos = { ...s, gridX: gx, gridY: gy };

            if (isPositionValid(newPos, prev)) {
              return {
                ...s,
                isDragging: false,
                isPlaced: true,
                gridX: gx,
                gridY: gy,
                top: gy * CELL_SIZE + CELL_SIZE,
                left: gx * CELL_SIZE + CELL_SIZE,
              };
            }

            return {
              ...s,
              isDragging: false,
              top: originalPosition.top,
              left: originalPosition.left,
            };
          })
        );

        setDraggingShip(null);
      },
      [draggingShip, boardRef, originalPosition, isLocked, isPositionValid]
    );

    // ---------------------------------------------------------
    // Keyboard
    // ---------------------------------------------------------

    const handleKeyDown = useCallback(
      (e) => {
        if (isLocked || !selectedShipId) return;

        const ship = ships.find((s) => s.id === selectedShipId);
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
            setShips((prev) =>
              prev.map((s) =>
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
            setShips((prev) =>
              prev.map((s) => (s.id === selectedShipId ? rotated : s))
            );
          }
        }
      },
      [ships, isLocked, selectedShipId, isPositionValid]
    );

    // ---------------------------------------------------------
    // Random ship placement
    // ---------------------------------------------------------

    const placeShipsRandomly = useCallback(() => {
      if (!boardRef.current) return;

      setShips((prev) => {
        const placed = [];

        return prev.map((ship) => {
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

            if (!placed.some((p) => isOverlapping(temp, p))) {
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

    // ---------------------------------------------------------
    // Global listeners
    // ---------------------------------------------------------

    useEffect(() => {
      placeShipsRandomly();
    }, [placeShipsRandomly]);

    useEffect(() => {
      if (draggingShip) {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
      } else {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      }

      const keyHandler = (e) => handleKeyDown(e);
      window.addEventListener("keydown", keyHandler);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("keydown", keyHandler);
      };
    }, [draggingShip, handleMouseMove, handleMouseUp, handleKeyDown]);

    // ---------------------------------------------------------
    // Exposed API for Play.jsx
    // ---------------------------------------------------------

    useImperativeHandle(ref, () => ({
  randomize: placeShipsRandomly,

  // must return a plain array (placeFleet will wrap it before sending)
  getFleetForBackend: () =>
    ships
      .filter((s) => s.isPlaced)
      .map((s) => ({
        ship_id: s.ship_id,
        head_coord_x: s.gridX,
        head_coord_y: s.gridY,
        orientation: s.rotation === 0 ? "HORIZONTAL" : "VERTICAL",
      })),

  setFleetFromBackend: (fleetArray) => {
    if (!Array.isArray(fleetArray)) return;
    setShips((prev) =>
      prev.map((s) => {
        const placed = fleetArray.find((f) => f.ship_id === s.ship_id);
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

  // expose fleet UI state to parent (Play.jsx was calling this)
  getShips: () => ships,
}));



    // ---------------------------------------------------------
    // Render
    // ---------------------------------------------------------

    return (
      <div className={styles.ships}>
        {ships.map((ship) =>
          !ship.isHidden || ship.isSunk ? (
            <div
              key={ship.id}
              id={ship.id}
              className={`${styles.ship} ${
                ship.isDragging && !isLocked ? styles.dragging : ""
              } ${ship.isSunk ? styles.sunk : ""} ${
                ship.id === selectedShipId && !isLocked ? styles.selected : ""
              } ${isLocked ? styles.locked : ""}`}
              style={{
                top: ship.top,
                left: ship.left,
                "--ship-size": ship.size,
                transform: `rotate(${ship.rotation}deg)`,
              }}
              onMouseDown={(e) => handleMouseDown(e, ship.id)}
            >
              <img src={ship.img} alt="ship" className={styles.shipImage} />
            </div>
          ) : null
        )}
      </div>
    );
  }
);

export default Ships;
