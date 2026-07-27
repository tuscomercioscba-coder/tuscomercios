import { useState } from "react";

import {
  FONT_OPTIONS,
  TEXT_PRESETS,
} from "./textPresets";

export default function TextProInspector({
  layer,
  disabled,
  onChange,
  onDuplicate,
  onDelete,
}) {
  const [openSections, setOpenSections] =
    useState({
      text: true,
      animation: true,
      typography: true,
      color: true,
      outline: false,
      shadow: false,
      background: false,
      position: false,
    });

  if (!layer) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
          Editor de texto
        </p>

        <h3 className="mt-2 text-xl font-black text-slate-950">
          Seleccioná un texto
        </h3>

        <p className="mt-2 text-sm font-semibold text-slate-500">
          Este editor sirve para títulos y subtítulos.
        </p>
      </section>
    );
  }

  function toggleSection(section) {
    setOpenSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  }

  return (
    <section className="rounded-[2rem] border border-blue-100 bg-white p-4 shadow-xl sm:p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
        Editor de texto profesional
      </p>

      <h3 className="mt-2 text-xl font-black text-slate-950">
        {layer.name}
      </h3>

      <p className="mt-2 text-sm font-semibold text-slate-500">
        Por defecto se muestra solo el texto. Fondo, contorno y sombra se activan cuando los necesites.
      </p>

      <div className="mt-5 space-y-3">
        <Accordion
          title="Texto"
          open={openSections.text}
          onToggle={() => toggleSection("text")}
        >
          <div className="space-y-4">
            <Field label="Contenido">
              <textarea
                rows={4}
                value={layer.text || ""}
                disabled={disabled}
                onChange={(event) =>
                  onChange({
                    text: event.target.value,
                  })
                }
                className="w-full rounded-2xl border border-slate-200 p-3 font-bold"
              />
            </Field>

            <Field label="Estilos rápidos">
              <div className="grid grid-cols-2 gap-2">
                {TEXT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      onChange(preset.changes)
                    }
                    className="min-h-11 rounded-xl bg-slate-100 px-3 text-xs font-black text-slate-700 disabled:opacity-40"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </Accordion>

        <Accordion
          title="Fuente y formato"
          open={openSections.typography}
          onToggle={() =>
            toggleSection("typography")
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Fuente">
                <select
                  value={
                    layer.fontFamily ||
                    "Montserrat"
                  }
                  disabled={disabled}
                  onChange={(event) =>
                    onChange({
                      fontFamily:
                        event.target.value,
                    })
                  }
                  className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 font-bold"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option
                      key={font}
                      value={font}
                    >
                      {font}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Peso">
                <select
                  value={Number(
                    layer.fontWeight || 900
                  )}
                  disabled={disabled}
                  onChange={(event) =>
                    onChange({
                      fontWeight: Number(
                        event.target.value
                      ),
                    })
                  }
                  className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 font-bold"
                >
                  <option value={400}>
                    Normal
                  </option>
                  <option value={600}>
                    Semibold
                  </option>
                  <option value={700}>
                    Bold
                  </option>
                  <option value={800}>
                    Extra Bold
                  </option>
                  <option value={900}>
                    Black
                  </option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <ToggleButton
                active={Boolean(layer.italic)}
                label="Cursiva"
                onClick={() =>
                  onChange({
                    italic: !layer.italic,
                  })
                }
              />

              <ToggleButton
                active={Boolean(
                  layer.underline
                )}
                label="Subrayado"
                onClick={() =>
                  onChange({
                    underline:
                      !layer.underline,
                  })
                }
              />

              <ToggleButton
                active={Boolean(
                  layer.uppercase
                )}
                label="Mayúsculas"
                onClick={() =>
                  onChange({
                    uppercase:
                      !layer.uppercase,
                  })
                }
              />
            </div>

            <Range
              label="Tamaño"
              min={18}
              max={180}
              step={1}
              value={Number(
                layer.fontSize || 64
              )}
              onChange={(fontSize) =>
                onChange({ fontSize })
              }
            />

            <Range
              label="Espaciado entre letras"
              min={-3}
              max={12}
              step={0.5}
              value={Number(
                layer.letterSpacing || 0
              )}
              onChange={(letterSpacing) =>
                onChange({
                  letterSpacing,
                })
              }
            />

            <Range
              label="Interlineado"
              min={0.8}
              max={1.8}
              step={0.05}
              value={Number(
                layer.lineHeight || 1.1
              )}
              onChange={(lineHeight) =>
                onChange({ lineHeight })
              }
            />

            <div className="grid grid-cols-3 gap-2">
              {[
                ["left", "Izquierda"],
                ["center", "Centro"],
                ["right", "Derecha"],
              ].map(([align, label]) => (
                <button
                  key={align}
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    onChange({ align })
                  }
                  className={`min-h-11 rounded-xl text-xs font-black ${(layer.align ||
                      "center") === align
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </Accordion>

        <Accordion
          title="Color y opacidad"
          open={openSections.color}
          onToggle={() =>
            toggleSection("color")
          }
        >
          <div className="grid grid-cols-2 gap-3">
            <ColorField
              label="Color"
              value={
                layer.color || "#ffffff"
              }
              onChange={(color) =>
                onChange({ color })
              }
            />

            <Range
              label="Opacidad"
              min={0}
              max={100}
              step={1}
              value={Math.round(
                Number(
                  layer.textOpacity ?? 1
                ) * 100
              )}
              onChange={(value) =>
                onChange({
                  textOpacity:
                    value / 100,
                })
              }
            />
          </div>
        </Accordion>

        <Accordion
          title="Contorno"
          open={openSections.outline}
          onToggle={() =>
            toggleSection("outline")
          }
          switchChecked={Boolean(
            layer.strokeEnabled
          )}
          onSwitch={(checked) =>
            onChange({
              strokeEnabled: checked,
            })
          }
        >
          {layer.strokeEnabled ? (
            <div className="grid grid-cols-2 gap-3">
              <ColorField
                label="Color"
                value={
                  layer.strokeColor ||
                  "#000000"
                }
                onChange={(strokeColor) =>
                  onChange({
                    strokeColor,
                  })
                }
              />

              <Range
                label="Grosor"
                min={1}
                max={12}
                step={1}
                value={Number(
                  layer.strokeWidth || 2
                )}
                onChange={(strokeWidth) =>
                  onChange({
                    strokeWidth,
                  })
                }
              />
            </div>
          ) : (
            <DisabledHint text="Activá el contorno para configurar color y grosor." />
          )}
        </Accordion>

        <Accordion
          title="Sombra"
          open={openSections.shadow}
          onToggle={() =>
            toggleSection("shadow")
          }
          switchChecked={Boolean(
            layer.shadowEnabled
          )}
          onSwitch={(checked) =>
            onChange({
              shadowEnabled: checked,
            })
          }
        >
          {layer.shadowEnabled ? (
            <div className="space-y-4">
              <ColorField
                label="Color"
                value={
                  layer.shadowColor ||
                  "#000000"
                }
                onChange={(shadowColor) =>
                  onChange({
                    shadowColor,
                  })
                }
              />

              <div className="grid grid-cols-2 gap-3">
                <Range
                  label="Desenfoque"
                  min={0}
                  max={40}
                  step={1}
                  value={Number(
                    layer.shadowBlur || 16
                  )}
                  onChange={(shadowBlur) =>
                    onChange({
                      shadowBlur,
                    })
                  }
                />

                <Range
                  label="Distancia"
                  min={0}
                  max={30}
                  step={1}
                  value={Number(
                    layer.shadowOffsetY || 6
                  )}
                  onChange={(
                    shadowOffsetY
                  ) =>
                    onChange({
                      shadowOffsetY,
                    })
                  }
                />
              </div>
            </div>
          ) : (
            <DisabledHint text="Activá la sombra para mejorar la lectura del texto." />
          )}
        </Accordion>

        <Accordion
          title="Fondo"
          open={openSections.background}
          onToggle={() =>
            toggleSection("background")
          }
          switchChecked={Boolean(
            layer.backgroundEnabled
          )}
          onSwitch={(checked) =>
            onChange({
              backgroundEnabled:
                checked,
            })
          }
        >
          {layer.backgroundEnabled ? (
            <div className="space-y-4">
              <ColorField
                label="Color"
                value={
                  layer.backgroundColor ||
                  "#000000"
                }
                onChange={(
                  backgroundColor
                ) =>
                  onChange({
                    backgroundColor,
                  })
                }
              />

              <Range
                label="Opacidad"
                min={0}
                max={100}
                step={1}
                value={Math.round(
                  Number(
                    layer.backgroundOpacity ??
                    0.72
                  ) * 100
                )}
                onChange={(value) =>
                  onChange({
                    backgroundOpacity:
                      value / 100,
                  })
                }
              />

              <div className="grid grid-cols-2 gap-3">
                <Range
                  label="Relleno"
                  min={4}
                  max={50}
                  step={1}
                  value={Number(
                    layer.backgroundPadding ||
                    14
                  )}
                  onChange={(
                    backgroundPadding
                  ) =>
                    onChange({
                      backgroundPadding,
                    })
                  }
                />

                <Range
                  label="Redondeado"
                  min={0}
                  max={50}
                  step={1}
                  value={Number(
                    layer.backgroundRadius ||
                    14
                  )}
                  onChange={(
                    backgroundRadius
                  ) =>
                    onChange({
                      backgroundRadius,
                    })
                  }
                />
              </div>
            </div>
          ) : (
            <DisabledHint text="El texto se muestra solo, sin cuadro. Activá el fondo para usar una caja de color." />
          )}
        </Accordion>

        <Accordion
          title="Animación"
          open={openSections.animation}
          onToggle={() =>
            toggleSection("animation")
          }
        >
          <div className="space-y-4">
            <Field label="Efecto de entrada">
              <select
                value={layer.animation || "none"}
                disabled={disabled}
                onChange={(event) =>
                  onChange({
                    animation: event.target.value,
                  })
                }
                className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 font-bold"
              >
                <option value="none">Sin animación</option>
                <option value="fade">Aparecer suave</option>
                <option value="zoom">Zoom</option>
                <option value="zoom-fade">Zoom + aparecer</option>
                <option value="slide-up">Desde abajo</option>
                <option value="slide-down">Desde arriba</option>
                <option value="slide-left">Desde la derecha</option>
                <option value="slide-right">Desde la izquierda</option>
                <option value="bounce">Rebote</option>
                <option value="typewriter">
                  Máquina de escribir
                </option>
                <option value="rotate">Giro suave</option>
                <option value="pop">Pop</option>
                <option value="pulse">Pulso</option>
                <option value="elastic">Elástico</option>
                <option value="drop">Caída</option>
                <option value="rise">Ascenso</option>
                <option value="whip-left">Latigazo izquierdo</option>
                <option value="whip-right">Latigazo derecho</option>
                <option value="swing">Balanceo</option>
                <option value="flip">Volteo</option>
                <option value="shrink">Contraer</option>
              </select>
            </Field>

            <Range
              label="Duración"
              min={0.2}
              max={3}
              step={0.1}
              value={Number(
                layer.animationDuration || 0.8
              )}
              onChange={(animationDuration) =>
                onChange({
                  animationDuration,
                })
              }
            />

            <Range
              label="Retraso"
              min={0}
              max={3}
              step={0.1}
              value={Number(
                layer.animationDelay || 0
              )}
              onChange={(animationDelay) =>
                onChange({
                  animationDelay,
                })
              }
            />
          </div>
        </Accordion>

        <Accordion
          title="Posición y rotación"
          open={openSections.position}
          onToggle={() =>
            toggleSection("position")
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Range
                label="Posición X"
                min={5}
                max={95}
                step={1}
                value={Number(
                  layer.x ?? 50
                )}
                onChange={(x) =>
                  onChange({ x })
                }
              />

              <Range
                label="Posición Y"
                min={5}
                max={95}
                step={1}
                value={Number(
                  layer.y ?? 50
                )}
                onChange={(y) =>
                  onChange({ y })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Range
                label="Ancho de caja"
                min={14}
                max={94}
                step={1}
                value={Number(
                  layer.boxWidth ??
                  (layer.type === "subtitle"
                    ? 86
                    : 52)
                )}
                onChange={(boxWidth) =>
                  onChange({ boxWidth })
                }
              />

              <Range
                label="Alto mínimo"
                min={6}
                max={60}
                step={1}
                value={Number(
                  layer.boxHeight ??
                  (layer.type === "subtitle"
                    ? 12
                    : 14)
                )}
                onChange={(boxHeight) =>
                  onChange({ boxHeight })
                }
              />
            </div>

            <Range
              label="Rotación"
              min={-180}
              max={180}
              step={1}
              value={Number(
                layer.rotation || 0
              )}
              onChange={(rotation) =>
                onChange({ rotation })
              }
            />
          </div>
        </Accordion>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            disabled={disabled}
            onClick={onDuplicate}
            className="min-h-12 rounded-xl bg-blue-50 font-black text-blue-700 disabled:opacity-40"
          >
            Duplicar
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className="min-h-12 rounded-xl bg-red-50 font-black text-red-600 disabled:opacity-40"
          >
            Eliminar
          </button>
        </div>
      </div>
    </section>
  );
}

function Accordion({
  title,
  open,
  onToggle,
  switchChecked,
  onSwitch,
  children,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex min-h-14 items-center gap-3 px-4">
        <button
          type="button"
          onClick={onToggle}
          className="flex min-h-14 flex-1 items-center justify-between text-left font-black text-slate-800"
        >
          <span>{title}</span>
          <span className="text-slate-400">
            {open ? "−" : "+"}
          </span>
        </button>

        {typeof switchChecked ===
          "boolean" && (
            <label
              className="relative inline-flex cursor-pointer items-center"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <input
                type="checkbox"
                checked={switchChecked}
                onChange={(event) =>
                  onSwitch?.(
                    event.target.checked
                  )
                }
                className="peer sr-only"
              />

              <span className="h-7 w-12 rounded-full bg-slate-200 transition peer-checked:bg-blue-600" />

              <span className="absolute left-1 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
            </label>
          )}
      </div>

      {open && (
        <div className="border-t border-slate-100 p-4">
          {children}
        </div>
      )}
    </section>
  );
}

function DisabledHint({ text }) {
  return (
    <p className="rounded-xl bg-slate-50 p-3 text-xs font-bold text-slate-500">
      {text}
    </p>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function ToggleButton({
  active,
  label,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 rounded-xl text-xs font-black ${active
          ? "bg-blue-600 text-white"
          : "bg-slate-100 text-slate-700"
        }`}
    >
      {label}
    </button>
  );
}

function ColorField({
  label,
  value,
  onChange,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </span>

      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="h-11 w-14 rounded-xl border border-slate-200 bg-white"
        />

        <input
          type="text"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 font-mono text-xs font-bold"
        />
      </div>
    </label>
  );
}

function Range({
  label,
  min,
  max,
  step,
  value,
  onChange,
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-black text-slate-700">
          {label}
        </span>

        <span className="text-xs font-black text-blue-700">
          {Number(value).toFixed(
            step < 1 ? 2 : 0
          )}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) =>
          onChange(
            Number(event.target.value)
          )
        }
        className="mt-3 w-full accent-blue-600"
      />
    </label>
  );
}
