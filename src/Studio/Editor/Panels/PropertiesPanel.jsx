import { ELEMENT_TYPES, FONT_OPTIONS } from "../Utils/constants";
import { resetImageFilters } from "../Utils/filterUtils";

export default function PropertiesPanel({ element, editingImage, onChange, onUpload, onStartImageEdit, onFinishImageEdit }) {
  if (!element) {
    return (
      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-lg">
        <h3 className="text-lg font-black text-slate-950">Propiedades</h3>
        <p className="mt-3 text-sm font-semibold text-slate-500">Tocá un elemento para editarlo.</p>
      </section>
    );
  }

  const isText = element.type === ELEMENT_TYPES.TEXT;
  const isImage = element.type === ELEMENT_TYPES.IMAGE || element.type === ELEMENT_TYPES.LOGO;
  const isShape = element.type === ELEMENT_TYPES.SHAPE;

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-black text-slate-950">Editar {element.name}</h3>
        {isImage && (
          <button type="button" onClick={editingImage ? onFinishImageEdit : onStartImageEdit}
            className={`rounded-xl px-3 py-2 text-xs font-black ${editingImage ? "bg-emerald-500 text-white" : "bg-blue-50 text-blue-700"}`}>
            {editingImage ? "Terminar" : "Editar imagen"}
          </button>
        )}
      </div>

      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Posición X" value={Math.round(element.x || 0)} onChange={(value) => onChange({ x: value })} />
          <NumberField label="Posición Y" value={Math.round(element.y || 0)} onChange={(value) => onChange({ y: value })} />
          <NumberField label="Ancho" value={Math.round(element.width || 0)} min={30} onChange={(value) => onChange({ width: Math.max(30, value) })} />
          <NumberField label="Alto" value={Math.round(element.height || 0)} min={30} onChange={(value) => onChange({ height: Math.max(30, value) })} />
        </div>

        {isText && (
          <>
            <Field label="Texto"><textarea value={element.text || ""} onChange={(e) => onChange({ text: e.target.value })} rows="3" className="w-full rounded-2xl border border-slate-200 p-3" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Fuente"><select value={element.fontFamily || "Arial"} onChange={(e) => onChange({ fontFamily: e.target.value })} className="min-h-11 w-full rounded-xl border border-slate-200 px-3 font-bold">{FONT_OPTIONS.map((font) => <option key={font} value={font}>{font}</option>)}</select></Field>
              <Field label="Color"><input type="color" value={element.fill || "#ffffff"} onChange={(e) => onChange({ fill: e.target.value })} className="h-11 w-full rounded-xl border border-slate-200 bg-white" /></Field>
            </div>
            <Range label="Tamaño de letra" min={12} max={200} value={element.fontSize || 32} onChange={(value) => onChange({ fontSize: value })} />
            <Range label="Espaciado" min={-5} max={30} value={element.letterSpacing || 0} onChange={(value) => onChange({ letterSpacing: value })} />
          </>
        )}

        {isImage && (
          <>
            <label className="block cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
              <span className="flex min-h-14 items-center justify-center rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 px-3 text-center font-black text-blue-700">Subir o cambiar imagen</span>
            </label>

            <Field label="Ajuste"><select value={element.fit || "cover"} onChange={(e) => onChange({ fit: e.target.value })} className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 font-bold"><option value="cover">Llenar y recortar</option><option value="contain">Mostrar completa</option><option value="fill">Estirar</option></select></Field>

            {editingImage && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-sm font-black text-emerald-800">Edición interna activa</p>
                <p className="mt-1 text-xs font-semibold text-emerald-700">Arrastrá la foto dentro del marco. Usá la rueda del mouse para acercar o alejar.</p>
              </div>
            )}

            <Range label="Zoom interno" min={50} max={300} value={Math.round((element.imageScale || 1) * 100)} onChange={(value) => onChange({ imageScale: value / 100 })} />
            <Range label="Rotar solo la foto" min={-180} max={180} value={Math.round(element.imageRotation || 0)} onChange={(value) => onChange({ imageRotation: value })} />

            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => onChange({ flipX: !element.flipX })} className={`min-h-11 rounded-xl font-black ${element.flipX ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}>Voltear horizontal</button>
              <button type="button" onClick={() => onChange({ flipY: !element.flipY })} className={`min-h-11 rounded-xl font-black ${element.flipY ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}>Voltear vertical</button>
            </div>

            <button type="button" onClick={() => onChange({ imageScale: 1, imageRotation: 0, flipX: false, flipY: false, cropOffsetX: 0, cropOffsetY: 0 })} className="min-h-11 w-full rounded-xl bg-slate-100 font-black text-slate-700">Centrar y restaurar encuadre</button>

            <div className="border-t border-slate-200 pt-4">
              <h4 className="font-black text-slate-900">Mejorar foto</h4>
              <div className="mt-4 space-y-4">
                <Range label="Brillo" min={-100} max={100} value={Math.round((element.brightness || 0) * 100)} onChange={(value) => onChange({ brightness: value / 100 })} />
                <Range label="Contraste" min={-100} max={100} value={element.contrast || 0} onChange={(value) => onChange({ contrast: value })} />
                <Range label="Saturación" min={-100} max={100} value={Math.round((element.saturation || 0) * 100)} onChange={(value) => onChange({ saturation: value / 100 })} />
                <Range label="Desenfoque" min={0} max={40} value={element.blur || 0} onChange={(value) => onChange({ blur: value })} />
                <label className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"><span className="font-black text-slate-700">Blanco y negro</span><input type="checkbox" checked={Boolean(element.grayscale)} onChange={(e) => onChange({ grayscale: e.target.checked ? 1 : 0 })} /></label>
                <button type="button" onClick={() => onChange(resetImageFilters())} className="min-h-11 w-full rounded-xl border border-slate-200 bg-white font-black text-slate-700">Restaurar filtros</button>
              </div>
            </div>

            <Range label="Esquinas redondeadas" min={0} max={180} value={element.cornerRadius || 0} onChange={(value) => onChange({ cornerRadius: value })} />
          </>
        )}

        {isShape && <><Field label="Color de la forma"><input type="color" value={element.fill || "#2563eb"} onChange={(e) => onChange({ fill: e.target.value })} className="h-11 w-full rounded-xl border border-slate-200 bg-white" /></Field><Range label="Esquinas redondeadas" min={0} max={180} value={element.cornerRadius || 0} onChange={(value) => onChange({ cornerRadius: value })} /></>}

        <Range label="Transparencia" min={0} max={100} value={Math.round((element.opacity ?? 1) * 100)} onChange={(value) => onChange({ opacity: value / 100 })} />
        <label className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"><span className="font-black text-slate-700">Sombra</span><input type="checkbox" checked={Boolean(element.shadowEnabled)} onChange={(e) => onChange({ shadowEnabled: e.target.checked })} /></label>
        <label className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"><span className="font-black text-slate-700">Bloquear elemento</span><input type="checkbox" checked={Boolean(element.locked)} onChange={(e) => onChange({ locked: e.target.checked })} /></label>
        <label className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"><span className="font-black text-slate-700">Ocultar elemento</span><input type="checkbox" checked={Boolean(element.hidden)} onChange={(e) => onChange({ hidden: e.target.checked })} /></label>
      </div>
    </section>
  );
}

function Field({ label, children }) { return <label className="block"><span className="mb-2 block text-sm font-black text-slate-700">{label}</span>{children}</label>; }
function NumberField({ label, value, min, onChange }) { return <label className="block"><span className="mb-2 block text-xs font-black text-slate-600">{label}</span><input type="number" min={min} value={value} onChange={(e) => onChange(Number(e.target.value || 0))} className="min-h-11 w-full rounded-xl border border-slate-200 px-3 font-bold" /></label>; }
function Range({ label, min, max, value, onChange }) { return <label className="block"><div className="flex items-center justify-between gap-3"><span className="text-sm font-black text-slate-700">{label}</span><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700">{value}</span></div><input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-3 w-full accent-blue-600" /></label>; }
