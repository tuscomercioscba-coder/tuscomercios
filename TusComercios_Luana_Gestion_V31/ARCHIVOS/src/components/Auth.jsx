import { useEffect } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import { trackMetaStandardEvent } from "../services/analytics/metaPixel";

export default function Auth() {
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          trackRegistrationIfNew(session.user);
          await redirectUser(session.user.id);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      trackRegistrationIfNew(session.user);
      await redirectUser(session.user.id);
    }
  }

  function trackRegistrationIfNew(user) {
    if (!user?.id || !user?.created_at || !user?.last_sign_in_at) return;

    const createdAt = new Date(user.created_at).getTime();
    const lastSignInAt = new Date(user.last_sign_in_at).getTime();
    const isNew = Math.abs(lastSignInAt - createdAt) <= 2 * 60 * 1000;
    const key = `tc_meta_registered_${user.id}`;

    if (!isNew || localStorage.getItem(key)) return;

    if (
      trackMetaStandardEvent("CompleteRegistration", {
        content_name: "cuenta_tuscomercios",
        status: true,
      })
    ) {
      localStorage.setItem(key, "1");
    }
  }

  async function redirectUser(userId) {
    const { data: creatorBusinessId } = await supabase.rpc(
      "provision_content_creator_access",
    );

    if (creatorBusinessId) {
      navigate("/dashboard");
      return;
    }

    const { data } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    if (data && data.length > 0) {
      navigate("/dashboard");
    } else {
      navigate("/planes");
    }
  }

  async function signInGoogle() {
    const { error } =
      await supabase.auth.signInWithOAuth({
        provider: "google",

        options: {
          redirectTo:
            window.location.origin +
            "/login",
        },
      });

    if (error) {
      console.error(error);

      alert(
        "Error iniciando sesión"
      );
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 px-4">

      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">

        <div className="text-center mb-8">

          <h1 className="text-4xl font-black text-slate-800">
            Tus Comercios
          </h1>

          <p className="text-gray-500 mt-2">
            Ingresá o publicá tu negocio
            en minutos
          </p>

        </div>

        <button
          onClick={signInGoogle}
          className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-slate-700 shadow-sm hover:shadow transition"
        >

          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-6 h-6"
          />

          Continuar con Google

        </button>

        <p className="text-xs text-center text-gray-400 mt-6">
          Al continuar aceptás los
          términos y políticas de
          privacidad
        </p>

      </div>

    </section>
  );
}
