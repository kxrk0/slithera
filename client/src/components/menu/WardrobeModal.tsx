import { useEffect, useRef, useState } from "react";
import { SNAKE_SKINS, HAT_OPTIONS, ROPE_ACCESSORIES, RARITY_COLOR, type Rarity } from "../../../../shared/constants";
import { useAuth } from "../../lib/auth";
import { useInventoryItems } from "../../lib/useEconomy";
import { canUseSkin, isExclusiveSkin } from "../../lib/exclusiveSkins";
import { canUseCharm, isExclusiveCharm } from "../../lib/exclusiveSkins";
import { findMarketItemByRef, isFreeSkin, isFreeHat, isFreeCharm } from "../../lib/marketCatalog";
import { SnakePreview3D } from "./SnakePreview3D";
import { SnakePreview } from "./icons/SnakePreview";

export type WardrobeTab = "skin" | "hat" | "charm";

type Props = {
  open: boolean;
  onClose: () => void;
  initialTab?: WardrobeTab;
  skinId: string;
  hatId: string;
  ropeAccessoryId: string;
  onSkinChange: (id: string) => void;
  onHatChange: (id: string) => void;
  onCharmChange: (id: string) => void;
};

// ── Rarity helpers ────────────────────────────────────────────────────────────

const RARITY_ORDER: Rarity[] = ["mythic", "legendary", "epic", "rare", "uncommon", "common"];
const RARITY_SORT = Object.fromEntries(RARITY_ORDER.map((r, i) => [r, i])) as Record<Rarity, number>;

function rarityColor(r: string): string {
  return RARITY_COLOR[r as Rarity] ?? "#6a5a48";
}

// ── Main component ─────────────────────────────────────────────────────────────

