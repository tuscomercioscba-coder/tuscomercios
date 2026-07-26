import {
  BRAND_FONT_OPTIONS,
  getBrandCssVariables,
} from "../BrandEngine";

function getFontFamily(fontId) {
  return (
    BRAND_FONT_OPTIONS.find((font) => font.id === fontId)?.family ||
    "Inter, Arial, sans-serif"
  );
}

export default function BrandPreview({
  brandKit,
  business,
}) {
  const variables = getBrandCssVariables(brandKit);
  const titleFont = getFontFamily(
    brandKit.typography.primaryFont
  );
  const bodyFont = getFontFamily(
    brandKit.typography.secondaryFont
  );

  return (
    <section
      className="overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-2xl"
      style={variables}
    >
      <div
        className="relative min-h-[560px] p-6 sm:p-8"
        style={{
          background: `linear-gradient(145deg, ${brandKit.colors.secondary}, ${brandKit.colors.primary})`,
        }}
      >
        <div
          className="absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl"
          style={{
            backgroundColor: brandKit.colors.accent,
            opacity: 0.22,
          }}
        />

        <div className="relative z-10 flex h-full min-h-[500px] flex-col justify-between">
          <div>
            <div className="flex items-center gap-4">
              {brandKit.logos.primary ? (
                <img
                  src={brandKit.logos.primary}
                  alt=""
                  className="h-20 w-20 rounded-3xl bg-white/10 object-contain p-2 shadow-xl"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 text-2xl font-black text-white">
                  TC
                </div>
              )}

              <div className="min-w-0">
                <p
                  className="truncate text-2xl font-black text-white"
                  style={{ fontFamily: titleFont }}
                >
                  {brandKit.identity.businessName ||
                    business?.negocio ||
                    "Tu marca"}
                </p>

                <p
                  className="mt-1 truncate text-sm font-semibold text-white/75"
                  style={{ fontFamily: bodyFont }}
                >
                  {brandKit.identity.slogan ||
                    "Una identidad clara y profesional"}
                </p>
              </div>
            </div>

            <div className="mt-12">
              <span
                className="inline-flex rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em]"
                style={{
                  backgroundColor: brandKit.colors.accent,
                  color: brandKit.button.textColor,
                  fontFamily: bodyFont,
                }}
              >
                {brandKit.style.preferredStyle}
              </span>

              <h2
                className="mt-5 max-w-xl text-4xl font-black leading-tight text-white sm:text-5xl"
                style={{ fontFamily: titleFont }}
              >
                Tu identidad visual aplicada automáticamente
              </h2>

              <p
                className="mt-4 max-w-xl text-base font-semibold leading-relaxed text-white/75"
                style={{ fontFamily: bodyFont }}
              >
                {brandKit.identity.shortDescription ||
                  "Tus imágenes, reels y campañas usarán los mismos colores, tipografías y estilo."}
              </p>
            </div>
          </div>

          <div>
            <button
              type="button"
              className="min-h-14 px-6 py-3 font-black shadow-xl"
              style={{
                backgroundColor: brandKit.button.backgroundColor,
                color: brandKit.button.textColor,
                borderRadius: `${brandKit.button.borderRadius}px`,
                border: `${brandKit.button.borderWidth}px solid ${brandKit.button.borderColor}`,
                fontFamily: bodyFont,
              }}
            >
              {brandKit.content.preferredCta}
            </button>

            <div className="mt-6 grid grid-cols-5 gap-2">
              {[
                brandKit.colors.primary,
                brandKit.colors.secondary,
                brandKit.colors.accent,
                brandKit.colors.background,
                brandKit.colors.text,
              ].map((color) => (
                <div
                  key={color}
                  className="h-12 rounded-2xl border border-white/20 shadow"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
