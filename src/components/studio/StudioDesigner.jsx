export default function StudioDesigner({
  business,
  title = "",
  subtitle = "",
  badge = "",
  image = "",
  logo = "",
  whatsapp = "",
  cta = "Consultanos",
  format = "1:1",
  style = "premium",
  model = "impact",
  titleColor = "#ffffff",
  textColor = "#ffffff",
  buttonColor = "#22c55e",
  textPosition = "bottom",
  textAlign = "left",

  titleFont = "Inter",
  subtitleFont = "Inter",
  titleSize = 112,
  subtitleSize = 38,

  extraImage = "",
  extraImagePosition = "belowSubtitle",
  extraImageSize = 32,
  extraImageRadius = 24,
}) {
  const size = getSize(format);
  const theme = getTheme(style);
  const layout = getLayout({ model, position: textPosition, align: textAlign, size });

  const data = {
    business,
    title,
    subtitle,
    badge,
    image,
    logo,
    whatsapp,
    cta,
    format,
    style,
    model,
    titleColor,
    textColor,
    buttonColor,
    textPosition,
    textAlign,
    titleFont,
    subtitleFont,
    titleSize,
    subtitleSize,
    extraImage,
    extraImagePosition,
    extraImageSize,
    extraImageRadius,
  };

  return (
    <Canvas size={size} theme={theme}>
      <Background image={image} theme={theme} model={model} />

      {normalizeModel(model) === "agency" && <AgencyPanel theme={theme} size={size} />}
      {normalizeModel(model) === "minimal" && <MinimalFrame theme={theme} />}
      {normalizeModel(model) === "impact" && <ImpactShapes theme={theme} />}

      <BrandBar data={data} theme={theme} model={model} />
      <MainContent data={data} theme={theme} layout={layout} model={model} size={size} />
      <FooterCTA data={data} theme={theme} model={model} />
    </Canvas>
  );
}

