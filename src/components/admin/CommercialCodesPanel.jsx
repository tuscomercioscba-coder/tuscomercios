import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../supabase";

const MONEY = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const EMPTY = {
  code: "", code_type: "seller", description: "", discount_type: "percent", discount_value: 50,
  commission_type: "percent", commission_value: 20, seller_name: "", seller_email: "", payout_weekday: 6,
  applies_to: ["standard", "premium", "gestion"], max_uses: "", expires_at: "", active: true,
};

function localDate(value) {
  return value ? new Date(value).toLocaleDateString("es-AR") : "—";
}

export default function CommercialCodesPanel() {
  const [form, setForm] = useState(EMPTY);
  const [codes, setCodes] = useState([]);
  const [uses, setUses] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [filter, setFilter] = useState("pending");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [codesResult, usesResult, commissionsResult, businessesResult, collaboratorsResult] = await Promise.all([
      supabase.from("commercial_codes").select("*").order("created_at", { ascending: false }),
      supabase.from("commercial_code_uses").select("*").order("created_at", { ascending: false }),
      supabase.from("seller_commissions").select("*").order("sale_date", { ascending: false }),
      supabase.from("businesses").select("id,user_id,negocio,plan"),
      supabase.rpc("admin_list_content_collaborators"),
    ]);
    const error = codesResult.error || usesResult.error || commissionsResult.error || collaboratorsResult.error;
    if (error) setMessage(error.message);
    setCodes(codesResult.data || []);
    setUses(usesResult.data || []);
    setCommissions(commissionsResult.data || []);
    setBusinesses(businessesResult.data || []);
    setCollaborators(collaboratorsResult.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const codeById = useMemo(() => Object.fromEntries(codes.map((item) => [item.id, item])), [codes]);
  const useById = useMemo(() => Object.fromEntries(uses.map((item) => [item.id, item])), [uses]);
  const businessForUse = (use) => businesses.find((item) => item.id === use?.business_id) || businesses.find((item) => item.user_id === use?.user_id);
  const visibleCommissions = filter === "all" ? commissions : commissions.filter((item) => item.status === filter);
  const pendingTotal = commissions.filter((item) => item.status === "pending").reduce((sum, item) => sum + Number(item.commission_amount || 0), 0);

  function update(name, value) { setForm((current) => ({ ...current, [name]: value })); }
  function toggleService(service) {
    update("applies_to", form.applies_to.includes(service) ? form.applies_to.filter((item) => item !== service) : [...form.applies_to, service]);
  }

  async function createCode(event) {
    event.preventDefault();
    setMessage("");
    if (!form.code.trim() || !form.applies_to.length) return setMessage("Completá el código y al menos un servicio.");
    if (form.code_type === "seller" && !form.seller_name.trim()) return setMessage("Ingresá el nombre del vendedor.");
    const payload = {
      ...form,
      code: form.code.trim().toUpperCase().replace(/\s+/g, "-"),
      description: form.description.trim() || null,
      seller_name: form.code_type === "seller" ? form.seller_name.trim() : null,
      seller_email: form.code_type === "seller" ? form.seller_email.trim().toLowerCase() || null : null,
      discount_type: form.code_type === "discount" ? form.discount_type : null,
      discount_value: form.code_type === "discount" ? Number(form.discount_value) : 0,
      commission_type: form.code_type === "seller" ? form.commission_type : null,
      commission_value: form.code_type === "seller" ? Number(form.commission_value) : 0,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      expires_at: form.expires_at ? new Date(`${form.expires_at}T23:59:59`).toISOString() : null,
    };
    const { error } = await supabase.from("commercial_codes").insert(payload);
    if (error) return setMessage(error.message.includes("duplicate") ? "Ese código ya existe." : error.message);
    setForm(EMPTY);
    setMessage("Código creado correctamente.");
    load();
  }

  async function toggleCode(item) {
    const { error } = await supabase.from("commercial_codes").update({ active: !item.active, updated_at: new Date().toISOString() }).eq("id", item.id);
    if (error) setMessage(error.message); else load();
  }

  async function addCollaborator(event) {
    event.preventDefault();
    const email = collaboratorEmail.trim().toLowerCase();
    if (!email) return;
    const { data, error } = await supabase.rpc("admin_add_content_collaborator", { p_email: email });
    setMessage(error?.message || data || "Correo autorizado.");
    if (!error) { setCollaboratorEmail(""); load(); }
  }

  async function toggleCollaborator(item) {
    const { error } = await supabase.rpc("admin_set_collaborator_active", { p_email: item.email, p_active: !item.active });
    if (error) setMessage(error.message); else load();
  }

  async function markPaid(id) {
    const { error } = await supabase.rpc("admin_mark_commission_paid", { p_commission_id: id });
    if (error) setMessage(error.message); else load();
  }

  return (
    <div className="space-y-6">
      {message && <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 font-bold text-blue-900">{message}</div>}

      <section className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <form onSubmit={createCode} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <p className="text-xs font-black uppercase tracking-widest text-blue-600">Generador comercial</p>
          <h2 className="mt-2 text-2xl font-black">Crear cupón o código de vendedor</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="font-bold">Nombre del código<input value={form.code} onChange={(e) => update("code", e.target.value.toUpperCase())} placeholder="MARCELO355" className="mt-2 w-full rounded-xl border p-3 uppercase" /></label>
            <label className="font-bold">Tipo<select value={form.code_type} onChange={(e) => update("code_type", e.target.value)} className="mt-2 w-full rounded-xl border p-3"><option value="seller">Código de vendedor</option><option value="discount">Cupón de descuento</option></select></label>
            {form.code_type === "discount" ? <>
              <label className="font-bold">Descuento<select value={form.discount_type} onChange={(e) => update("discount_type", e.target.value)} className="mt-2 w-full rounded-xl border p-3"><option value="percent">Porcentaje</option><option value="fixed">Monto fijo</option></select></label>
              <label className="font-bold">Valor<input type="number" min="1" max={form.discount_type === "percent" ? 100 : undefined} value={form.discount_value} onChange={(e) => update("discount_value", e.target.value)} className="mt-2 w-full rounded-xl border p-3" /></label>
            </> : <>
              <label className="font-bold">Vendedor<input value={form.seller_name} onChange={(e) => update("seller_name", e.target.value)} placeholder="Marcelo" className="mt-2 w-full rounded-xl border p-3" /></label>
              <label className="font-bold">Correo del vendedor<input type="email" value={form.seller_email} onChange={(e) => update("seller_email", e.target.value)} placeholder="Opcional" className="mt-2 w-full rounded-xl border p-3" /></label>
              <label className="font-bold">Comisión<select value={form.commission_type} onChange={(e) => update("commission_type", e.target.value)} className="mt-2 w-full rounded-xl border p-3"><option value="percent">Porcentaje</option><option value="fixed">Monto fijo</option></select></label>
              <label className="font-bold">Valor de comisión<input type="number" min="0" value={form.commission_value} onChange={(e) => update("commission_value", e.target.value)} className="mt-2 w-full rounded-xl border p-3" /></label>
              <label className="font-bold">Día de pago<select value={form.payout_weekday} onChange={(e) => update("payout_weekday", Number(e.target.value))} className="mt-2 w-full rounded-xl border p-3">{DAYS.map((day, index) => <option value={index} key={day}>{day}</option>)}</select></label>
            </>}
            <label className="font-bold">Vencimiento<input type="date" value={form.expires_at} onChange={(e) => update("expires_at", e.target.value)} className="mt-2 w-full rounded-xl border p-3" /></label>
            <label className="font-bold">Máximo de usos<input type="number" min="1" value={form.max_uses} onChange={(e) => update("max_uses", e.target.value)} placeholder="Sin límite" className="mt-2 w-full rounded-xl border p-3" /></label>
          </div>
          <div className="mt-5"><p className="font-black">Válido para</p><div className="mt-2 flex flex-wrap gap-2">{[["standard","Estándar"],["premium","Premium"],["gestion","Gestión"]].map(([value,label]) => <button key={value} type="button" onClick={() => toggleService(value)} className={`rounded-xl px-4 py-2 font-bold ${form.applies_to.includes(value) ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>{label}</button>)}</div></div>
          <button className="mt-6 w-full rounded-2xl bg-gradient-to-r from-blue-700 to-red-600 p-4 font-black text-white">Crear código</button>
        </form>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <p className="text-xs font-black uppercase tracking-widest text-red-600">Acceso de trabajo</p>
          <h2 className="mt-2 text-2xl font-black">Correos con Studio + Gestión libre</h2>
          <p className="mt-2 text-sm text-slate-500">Al ingresar con Google reciben automáticamente un negocio demo privado. No acceden al panel administrador ni a datos ajenos.</p>
          <form onSubmit={addCollaborator} className="mt-5 flex flex-col gap-2 sm:flex-row"><input type="email" required value={collaboratorEmail} onChange={(e) => setCollaboratorEmail(e.target.value)} placeholder="persona@gmail.com" className="min-w-0 flex-1 rounded-xl border p-3" /><button className="rounded-xl bg-slate-950 px-5 py-3 font-black text-white">Autorizar</button></form>
          <div className="mt-5 space-y-2">{collaborators.map((item) => <div key={item.email} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"><div className="min-w-0"><p className="truncate font-bold">{item.email}</p><p className="text-xs text-slate-500">Desde {localDate(item.created_at)}</p></div><button type="button" onClick={() => toggleCollaborator(item)} className={`rounded-lg px-3 py-2 text-xs font-black ${item.active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{item.active ? "Activo" : "Desactivado"}</button></div>)}</div>
        </section>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-2xl font-black">Códigos creados</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{codes.map((item) => <article key={item.id} className="rounded-2xl border p-4"><div className="flex justify-between gap-2"><p className="text-lg font-black">{item.code}</p><button onClick={() => toggleCode(item)} className={`rounded-full px-3 py-1 text-xs font-black ${item.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{item.active ? "Activo" : "Inactivo"}</button></div><p className="mt-1 text-sm text-slate-500">{item.code_type === "discount" ? `Descuento: ${item.discount_type === "percent" ? `${item.discount_value}%` : MONEY.format(item.discount_value)}` : `${item.seller_name} · Comisión ${item.commission_type === "percent" ? `${item.commission_value}%` : MONEY.format(item.commission_value)}`}</p><p className="mt-2 text-xs font-bold uppercase text-blue-600">{item.applies_to?.join(" · ")}</p></article>)}</div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="text-xs font-black uppercase tracking-widest text-blue-600">Liquidación</p><h2 className="text-2xl font-black">Ventas y comisiones</h2><p className="mt-1 font-bold text-slate-500">Pendiente total: {MONEY.format(pendingTotal)}</p></div><select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border p-3 font-bold"><option value="pending">Pendientes</option><option value="paid">Pagadas</option><option value="all">Todas</option></select></div>
        <div className="mt-5 overflow-x-auto"><table className="min-w-[900px] w-full text-left text-sm"><thead><tr className="border-b text-xs uppercase text-slate-500"><th className="p-3">Vendedor / código</th><th className="p-3">Comercio</th><th className="p-3">Servicio</th><th className="p-3">Alta</th><th className="p-3">Venta</th><th className="p-3">Comisión</th><th className="p-3">Pago previsto</th><th className="p-3">Estado</th></tr></thead><tbody>{visibleCommissions.map((item) => { const use = useById[item.code_use_id]; const business = businessForUse(use); return <tr key={item.id} className="border-b"><td className="p-3"><b>{item.seller_name}</b><br/><span className="text-xs text-slate-500">{codeById[item.code_id]?.code}</span></td><td className="p-3 font-bold">{business?.negocio || "Pendiente de registrar"}</td><td className="p-3 capitalize">{use?.purchase_type || "—"}</td><td className="p-3">{localDate(item.sale_date)}</td><td className="p-3">{MONEY.format(item.base_amount)}</td><td className="p-3 font-black">{MONEY.format(item.commission_amount)}</td><td className="p-3">{localDate(item.scheduled_payment_date)}</td><td className="p-3">{item.status === "pending" ? <button onClick={() => markPaid(item.id)} className="rounded-lg bg-emerald-600 px-3 py-2 font-black text-white">Marcar pagada</button> : <span className="font-black text-emerald-700">Pagada</span>}</td></tr>; })}</tbody></table>{!loading && !visibleCommissions.length && <p className="py-8 text-center font-bold text-slate-400">Todavía no hay comisiones en este estado.</p>}</div>
      </section>
    </div>
  );
}
