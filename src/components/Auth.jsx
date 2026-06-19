import { useEffect } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await redirectUser(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      await redirectUser(session.user.id);
    }
  }

  async function redirectUser(userId) {
    const pendingBusiness = localStorage.getItem("pendingBusiness");
    const selectedPlan = localStorage.getItem("selectedPlan") || "free";

    if (pendingBusiness) {
      navigate(`/register-business?plan=${selectedPlan}&continue=true`);
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
      navigate("/register-business");
    }
  }

  async function signInGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/login",
      },
    });

    if (error) {
      console.error(error);
      alert("Error iniciando sesión");
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
            Ingresá o publicá tu negocio en minutos
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
          Al continuar aceptás los términos y políticas de privacidad
        </p>
      </div>
    </section>
  );
}