function Canvas({ size, theme, children }) {
  return (
    <div
      className="relative overflow-hidden select-none"
      style={{
        width: size.w,
        height: size.h,
        borderRadius: size.radius,
        background: theme.canvas,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {children}
    </div>
  );
}

function Background({ image, theme, model }) {
  const normalizedModel = normalizeModel(model);

  return (
    <>
      <div className="absolute inset-0" style={{ background: theme.canvas }} />

      {image && normalizedModel === "impact" && (
        <img
          src={image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: theme.imageOpacityImpact, filter: theme.imageFilter }}
        />
      )}

      {image && normalizedModel === "agency" && (
        <img
          src={image}
          alt=""
          className="absolute right-0 top-0 h-full object-cover"
          style={{
            width: "58%",
            opacity: theme.imageOpacityAgency,
            filter: theme.imageFilter,
          }}
        />
      )}

      {image && normalizedModel === "minimal" && (
        <img
          src={image}
          alt=""
          className="absolute object-cover shadow-2xl"
          style={{
            right: 72,
            bottom: 120,
            width: "38%",
            height: "38%",
            borderRadius: 46,
            opacity: theme.imageOpacityMinimal,
            filter: theme.imageFilter,
          }}
        />
      )}

      <div className="absolute inset-0" style={{ background: theme.overlay }} />

      <div
        className="absolute rounded-full blur-3xl"
        style={{
          width: 620,
          height: 620,
          top: -260,
          right: -220,
          background: theme.glowOne,
          opacity: theme.glowOpacityOne,
        }}
      />

      <div
        className="absolute rounded-full blur-3xl"
        style={{
          width: 560,
          height: 560,
          bottom: -260,
          left: -220,
          background: theme.glowTwo,
          opacity: theme.glowOpacityTwo,
        }}
      />

      {theme.pattern === "dots" && <DotsPattern theme={theme} />}
      {theme.pattern === "lines" && <LinesPattern theme={theme} />}
      {theme.pattern === "burst" && <BurstPattern theme={theme} />}
    </>
  );
}

function DotsPattern({ theme }) {
  return (
    <div
      className="absolute inset-0 opacity-30"
      style={{
        backgroundImage: `radial-gradient(${theme.patternColor} 2px, transparent 2px)`,
        backgroundSize: "34px 34px",
      }}
    />
  );
}

function LinesPattern({ theme }) {
  return (
    <div
      className="absolute inset-0 opacity-25"
      style={{
        backgroundImage: `linear-gradient(135deg, ${theme.patternColor} 1px, transparent 1px)`,
        backgroundSize: "34px 34px",
      }}
    />
  );
}

function BurstPattern({ theme }) {
  return (
    <div
      className="absolute inset-0 opacity-20"
      style={{
        background: `repeating-conic-gradient(from 0deg, ${theme.patternColor} 0deg 8deg, transparent 8deg 16deg)`,
        transform: "scale(1.6)",
      }}
    />
  );
}

function AgencyPanel({ theme, size }) {
  const isWide = size.w > size.h;

  return (
    <div
      className="absolute z-10 backdrop-blur-xl shadow-2xl"
      style={{
        left: 52,
        top: 52,
        bottom: 52,
        width: isWide ? "45%" : "55%",
        borderRadius: 54,
        background: theme.panel,
        border: `2px solid ${theme.frame}`,
      }}
    />
  );
}

function MinimalFrame({ theme }) {
  return (
    <>
      <div
        className="absolute z-10"
        style={{
          left: 58,
          right: 58,
          top: 58,
          bottom: 58,
          borderRadius: 58,
          border: `3px solid ${theme.frame}`,
        }}
      />

      <div
        className="absolute z-10"
        style={{
          left: 92,
          right: 92,
          top: 92,
          bottom: 92,
          borderRadius: 42,
          border: `1px solid ${theme.frameSoft}`,
        }}
      />
    </>
  );
}

function ImpactShapes({ theme }) {
  return (
    <>
      <div
        className="absolute z-10"
        style={{
          left: -120,
          bottom: 180,
          width: 520,
          height: 120,
          transform: "rotate(-12deg)",
          borderRadius: 999,
          background: theme.impactBand,
          opacity: 0.8,
        }}
      />

      <div
        className="absolute z-10"
        style={{
          right: -160,
          top: 260,
          width: 640,
          height: 130,
          transform: "rotate(-12deg)",
          borderRadius: 999,
          background: theme.impactBandTwo,
          opacity: 0.7,
        }}
      />
    </>
  );
}

function BrandBar({ data, theme, model }) {
  const normalizedModel = normalizeModel(model);

  return (
    <div
      className="absolute z-30 flex items-start justify-between gap-8"
      style={{
        top: normalizedModel === "minimal" ? 86 : 64,
        left: normalizedModel === "minimal" ? 92 : 68,
        right: normalizedModel === "minimal" ? 92 : 68,
      }}
    >
      <div className="flex items-center gap-5 min-w-0">
        {data.logo && (
          <img
            src={data.logo}
            alt=""
            className="object-cover shadow-2xl bg-white"
            style={{
              width: normalizedModel === "minimal" ? 74 : 84,
              height: normalizedModel === "minimal" ? 74 : 84,
              borderRadius: theme.logoRadius,
              border: `2px solid ${theme.logoBorder}`,
            }}
          />
        )}

        <div className="min-w-0">
          <p
            className="truncate"
            style={{
              color: theme.brandText,
              fontFamily: getFontFamily("Inter"),
              fontSize: normalizedModel === "impact" ? 28 : 25,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: theme.brandSpacing,
              textTransform: theme.brandTransform,
              maxWidth: 560,
              textShadow: theme.brandShadow,
            }}
          >
            {data.business?.negocio || "Tu comercio"}
          </p>

          <p
            style={{
              color: theme.muted,
              fontSize: 18,
              marginTop: 8,
              fontWeight: 800,
            }}
          >
            {data.business?.ciudad || "TusComercios"}
          </p>
        </div>
      </div>

      {data.badge && <Badge text={data.badge} theme={theme} model={model} />}
    </div>
  );
}

function Badge({ text, theme, model }) {
  const normalizedModel = normalizeModel(model);

  return (
    <div
      className="shadow-2xl whitespace-nowrap"
      style={{
        padding: normalizedModel === "impact" ? "18px 28px" : "14px 24px",
        borderRadius: theme.badgeRadius,
        background: theme.badgeBg,
        color: theme.badgeText,
        border: `2px solid ${theme.badgeBorder}`,
        fontFamily: getFontFamily("Inter"),
        fontSize: normalizedModel === "impact" ? 30 : 24,
        fontWeight: 950,
        letterSpacing: theme.badgeSpacing,
        textTransform: theme.badgeTransform,
        transform: theme.badgeTilt,
      }}
    >
      {text}
    </div>
  );
}

function MainContent({ data, theme, layout, model, size }) {
  const normalizedModel = normalizeModel(model);

  return (
    <div
      className="absolute z-30"
      style={{
        top: layout.top,
        bottom: layout.bottom,
        left: layout.left,
        right: layout.right,
        transform: layout.transform,
        maxWidth: layout.maxWidth,
        textAlign: layout.textAlign,
      }}
    >
      {normalizedModel === "minimal" && (
        <div
          style={{
            width: 92,
            height: 8,
            borderRadius: 999,
            marginBottom: 34,
            background: theme.accent,
            marginLeft: layout.textAlign === "center" || layout.textAlign === "right" ? "auto" : 0,
            marginRight: layout.textAlign === "center" ? "auto" : 0,
          }}
        />
      )}

      <h1
        style={{
          margin: 0,
          color: data.titleColor || theme.title,
          fontFamily: getFontFamily(data.titleFont),
          fontSize: Number(data.titleSize) || getTitleSize(normalizedModel, data.format),
          fontWeight: theme.titleWeight,
          lineHeight: theme.titleLineHeight,
          letterSpacing: theme.titleSpacing,
          textTransform: theme.titleTransform,
          textShadow: theme.titleShadow,
        }}
      >
        {data.title || "Título principal"}
      </h1>

      {data.extraImage && data.extraImagePosition === "belowTitle" && (
        <ExtraImage data={data} layout={layout} size={size} />
      )}

      {data.subtitle && (
        <p
          style={{
            marginTop: normalizedModel === "impact" ? 30 : 34,
            marginBottom: 0,
            color: data.textColor || theme.text,
            fontFamily: getFontFamily(data.subtitleFont),
            fontSize: Number(data.subtitleSize) || getSubtitleSize(normalizedModel, data.format),
            fontWeight: theme.subtitleWeight,
            lineHeight: 1.1,
            textShadow: theme.textShadow,
            maxWidth: normalizedModel === "minimal" ? 720 : 850,
          }}
        >
          {data.subtitle}
        </p>
      )}

      {data.extraImage && data.extraImagePosition === "belowSubtitle" && (
        <ExtraImage data={data} layout={layout} size={size} />
      )}
    </div>
  );
}

function ExtraImage({ data, layout, size }) {
  const widthPercent = Number(data.extraImageSize) || 32;
  const maxWidth = size.w * (widthPercent / 100);

  return (
    <img
      src={data.extraImage}
      alt=""
      className="object-cover shadow-2xl"
      style={{
        display: "block",
        width: maxWidth,
        height: maxWidth * 0.56,
        borderRadius: Number(data.extraImageRadius) || 24,
        marginTop: 30,
        marginLeft: layout.textAlign === "center" || layout.textAlign === "right" ? "auto" : 0,
        marginRight: layout.textAlign === "center" ? "auto" : 0,
        border: "2px solid rgba(255,255,255,.25)",
      }}
    />
  );
}

function FooterCTA({ data, theme, model }) {
  const normalizedModel = normalizeModel(model);

  return (
    <div
      className="absolute z-30 flex items-end justify-between gap-6"
      style={{
        left: normalizedModel === "minimal" ? 92 : 68,
        right: normalizedModel === "minimal" ? 92 : 68,
        bottom: normalizedModel === "minimal" ? 86 : 62,
      }}
    >
      <div
        className="shadow-2xl"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: normalizedModel === "impact" ? 74 : 66,
          padding: normalizedModel === "impact" ? "20px 34px" : "17px 30px",
          borderRadius: theme.buttonRadius,
          background: data.buttonColor || theme.button,
          color: theme.buttonText,
          border: `2px solid ${theme.buttonBorder}`,
          fontFamily: getFontFamily("Inter"),
          fontSize: normalizedModel === "impact" ? 28 : 24,
          fontWeight: 950,
          letterSpacing: theme.buttonSpacing,
          textTransform: theme.buttonTransform,
        }}
      >
        {data.cta || "Consultanos"}
      </div>

      <div style={{ textAlign: "right" }}>
        {data.whatsapp && (
          <p
            style={{
              margin: 0,
              color: theme.brandText,
              fontFamily: getFontFamily("Inter"),
              fontSize: 26,
              fontWeight: 950,
              lineHeight: 1,
              textShadow: theme.brandShadow,
            }}
          >
            {data.whatsapp}
          </p>
        )}

        <p
          style={{
            margin: 0,
            marginTop: 10,
            color: theme.muted,
            fontSize: 18,
            fontWeight: 800,
          }}
        >
          TusComercios Studio
        </p>
      </div>
    </div>
  );
}

