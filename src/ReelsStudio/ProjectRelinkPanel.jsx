export default function ProjectRelinkPanel({
  pendingProject,
  missingFiles,
  onChooseFiles,
  onCancel,
}) {
  if (!pendingProject) {
    return null;
  }

  const references = [
    ...(pendingProject
      .references?.media ||
      []),
    ...(pendingProject
      .references?.audio ||
      []),
  ];

  return (
    <section className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-5 shadow-2xl sm:p-7">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
          Abrir proyecto
        </p>

        <h2 className="mt-2 text-2xl font-black text-slate-950">
          Volvé a vincular los archivos originales
        </h2>

        <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
          Por seguridad, el navegador no puede abrir automáticamente archivos de tu computadora. Seleccioná los videos, grabaciones, imágenes y audios usados en este proyecto. Podés elegir uno, varios o repetir este paso las veces que necesites.
        </p>

        <div className="mt-5 rounded-2xl bg-blue-50 p-4">
          <p className="font-black text-blue-950">
            El proyecto sí recuperará:
          </p>

          <p className="mt-2 text-sm font-semibold text-blue-800">
            escenas, cortes, textos, subtítulos, stickers, capas, posiciones, transiciones, música, narración y todos los ajustes.
          </p>
        </div>

        <div className="mt-5 space-y-2">
          {references.map(
            (reference) => {
              const missing =
                missingFiles.some(
                  (item) =>
                    item.id ===
                      reference.id &&
                    item.role ===
                      reference.role
                );

              return (
                <div
                  key={`${reference.role || "media"}-${reference.id}`}
                  className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${
                    missing
                      ? "border-red-200 bg-red-50"
                      : "border-slate-100 bg-slate-50"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-800">
                      {reference.name}
                    </p>

                    <p className="mt-1 text-[10px] font-bold uppercase text-slate-500">
                      {reference.role ===
                      "music"
                        ? "Música"
                        : reference.role ===
                          "voice"
                        ? "Narración"
                        : reference.origin ===
                          "recording"
                        ? "Grabación de pantalla"
                        : "Contenido"}
                    </p>
                  </div>

                  <span className={`shrink-0 text-xs font-black ${
                    missing
                      ? "text-red-600"
                      : "text-slate-500"
                  }`}>
                    {missing
                      ? "Falta seleccionar"
                      : "Seleccionado"}
                  </span>
                </div>
              );
            }
          )}
        </div>

        {missingFiles.length >
          0 && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">
            Faltan {missingFiles.length} archivo(s). Podés agregarlos por separado; los ya seleccionados se conservan.
          </p>
        )}

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-12 rounded-xl bg-slate-100 font-black text-slate-700"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onChooseFiles}
            className="min-h-12 rounded-xl bg-blue-600 font-black text-white"
          >
            Agregar archivos
          </button>
        </div>
      </div>
    </section>
  );
}