export function WardrobeModal({
  open, onClose, initialTab = "skin",
  skinId, hatId, ropeAccessoryId,
  onSkinChange, onHatChange, onCharmChange,
}: Props) {
  const { user } = useAuth();
  const owned = useInventoryItems();
  const uid = user?.id;
  const [tab, setTab] = useState<WardrobeTab>(initialTab);
  const [hoverId, setHoverId] = useState<string | null>(null);

  // Sync tab when parent requests a specific tab
  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  // ── Lock helpers ───────────────────────────────────────────────────────────

  const skinLocked = (id: string) => {
    if (isFreeSkin(id)) return false;
    if (isExclusiveSkin(id)) return !canUseSkin(id, uid);
    const item = findMarketItemByRef("skin", id);
    return item ? !owned.includes(item.id) : false;
  };

  const hatLocked = (id: string, rarity: string) => {
    if (!rarity || rarity === "") return false; // "none" hat is always free
    if (isFreeHat(id)) return false;
    const item = findMarketItemByRef("hat", id);
    return item ? !owned.includes(item.id) : false;
  };

  const charmLocked = (id: string) => {
    if (isFreeCharm(id)) return false;
    if (isExclusiveCharm(id)) return !canUseCharm(id, uid);
    const item = findMarketItemByRef("charm", id);
    return item ? !owned.includes(item.id) : false;
  };

  // ── Data per tab ───────────────────────────────────────────────────────────

  type SkinRow  = { id: string; name: string; rarity: Rarity; locked: boolean };
  type HatRow   = { id: string; name: string; rarity: string; locked: boolean };
  type CharmRow = { id: string; name: string; rarity: string; locked: boolean };

  const skinRows: SkinRow[] = SNAKE_SKINS
    .filter(s => !isExclusiveSkin(s.id) || canUseSkin(s.id, uid))
    .map(s => ({ id: s.id, name: s.name, rarity: s.rarity, locked: skinLocked(s.id) }))
    .sort((a, b) => (RARITY_SORT[a.rarity] ?? 6) - (RARITY_SORT[b.rarity] ?? 6));

  const hatRows: HatRow[] = HAT_OPTIONS.map(h => ({
    id: h.id, name: h.name, rarity: h.rarity as string, locked: hatLocked(h.id, h.rarity as string),
  }));

  const charmRows: CharmRow[] = ROPE_ACCESSORIES
    .filter(r => !isExclusiveCharm(r.id) || canUseCharm(r.id, uid))
    .map(r => ({ id: r.id, name: r.name, rarity: r.rarity, locked: charmLocked(r.id) }));

  // ── Equip handlers ─────────────────────────────────────────────────────────

  const equipSkin  = (id: string) => { if (!skinLocked(id)) onSkinChange(id); };
  const equipHat   = (id: string, r: string) => { if (!hatLocked(id, r)) onHatChange(id); };
  const equipCharm = (id: string) => { if (!charmLocked(id)) onCharmChange(id); };

  // ── Tab meta ───────────────────────────────────────────────────────────────

  const TABS: { id: WardrobeTab; label: string; glyph: string }[] = [
    { id: "skin",  label: "Skins",  glyph: "◉" },
    { id: "hat",   label: "Hats",   glyph: "◎" },
    { id: "charm", label: "Charms", glyph: "✦" },
  ];

  const currentEquipped = tab === "skin" ? skinId : tab === "hat" ? hatId : ropeAccessoryId;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="wg-modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="wg-modal" style={S.modal} onClick={e => e.stopPropagation()}>
        <button className="wg-modal-close" type="button" aria-label="Close" onClick={onClose}>×</button>

        {/* ── Left: 3D animated snake preview ────────────────────── */}
        <SnakePreview3D
          skinId={skinId}
          hatId={hatId}
          label="· · · EQUIPPED · · ·"
          name={SNAKE_SKINS.find(s => s.id === skinId)?.name ?? skinId}
          meta={(SNAKE_SKINS.find(s => s.id === skinId)?.rarity ?? "common").toUpperCase().slice(0, 4)}
        />

        {/* ── Right: inventory picker ─────────────────────────────── */}
        <div style={S.right}>
          {/* Header */}
          <div style={S.rightHeader}>
            <div style={S.rightTitle}>Wardrobe</div>
            <div style={S.rightSub}>Equip your relics</div>
          </div>

          {/* Tab bar */}
          <div style={S.tabBar}>
            {TABS.map(t => (
              <button
                key={t.id}
                style={{ ...S.tab, ...(tab === t.id ? S.tabActive : {}) }}
                onClick={() => setTab(t.id)}
              >
                <span style={{ opacity: 0.7, fontSize: 10 }}>{t.glyph}</span>
                {t.label}
                {tab === t.id && <div style={S.tabIndicator} />}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div style={S.grid}>
            {tab === "skin" && skinRows.map(row => {
              const isEquipped = row.id === currentEquipped;
              const hovered    = hoverId === row.id;
              const rc         = rarityColor(row.rarity);
              return (
                <ItemCard
                  key={row.id}
                  itemId={`skin.${row.id}`}
                  category="skin"
                  rarity={row.rarity}
                  name={row.name}
                  rarityStr={row.rarity}
                  rarityColor={rc}
                  isEquipped={isEquipped}
                  isLocked={row.locked}
                  hovered={hovered}
                  onMouseEnter={() => setHoverId(row.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onEquip={() => equipSkin(row.id)}
                />
              );
            })}

            {tab === "hat" && hatRows.map(row => {
              const isEquipped = row.id === currentEquipped;
              const hovered    = hoverId === row.id;
              const rc         = rarityColor(row.rarity);
              return (
                <ItemCard
                  key={row.id}
                  itemId={`hat.${row.id}`}
                  category="hat"
                  rarity={(row.rarity || "common") as Rarity}
                  name={row.name}
                  rarityStr={row.rarity || ""}
                  rarityColor={rc}
                  isEquipped={isEquipped}
                  isLocked={row.locked}
                  hovered={hovered}
                  bodySkinId={skinId}
                  onMouseEnter={() => setHoverId(row.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onEquip={() => equipHat(row.id, row.rarity)}
                />
              );
            })}

            {tab === "charm" && charmRows.map(row => {
              const isEquipped = row.id === currentEquipped;
              const hovered    = hoverId === row.id;
              const rc         = rarityColor(row.rarity as string);
              return (
                <ItemCard
                  key={row.id}
                  itemId={`charm.${row.id}`}
                  category="charm"
                  rarity={row.rarity as Rarity}
                  name={row.name}
                  rarityStr={row.rarity as string}
                  rarityColor={rc}
                  isEquipped={isEquipped}
                  isLocked={row.locked}
                  hovered={hovered}
                  bodySkinId={skinId}
                  onMouseEnter={() => setHoverId(row.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onEquip={() => equipCharm(row.id)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Item card ──────────────────────────────────────────────────────────────────

type ItemCardProps = {
  itemId: string;
  category: "skin" | "hat" | "charm";
  rarity: Rarity;
  name: string;
  rarityStr: string;
  rarityColor: string;
  isEquipped: boolean;
  isLocked: boolean;
  hovered: boolean;
  bodySkinId?: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onEquip: () => void;
};

function ItemCard({
  itemId, category, rarity, name, rarityStr, rarityColor,
  isEquipped, isLocked, hovered, bodySkinId,
  onMouseEnter, onMouseLeave, onEquip,
}: ItemCardProps) {
  const rc = rarityColor;
  return (
    <article
      style={{
        ...S.card,
        borderColor: isEquipped
          ? `${rc}cc`
          : hovered && !isLocked
            ? `${rc}55`
            : "rgba(245,233,211,0.07)",
        boxShadow: isEquipped
          ? `0 0 0 1px ${rc}44, 0 4px 20px rgba(0,0,0,0.5), inset 0 0 0 1px ${rc}22`
          : hovered && !isLocked
            ? "0 4px 16px rgba(0,0,0,0.4)"
            : "none",
        transform: hovered && !isLocked && !isEquipped ? "translateY(-1px)" : "none",
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Rarity stripe */}
      <div style={{ ...S.rarityStripe, background: rc, opacity: isLocked ? 0.25 : isEquipped ? 1 : 0.75 }} />

      {/* Animated snake preview — full card width */}
      <div style={{ width: "100%", opacity: isLocked ? 0.4 : 1 }}>
        <SnakePreview
          itemId={itemId}
          category={category}
          rarity={rarity}
          height={62}
          bodySkinId={bodySkinId}
        />
      </div>

      {/* Name */}
      <div style={{ ...S.cardName, color: isLocked ? "#4a3a2a" : "#f5e9d3" }}>
        {name}
      </div>

      {/* Rarity label */}
      {rarityStr ? (
        <div style={{ ...S.cardRarity, color: isLocked ? "#3a2e24" : rc }}>
          {rarityStr.toUpperCase()}
        </div>
      ) : (
        <div style={{ ...S.cardRarity, color: "#3a2e24" }}>—</div>
      )}

      {/* Action button */}
      {isEquipped ? (
        <div style={S.equippedTag}>✓ Equipped</div>
      ) : isLocked ? (
        <div style={S.lockedTag}>🔒 Locked</div>
      ) : (
        <button style={S.equipBtn} onClick={onEquip}>
          Equip →
        </button>
      )}
    </article>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
  modal: {
    gridTemplateColumns: "1fr 1.1fr",
    maxWidth: 980,
  },
  right: {
    display: "flex",
    flexDirection: "column",
    background: "rgba(10,7,3,0.5)",
    borderLeft: "1px solid rgba(245,233,211,0.05)",
    overflow: "hidden",
    minHeight: 0,
  },
  rightHeader: {
    padding: "22px 20px 12px",
    borderBottom: "1px solid rgba(245,233,211,0.05)",
    flexShrink: 0,
  },
  rightTitle: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: 20,
    fontWeight: 700,
    fontStyle: "italic",
    color: "#f5e9d3",
    letterSpacing: "-0.01em",
    lineHeight: 1,
  },
  rightSub: {
    fontFamily: "Outfit, sans-serif",
    fontSize: 10,
    color: "#4a3a2a",
    marginTop: 5,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },

  // ── Tab bar ─────────────────────────────────────────────────────
  tabBar: {
    display: "flex",
    borderBottom: "1px solid rgba(245,233,211,0.06)",
    flexShrink: 0,
  },
  tab: {
    flex: 1,
    position: "relative",
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    color: "#5a4a38",
    fontFamily: "Outfit, sans-serif",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    padding: "11px 4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    transition: "color 0.18s",
  },
  tabActive: {
    color: "#f0b540",
    borderBottomColor: "#f0b540",
  },
  tabIndicator: {
    display: "none",
  },

  // ── Grid ────────────────────────────────────────────────────────
  grid: {
    flex: 1,
    overflowY: "auto",
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(240,181,64,0.15) transparent",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(128px, 1fr))",
    gap: 12,
    padding: "14px 18px 20px",
    alignContent: "start",
  },

  // ── Cards ────────────────────────────────────────────────────────
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0 0 10px",
    border: "1px solid rgba(245,233,211,0.07)",
    borderRadius: 10,
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(160deg, rgba(24,18,12,0.9), rgba(16,12,8,0.95))",
    transition: "border-color 0.18s, box-shadow 0.18s, transform 0.15s",
    cursor: "default",
    gap: 0,
  },
  rarityStripe: {
    width: "100%",
    height: 2,
    borderRadius: "10px 10px 0 0",
    flexShrink: 0,
    marginBottom: 0,
  },
  cardName: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: 11,
    fontWeight: 700,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 7,
    lineHeight: 1.2,
    padding: "0 6px",
    width: "100%",
  },
  cardRarity: {
    fontFamily: "Outfit, sans-serif",
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: "0.1em",
    marginTop: 3,
    marginBottom: 6,
  },

  // ── Action buttons ────────────────────────────────────────────────
  equippedTag: {
    fontFamily: "Outfit, sans-serif",
    fontSize: 9,
    fontWeight: 700,
    color: "#f0b540",
    padding: "4px 10px",
    border: "1px solid rgba(240,181,64,0.3)",
    borderRadius: 5,
    background: "rgba(240,181,64,0.08)",
    letterSpacing: "0.05em",
  },
  lockedTag: {
    fontFamily: "Outfit, sans-serif",
    fontSize: 9,
    color: "#3a2e24",
    padding: "4px 10px",
    border: "1px solid rgba(245,233,211,0.06)",
    borderRadius: 5,
  },
  equipBtn: {
    background: "linear-gradient(135deg, #2d1f0a, #3d2c12)",
    border: "1px solid rgba(240,181,64,0.28)",
    borderRadius: 5,
    color: "#f0b540",
    fontFamily: "Outfit, sans-serif",
    fontSize: 9,
    fontWeight: 700,
    padding: "4px 10px",
    cursor: "pointer",
    letterSpacing: "0.05em",
    transition: "opacity 0.15s",
  },
};