function getLayout({ model, position, align, size }) {
  const normalizedModel = normalizeModel(model);

  let top = "auto";
  let bottom = "23%";
  let transform = "none";

  if (position === "top") {
    top = normalizedModel === "minimal" ? "24%" : "22%";
    bottom = "auto";
  }

  if (position === "center") {
    top = "50%";
    bottom = "auto";
    transform = "translateY(-50%)";
  }

  if (position === "bottom") {
    top = "auto";
    bottom = normalizedModel === "impact" ? "24%" : "25%";
  }

  let textAlign = "left";
  if (align === "center") textAlign = "center";
  if (align === "right") textAlign = "right";

  let left = 78;
  let right = 78;
  let maxWidth = 860;

  if (normalizedModel === "agency") {
    left = 92;
    right = size.w > size.h ? size.w * 0.56 : size.w * 0.44;
    maxWidth = 620;
  }

  if (normalizedModel === "minimal") {
    left = 112;
    right = 112;
    maxWidth = size.w > size.h ? 820 : 780;
  }

  if (normalizedModel === "impact") {
    left = 72;
    right = 72;
    maxWidth = size.w > size.h ? 1100 : 920;
  }

  if (textAlign === "center" || textAlign === "right") {
    maxWidth = "calc(100% - 150px)";
  }

  return { top, bottom, transform, left, right, maxWidth, textAlign };
}

