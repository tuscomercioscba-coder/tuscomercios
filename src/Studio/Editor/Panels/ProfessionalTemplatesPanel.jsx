import {
  DESIGN_CATEGORIES,
} from "../Utils/constants";

export default function ProfessionalTemplatesPanel({
  onApply,
}) {
  return (
    <section className="rounded-[1.5rem] border border-white bg-white p-4 shadow-lg">
      <h3 className="text-lg font-black text-slate-950">
        Estilos profesionales
      </h3>

      <p className="mt-1 text-sm font-semibold text-slate-500">
        Aplica una identidad visual completa sin borrar tus fotos.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {DESIGN_CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onApply(category)}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm"
          >
            <span
              className="block h-20"
              style={{
                background:
                  category.background.type === "solid"
                    ? category.background.color
                    : `linear-gradient(135deg, ${category.background.colors.join(",")})`,
              }}
            />

            <span className="block p-3 text-sm font-black text-slate-800">
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
