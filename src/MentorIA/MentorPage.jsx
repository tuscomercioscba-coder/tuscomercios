import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  supabase,
} from "../supabase";

import Layout from "../components/Layout";

import MarketingProfile from "./Components/MarketingProfile";
import MentorCounter from "./Components/MentorCounter";
import MentorInput from "./Components/MentorInput";
import MentorMessage from "./Components/MentorMessage";
import MentorQuickActions from "./Components/MentorQuickActions";
import MentorSidebar from "./Components/MentorSidebar";
import MentorTyping from "./Components/MentorTyping";

import {
  getMentorStatus,
  requestMentorResponse,
} from "./Services/MentorApi";

import {
  loadDailyUsage,
  loadMarketingProfile,
  loadMentorHistory,
  saveDailyUsage,
  saveMarketingProfile,
  saveMentorHistory,
} from "./Services/MentorStorage";

import {
  getMentorLimit,
  normalizePlan,
} from "./Utils/MentorLimits";

function timeNow() {
  return new Date().toLocaleTimeString(
    "es-AR",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function createWelcomeMessage(
  business
) {
  return {
    id: `welcome-${Date.now()}`,
    role: "assistant",
    content: `Ya conozco ${
      business?.negocio ||
      business?.name ||
      "tu negocio"
    }. Puedo ayudarte con ventas, publicaciones, promociones y también guiarte con las funciones reales del Editor de Imágenes, Reels Studio, Brand Kit y Biblioteca.

Contame cuál es el principal problema que querés resolver hoy.`,
    time: timeNow(),
  };
}

export default function MentorPage() {
  const {
    entityType = "business",
    id,
  } = useParams();

  const navigate =
    useNavigate();

  const bottomRef =
    useRef(null);

  const chatScrollRef =
    useRef(null);

  const [business, setBusiness] =
    useState(null);

  const [profile, setProfile] =
    useState({
      audience: "",
      products: "",
      goal: "Vender más",
      tone:
        "Cercano y profesional",
    });

  const [messages, setMessages] =
    useState([]);

  const [used, setUsed] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [isAdmin, setIsAdmin] =
    useState(false);

  const [error, setError] =
    useState("");

  const workspace =
    entityType === "workspace";

  const plan =
    normalizePlan(
      business?.plan ||
        (workspace
          ? "premium"
          : "free")
    );

  const unlimited =
    isAdmin || workspace;

  const limit =
    getMentorLimit(
      plan,
      unlimited
    );

  const remaining =
    unlimited
      ? Infinity
      : Math.max(
          0,
          limit - used
        );

  const blocked =
    !unlimited &&
    (limit <= 0 ||
      remaining <= 0);

  const planLabel =
    unlimited
      ? "Administrador"
      : plan === "premium"
      ? "Premium"
      : plan === "standard"
      ? "Estándar"
      : "Gratuito";

  useEffect(() => {
    loadPage();
  }, [entityType, id]);

  useEffect(() => {
    const chat =
      chatScrollRef.current;

    if (!chat) return;

    chat.scrollTo({
      top: chat.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  async function loadPage() {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const {
        data: userProfile,
      } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const admin =
        String(
          userProfile?.role ||
            ""
        ).toLowerCase() ===
        "admin";

      setIsAdmin(admin);

      const query = workspace
        ? supabase
            .from(
              "studio_workspaces"
            )
            .select("*")
            .eq("id", id)
            .eq(
              "owner_id",
              user.id
            )
            .maybeSingle()
        : supabase
            .from("businesses")
            .select("*")
            .eq("id", id)
            .eq(
              "user_id",
              user.id
            )
            .maybeSingle();

      const {
        data,
        error: queryError,
      } = await query;

      if (
        queryError ||
        !data
      ) {
        throw new Error(
          "No se pudo encontrar el comercio seleccionado."
        );
      }

      const entity =
        workspace
          ? {
              ...data,
              negocio:
                data.name,
              plan: "premium",
            }
          : data;

      setBusiness(entity);

      setProfile(
        loadMarketingProfile(
          entityType,
          id
        )
      );

      try {
        const status =
          await getMentorStatus({
            entityType,
            entityId: id,
          });

        setUsed(
          Number(
            status.used || 0
          )
        );
      } catch (statusError) {
        console.warn(
          "Mentor status:",
          statusError
        );

        setUsed(
          loadDailyUsage(
            entityType,
            id
          )
        );
      }

      const savedHistory =
        loadMentorHistory(
          entityType,
          id
        );

      setMessages(
        savedHistory.length
          ? savedHistory
          : [
              createWelcomeMessage(
                entity
              ),
            ]
      );
    } catch (loadError) {
      console.error(
        loadError
      );

      setError(
        loadError.message ||
          "No se pudo cargar Mentor IA."
      );
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(
    content
  ) {
    if (
      sending ||
      blocked ||
      !business
    ) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      time: timeNow(),
    };

    const nextMessages = [
      ...messages,
      userMessage,
    ];

    setMessages(
      nextMessages
    );

    setSending(true);

    try {
      const result =
        await requestMentorResponse({
          message: content,
          business,
          marketingProfile:
            profile,
          history:
            nextMessages,
          entityType,
          entityId: id,
        });

      const mentorMessage = {
        id: `mentor-${Date.now()}`,
        role: "assistant",
        content:
          result.content,
        time: timeNow(),
      };

      const completed = [
        ...nextMessages,
        mentorMessage,
      ];

      setMessages(completed);

      saveMentorHistory(
        entityType,
        id,
        completed
      );

      if (!unlimited) {
        const serverUsed =
          Number(
            result.used ??
              used + 1
          );

        setUsed(serverUsed);

        saveDailyUsage(
          entityType,
          id,
          serverUsed
        );
      }
    } catch (sendError) {
      console.error(
        sendError
      );

      const failed = [
        ...nextMessages,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            "No pude responder en este momento. Esta respuesta no se descontó. Esperá unos segundos y volvé a intentarlo.",
          time: timeNow(),
        },
      ];

      setMessages(failed);

      saveMentorHistory(
        entityType,
        id,
        failed
      );
    } finally {
      setSending(false);
    }
  }

  function saveProfile(
    nextProfile
  ) {
    setProfile(
      nextProfile
    );

    saveMarketingProfile(
      entityType,
      id,
      nextProfile
    );
  }

  function newConversation() {
    if (!business) return;

    const welcome =
      createWelcomeMessage(
        business
      );

    setMessages([
      welcome,
    ]);

    saveMentorHistory(
      entityType,
      id,
      [welcome]
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center bg-slate-100">
          <div className="rounded-[2rem] bg-white p-8 text-center shadow-xl">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-red-100 border-t-red-600" />

            <p className="mt-4 text-xl font-black text-slate-950">
              Cargando Mentor IA...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
          <div className="max-w-lg rounded-[2rem] bg-white p-7 text-center shadow-xl">
            <h1 className="text-2xl font-black text-slate-950">
              No pudimos abrir Mentor IA
            </h1>

            <p className="mt-3 font-semibold text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/studio"
                )
              }
              className="mt-5 rounded-xl bg-blue-700 px-5 py-3 font-black text-white"
            >
              Volver a Studio
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen w-full overflow-x-hidden bg-[radial-gradient(circle_at_top,#eff6ff_0,#f8fafc_42%,#eef2f7_100%)] p-2 sm:p-5">
        <div className="mx-auto max-w-[1500px] space-y-4">
          <header className="min-w-0 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 text-white shadow-2xl sm:rounded-[2rem]">
            <div className="flex flex-col justify-between gap-4 p-4 sm:p-8 md:flex-row md:items-center">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-xl font-black shadow-inner sm:h-16 sm:w-16 sm:rounded-[1.4rem] sm:text-2xl">
                  M
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">
                    TusComercios Studio
                  </p>

                  <h1 className="mt-1 text-2xl font-black sm:text-5xl">
                    Mentor IA
                  </h1>

                  <p className="mt-1 text-sm font-semibold leading-snug text-blue-100 sm:text-lg">
                    Tu asesor de marketing para vender más.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/studio"
                  )
                }
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-black transition hover:bg-white/20 md:w-auto md:px-5 md:text-base"
              >
                ← Volver a Studio
              </button>
            </div>

            <div className="grid grid-cols-3 border-t border-white/10 bg-black/10">
              <HeaderStat
                label="Negocio"
                value={
                  business?.negocio ||
                  business?.name ||
                  "Mi comercio"
                }
              />

              <HeaderStat
                label="Plan"
                value={
                  planLabel
                }
              />

              <HeaderStat
                label="Especialidad"
                value="Marketing y ventas"
                last
              />
            </div>
          </header>

          <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_330px]">
            <div className="order-2 xl:order-1">
              <MentorSidebar
                business={
                  business
                }
                planLabel={
                  planLabel
                }
                disabled={
                  blocked ||
                  sending
                }
                onSelect={
                  sendMessage
                }
                onNewConversation={
                  newConversation
                }
              />
            </div>

            <section className="order-1 flex min-h-[560px] min-w-0 flex-col overflow-hidden rounded-[1.5rem] border border-white bg-white/90 shadow-xl backdrop-blur sm:min-h-[680px] sm:rounded-[2rem] xl:order-2 xl:h-[720px] xl:min-h-0">
              <div className="border-b border-slate-200 bg-white p-4 sm:p-5">
                <MentorQuickActions
                  disabled={
                    blocked ||
                    sending
                  }
                  onSelect={
                    sendMessage
                  }
                />
              </div>

              <div
                ref={chatScrollRef}
                className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] p-4 sm:p-6"
              >
                <div className="mx-auto w-full max-w-4xl space-y-5">
                  {messages.map(
                    (message) => (
                      <MentorMessage
                        key={
                          message.id
                        }
                        message={
                          message
                        }
                      />
                    )
                  )}

                  {sending && (
                    <MentorTyping />
                  )}

                  {blocked && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
                      <p className="font-black text-red-700">
                        Ya utilizaste las respuestas disponibles de hoy.
                      </p>

                      <p className="mt-1 text-sm font-semibold text-red-600">
                        Volverán a estar disponibles mañana.
                      </p>
                    </div>
                  )}

                  <div
                    ref={
                      bottomRef
                    }
                  />
                </div>
              </div>

              <MentorInput
                disabled={
                  blocked
                }
                loading={
                  sending
                }
                onSend={
                  sendMessage
                }
              />
            </section>

            <aside className="order-3 space-y-4">
              <MentorCounter
                used={used}
                limit={limit}
                unlimited={
                  unlimited
                }
              />

              <MarketingProfile
                business={
                  business
                }
                profile={
                  profile
                }
                onSave={
                  saveProfile
                }
              />

              <section className="rounded-[1.7rem] border border-blue-100 bg-blue-50 p-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">
                  Cómo aprovecharlo
                </p>

                <p className="mt-2 text-sm font-semibold leading-6 text-blue-900">
                  Contale el problema real del negocio. Cuanto más concreta sea la consulta, más útil será la recomendación.
                </p>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function HeaderStat({
  label,
  value,
  last,
}) {
  return (
    <div
      className={`min-w-0 p-3 sm:p-5 ${
        last
          ? ""
          : "border-b border-white/10 sm:border-b-0 sm:border-r"
      }`}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-200">
        {label}
      </p>

      <p className="mt-1 break-words text-xs font-black leading-tight text-white sm:text-base">
        {value}
      </p>
    </div>
  );
}
