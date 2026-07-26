export default function MentorMessage({ message }) {
  const mentor = message.role === "assistant";

  return (
    <article className={`flex gap-3 ${mentor ? "justify-start" : "justify-end"}`}>
      {mentor && (
        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-sm font-black text-white shadow">
          M
        </div>
      )}

      <div
        className={`max-w-[88%] overflow-hidden rounded-3xl text-sm font-semibold leading-6 shadow-sm sm:max-w-[76%] ${
          mentor
            ? "rounded-tl-md border border-slate-200 bg-white text-slate-700"
            : "rounded-tr-md bg-gradient-to-br from-blue-700 to-blue-950 text-white"
        }`}
      >
        <div className="px-4 py-3">
          {mentor && (
            <div className="mb-2 flex items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-red-600">
                Mentor IA
              </p>

              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-black text-blue-700">
                Asesor de marketing
              </span>
            </div>
          )}

          <p className="whitespace-pre-wrap">{message.content}</p>

          <p
            className={`mt-2 text-[10px] font-bold ${
              mentor ? "text-slate-400" : "text-blue-200"
            }`}
          >
            {message.time}
          </p>
        </div>
      </div>
    </article>
  );
}
