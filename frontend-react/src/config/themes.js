// Tier styling and theme configuration
export const TIER_STYLES = {
  NONE: { accent: "#0078D4", glow: "rgba(0,120,212,0.2)" },
  BRONZE: { accent: "#CD7F32", glow: "rgba(205,127,50,0.2)" },
  SILVER: { accent: "#C0C0C0", glow: "rgba(192,192,192,0.2)" },
  GOLD: { accent: "#FFB900", glow: "rgba(255,185,0,0.2)" },
  DIAMOND: { accent: "#00D4FF", glow: "rgba(0,212,255,0.3)" },
  WHALE: { accent: "#9400D3", glow: "rgba(148,0,211,0.3)" },
};

// Background gradient styles
export const getBackgroundStyle = (profile, backgroundImage) => {
  const theme = TIER_STYLES[profile?.holderTier || "NONE"];
  
  if (backgroundImage) {
    return {
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  
  return {
    background: `
      radial-gradient(ellipse 80% 50% at 50% -20%, ${theme?.glow || 'rgba(0,120,212,0.2)'}, transparent),
      radial-gradient(ellipse 80% 50% at 80% 80%, rgba(120,119,198,0.3), transparent),
      linear-gradient(180deg, #0c1929 0%, #151f2e 50%, #1a2332 100%)
    `,
  };
};
