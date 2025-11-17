import { useEffect, useState, useRef } from "react";
import styles from "./Store.module.css";
import Card from "./elements/Cards/Cards";

import {
  getCosmetics,
  getUserCosmetics,
  purchaseCosmetic
} from "../../../services/storeService";

import { getMe, addCoins } from "../../../services/userService";
import { purchaseCard } from "../../../services/cardService";
import useUserCards from "../../../hooks/useUserCards";

export default function Store() {
  const { cards: userCards, loadingCards, refreshCards } = useUserCards();

  const [loading, setLoading] = useState(true);
  const [cosmetics, setCosmetics] = useState([]);
  const [owned, setOwned] = useState(new Set());
  const [ownedCards, setOwnedCards] = useState(new Set());
  const [coins, setCoins] = useState(0);
  const [tab, setTab] = useState("ICON");
  const [processing, setProcessing] = useState(false);

  const carouselRef = useRef(null);

  const tabsMap = {
    ICON: "Ícones",
    EFFECT: "Efeitos",
    BACKGROUND: "Backgrounds",
    SKIN: "Skins",
    CARD: "Cartas"
  };

  function resolveUrl(link) {
    if (!link) return "/placeholder.png";
    if (link.startsWith("http")) return link;
    if (link.startsWith("/")) return link;
    return `/${link}`;
  }

  useEffect(() => {
    async function load() {
      try {
        const [storeRes, userCosRes, meRes] = await Promise.all([
          getCosmetics(),
          getUserCosmetics(),
          getMe()
        ]);

        setCosmetics(storeRes.cosmetics || []);
        setOwned(new Set(userCosRes.cosmetics?.map(c => c.cosmetic_id) || []));
        setCoins(meRes.coins ?? 0);
      } catch (err) {
        console.error("[STORE] Erro ao carregar:", err);
        alert("Erro ao carregar a loja. Tente novamente.");
      } finally {
        setLoading(false);
        setOwnedCards(new Set(userCards.map(c => c.card_id)));
      }
    }
    load();
  }, [userCards]);

  const filteredCosmetics = cosmetics.filter(c => c.type === tab);

  const handleBuyCosmetic = async (c) => {
    if (processing || owned.has(c.cosmetic_id)) return;
    if (coins < c.price) {
      alert("Você não possui Fatec Coins suficientes.");
      return;
    }

    try {
      setProcessing(true);
      await purchaseCosmetic(c.cosmetic_id);
      setOwned(prev => new Set(prev).add(c.cosmetic_id));
      setCoins(prev => prev - c.price);
      alert(`Você comprou: ${c.description}`);
    } catch {
      alert("Erro ao comprar o item. Tente novamente.");
    } finally {
      setProcessing(false);
    }
  };

  const handleBuyCard = async (card) => {
    if (processing || ownedCards.has(card.card_id)) return;
    if (coins < card.price) {
      alert("Você não possui Fatec Coins suficientes.");
      return;
    }

    try {
      setProcessing(true);
      await purchaseCard(card.card_id);
      setOwnedCards(prev => new Set(prev).add(card.card_id));
      setCoins(prev => prev - card.price);
      refreshCards();
      alert(`Você adquiriu a carta: ${card.card_name}`);
    } catch {
      alert("Erro ao comprar a carta.");
    } finally {
      setProcessing(false);
    }
  };

  const coinPacks = [
    { id: 1, amount: 500, price: "R$ 4,90" },
    { id: 2, amount: 1200, price: "R$ 9,90" },
    { id: 3, amount: 3000, price: "R$ 19,90" }
  ];

  const scrollByAmount = (delta) => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: delta, behavior: "smooth" });
    }
  };

  if (loading || loadingCards) {
    return (
      <div className={styles.container} style={{ minHeight: "60vh", justifyContent: "center" }}>
        <p>Carregando Loja...</p>
      </div>
    );
  }

  const isCardsTab = tab === "CARD";

  return (
    <div className={styles.container}>
      <div className={styles.FC_Container}>
        ⚓ Fatec Coins: <span style={{ color: "var(--tertiary-color)" }}>{coins}</span>
      </div>

      <div className={styles.CoinPacks}>
        <div className={styles.PackList}>
          {coinPacks.map(p => (
            <div key={p.id} className={styles.PackCard}>
              <h3>{p.amount} FC</h3>
              <p>{p.price}</p>
              <button
                onClick={() => addCoins(p.amount).then(r => setCoins(r.coins))}
                disabled={processing}
              >
                Comprar
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.Nav_Buttons_Container}>
        <ul>
          {Object.entries(tabsMap).map(([key, label]) => (
            <li
              key={key}
              aria-selected={tab === key}
              onClick={() => !processing && setTab(key)}
            >
              {label}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.Carousel_Container}>
        <button
          className={`${styles.Carousel_Button} ${styles.prev}`}
          onClick={() => scrollByAmount(-240)}
          disabled={processing}
        >
          ‹
        </button>

        <div ref={carouselRef} className={styles.Carousel_Wrapper}>
          {/* Cards Tab */}
          {isCardsTab &&
            userCards.map(card => {
              const isOwned = ownedCards.has(card.card_id);
              return (
                <div
                  key={card.card_id}
                  className={`${styles.Card_Wrapper} ${isOwned ? styles.ownedCard : ""}`}
                >
                  {isOwned && <div className={styles.ownedTag}>Adquirido</div>}
                  <Card
                    titulo={card.card_name}
                    preco={card.price}
                    imagem={resolveUrl(card.link)}
                    onComprar={() => handleBuyCard(card)}
                  />
                </div>
              );
            })
          }

          {/* Cosmetics Tabs */}
          {!isCardsTab &&
            filteredCosmetics.map(c => {
              const isOwned = owned.has(c.cosmetic_id);
              return (
                <div
                  key={c.cosmetic_id}
                  className={`${styles.Card_Wrapper} ${isOwned ? styles.ownedCard : ""}`}
                >
                  {isOwned && <div className={styles.ownedTag}>Adquirido</div>}
                  <Card
                    titulo={c.description}
                    preco={c.price}
                    imagem={resolveUrl(c.link)}
                    onComprar={() => handleBuyCosmetic(c)}
                  />
                </div>
              );
            })
          }
        </div>

        <button
          className={`${styles.Carousel_Button} ${styles.next}`}
          onClick={() => scrollByAmount(240)}
          disabled={processing}
        >
          ›
        </button>
      </div>
    </div>
  );
}
