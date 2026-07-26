export default function Toolbar({
  disabled,
  onUploadVideo,
  onUploadMedia,
  onAddText,
  onAddSubtitle,
  onOpenRecorder,
  onOpenAudio,
  onOpenVoiceAudio,
  onOpenStickers,
}) {
  const items = [
    ["+ Video", onUploadVideo, false],
    ["+ Fotos", onUploadMedia, false],
    ["🎥 Grabar pantalla", onOpenRecorder, false],
    ["🎙 Audio", onOpenVoiceAudio, false],
    ["📝 Texto", onAddText, false],
    ["💬 Subtítulo", onAddSubtitle, false],
    ["⭐ Stickers", onOpenStickers, false],
    ["🎵 Música", onOpenAudio, false],
  ];

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-3 shadow-xl">
      <div className="flex gap-2 overflow-x-auto">
        {items.map(([label, action, upcoming]) => (
          <button
            key={label}
            type="button"
            disabled={disabled || upcoming}
            onClick={action || undefined}
            className={`min-h-11 shrink-0 rounded-xl px-4 text-sm font-black ${
              upcoming
                ? "bg-slate-100 text-slate-400"
                : "bg-slate-950 text-white"
            } disabled:opacity-60`}
            title={upcoming ? "Se agrega en las próximas fases." : ""}
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
