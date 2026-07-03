import { useState } from "react";
import { analyzeMarketingIdea } from "../../services/ai/marketingDirector";
import { buildCampaignPlan } from "../../services/ai/campaignDirector";

export default function StudioColleague({ business, navigate }) {
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "colleague",
      text: "Hola. Soy tu colega de marketing. Estoy acá para ayudarte a vender más con contenido profesional.\n\n¿Qué querés lograr hoy?",
    },
  ]);

  function handleSend() {
    if (!input.trim()) return;

    const userMessage = input.trim();

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userMessage },
    ]);

    setInput("");
    setThinking(true);

    setTimeout(() => {
      const analysis = analyzeMarketingIdea({
        business,
        idea: userMessage,
      });

      if (analysis.needsMoreInfo) {
        setMessages((prev) => [
          ...prev,
          {
            role: "colleague",
            text: analysis.message,
          },
        ]);

        setThinking(false);
        return;
      }

      const campaign = buildCampaignPlan({
        business,
        idea: userMessage,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "colleague",
          text: `${analysis.message}

Preparé esta campaña:

• ${campaign.pieces[0].label}
• ${campaign.pieces[1].label}
• ${campaign.pieces[2].label}
• ${campaign.pieces[3].label}

Mi recomendación: empezá por una imagen o flyer, porque después podés publicarlo como historia o descargarlo para WhatsApp.`,
          actions: true,
          campaign,
        },
      ]);

      setThinking(false);
    }, 900);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <section className="bg-white rounded-[2rem] shadow border border-slate-100 overflow-hidden">
      <div className="flex items-center gap-4 border-b p-5 bg-slate-50">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl">
          👔
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-900">Colega</h2>
          <p className="text-slate-500">
            Tu colega de marketing, impulsado por la IA de TusComercios.
          </p>
        </div>
      </div>

      <div className="relative min-h-[470px] p-6">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]">
          <img src="/logo.png" alt="" className="w-[560px] object-contain" />
        </div>

        <div className="relative z-10 space-y-5">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`max-w-2xl rounded-3xl p-5 shadow-sm ${
                message.role === "user"
                  ? "ml-auto bg-blue-600 text-white"
                  : "bg-white border text-slate-800"
              }`}
            >
              <p className="whitespace-pre-line leading-relaxed">
                {message.text}
              </p>

              {message.actions && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-5">
                  <button
                    onClick={() => alert("Campañas: siguiente etapa")}
                    className="bg-slate-900 text-white py-3 rounded-2xl font-black"
                  >
                    🚀 Campaña
                  </button>

                  <button
                    onClick={() =>
                      business?.id
                        ? navigate(`/studio/imagen/${business.id}`)
                        : alert("Primero elegí un negocio")
                    }
                    className="bg-blue-600 text-white py-3 rounded-2xl font-black"
                  >
                    🖼 Imagen
                  </button>

                  <button
                    onClick={() =>
                      business?.id
                        ? navigate(`/generar-reel/${business.id}`)
                        : alert("Primero elegí un negocio")
                    }
                    className="bg-purple-600 text-white py-3 rounded-2xl font-black"
                  >
                    🎬 Reel
                  </button>

                  <button
                    onClick={() => alert("Historias: siguiente etapa")}
                    className="bg-green-600 text-white py-3 rounded-2xl font-black"
                  >
                    📱 Historia
                  </button>
                </div>
              )}
            </div>
          ))}

          {thinking && (
            <div className="max-w-sm bg-white border rounded-3xl p-5 shadow-sm text-slate-500">
              Colega está pensando...
            </div>
          )}
        </div>
      </div>

      <div className="border-t bg-white p-5">
        <p className="font-black text-slate-900 mb-3">
          ¿Qué querés lograr hoy?
        </p>

        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Ejemplo: "Quiero conseguir más consultas por WhatsApp esta semana"'
            className="flex-1 min-h-20 rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white transition"
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || thinking}
            className="bg-slate-900 text-white px-6 rounded-2xl font-black hover:bg-black transition disabled:opacity-40"
          >
            Enviar
          </button>
        </div>
      </div>
    </section>
  );
}