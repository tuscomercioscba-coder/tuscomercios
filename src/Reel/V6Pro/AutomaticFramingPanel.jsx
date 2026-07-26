import {
  getAutomaticFraming,
} from "./sceneFraming";

export default function AutomaticFramingPanel({
  scenes,
  disabled,
  onApply,
}) {
  async function applyAll() {
    const next = await Promise.all(
      scenes.map(async (scene, index) => {
        if (!scene.media || scene.isEndScene) {
          return scene;
        }

        const size =
          await readMediaSize(
            scene.media,
            scene.mediaType
          );

        return {
          ...scene,
          ...getAutomaticFraming({
            mediaWidth: size.width,
            mediaHeight: size.height,
            sceneIndex: index,
          }),
        };
      })
    );

    onApply(next);
  }

  return (
    <section className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-xl sm:p-5">
      <h3 className="text-lg font-black text-slate-950">
        Encuadre automático profesional
      </h3>

      <p className="mt-2 text-sm font-semibold text-slate-500">
        Ajusta todas las fotos y videos según su formato. En grabaciones horizontales alterna izquierda, centro y derecha para mostrar distintas zonas.
      </p>

      <button
        type="button"
        onClick={applyAll}
        disabled={disabled}
        className="mt-4 min-h-14 w-full rounded-2xl bg-emerald-600 px-4 font-black text-white shadow-lg disabled:opacity-40"
      >
        Ajustar todas las escenas
      </button>
    </section>
  );
}

function readMediaSize(src, type) {
  return new Promise((resolve) => {
    if (type === "video") {
      const video =
        document.createElement("video");

      video.preload = "metadata";
      video.muted = true;
      video.src = src;

      video.onloadedmetadata = () => {
        resolve({
          width: video.videoWidth,
          height: video.videoHeight,
        });
      };

      video.onerror = () =>
        resolve({ width: 0, height: 0 });

      video.load();
      return;
    }

    const image = new Image();

    image.onload = () =>
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });

    image.onerror = () =>
      resolve({ width: 0, height: 0 });

    image.src = src;
  });
}
