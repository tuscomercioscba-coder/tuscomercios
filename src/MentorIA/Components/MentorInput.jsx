import {
  useState,
} from "react";

export default function MentorInput({
  disabled,
  loading,
  onSend,
}) {
  const [value, setValue] =
    useState("");

  function submit() {
    const clean =
      value.trim();

    if (
      !clean ||
      disabled ||
      loading
    ) {
      return;
    }

    onSend(clean);
    setValue("");
  }

  return (
    <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2 transition focus-within:border-red-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-red-50">
        <textarea
          value={value}
          disabled={
            disabled ||
            loading
          }
          onChange={(event) =>
            setValue(
              event.target.value
            )
          }
          onKeyDown={(
            event
          ) => {
            if (
              event.key ===
                "Enter" &&
              !event.shiftKey
            ) {
              event.preventDefault();
              submit();
            }
          }}
          maxLength={700}
          rows={3}
          placeholder={
            disabled
              ? "No hay respuestas disponibles"
              : "Contale a Mentor qué necesitás mejorar, vender o comunicar..."
          }
          className="min-h-[72px] w-full resize-none bg-transparent px-2 py-2 font-semibold text-slate-800 outline-none disabled:cursor-not-allowed"
        />

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-1 pt-2">
          <p className="text-[10px] font-bold text-slate-400">
            {value.length}/700
          </p>

          <button
            type="button"
            onClick={submit}
            disabled={
              disabled ||
              loading ||
              !value.trim()
            }
            className="min-h-11 rounded-xl bg-red-600 px-5 font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading
              ? "Analizando..."
              : "Enviar consulta →"}
          </button>
        </div>
      </div>

      <p className="mt-2 px-1 text-[11px] font-semibold text-slate-400">
        Cada respuesta del Mentor descuenta una disponible.
      </p>
    </div>
  );
}
