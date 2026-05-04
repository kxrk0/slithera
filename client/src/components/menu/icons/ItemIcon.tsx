import { RARITY_COLOR, type Rarity } from "../../../../../shared/constants";
import {
  DarkCrownIcon, SantaIcon, CrownIcon, PharaohIcon, SamuraiIcon,
  FireCrownIcon, PlagueIcon, HornsIcon, AngelIcon, IceCrownIcon, VikingIcon,
  HelmIcon, TopHatIcon, WizardIcon, BladeIcon, DetectiveIcon, JesterIcon,
  NinjaIcon, FlowerCrownIcon, PartyHatIcon, MortarIcon, HardhatIcon, CowboyIcon,
  HaloIcon, VisorIcon, CapIcon, BunnyIcon,
} from "./HatIcons";
import {
  DragonCharmIcon, PhoenixCharmIcon, VoidOrbIcon,
  AtomIcon, CrystalCharmIcon, CrownCharmIcon,
  DiamondIcon, KeyIcon, TridentIcon, SwordIcon, InfinityIcon,
  HourglassIcon, CompassIcon, SpiralIcon, RuneIcon,
  SkullIcon, MoonIcon, CubeIcon, ShieldIcon, SnowflakeIcon,
  GearIcon, CrossIcon, FeatherIcon, CloverIcon, AnchorIcon,
  StarIcon, BoltIcon, FireCharmIcon, EyeIcon, HeartIcon, ArrowIcon,
} from "./CharmIcons";
import {
  RainbowSkinIcon, LotusSkinIcon, AuroraSkinIcon,
  ObsidianSkinIcon, LavaSkinIcon, InfernoSkinIcon,
  TideSkinIcon, CoalSkinIcon, MidnightSkinIcon, ChromeSkinIcon, GlacialSkinIcon,
  VoidVioletSkinIcon, SolarGoldSkinIcon,
  ShadowSkinIcon, CrimsonSkinIcon, ArcticSkinIcon, SakuraSkinIcon, PoisonSkinIcon,
  CyanCoreSkinIcon, EmbercoilSkinIcon, VenomLimeSkinIcon,
  SparkleTrailIcon, ShadowTrailIcon, FireTrailIcon, IceTrailIcon, RainbowTrailIcon,
  SakuraTrailIcon, VoidTrailIcon, GoldTrailIcon, LightningTrailIcon, AuroraTrailIcon,
} from "./SkinTrailIcons";

type IconFn = (size: number) => React.ReactElement;

