import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CreditCard,
  Eye,
  HandCoins,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { supabase } from "../supabase";

const MONEY = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 2,
});

const EMPTY_PERSON = {
  name: "",
  document: "",
  phone: "",
  email: "",
  address: "",
  credit_limit: "",
  notes: "",
};

function number(value) {
  const parsed = Number(String(value || "0").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function PersonModal({ type, form, setForm, saving, onClose, onSubmit }) {
  const customer = type === "customer";
  const editing = Boolean(form.id);
  return (
    <div className="fixed inset-0 z-[110] grid place-items-center bg-slate-950/60 p-3 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl"
      >
        <div className="sticky top-0 flex items-center justify-between border-b bg-white p-5">
          <h2 className="text-2xl font-black">
            {editing
              ? customer
                ? "Editar cliente"
                : "Editar proveedor"
              : customer
                ? "Nuevo cliente"
                : "Nuevo proveedor"}
          </h2>
          <button type="button" onClick={onClose} className="rounded-xl bg-slate-100 p-3">
            <X size={20} />
          </button>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          {[
            ["Nombre completo o razón social *", "name"],
            [customer ? "DNI/CUIT" : "CUIT", "document"],
            ["Teléfono", "phone"],
            ["Correo electrónico", "email"],
            ["Dirección", "address"],
          ].map(([label, field]) => (
            <label key={field} className={field === "name" ? "sm:col-span-2" : ""}>
              <span className="mb-2 block font-black">{label}</span>
              <input
                required={field === "name"}
                value={form[field]}
                onChange={(event) =>
                  setForm((current) => ({ ...current, [field]: event.target.value }))
                }
                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-semibold"
              />
            </label>
          ))}
          {customer && (
            <label>
              <span className="mb-2 block font-black">Límite de crédito</span>
              <input
                inputMode="decimal"
                value={form.credit_limit}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    credit_limit: event.target.value,
                  }))
                }
                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-semibold"
              />
            </label>
          )}
          <label className="sm:col-span-2">
            <span className="mb-2 block font-black">Notas</span>
            <textarea
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({ ...current, notes: event.target.value }))
              }
              className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4"
            />
          </label>
          <button
            disabled={saving}
            className={`h-14 rounded-2xl font-black text-white disabled:opacity-50 sm:col-span-2 ${
              customer ? "bg-blue-600" : "bg-red-600"
            }`}
          >
            {saving
              ? "Guardando..."
              : editing
                ? "Guardar cambios"
                : customer
                  ? "Guardar cliente"
                  : "Guardar proveedor"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CustomersPanel({
  businessId,
  branchId,
  cashSession,
  onCustomersChange,
  onPaymentSaved,
}) {
  const [tab, setTab] = useState("customers");
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [movements, setMovements] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState("");
  const [form, setForm] = useState(EMPTY_PERSON);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [accountPerson, setAccountPerson] = useState(null);
  const [profilePerson, setProfilePerson] = useState(null);
  const [payment, setPayment] = useState({
    amount: "",
    description: "",
    payment_method: "cash",
  });

  useEffect(() => {
    load();
  }, [businessId]);

  async function load() {
    if (!businessId) return;
    const [{ data: customerData }, { data: supplierData }, { data: movementData }] =
      await Promise.all([
        supabase
          .from("admin_customers")
          .select("*")
          .eq("business_id", businessId)
          .eq("active", true)
          .order("name"),
        supabase
          .from("admin_suppliers")
          .select("*")
          .eq("business_id", businessId)
          .eq("active", true)
          .order("name"),
        supabase
          .from("admin_account_movements")
          .select("*")
          .eq("business_id", businessId)
          .order("created_at", { ascending: false }),
      ]);
    setCustomers(customerData || []);
    setSuppliers(supplierData || []);
    setMovements(movementData || []);
    onCustomersChange?.(customerData || []);
  }

  function balanceFor(person, type) {
    return movements
      .filter((movement) =>
        type === "customer"
          ? movement.customer_id === person.id
          : movement.supplier_id === person.id,
      )
      .reduce(
        (total, movement) =>
          total +
          (movement.movement_type === "debit"
            ? number(movement.amount)
            : -number(movement.amount)),
        0,
      );
  }

  async function savePerson(event) {
    event.preventDefault();
    setSaving(true);
    const customer = modal === "customer";
    const table = customer ? "admin_customers" : "admin_suppliers";
    const payload = {
      business_id: businessId,
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      notes: form.notes.trim() || null,
      ...(customer
        ? {
            document: form.document.trim() || null,
            credit_limit: number(form.credit_limit),
          }
        : { tax_id: form.document.trim() || null }),
    };
    const request = form.id
      ? supabase
          .from(table)
          .update(payload)
          .eq("id", form.id)
          .eq("business_id", businessId)
      : supabase.from(table).insert(payload);
    const { error } = await request;
    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setModal("");
    setForm(EMPTY_PERSON);
    setProfilePerson(null);
    setMessage(
      form.id
        ? customer
          ? "Cliente actualizado."
          : "Proveedor actualizado."
        : customer
          ? "Cliente guardado."
          : "Proveedor guardado.",
    );
    await load();
  }

  async function registerPayment(event) {
    event.preventDefault();
    if (!accountPerson) return;
    setSaving(true);
    const { error } = await supabase.rpc(
      "register_administration_account_payment",
      {
        p_business_id: businessId,
        p_branch_id: branchId,
        p_party_type: accountPerson.type,
        p_party_id: accountPerson.id,
        p_amount: number(payment.amount),
        p_payment_method: payment.payment_method,
        p_description: payment.description.trim(),
      },
    );
    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setPayment({
      amount: "",
      description: "",
      payment_method: "cash",
    });
    setAccountPerson(null);
    setMessage("Pago registrado correctamente.");
    load();
    onPaymentSaved?.();
  }

  const people = tab === "customers" ? customers : suppliers;
  const type = tab === "customers" ? "customer" : "supplier";
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return people;
    return people.filter((person) =>
      [person.name, person.phone, person.document, person.tax_id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle)),
    );
  }, [people, search]);

  const totalReceivable = customers.reduce(
    (total, person) => total + Math.max(0, balanceFor(person, "customer")),
    0,
  );
  const totalPayable = suppliers.reduce(
    (total, person) => total + Math.max(0, balanceFor(person, "supplier")),
    0,
  );

  return (
    <section className="mt-5 space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-[1.7rem] bg-blue-600 p-5 text-white shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-blue-200">
            Cuentas por cobrar
          </p>
          <p className="mt-2 text-3xl font-black">{MONEY.format(totalReceivable)}</p>
          <p className="mt-1 font-bold text-blue-100">{customers.length} clientes</p>
        </article>
        <article className="rounded-[1.7rem] bg-red-600 p-5 text-white shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-red-100">
            Cuentas por pagar
          </p>
          <p className="mt-2 text-3xl font-black">{MONEY.format(totalPayable)}</p>
          <p className="mt-1 font-bold text-red-100">{suppliers.length} proveedores</p>
        </article>
      </div>

      <div className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-blue-600">
              Gestión comercial
            </p>
            <h2 className="mt-1 text-2xl font-black">Clientes y proveedores</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTab("customers")}
              className={`rounded-2xl px-5 py-3 font-black ${
                tab === "customers" ? "bg-blue-600 text-white" : "bg-slate-100"
              }`}
            >
              <Users className="mr-2 inline" size={19} /> Clientes
            </button>
            <button
              type="button"
              onClick={() => setTab("suppliers")}
              className={`rounded-2xl px-5 py-3 font-black ${
                tab === "suppliers" ? "bg-red-600 text-white" : "bg-slate-100"
              }`}
            >
              <Building2 className="mr-2 inline" size={19} /> Proveedores
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(EMPTY_PERSON);
                setModal(type);
              }}
              className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white"
            >
              <Plus className="mr-1 inline" size={19} /> Nuevo
            </button>
          </div>
        </div>

        {message && (
          <div className="mt-4 flex justify-between rounded-2xl bg-slate-100 p-4 font-bold">
            {message}
            <button type="button" onClick={() => setMessage("")}>
              <X size={18} />
            </button>
          </div>
        )}

        <label className="mt-5 flex h-14 items-center gap-3 rounded-2xl bg-slate-100 px-4">
          <Search className="text-slate-500" size={20} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre, documento o teléfono..."
            className="min-w-0 flex-1 bg-transparent font-bold outline-none"
          />
        </label>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {filtered.map((person) => {
            const balance = balanceFor(person, type);
            return (
              <article key={person.id} className="rounded-3xl border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    <div
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
                        type === "customer"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {type === "customer" ? <UserRound /> : <Building2 />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-black">{person.name}</h3>
                      <p className="text-sm text-slate-500">
                        {person.document || person.tax_id || "Sin documento"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-2 text-xs font-black ${
                      balance > 0
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {balance > 0 ? `Debe ${MONEY.format(balance)}` : "Al día"}
                  </span>
                </div>
                {person.phone && (
                  <p className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-600">
                    <Phone size={17} /> {person.phone}
                  </p>
                )}
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setProfilePerson({ ...person, type })}
                    className="flex-1 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-700"
                  >
                    <Eye className="mr-1 inline" size={18} /> Ver ficha
                  </button>
                  <button
                    type="button"
                    disabled={!cashSession}
                    onClick={() => setAccountPerson({ ...person, type })}
                    className="flex-1 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <HandCoins className="mr-1 inline" size={18} /> Registrar pago
                  </button>
                </div>
                {!cashSession && (
                  <p className="mt-2 text-xs font-bold text-red-600">
                    Abrí la caja para registrar pagos.
                  </p>
                )}
              </article>
            );
          })}
        </div>

        {!filtered.length && (
          <div className="py-14 text-center text-slate-500">
            <Users className="mx-auto mb-3" size={45} />
            <p className="font-black">
              Todavía no hay {tab === "customers" ? "clientes" : "proveedores"}.
            </p>
          </div>
        )}
      </div>

      {modal && (
        <PersonModal
          type={modal}
          form={form}
          setForm={setForm}
          saving={saving}
          onClose={() => setModal("")}
          onSubmit={savePerson}
        />
      )}

      {profilePerson && (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-slate-950/60 p-3 backdrop-blur-sm">
          <div className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-5">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-600">
                  Ficha completa
                </p>
                <h2 className="text-2xl font-black">{profilePerson.name}</h2>
              </div>
              <button
                type="button"
                onClick={() => setProfilePerson(null)}
                className="rounded-xl bg-slate-100 p-3"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              {(() => {
                const profileType = profilePerson.type;
                const balance = balanceFor(profilePerson, profileType);
                const profileMovements = movements.filter((movement) =>
                  profileType === "customer"
                    ? movement.customer_id === profilePerson.id
                    : movement.supplier_id === profilePerson.id,
                );
                const creditLimit =
                  profileType === "customer"
                    ? number(profilePerson.credit_limit)
                    : 0;
                const available =
                  profileType === "customer" && creditLimit > 0
                    ? Math.max(0, creditLimit - Math.max(0, balance))
                    : null;
                return (
                  <>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <article className="rounded-2xl bg-slate-950 p-4 text-white">
                        <p className="text-xs font-black uppercase text-slate-400">
                          Saldo actual
                        </p>
                        <p className="mt-2 text-2xl font-black">
                          {MONEY.format(Math.max(0, balance))}
                        </p>
                      </article>
                      {profileType === "customer" && (
                        <>
                          <article className="rounded-2xl bg-blue-600 p-4 text-white">
                            <p className="text-xs font-black uppercase text-blue-100">
                              Límite fiado
                            </p>
                            <p className="mt-2 text-2xl font-black">
                              {creditLimit > 0
                                ? MONEY.format(creditLimit)
                                : "Sin límite"}
                            </p>
                          </article>
                          <article className="rounded-2xl bg-emerald-500 p-4 text-slate-950">
                            <p className="text-xs font-black uppercase">
                              Disponible
                            </p>
                            <p className="mt-2 text-2xl font-black">
                              {available === null
                                ? "Sin límite"
                                : MONEY.format(available)}
                            </p>
                          </article>
                        </>
                      )}
                    </div>

                    <div className="mt-5 grid gap-3 rounded-3xl bg-slate-50 p-5 sm:grid-cols-2">
                      <p className="font-bold">
                        Documento:{" "}
                        <span className="font-normal">
                          {profilePerson.document ||
                            profilePerson.tax_id ||
                            "No informado"}
                        </span>
                      </p>
                      <p className="flex items-center gap-2 font-bold">
                        <Phone size={17} />
                        {profilePerson.phone || "No informado"}
                      </p>
                      <p className="flex items-center gap-2 font-bold">
                        <Mail size={17} />
                        {profilePerson.email || "No informado"}
                      </p>
                      <p className="flex items-center gap-2 font-bold">
                        <MapPin size={17} />
                        {profilePerson.address || "No informada"}
                      </p>
                      <p className="sm:col-span-2">
                        <strong>Notas:</strong>{" "}
                        {profilePerson.notes || "Sin notas"}
                      </p>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setForm({
                            id: profilePerson.id,
                            name: profilePerson.name || "",
                            document:
                              profilePerson.document ||
                              profilePerson.tax_id ||
                              "",
                            phone: profilePerson.phone || "",
                            email: profilePerson.email || "",
                            address: profilePerson.address || "",
                            credit_limit: profilePerson.credit_limit || "",
                            notes: profilePerson.notes || "",
                          });
                          setModal(profileType);
                          setProfilePerson(null);
                        }}
                        className="rounded-2xl bg-blue-600 px-5 py-3 font-black text-white"
                      >
                        <Pencil className="mr-2 inline" size={18} />
                        Editar datos y límite
                      </button>
                      <button
                        type="button"
                        disabled={!cashSession}
                        onClick={() => {
                          setAccountPerson({
                            ...profilePerson,
                            type: profileType,
                          });
                          setProfilePerson(null);
                        }}
                        className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white disabled:opacity-40"
                      >
                        <HandCoins className="mr-2 inline" size={18} />
                        Registrar pago
                      </button>
                    </div>

                    <div className="mt-7">
                      <h3 className="text-xl font-black">Movimientos de la cuenta</h3>
                      <div className="mt-3 overflow-x-auto rounded-2xl border">
                        <table className="w-full min-w-[620px] text-left">
                          <thead className="bg-slate-950 text-xs uppercase text-white">
                            <tr>
                              <th className="p-3">Fecha</th>
                              <th className="p-3">Detalle</th>
                              <th className="p-3">Tipo</th>
                              <th className="p-3 text-right">Importe</th>
                            </tr>
                          </thead>
                          <tbody>
                            {profileMovements.map((movement) => (
                              <tr key={movement.id} className="border-t text-sm">
                                <td className="p-3">
                                  {new Date(
                                    movement.created_at,
                                  ).toLocaleDateString("es-AR")}
                                </td>
                                <td className="p-3 font-bold">
                                  {movement.description || "Movimiento"}
                                </td>
                                <td className="p-3">
                                  {movement.movement_type === "debit"
                                    ? "Deuda"
                                    : "Pago"}
                                </td>
                                <td
                                  className={`p-3 text-right font-black ${
                                    movement.movement_type === "debit"
                                      ? "text-red-700"
                                      : "text-emerald-700"
                                  }`}
                                >
                                  {movement.movement_type === "debit" ? "+" : "−"}
                                  {MONEY.format(number(movement.amount))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {!profileMovements.length && (
                          <p className="py-10 text-center font-bold text-slate-500">
                            Todavía no tiene movimientos.
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {accountPerson && (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-slate-950/60 p-3 backdrop-blur-sm">
          <form
            onSubmit={registerPayment}
            className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl"
          >
            <div className="flex justify-between gap-3">
              <div>
                <CreditCard className="text-blue-600" size={34} />
                <h2 className="mt-2 text-2xl font-black">Registrar pago</h2>
                <p className="text-slate-500">{accountPerson.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setAccountPerson(null)}
                className="h-fit rounded-xl bg-slate-100 p-3"
              >
                <X size={20} />
              </button>
            </div>
            <label className="mt-5 block">
              <span className="mb-2 block font-black">Importe *</span>
              <input
                required
                autoFocus
                inputMode="decimal"
                value={payment.amount}
                onChange={(event) =>
                  setPayment((current) => ({ ...current, amount: event.target.value }))
                }
                className="h-16 w-full rounded-2xl bg-slate-100 px-4 text-2xl font-black"
              />
            </label>
            <label className="mt-4 block">
              <span className="mb-2 block font-black">Medio de pago</span>
              <select
                value={payment.payment_method}
                onChange={(event) =>
                  setPayment((current) => ({
                    ...current,
                    payment_method: event.target.value,
                  }))
                }
                className="h-14 w-full rounded-2xl bg-slate-100 px-4 font-bold"
              >
                <option value="cash">Efectivo</option>
                <option value="transfer">Transferencia</option>
                <option value="debit">Débito</option>
                <option value="credit">Crédito</option>
                <option value="mercadopago">Mercado Pago</option>
              </select>
            </label>
            <label className="mt-4 block">
              <span className="mb-2 block font-black">Descripción</span>
              <input
                value={payment.description}
                onChange={(event) =>
                  setPayment((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="h-14 w-full rounded-2xl bg-slate-100 px-4 font-bold"
              />
            </label>
            <button
              disabled={saving}
              className="mt-5 h-14 w-full rounded-2xl bg-blue-600 font-black text-white disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Confirmar pago"}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
