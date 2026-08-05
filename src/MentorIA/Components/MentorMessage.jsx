export default function MentorMessage({ message }) {
  const mentor = message.role === "assistant";

  return (
    <article className={`flex min-w-0 max-w-full gap-2 sm:gap-3 ${mentor ? "justify-start" : "justify-end"}`}>
      {mentor && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-xs font-black text-white shadow sm:h-9 sm:w-9 sm:rounded-2xl sm:text-sm">
          M
        </div>
      )}

      <div
        className={`min-w-0 max-w-[calc(100%_-_2.5rem)] overflow-hidden rounded-2xl text-[15px] font-semibold leading-7 shadow-sm sm:max-w-[76%] sm:rounded-3xl sm:text-sm sm:leading-6 ${
          mentor
            ? "rounded-tl-md border border-slate-200 bg-white text-slate-700"
            : "rounded-tr-md bg-gradient-to-br from-blue-700 to-blue-950 text-white"
        }`}
      >
        <div className="px-3.5 py-3 sm:px-4">
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

          <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{message.content}</p>

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