const ICONS: Record<string, IconFn> = {
  // ── Hats ──────────────────────────────────────────────────────────────────
  "hat.dark-crown":  (s) => <DarkCrownIcon size={s}/>,
  "hat.santa":       (s) => <SantaIcon size={s}/>,
  "hat.crown":       (s) => <CrownIcon size={s}/>,
  "hat.pharaoh":     (s) => <PharaohIcon size={s}/>,
  "hat.samurai":     (s) => <SamuraiIcon size={s}/>,
  "hat.fire-crown":  (s) => <FireCrownIcon size={s}/>,
  "hat.plague":      (s) => <PlagueIcon size={s}/>,
  "hat.horns":       (s) => <HornsIcon size={s}/>,
  "hat.angel":       (s) => <AngelIcon size={s}/>,
  "hat.ice-crown":   (s) => <IceCrownIcon size={s}/>,
  "hat.viking":      (s) => <VikingIcon size={s}/>,
  "hat.helm":        (s) => <HelmIcon size={s}/>,
  "hat.top-hat":     (s) => <TopHatIcon size={s}/>,
  "hat.wizard":      (s) => <WizardIcon size={s}/>,
  "hat.blade":       (s) => <BladeIcon size={s}/>,
  "hat.detective":   (s) => <DetectiveIcon size={s}/>,
  "hat.jester":      (s) => <JesterIcon size={s}/>,
  "hat.ninja":       (s) => <NinjaIcon size={s}/>,
  "hat.flower":      (s) => <FlowerCrownIcon size={s}/>,
  "hat.party":       (s) => <PartyHatIcon size={s}/>,
  "hat.mortar":      (s) => <MortarIcon size={s}/>,
  "hat.hardhat":     (s) => <HardhatIcon size={s}/>,
  "hat.cowboy":      (s) => <CowboyIcon size={s}/>,
  "hat.halo":        (s) => <HaloIcon size={s}/>,
  "hat.visor":       (s) => <VisorIcon size={s}/>,
  "hat.cap":         (s) => <CapIcon size={s}/>,
  "hat.bunny":       (s) => <BunnyIcon size={s}/>,

  // ── Charms ────────────────────────────────────────────────────────────────
  "charm.dragon":      (s) => <DragonCharmIcon size={s}/>,
  "charm.phoenix":     (s) => <PhoenixCharmIcon size={s}/>,
  "charm.orb":         (s) => <VoidOrbIcon size={s}/>,
  "charm.atom":        (s) => <AtomIcon size={s}/>,
  "charm.crystal":     (s) => <CrystalCharmIcon size={s}/>,
  "charm.crown-charm": (s) => <CrownCharmIcon size={s}/>,
  "charm.diamond":     (s) => <DiamondIcon size={s}/>,
  "charm.key":         (s) => <KeyIcon size={s}/>,
  "charm.trident":     (s) => <TridentIcon size={s}/>,
  "charm.sword":       (s) => <SwordIcon size={s}/>,
  "charm.infinity":    (s) => <InfinityIcon size={s}/>,
  "charm.hourglass":   (s) => <HourglassIcon size={s}/>,
  "charm.compass":     (s) => <CompassIcon size={s}/>,
  "charm.spiral":      (s) => <SpiralIcon size={s}/>,
  "charm.rune":        (s) => <RuneIcon size={s}/>,
  "charm.skull":       (s) => <SkullIcon size={s}/>,
  "charm.moon":        (s) => <MoonIcon size={s}/>,
  "charm.cube":        (s) => <CubeIcon size={s}/>,
  "charm.shield":      (s) => <ShieldIcon size={s}/>,
  "charm.snowflake":   (s) => <SnowflakeIcon size={s}/>,
  "charm.gear":        (s) => <GearIcon size={s}/>,
  "charm.cross":       (s) => <CrossIcon size={s}/>,
  "charm.feather":     (s) => <FeatherIcon size={s}/>,
  "charm.clover":      (s) => <CloverIcon size={s}/>,
  "charm.anchor":      (s) => <AnchorIcon size={s}/>,
  "charm.star":        (s) => <StarIcon size={s}/>,
  "charm.bolt":        (s) => <BoltIcon size={s}/>,
  "charm.fire":        (s) => <FireCharmIcon size={s}/>,
  "charm.eye":         (s) => <EyeIcon size={s}/>,
  "charm.heart":       (s) => <HeartIcon size={s}/>,
  "charm.arrow":       (s) => <ArrowIcon size={s}/>,

  // ── Skins ─────────────────────────────────────────────────────────────────
  "skin.rainbow":      (s) => <RainbowSkinIcon size={s}/>,
  "skin.lotus":        (s) => <LotusSkinIcon size={s}/>,
  "skin.aurora":       (s) => <AuroraSkinIcon size={s}/>,
  "skin.obsidian":     (s) => <ObsidianSkinIcon size={s}/>,
  "skin.lava":         (s) => <LavaSkinIcon size={s}/>,
  "skin.inferno":      (s) => <InfernoSkinIcon size={s}/>,
  "skin.tide":         (s) => <TideSkinIcon size={s}/>,
  "skin.coal":         (s) => <CoalSkinIcon size={s}/>,
  "skin.midnight":     (s) => <MidnightSkinIcon size={s}/>,
  "skin.chrome":       (s) => <ChromeSkinIcon size={s}/>,
  "skin.glacial":      (s) => <GlacialSkinIcon size={s}/>,
  "skin.void-violet":  (s) => <VoidVioletSkinIcon size={s}/>,
  "skin.solar-gold":   (s) => <SolarGoldSkinIcon size={s}/>,
  "skin.shadow":       (s) => <ShadowSkinIcon size={s}/>,
  "skin.crimson":      (s) => <CrimsonSkinIcon size={s}/>,
  "skin.arctic":       (s) => <ArcticSkinIcon size={s}/>,
  "skin.sakura":       (s) => <SakuraSkinIcon size={s}/>,
  "skin.poison":       (s) => <PoisonSkinIcon size={s}/>,
  "skin.cyan-core":    (s) => <CyanCoreSkinIcon size={s}/>,
  "skin.embercoil":    (s) => <EmbercoilSkinIcon size={s}/>,
  "skin.venom-lime":   (s) => <VenomLimeSkinIcon size={s}/>,

  // ── Trails ────────────────────────────────────────────────────────────────
  "trail.sparkle":         (s) => <SparkleTrailIcon size={s}/>,
  "trail.shadow-trail":    (s) => <ShadowTrailIcon size={s}/>,
  "trail.fire-trail":      (s) => <FireTrailIcon size={s}/>,
  "trail.ice-trail":       (s) => <IceTrailIcon size={s}/>,
  "trail.rainbow-trail":   (s) => <RainbowTrailIcon size={s}/>,
  "trail.sakura-trail":    (s) => <SakuraTrailIcon size={s}/>,
  "trail.void-trail":      (s) => <VoidTrailIcon size={s}/>,
  "trail.gold-trail":      (s) => <GoldTrailIcon size={s}/>,
  "trail.lightning-trail": (s) => <LightningTrailIcon size={s}/>,
  "trail.aurora-trail":    (s) => <AuroraTrailIcon size={s}/>,
};

// ── Fallback ──────────────────────────────────────────────────────────────────

function FallbackIcon({ size, rarity }: { size: number; rarity: Rarity }) {
  const c = RARITY_COLOR[rarity] ?? "#8a7d68";
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <circle cx="30" cy="30" r="24" fill={c} opacity="0.15"/>
      <circle cx="30" cy="30" r="14" fill={c} opacity="0.4"/>
      <circle cx="30" cy="30" r="6" fill={c}/>
      <circle cx="24" cy="24" r="3" fill="white" opacity="0.25"/>
    </svg>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────

export function ItemIcon({
  itemId,
  rarity,
  size = 52,
}: {
  itemId: string;
  rarity: Rarity;
  size?: number;
}) {
  const fn = ICONS[itemId];
  if (fn) return fn(size);
  return <FallbackIcon size={size} rarity={rarity}/>;
}
