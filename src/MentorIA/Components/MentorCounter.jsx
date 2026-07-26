export default function MentorCounter({
  used,
  limit,
  unlimited,
}) {
  const remaining =
    unlimited
      ? Infinity
      : Math.max(
          0,
          limit - used
        );

  const percent =
    unlimited || !limit
      ? 100
      : Math.max(
          0,
          Math.min(
            100,
            (remaining /
              limit) *
              100
          )
        );

  return (
    <section className="overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-lg">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-red-600">
              Respuestas disponibles hoy
            </p>

            <p className="mt-2 text-3xl font-black text-slate-950">
              {unlimited
                ? "Ilimitadas"
                : `${remaining} / ${limit}`}
            </p>

            <p className="mt-1 text-xs font-semibold text-slate-500">
              Se reinician automáticamente cada día.
            </p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-50 to-red-100 text-2xl">
            ✦
          </div>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-red-700 via-red-600 to-red-400 transition-all duration-500"
            style={{
              width: `${percent}%`,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 border-t border-slate-100 bg-slate-50">
        <div className="border-r border-slate-100 p-3 text-center">
          <p className="text-[10px] font-black uppercase text-slate-400">
            Utilizadas
          </p>

          <p className="mt-1 font-black text-slate-700">
            {unlimited
              ? used
              : Math.min(
                  used,
                  limit
                )}
          </p>
        </div>

        <div className="p-3 text-center">
          <p className="text-[10px] font-black uppercase text-slate-400">
            Estado
          </p>

          <p
            className={`mt-1 font-black ${
              remaining === 0 &&
              !unlimited
                ? "text-red-600"
                : "text-blue-700"
            }`}
          >
            {remaining === 0 &&
            !unlimited
              ? "Límite alcanzado"
              : "Disponible"}
          </p>
        </div>
      </div>
    </section>
  );
}
