export default function StudioCounters({ selectedBusiness, usage }) {
  const plan = selectedBusiness?.plan || "standard";

  const limits =
    plan === "premium"
      ? {
          images: { used: usage?.image || 0, total: 10, label: "Imágenes" },
          reels: { used: usage?.reel || 0, total: 2, label: "Reels" },
          stories: { used: usage?.story || 0, total: 21, label: "Historias" },
        }
      : {
          images: { used: usage?.image || 0, total: 5, label: "Imágenes" },
          reels: { used: usage?.reel || 0, total: 1, label: "Reels" },
          stories: { used: usage?.story || 0, total: 7, label: "Historias" },
        };

  return (
    <section className="bg-white rounded-[2rem] shadow p-6 border border-slate-100">
      <h2 className="text-2xl font-black text-slate-900 mb-1">
        Tu consumo semanal
      </h2>

      <p className="text-slate-500 mb-5">
        Estos límites se reinician cada semana.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        <Counter icon="🖼️" data={limits.images} />
        <Counter icon="🎬" data={limits.reels} />
        <Counter icon="📱" data={limits.stories} />
      </div>
    </section>
  );
}

function Counter({ icon, data }) {
  const percent = Math.min(100, Math.round((data.used / data.total) * 100));
  const remaining = Math.max(0, data.total - data.used);
  const full = data.used >= data.total;

  return (
    <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-3xl mb-2">{icon}</div>
          <h3 className="font-black text-slate-900">{data.label}</h3>
        </div>

        <span
          className={`bg-white border px-3 py-1 rounded-full text-sm font-black ${
            full ? "text-red-600 border-red-200" : "text-slate-800 border-slate-200"
          }`}
        >
          {data.used}/{data.total}
        </span>
      </div>

      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${full ? "bg-red-500" : "bg-blue-600"}`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>

      <p className="text-xs text-slate-500 mt-3">
        {full ? "Límite semanal alcanzado." : `Te quedan ${remaining} disponibles.`}
      </p>
    </div>
  );
}