function getSize(format) {
  if (format === "9:16") return { w: 1080, h: 1920, radius: 58 };
  if (format === "16:9") return { w: 1920, h: 1080, radius: 58 };
  if (format === "4:5") return { w: 1080, h: 1350, radius: 58 };
  return { w: 1080, h: 1080, radius: 58 };
}

function getTitleSize(model, format) {
  if (format === "16:9") {
    if (model === "impact") return 126;
    if (model === "agency") return 92;
    return 96;
  }

  if (format === "9:16") {
    if (model === "impact") return 128;
    if (model === "agency") return 92;
    return 104;
  }

  if (model === "impact") return 112;
  if (model === "agency") return 84;
  return 92;
}

function getSubtitleSize(model, format) {
  if (format === "16:9") {
    if (model === "impact") return 40;
    if (model === "agency") return 34;
    return 36;
  }

  if (format === "9:16") {
    if (model === "impact") return 42;
    if (model === "agency") return 36;
    return 38;
  }

  if (model === "impact") return 38;
  if (model === "agency") return 32;
  return 34;
}

function getFontFamily(font) {
  const fonts = {
    Inter: "Inter, system-ui, sans-serif",
    Poppins: "Poppins, Inter, system-ui, sans-serif",
    Montserrat: "Montserrat, Inter, system-ui, sans-serif",
    Bebas: "'Bebas Neue', Impact, Arial Black, sans-serif",
    Impact: "Impact, Haettenschweiler, Arial Black, sans-serif",
    Georgia: "Georgia, Cambria, serif",
    Playfair: "'Playfair Display', Georgia, serif",
    Arial: "Arial, Helvetica, sans-serif",
  };

  return fonts[font] || fonts.Inter;
}

