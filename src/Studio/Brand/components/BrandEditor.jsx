import {
  BRAND_CTA_OPTIONS,
  BRAND_FONT_OPTIONS,
  BRAND_STYLE_OPTIONS,
  WATERMARK_POSITIONS,
} from "../BrandEngine";

export default function BrandEditor({
  brandKit,
  disabled,
  onChange,
  onUploadLogo,
}) {
  function updateSection(section, changes) {
    onChange({
      ...brandKit,
      [section]: {
        ...brandKit[section],
        ...changes,
      },
    });
  }

  return (
    <div className="min-w-0 max-w-full space-y-5 overflow-hidden">
      <Panel title="Identidad">
        <TextField
          label="Nombre comercial"
          value={brandKit.identity.businessName}
          disabled={disabled}
          onChange={(value) =>
            updateSection("identity", {
              businessName: value,
            })
          }
        />

        <div className="mt-4">
          <TextField
            label="Eslogan"
            value={brandKit.identity.slogan}
            disabled={disabled}
            onChange={(value) =>
              updateSection("identity", {
                slogan: value,
              })
            }
          />
        </div>

        <label className="mt-4 block">
          <span className="text-sm font-black text-slate-800">
            Descripción breve
          </span>

          <textarea
            value={brandKit.identity.shortDescription}
            disabled={disabled}
            onChange={(event) =>
              updateSection("identity", {
                shortDescription: event.target.value,
              })
            }
            rows="4"
            maxLength="300"
            className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 font-semibold text-slate-800 outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50"
          />
        </label>
      </Panel>

      <Panel title="Logos">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["primary", "Logo principal"],
            ["white", "Logo blanco"],
            ["dark", "Logo oscuro"],
            ["symbol", "Isotipo"],
          ].map(([type, label]) => (
            <LogoUploader
              key={type}
              type={type}
              label={label}
              value={brandKit.logos[type]}
              disabled={disabled}
              onUpload={onUploadLogo}
              onRemove={() =>
                updateSection("logos", {
                  [type]: "",
                  [`${type}Path`]: "",
                })
              }
            />
          ))}
        </div>
      </Panel>

      <Panel title="Colores">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["primary", "Primario"],
            ["secondary", "Secundario"],
            ["accent", "Acento"],
            ["background", "Fondo"],
            ["surface", "Superficie"],
            ["text", "Texto"],
            ["textSoft", "Texto suave"],
          ].map(([key, label]) => (
            <ColorField
              key={key}
              label={label}
              value={brandKit.colors[key]}
              disabled={disabled}
              onChange={(value) =>
                updateSection("colors", {
                  [key]: value,
                })
              }
            />
          ))}
        </div>
      </Panel>

      <Panel title="Tipografías">
        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField
            label="Principal"
            value={brandKit.typography.primaryFont}
            disabled={disabled}
            options={BRAND_FONT_OPTIONS.map((font) => [
              font.id,
              font.name,
            ])}
            onChange={(value) =>
              updateSection("typography", {
                primaryFont: value,
              })
            }
          />

          <SelectField
            label="Secundaria"
            value={brandKit.typography.secondaryFont}
            disabled={disabled}
            options={BRAND_FONT_OPTIONS.map((font) => [
              font.id,
              font.name,
            ])}
            onChange={(value) =>
              updateSection("typography", {
                secondaryFont: value,
              })
            }
          />
        </div>
      </Panel>

      <Panel title="Estilo visual">
        <SelectField
          label="Estilo favorito"
          value={brandKit.style.preferredStyle}
          disabled={disabled}
          options={BRAND_STYLE_OPTIONS.map((style) => [
            style.id,
            style.name,
          ])}
          onChange={(value) =>
            updateSection("style", {
              preferredStyle: value,
            })
          }
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <RangeField
            label="Redondeado"
            value={brandKit.style.cornerRadius}
            min={0}
            max={80}
            suffix="px"
            disabled={disabled}
            onChange={(value) =>
              updateSection("style", {
                cornerRadius: value,
              })
            }
          />

          <RangeField
            label="Sombras"
            value={brandKit.style.shadowStrength}
            min={0}
            max={100}
            suffix="%"
            disabled={disabled}
            onChange={(value) =>
              updateSection("style", {
                shadowStrength: value,
              })
            }
          />
        </div>
      </Panel>

      <Panel title="Botón y CTA">
        <SelectField
          label="CTA favorito"
          value={brandKit.content.preferredCta}
          disabled={disabled}
          options={BRAND_CTA_OPTIONS.map((cta) => [
            cta,
            cta,
          ])}
          onChange={(value) =>
            updateSection("content", {
              preferredCta: value,
            })
          }
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ColorField
            label="Fondo"
            value={brandKit.button.backgroundColor}
            disabled={disabled}
            onChange={(value) =>
              updateSection("button", {
                backgroundColor: value,
              })
            }
          />

          <ColorField
            label="Texto"
            value={brandKit.button.textColor}
            disabled={disabled}
            onChange={(value) =>
              updateSection("button", {
                textColor: value,
              })
            }
          />
        </div>

        <div className="mt-4">
          <RangeField
            label="Redondeado del botón"
            value={brandKit.button.borderRadius}
            min={0}
            max={60}
            suffix="px"
            disabled={disabled}
            onChange={(value) =>
              updateSection("button", {
                borderRadius: value,
              })
            }
          />
        </div>
      </Panel>

      <Panel title="Marca de agua">
        <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <span className="font-black text-slate-800">
            Activar marca de agua
          </span>

          <input
            type="checkbox"
            checked={brandKit.watermark.enabled}
            disabled={disabled}
            onChange={(event) =>
              updateSection("watermark", {
                enabled: event.target.checked,
              })
            }
            className="h-6 w-6"
          />
        </label>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <SelectField
            label="Posición"
            value={brandKit.watermark.position}
            disabled={disabled}
            options={WATERMARK_POSITIONS.map((position) => [
              position.id,
              position.name,
            ])}
            onChange={(value) =>
              updateSection("watermark", {
                position: value,
              })
            }
          />

          <RangeField
            label="Opacidad"
            value={brandKit.watermark.opacity}
            min={0}
            max={100}
            suffix="%"
            disabled={disabled}
            onChange={(value) =>
              updateSection("watermark", {
                opacity: value,
              })
            }
          />
        </div>
      </Panel>

      <Panel title="Contacto y redes">
        <div className="space-y-4">
          {[
            ["whatsapp", "WhatsApp"],
            ["instagram", "Instagram"],
            ["facebook", "Facebook"],
            ["tiktok", "TikTok"],
            ["website", "Sitio web"],
          ].map(([key, label]) => (
            <TextField
              key={key}
              label={label}
              value={brandKit.contact[key]}
              disabled={disabled}
              onChange={(value) =>
                updateSection("contact", {
                  [key]: value,
                })
              }
            />
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <section className="min-w-0 max-w-full overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/95 p-4 shadow-xl backdrop-blur-xl sm:rounded-[2rem] sm:p-5">
      <h3 className="mb-4 text-lg font-black text-slate-950 sm:text-xl">
        {title}
      </h3>
      {children}
    </section>
  );
}

function TextField({
  label,
  value,
  disabled,
  onChange,
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-800">
        {label}
      </span>

      <input
        value={value || ""}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-13 w-full min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 sm:text-base"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  disabled,
  options,
  onChange,
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-800">
        {label}
      </span>

      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-13 w-full min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 sm:px-4 sm:text-base"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function ColorField({
  label,
  value,
  disabled,
  onChange,
}) {
  return (
    <label className="block">
      <span className="text-xs font-black text-slate-700 sm:text-sm">
        {label}
      </span>

      <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
        <input
          type="color"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-12 cursor-pointer rounded-xl border-0"
        />

        <input
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-black uppercase outline-none"
        />
      </div>
    </label>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  suffix,
  disabled,
  onChange,
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-800">
        {label}
      </span>

      <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          disabled={disabled}
          onChange={(event) =>
            onChange(Number(event.target.value))
          }
          className="w-full"
        />

        <p className="mt-1 text-center text-xs font-black text-slate-500">
          {value}
          {suffix}
        </p>
      </div>
    </label>
  );
}

function LogoUploader({
  type,
  label,
  value,
  disabled,
  onUpload,
  onRemove,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-sm font-black text-slate-800">
        {label}
      </p>

      {value ? (
        <img
          src={value}
          alt=""
          className="mt-3 h-28 w-full rounded-2xl bg-white object-contain p-2"
        />
      ) : (
        <div className="mt-3 flex h-28 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white text-xs font-black text-slate-400">
          Sin logo
        </div>
      )}

      <label className="mt-3 block cursor-pointer">
        <input
          type="file"
          accept="image/*"
          disabled={disabled}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";

            if (file) {
              onUpload(type, file);
            }
          }}
          className="hidden"
        />

        <span className="flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-2 text-center text-xs font-black text-white">
          {value ? "Cambiar" : "Subir"}
        </span>
      </label>

      {value && (
        <button
          type="button"
          disabled={disabled}
          onClick={onRemove}
          className="mt-2 min-h-10 w-full rounded-xl bg-red-50 text-xs font-black text-red-600"
        >
          Quitar
        </button>
      )}
    </div>
  );
}
