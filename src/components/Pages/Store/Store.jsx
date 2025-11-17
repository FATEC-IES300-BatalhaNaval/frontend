import { useEffect, useState, useRef } from "react";
import styles from "./Store.module.css";
import Card from "./elements/Cards/Cards";

import {
  getCosmetics,
  getUserCosmetics,
  purchaseCosmetic
} from "../../../services/storeService";

import { getMe, addCoins } from "../../../services/userService";
import useUserCards from "../../../hooks/useUserCards";
import { getAllCards, purchaseCard } from "../../../services/cardService";

export default function Store() {
  const [allCards, setAllCards] = useState([]);

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
    CARD: "Cartas",
  };

  // Subtipos de skins por tipo de navio
  const skinTypes = {
    DESTROYER: "Destroyer",
    BATTLESHIP: "Encouraçado",
    AIRCRAFT: "Porta-Aviões",
    SUBMARINE: "Submarino",
  };

  const [selectedSkinType, setSelectedSkinType] = useState("DESTROYER");

  function resolveUrl(link) {
    if (!link) return "/placeholder.png";
    if (link.startsWith("http")) return link;
    if (link.startsWith("/")) return link;
    return `/${link}`;
  }

  useEffect(() => {
    async function load() {
      try {
        const [storeRes, userCosRes, meRes, allCardsRes] = await Promise.all([
          getCosmetics(),
          getUserCosmetics(),
          getMe(),
          getAllCards()
        ]);

        setCosmetics(storeRes.cosmetics || []);

        setOwned(new Set(userCosRes.cosmetics?.map(c => c.cosmetic_id) || []));

        setCoins(meRes.coins ?? 0);

        setAllCards(allCardsRes.cards || []); // <-- todas as cartas disponíveis

        setOwnedCards(new Set(userCards.map(c => c.card_id))); // <-- cartas do usuário

      } catch (err) {
        console.error("[STORE] Erro ao carregar:", err);
        alert("Erro ao carregar a loja. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userCards]);

  const filteredCosmetics = cosmetics.filter(c => c.type === tab);

  // Skins: filtramos tudo que é tipo de navio
  const allSkins = cosmetics.filter(c => Object.keys(skinTypes).includes(c.type));
  const skinsBySelectedType = allSkins.filter(c => c.type === selectedSkinType);

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

  const handleBuyCoins = async (amount) => {
    if (processing) return;

    try {
      setProcessing(true);
      const res = await addCoins(amount);
      setCoins(res.coins);
      alert(`Você recebeu ${amount} Fatec Coins.`);
    } catch (err) {
      console.error("Erro ao comprar moedas:", err);
      alert("Erro ao comprar moedas.");
    } finally {
      setProcessing(false);
    }
  };

  const scrollByAmount = (delta) => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: delta, behavior: "smooth" });
  };

  if (loading || loadingCards) {
    return (
      <div className={styles.container} style={{ minHeight: "60vh", justifyContent: "center" }}>
        <p>Carregando Loja...</p>
      </div>
    );
  }

  const isCardsTab = tab === "CARD";
  const isSkinTab = tab === "SKIN";

  return (
    <div className={styles.container}>
      {/* Saldo */}
      <div className={styles.FC_Container}>
        ⚓ Fatec Coins: <span style={{ color: "var(--tertiary-color)" }}>{coins}</span>
      </div>

      {/* Comprar Moedas */}
      <div className={styles.CoinPacks}>
        <div className={styles.PackList}>
          {coinPacks.map(p => (
            <div key={p.id} className={styles.PackCard}>
              <h3>{p.amount} FC</h3>
              <p>{p.price}</p>
              <button
                onClick={() => handleBuyCoins(p.amount)}
                disabled={processing}
              >
                {processing ? "⋯" : "Comprar"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs principais */}
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

      {/* Subtabs de Skin por tipo de navio */}
      {isSkinTab && (
        <div className={styles.SkinTabs}>
          {Object.entries(skinTypes).map(([key, label]) => (
            <span
              key={key}
              className={`${styles.SkinTab} ${selectedSkinType === key ? styles.activeSkinTab : ""}`}
              onClick={() => !processing && setSelectedSkinType(key)}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Carrossel */}
      <div className={styles.Carousel_Container}>
        <button
          className={`${styles.Carousel_Button} ${styles.prev}`}
          onClick={() => scrollByAmount(-240)}
          disabled={processing}
        >
          ‹
        </button>

        <div ref={carouselRef} className={styles.Carousel_Wrapper}>
          {/* Aba de Cartas */}
          {isCardsTab &&
            allCards.map(card => {
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

          {/* Aba de Skins (por tipo) */}
          {isSkinTab &&
            skinsBySelectedType.map(c => {
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

          {/* Outros cosméticos (ícones, efeitos, backgrounds) */}
          {!isCardsTab && !isSkinTab &&
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