function getTheme(style) {
  const normalizedStyle = normalizeStyle(style);

  const themes = {
    premium: {
      canvas: "linear-gradient(135deg, #020617 0%, #312e81 45%, #111827 100%)",
      overlay: "linear-gradient(135deg, rgba(2,6,23,.72), rgba(49,46,129,.38), rgba(245,158,11,.16))",
      panel: "rgba(2, 6, 23, .66)",
      frame: "rgba(255,255,255,.20)",
      frameSoft: "rgba(255,255,255,.10)",
      glowOne: "#f59e0b",
      glowTwo: "#6366f1",
      glowOpacityOne: 0.62,
      glowOpacityTwo: 0.48,
      impactBand: "rgba(245,158,11,.88)",
      impactBandTwo: "rgba(99,102,241,.72)",
      accent: "#f59e0b",
      imageOpacityImpact: 0.88,
      imageOpacityAgency: 0.95,
      imageOpacityMinimal: 0.96,
      imageFilter: "contrast(1.08) saturate(1.08)",
      pattern: "lines",
      patternColor: "rgba(255,255,255,.16)",
      badgeBg: "linear-gradient(135deg, #fbbf24, #f59e0b)",
      badgeText: "#111827",
      badgeBorder: "rgba(255,255,255,.48)",
      badgeRadius: 999,
      badgeSpacing: "-.03em",
      badgeTransform: "uppercase",
      badgeTilt: "rotate(-2deg)",
      button: "#22c55e",
      buttonText: "#ffffff",
      buttonBorder: "rgba(255,255,255,.25)",
      buttonRadius: 28,
      buttonSpacing: "-.02em",
      buttonTransform: "uppercase",
      title: "#ffffff",
      text: "#dbeafe",
      brandText: "#ffffff",
      muted: "rgba(255,255,255,.74)",
      titleWeight: 950,
      titleLineHeight: 0.82,
      titleSpacing: "-.075em",
      titleTransform: "uppercase",
      subtitleWeight: 850,
      brandSpacing: "-.03em",
      brandTransform: "uppercase",
      logoRadius: 28,
      logoBorder: "rgba(255,255,255,.45)",
      titleShadow: "0 16px 42px rgba(0,0,0,.58)",
      textShadow: "0 10px 26px rgba(0,0,0,.42)",
      brandShadow: "0 8px 22px rgba(0,0,0,.35)",
    },

    moderno: {
      canvas: "linear-gradient(135deg, #020617 0%, #1d4ed8 52%, #06b6d4 100%)",
      overlay: "linear-gradient(135deg, rgba(2,6,23,.58), rgba(29,78,216,.30), rgba(6,182,212,.18))",
      panel: "rgba(2, 6, 23, .58)",
      frame: "rgba(255,255,255,.22)",
      frameSoft: "rgba(255,255,255,.12)",
      glowOne: "#38bdf8",
      glowTwo: "#2563eb",
      glowOpacityOne: 0.64,
      glowOpacityTwo: 0.45,
      impactBand: "rgba(56,189,248,.82)",
      impactBandTwo: "rgba(37,99,235,.72)",
      accent: "#38bdf8",
      imageOpacityImpact: 0.84,
      imageOpacityAgency: 0.94,
      imageOpacityMinimal: 0.96,
      imageFilter: "contrast(1.12) saturate(1.18)",
      pattern: "dots",
      patternColor: "rgba(255,255,255,.18)",
      badgeBg: "#38bdf8",
      badgeText: "#020617",
      badgeBorder: "rgba(255,255,255,.42)",
      badgeRadius: 24,
      badgeSpacing: "-.04em",
      badgeTransform: "uppercase",
      badgeTilt: "rotate(0deg)",
      button: "#22c55e",
      buttonText: "#ffffff",
      buttonBorder: "rgba(255,255,255,.25)",
      buttonRadius: 24,
      buttonSpacing: "-.035em",
      buttonTransform: "uppercase",
      title: "#ffffff",
      text: "#e0f2fe",
      brandText: "#ffffff",
      muted: "rgba(255,255,255,.76)",
      titleWeight: 950,
      titleLineHeight: 0.84,
      titleSpacing: "-.08em",
      titleTransform: "uppercase",
      subtitleWeight: 850,
      brandSpacing: "-.035em",
      brandTransform: "uppercase",
      logoRadius: 26,
      logoBorder: "rgba(255,255,255,.40)",
      titleShadow: "0 14px 34px rgba(0,0,0,.48)",
      textShadow: "0 8px 22px rgba(0,0,0,.35)",
      brandShadow: "0 7px 18px rgba(0,0,0,.32)",
    },

    vintage: {
      canvas: "linear-gradient(135deg, #3f1d0b 0%, #7c2d12 50%, #f59e0b 100%)",
      overlay: "linear-gradient(135deg, rgba(63,29,11,.76), rgba(124,45,18,.42), rgba(245,158,11,.24))",
      panel: "rgba(63, 29, 11, .66)",
      frame: "rgba(254,215,170,.38)",
      frameSoft: "rgba(254,215,170,.18)",
      glowOne: "#facc15",
      glowTwo: "#fb923c",
      glowOpacityOne: 0.58,
      glowOpacityTwo: 0.42,
      impactBand: "rgba(250,204,21,.76)",
      impactBandTwo: "rgba(251,146,60,.70)",
      accent: "#facc15",
      imageOpacityImpact: 0.82,
      imageOpacityAgency: 0.92,
      imageOpacityMinimal: 0.94,
      imageFilter: "sepia(.22) contrast(1.08) saturate(.96)",
      pattern: "lines",
      patternColor: "rgba(255,237,213,.20)",
      badgeBg: "#facc15",
      badgeText: "#3f1d0b",
      badgeBorder: "rgba(255,247,237,.62)",
      badgeRadius: 18,
      badgeSpacing: ".02em",
      badgeTransform: "none",
      badgeTilt: "rotate(-3deg)",
      button: "#f97316",
      buttonText: "#ffffff",
      buttonBorder: "rgba(255,237,213,.35)",
      buttonRadius: 18,
      buttonSpacing: ".01em",
      buttonTransform: "none",
      title: "#fff7ed",
      text: "#fed7aa",
      brandText: "#fff7ed",
      muted: "rgba(255,237,213,.80)",
      titleWeight: 900,
      titleLineHeight: 0.9,
      titleSpacing: "-.035em",
      titleTransform: "none",
      subtitleWeight: 750,
      brandSpacing: "-.01em",
      brandTransform: "none",
      logoRadius: 18,
      logoBorder: "rgba(255,237,213,.52)",
      titleShadow: "0 14px 30px rgba(63,29,11,.62)",
      textShadow: "0 8px 18px rgba(63,29,11,.50)",
      brandShadow: "0 7px 16px rgba(63,29,11,.45)",
    },

    elegante: {
      canvas: "linear-gradient(135deg, #030712 0%, #111827 55%, #27272a 100%)",
      overlay: "linear-gradient(135deg, rgba(3,7,18,.80), rgba(17,24,39,.54), rgba(212,175,55,.12))",
      panel: "rgba(3, 7, 18, .72)",
      frame: "rgba(212,175,55,.40)",
      frameSoft: "rgba(212,175,55,.18)",
      glowOne: "#d4af37",
      glowTwo: "#6b7280",
      glowOpacityOne: 0.46,
      glowOpacityTwo: 0.32,
      impactBand: "rgba(212,175,55,.68)",
      impactBandTwo: "rgba(255,255,255,.22)",
      accent: "#d4af37",
      imageOpacityImpact: 0.78,
      imageOpacityAgency: 0.90,
      imageOpacityMinimal: 0.94,
      imageFilter: "contrast(1.06) saturate(.86)",
      pattern: "lines",
      patternColor: "rgba(212,175,55,.16)",
      badgeBg: "#d4af37",
      badgeText: "#111827",
      badgeBorder: "rgba(255,255,255,.42)",
      badgeRadius: 999,
      badgeSpacing: ".08em",
      badgeTransform: "uppercase",
      badgeTilt: "rotate(0deg)",
      button: "#ffffff",
      buttonText: "#111827",
      buttonBorder: "rgba(212,175,55,.55)",
      buttonRadius: 999,
      buttonSpacing: ".08em",
      buttonTransform: "uppercase",
      title: "#ffffff",
      text: "#d1d5db",
      brandText: "#ffffff",
      muted: "rgba(255,255,255,.68)",
      titleWeight: 850,
      titleLineHeight: 0.9,
      titleSpacing: "-.04em",
      titleTransform: "uppercase",
      subtitleWeight: 650,
      brandSpacing: ".04em",
      brandTransform: "uppercase",
      logoRadius: 999,
      logoBorder: "rgba(212,175,55,.50)",
      titleShadow: "0 16px 38px rgba(0,0,0,.68)",
      textShadow: "0 8px 22px rgba(0,0,0,.48)",
      brandShadow: "0 7px 18px rgba(0,0,0,.42)",
    },

    oferta: {
      canvas: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 50%, #f97316 100%)",
      overlay: "linear-gradient(135deg, rgba(127,29,29,.72), rgba(220,38,38,.46), rgba(250,204,21,.20))",
      panel: "rgba(127, 29, 29, .66)",
      frame: "rgba(254,226,226,.28)",
      frameSoft: "rgba(254,226,226,.14)",
      glowOne: "#facc15",
      glowTwo: "#fb7185",
      glowOpacityOne: 0.70,
      glowOpacityTwo: 0.48,
      impactBand: "rgba(250,204,21,.90)",
      impactBandTwo: "rgba(255,255,255,.28)",
      accent: "#facc15",
      imageOpacityImpact: 0.84,
      imageOpacityAgency: 0.92,
      imageOpacityMinimal: 0.95,
      imageFilter: "contrast(1.16) saturate(1.24)",
      pattern: "burst",
      patternColor: "rgba(255,255,255,.28)",
      badgeBg: "#facc15",
      badgeText: "#7f1d1d",
      badgeBorder: "rgba(255,255,255,.65)",
      badgeRadius: 18,
      badgeSpacing: "-.04em",
      badgeTransform: "uppercase",
      badgeTilt: "rotate(-4deg)",
      button: "#16a34a",
      buttonText: "#ffffff",
      buttonBorder: "rgba(255,255,255,.35)",
      buttonRadius: 18,
      buttonSpacing: "-.04em",
      buttonTransform: "uppercase",
      title: "#ffffff",
      text: "#fee2e2",
      brandText: "#ffffff",
      muted: "rgba(255,255,255,.76)",
      titleWeight: 950,
      titleLineHeight: 0.78,
      titleSpacing: "-.035em",
      titleTransform: "uppercase",
      subtitleWeight: 950,
      brandSpacing: "-.03em",
      brandTransform: "uppercase",
      logoRadius: 20,
      logoBorder: "rgba(255,255,255,.48)",
      titleShadow: "0 14px 28px rgba(0,0,0,.58)",
      textShadow: "0 8px 18px rgba(0,0,0,.48)",
      brandShadow: "0 7px 18px rgba(0,0,0,.42)",
    },
  };

  return themes[normalizedStyle] || themes.premium;
}

function normalizeModel(model) {
  if (model === "agencia") return "agency";
  if (model === "impacto") return "impact";
  if (model === "minimalista") return "minimal";
  return model || "impact";
}

function normalizeStyle(style) {
  if (style === "ofertaFuerte") return "oferta";
  if (style === "oferta-fuerte") return "oferta";
  if (style === "Oferta Fuerte") return "oferta";
  return style || "premium";
}