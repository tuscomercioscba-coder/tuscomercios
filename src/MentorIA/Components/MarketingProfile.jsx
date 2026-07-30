import {
  useEffect,
  useState,
} from "react";

export default function MarketingProfile({
  business,
  profile,
  onSave,
}) {
  const [draft, setDraft] =
    useState(profile);

  const [open, setOpen] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  useEffect(
    () => setDraft(profile),
    [profile]
  );

  function change(
    field,
    value
  ) {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));

    setSaved(false);
  }

  function save() {
    onSave(draft);
    setSaved(true);

    window.setTimeout(
      () => setSaved(false),
      1800
    );
  }

  return (
    <section className="min-w-0 max-w-full overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-lg">
      <button
        type="button"
        onClick={() =>
          setOpen(
            (value) => !value
          )
        }
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
      >
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">
            Ficha de marketing
          </p>

          <h2 className="mt-2 text-lg font-black text-slate-950">
            Lo que Mentor sabe
          </h2>

          <p className="mt-1 break-words text-xs font-semibold text-slate-500 [overflow-wrap:anywhere]">
            {business?.negocio ||
              business?.name ||
              "Comercio"}{" "}
            ·{" "}
            {business?.rubro ||
              "Comercio"}
          </p>
        </div>

        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-black text-blue-700">
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div className="border-t border-slate-100 p-5 pt-4">
          <div className="space-y-3">
            <Field
              label="Público principal"
              value={draft.audience}
              onChange={(value) =>
                change(
                  "audience",
                  value
                )
              }
              placeholder="Ej: familias y vecinos del barrio"
            />

            <Field
              label="Productos o servicios principales"
              value={draft.products}
              onChange={(value) =>
                change(
                  "products",
                  value
                )
              }
              placeholder="Ej: panificados, tortas y sándwiches"
            />

            <Field
              label="Objetivo"
              value={draft.goal}
              onChange={(value) =>
                change(
                  "goal",
                  value
                )
              }
              placeholder="Ej: aumentar ventas diarias"
            />

            <label className="block">
              <span className="text-sm font-black text-slate-700">
                Tono de comunicación
              </span>

              <select
                value={draft.tone}
                onChange={(
                  event
                ) =>
                  change(
                    "tone",
                    event.target.value
                  )
                }
                className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 font-semibold"
              >
                <option>
                  Cercano y profesional
                </option>

                <option>
                  Divertido y dinámico
                </option>

                <option>
                  Formal y confiable
                </option>

                <option>
                  Premium y elegante
                </option>
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={save}
            className={`mt-4 min-h-11 w-full rounded-xl font-black text-white transition ${
              saved
                ? "bg-blue-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {saved
              ? "✓ Ficha guardada"
              : "Guardar ficha"}
          </button>
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-700">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3 font-semibold"
      />
    </label>
  );
}
