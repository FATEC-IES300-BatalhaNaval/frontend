import { useRef, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import styles from "./Play.module.css";

import Board from "../../Board/Board";
import Ships from "../../Ships/Ships";
import EmojiBox from "../../EmojiBox/EmojiBox";
import EmojiAnimation from "../../EmojiBox/EmojiAnimation";
import Placar from "../../Placar/Placar";
import Deck from "../../Deck/Deck";
import TurnIndicator from "../../TurnIndicator/TurnIndicator";
import Timer from "../../Timer/Timer";
import PopupComponent from "../Perfil/elements/PopupComponent";

import { useAuth } from "../../../hooks/useAuth";
import { useMatch } from "../../../hooks/useMatch";

export default function Play() {
  const { match_id } = useParams();
  const { user, setUserAtt } = useAuth();

  const {
    getMatch,
    getShipDefinitions,
    placeFleet,
    startMatch
  } = useMatch();

  const boardRef = useRef(null);
  const shipsRef = useRef(null);
  const enemyBoardRef = useRef(null);
  const enemyShipsRef = useRef(null);

  const [match, setMatch] = useState(null);
  const [shipDefs, setShipDefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [shots, setShots] = useState([]);
  const [activeEmoji, setActiveEmoji] = useState(null);
  const [isDeckPopupOpen, setIsDeckPopupOpen] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState("player");

  // Helpers -------------------------------------------------------------

  const meId = user?.data?.user_id || user?.user_id;

  function mePlayer() {
    return match?.player?.find(p => p.user_id === meId);
  }

  function enemyPlayer() {
    return match?.player?.find(p => p.user_id !== meId);
  }

  const playerHasPlaced = () =>
    (mePlayer()?.player_ship?.length || 0) > 0;

  const enemyHasPlaced = () =>
    (enemyPlayer()?.player_ship?.length || 0) > 0;

  // Initial load --------------------------------------------------------
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const [defs, matchData] = await Promise.all([
          getShipDefinitions(),
          getMatch(match_id),
        ]);

        setShipDefs(Array.isArray(defs) ? defs : []);
        setMatch(matchData);

        if (matchData && playerHasPlaced()) {
          shipsRef.current?.setFleetFromBackend(mePlayer().player_ship);
        }

      } catch (err) {
        console.error("Erro ao carregar partida:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getMatch, getShipDefinitions, match_id]);

  // Polling a cada 3 segundos -------------------------------------------
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const updated = await getMatch(match_id);

        setMatch(prev => {
          const newState = updated?.state;

          // Evita re-render contínuo desnecessário
          if (prev && prev.state === newState) {
            return updated;
          }
          return updated;
        });

        // Atualiza frota do jogador apenas se já enviou
        if (updated && updated.player) {
          const me = updated.player.find(p => p.user_id === meId);
          if (me && me.player_ship?.length > 0) {
            shipsRef.current?.setFleetFromBackend(me.player_ship);
          }
        }

      } catch (err) {
        console.error("Erro no polling da partida:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [match_id, getMatch, meId]);

  // Update user deck ----------------------------------------------------
  const handleDeckSave = useCallback(() => {
    setUserAtt?.(p => !p);
  }, [setUserAtt]);

  // Send fleet ----------------------------------------------------------
  async function handleConfirmPlacement() {
    if (playerHasPlaced()) return;

    try {
      setSubmitting(true);

      const fleet = shipsRef.current.getFleetForBackend();
      await placeFleet(match_id, fleet);

      const updated = await getMatch(match_id);
      setMatch(updated);

    } catch (err) {
      console.error("Erro ao enviar frota:", err);
    } finally {
      setSubmitting(false);
    }
  }

  // Start match ---------------------------------------------------------
  async function handleStartMatch() {
    try {
      setSubmitting(true);

      await startMatch(match_id);

      const updated = await getMatch(match_id);
      setMatch(updated);

    } catch (err) {
      console.error("Erro ao iniciar partida:", err);
    } finally {
      setSubmitting(false);
    }
  }

  // Turns ---------------------------------------------------------------
  useEffect(() => {
    if (match?.state !== "ACTIVE") return;
    if (currentPlayer === "enemy") {
      const t = setTimeout(() => setCurrentPlayer("player"), 2000);
      return () => clearTimeout(t);
    }
  }, [match, currentPlayer]);

  // Enemy click ---------------------------------------------------------
  const handleCellClick = (x, y) => {
    if (match?.state !== "ACTIVE") return;
    if (currentPlayer !== "player") return;

    if (shots.some(s => s.x === x && s.y === y)) return;

    const cols = ["A","B","C","D","E","F","G","H","I","J"];
    const coord = `${cols[x]}${y + 1}`;

    const hit = enemyShipsRef.current.registerHit(x, y);
    alert(hit ? `Acertou em ${coord}!` : `Errou em ${coord}!`);

    setShots(prev => [...prev, { x, y, isHit: !!hit }]);
    setCurrentPlayer("enemy");
  };

  // UI ------------------------------------------------------------------

  if (loading) {
    return <div style={{ padding: 20 }}>Carregando partida...</div>;
  }

  if (!match) {
    return <div style={{ padding: 20 }}>Erro ao carregar partida.</div>;
  }

  // LOBBY ---------------------------------------------------------------
  if (match.state === "LOBBY") {
    const players = match.player || [];
    const full = players.length === match.max_players;

    return (
      <div className={styles.lobby}>
        <h2>Sala: {match.room_name}</h2>

        <div className={styles.playerList}>
          {players.map(p => (
            <div key={p.user_id}>{p.user?.username}</div>
          ))}
        </div>

        {match.creator?.user_id === meId && (
          <button
            disabled={!full || submitting}
            onClick={handleStartMatch}
          >
            {submitting ? "Iniciando..." : "Iniciar"}
          </button>
        )}
      </div>
    );
  }

  // SHIP PLACEMENT ------------------------------------------------------
  if (match.state === "SHIP_PLACEMENT") {

    if (!playerHasPlaced()) {
      return (
        <div className={styles.playContainer}>
          <h2>Posicione seus navios</h2>

          <Board ref={boardRef}>
            <Ships
              ref={shipsRef}
              boardRef={boardRef}
              shipDefinitions={shipDefs}
              isLocked={false}
            />
          </Board>

          <div className={styles.buttonContainer}>
            <button onClick={() => shipsRef.current?.randomize()}>
              Reposicionar Navios
            </button>

            <button
              onClick={handleConfirmPlacement}
              disabled={submitting}
            >
              {submitting ? "Enviando..." : "Confirmar Posicionamento"}
            </button>
          </div>

          <div
            className={styles.deckContainer}
            onClick={() => setIsDeckPopupOpen(true)}
          >
            <Deck />
          </div>

          <PopupComponent
            isOpen={isDeckPopupOpen}
            onClose={() => setIsDeckPopupOpen(false)}
            type="cards"
            userData={user?.data || user}
            onSave={handleDeckSave}
          />
        </div>
      );
    }

    if (!enemyHasPlaced()) {
      return (
        <div className={styles.waiting}>
          <h2>Aguardando o oponente posicionar os navios...</h2>
        </div>
      );
    }
  }

  // ACTIVE BATTLE -------------------------------------------------------
  if (match.state === "ACTIVE") {
    return (
      <div className={styles.playContainer}>

        <Placar titulo="Seu Placar" ships={mePlayer()?.player_ship || []} />

        <div className={styles.mainGameArea}>
          <div className={styles.gameStatusContainer}>
            <TurnIndicator currentPlayer={currentPlayer} />
            <Timer
              duration={30}
              onTimeEnd={() => setCurrentPlayer("enemy")}
              isRunning={currentPlayer === "player"}
              key={currentPlayer}
            />
          </div>

          <div className={styles.boardsContainer}>

            <div className={styles.boardWrapper}>
              <Board ref={boardRef}>
                <Ships
                  ref={shipsRef}
                  boardRef={boardRef}
                  shipDefinitions={shipDefs}
                  isLocked={true}
                />
              </Board>
            </div>

            <div className={styles.boardWrapper}>
              <Board
                ref={enemyBoardRef}
                onCellClick={handleCellClick}
                shots={shots}
              >
                <Ships
                  ref={enemyShipsRef}
                  boardRef={enemyBoardRef}
                  shipDefinitions={shipDefs}
                  isLocked={true}
                  areShipsHidden={true}
                />
              </Board>
            </div>

          </div>

          <EmojiAnimation
            emoji={activeEmoji}
            onAnimationEnd={() => setActiveEmoji(null)}
          />
          <EmojiBox onEmojiSelect={setActiveEmoji} />
          <Deck />
        </div>

        <Placar titulo="Placar Inimigo" ships={enemyPlayer()?.player_ship || []} />
      </div>
    );
  }

  // FINISHED ------------------------------------------------------------
  if (match.state === "FINISHED") {
    return (
      <div className={styles.finished}>
        <h2>Partida encerrada</h2>
      </div>
    );
  }

  return <div>Estado desconhecido.</div>;
}
