import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  FilePlus2,
  FileText,
  Plus,
  Printer,
  Pencil,
  ReceiptText,
  Search,
  Trash2,
  UserRoundPlus,
  Users,
  X,
} from "lucide-react";
import { supabase } from "../supabase";

const MONEY = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 2,
});

const LABELS = {
  quote: "Presupuesto",
  delivery_note: "Remito",
  internal_receipt: "Comprobante interno",
};

function number(value) {
  const parsed = Number(String(value ?? "0").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default function DocumentsTeamPanel({
  businessId,
  branchId,
  branches,
  businessName,
}) {
  const [tab, setTab] = useState("documents");
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [businessSettings, setBusinessSettings] = useState(null);
  const [search, setSearch] = useState("");
  const [documentModal, setDocumentModal] = useState(false);
  const [employeeModal, setEmployeeModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [documentForm, setDocumentForm] = useState({
    document_type: "quote",
    customer_id: "",
    valid_until: "",
    notes: "",
  });
  const [items, setItems] = useState([
    { product_id: "", description: "", quantity: "1", unit_price: "" },
  ]);
  const [employeeForm, setEmployeeForm] = useState({
    id: "",
    name: "",
    document: "",
    email: "",
    role_name: "",
    branch_id: branchId || "",
    salary: "",
    commission_percent: "",
    permissions: {
      sales: true,
      cash: false,
      stock: false,
      documents: false,
      reports: false,
    },
  });

  useEffect(() => {
    load();
  }, [businessId]);

  useEffect(() => {
    setEmployeeForm((current) => ({
      ...current,
      branch_id: current.branch_id || branchId || "",
    }));
  }, [branchId]);

  async function load() {
    if (!businessId) return;
    const [{ data: productData }, { data: customerData }, { data: documentData }, { data: employeeData }, { data: settingData }] =
      await Promise.all([
        supabase
          .from("admin_products")
          .select("id, name, sale_price, barcode")
          .eq("business_id", businessId)
          .eq("active", true)
          .order("name"),
        supabase
          .from("admin_customers")
          .select("id, name, document, phone, address")
          .eq("business_id", businessId)
          .eq("active", true)
          .order("name"),
        supabase
          .from("admin_documents")
          .select("*")
          .eq("business_id", businessId)
          .order("created_at", { ascending: false }),
        supabase
          .from("admin_employees")
          .select("*")
          .eq("business_id", businessId)
          .eq("active", true)
          .order("name"),
        supabase
          .from("admin_business_settings")
          .select("*")
          .eq("business_id", businessId)
          .maybeSingle(),
      ]);
    setProducts(productData || []);
    setCustomers(customerData || []);
    setDocuments(documentData || []);
    setEmployees(employeeData || []);
    setBusinessSettings(settingData || null);
  }

  function updateItem(index, field, value) {
    setItems((current) =>
      current.map((item, position) => {
        if (position !== index) return item;
        if (field === "product_id") {
          const product = products.find((entry) => entry.id === value);
          return {
            ...item,
            product_id: value,
            description: product?.name || item.description,
            unit_price: product ? String(product.sale_price) : item.unit_price,
          };
        }
        return { ...item, [field]: value };
      }),
    );
  }

  const documentTotal = items.reduce(
    (total, item) => total + number(item.quantity) * number(item.unit_price),
    0,
  );

  async function saveDocument(event) {
    event.preventDefault();
    setSaving(true);
    const { error } = await supabase.rpc("create_administration_document", {
      p_business_id: businessId,
      p_branch_id: branchId,
      p_customer_id: documentForm.customer_id || null,
      p_document_type: documentForm.document_type,
      p_valid_until:
        documentForm.document_type === "quote" && documentForm.valid_until
          ? documentForm.valid_until
          : null,
      p_notes: documentForm.notes,
      p_items: items.map((item) => ({
        product_id: item.product_id || null,
        description: item.description.trim(),
        quantity: number(item.quantity),
        unit_price: number(item.unit_price),
      })),
    });
    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setDocumentModal(false);
    setDocumentForm({
      document_type: "quote",
      customer_id: "",
      valid_until: "",
      notes: "",
    });
    setItems([{ product_id: "", description: "", quantity: "1", unit_price: "" }]);
    setMessage("Documento guardado correctamente.");
    load();
  }

  async function saveEmployee(event) {
    event.preventDefault();
    setSaving(true);
    const payload = {
      business_id: businessId,
      branch_id: employeeForm.branch_id || null,
      name: employeeForm.name.trim(),
      document: employeeForm.document.trim() || null,
      email: employeeForm.email.trim() || null,
      role_name: employeeForm.role_name.trim() || null,
      salary: number(employeeForm.salary),
      commission_percent: number(employeeForm.commission_percent),
      permissions: employeeForm.permissions,
      updated_at: new Date().toISOString(),
    };
    const request = employeeForm.id
      ? supabase
          .from("admin_employees")
          .update(payload)
          .eq("id", employeeForm.id)
          .eq("business_id", businessId)
      : supabase.from("admin_employees").insert(payload);
    const { error } = await request;
    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setEmployeeModal(false);
    setEmployeeForm({
      id: "",
      name: "",
      document: "",
      email: "",
      role_name: "",
      branch_id: branchId || "",
      salary: "",
      commission_percent: "",
      permissions: {
        sales: true,
        cash: false,
        stock: false,
        documents: false,
        reports: false,
      },
    });
    setMessage("Empleado y permisos guardados.");
    load();
  }

  async function deactivateEmployee(employee) {
    if (!window.confirm(`¿Desactivar a ${employee.name}?`)) return;
    const { error } = await supabase
      .from("admin_employees")
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq("id", employee.id)
      .eq("business_id", businessId);
    setMessage(error ? error.message : "Empleado desactivado.");
    load();
  }

  async function printDocument(document) {
    const [{ data: lines }, { data: customer }] = await Promise.all([
      supabase
        .from("admin_document_items")
        .select("*")
        .eq("document_id", document.id)
        .order("id"),
      document.customer_id
        ? supabase
            .from("admin_customers")
            .select("*")
            .eq("id", document.customer_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    const branch = branches.find((entry) => entry.id === document.branch_id);
    const documentBusinessName =
      businessSettings?.display_name || businessName || "TusComercios";
    const watermark = businessSettings?.watermark_text || "TusComercios!";
    const rows = (lines || [])
      .map(
        (line) => `
          <tr>
            <td>${escapeHtml(line.description)}</td>
            <td class="right">${escapeHtml(line.quantity)}</td>
            <td class="right">${MONEY.format(line.unit_price)}</td>
            <td class="right">${MONEY.format(line.subtotal)}</td>
          </tr>`,
      )
      .join("");
    const popup = window.open("", "_blank", "width=900,height=700");
    if (!popup) {
      setMessage("El navegador bloqueó la impresión. Habilitá las ventanas emergentes.");
      return;
    }
    popup.document.write(`<!doctype html>
      <html><head><meta charset="utf-8"><title>${LABELS[document.document_type]}</title>
      <style>
        body{font-family:Arial,sans-serif;color:#0f172a;padding:36px;max-width:900px;margin:auto;position:relative}
        body:before{content:"${escapeHtml(watermark)}";position:fixed;inset:35% 0 auto 0;text-align:center;
          font-size:84px;font-weight:900;color:rgba(37,99,235,.07);transform:rotate(-24deg);z-index:-1}
        header{border-bottom:5px solid #2563eb;padding-bottom:20px;display:flex;justify-content:space-between}
        h1{margin:0;font-size:30px}.red{color:#dc2626}.muted{color:#64748b}
        .info{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:28px 0}
        .box{border:1px solid #cbd5e1;border-radius:14px;padding:16px}
        table{width:100%;border-collapse:collapse;margin-top:20px}
        th,td{padding:12px;border-bottom:1px solid #e2e8f0;text-align:left}.right{text-align:right}
        .total{font-size:26px;font-weight:900;text-align:right;margin-top:22px}
        footer{margin-top:50px;border-top:1px solid #cbd5e1;padding-top:16px;font-size:12px;color:#64748b}
        @media print{body{padding:0}button{display:none}}
      </style></head><body>
      <header><div>${businessSettings?.logo_url ? `<img src="${escapeHtml(businessSettings.logo_url)}" style="max-width:150px;max-height:70px;object-fit:contain">` : ""}
      <h1>${escapeHtml(documentBusinessName)}</h1><div class="muted">${escapeHtml(branch?.name || "")}</div>
      <div class="muted">${escapeHtml(businessSettings?.address || "")}</div>
      <div class="muted">${escapeHtml(businessSettings?.whatsapp || "")} · ${escapeHtml(businessSettings?.email || "")}</div></div>
      <div><h1 class="red">${LABELS[document.document_type]}</h1><div>N.º ${document.document_number}</div></div></header>
      <div class="info"><div class="box"><b>Cliente</b><br>${escapeHtml(customer?.name || "Consumidor final")}<br>
      ${escapeHtml(customer?.document || "")}<br>${escapeHtml(customer?.phone || "")}</div>
      <div class="box"><b>Fecha</b><br>${new Date(document.issue_date + "T12:00:00").toLocaleDateString("es-AR")}
      ${document.valid_until ? `<br><b>Válido hasta:</b> ${new Date(document.valid_until + "T12:00:00").toLocaleDateString("es-AR")}` : ""}</div></div>
      <table><thead><tr><th>Descripción</th><th class="right">Cantidad</th><th class="right">Precio</th><th class="right">Subtotal</th></tr></thead>
      <tbody>${rows}</tbody></table><div class="total">TOTAL: ${MONEY.format(document.total)}</div>
      ${document.notes ? `<div class="box"><b>Observaciones:</b><br>${escapeHtml(document.notes)}</div>` : ""}
      <footer>Documento interno no válido como factura fiscal. Generado mediante TusComercios Administración.</footer>
      <script>window.onload=()=>window.print()</script></body></html>`);
    popup.document.close();
  }

  async function convertQuote(document) {
    const { error } = await supabase.rpc(
      "convert_administration_quote_to_sale",
      {
        p_document_id: document.id,
        p_payment_method: "cash",
        p_paid_amount: document.total,
      },
    );
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Presupuesto convertido en venta y stock actualizado.");
    load();
  }

  function previewDraft() {
    const popup = window.open("", "_blank", "width=900,height=700");
    if (!popup) {
      setMessage("El navegador bloqueó la vista previa.");
      return;
    }
    const customer = customers.find(
      (entry) => entry.id === documentForm.customer_id,
    );
    const watermark = businessSettings?.watermark_text || "TusComercios!";
    const rows = items
      .map(
        (item) =>
          `<tr><td>${escapeHtml(item.description || "Concepto")}</td><td>${escapeHtml(item.quantity)}</td><td>${MONEY.format(number(item.unit_price))}</td><td>${MONEY.format(number(item.quantity) * number(item.unit_price))}</td></tr>`,
      )
      .join("");
    popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Vista previa</title>
      <style>body{font-family:Arial;padding:35px;color:#0f172a;position:relative}body:before{content:"${escapeHtml(watermark)}";position:fixed;top:40%;left:0;right:0;text-align:center;font-size:80px;font-weight:bold;color:rgba(37,99,235,.07);transform:rotate(-25deg);z-index:-1}header{display:flex;justify-content:space-between;border-bottom:5px solid #2563eb;padding-bottom:18px}h1{margin:0}.red{color:#dc2626}table{width:100%;border-collapse:collapse;margin-top:25px}th,td{padding:12px;border-bottom:1px solid #ddd;text-align:left}.total{text-align:right;font-size:26px;font-weight:bold;margin-top:20px}.box{margin-top:20px;background:#f1f5f9;padding:15px;border-radius:12px}</style>
      </head><body><header><div><h1>${escapeHtml(businessSettings?.display_name || businessName)}</h1><p>${escapeHtml(businessSettings?.address || "")}<br>${escapeHtml(businessSettings?.whatsapp || "")} · ${escapeHtml(businessSettings?.email || "")}</p></div><div><h1 class="red">${LABELS[documentForm.document_type]}</h1><p>VISTA PREVIA</p></div></header>
      <div class="box"><b>Cliente:</b> ${escapeHtml(customer?.name || "Consumidor final")}</div>
      <table><thead><tr><th>Descripción</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="total">TOTAL: ${MONEY.format(documentTotal)}</div>
      <p class="box">Documento interno no válido como factura fiscal · Generado con TusComercios Administración.</p></body></html>`);
    popup.document.close();
  }

  const filteredDocuments = useMemo(() => {
    const needle = search.toLowerCase();
    return documents.filter((document) => {
      const customer = customers.find((entry) => entry.id === document.customer_id);
      return [LABELS[document.document_type], document.document_number, customer?.name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [documents, customers, search]);

  return (
    <section className="mt-5 rounded-[2rem] bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-blue-600">
            Gestión interna
          </p>
          <h2 className="mt-1 text-2xl font-black">Documentos y equipo</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab("documents")}
            className={`rounded-2xl px-5 py-3 font-black ${
              tab === "documents" ? "bg-blue-600 text-white" : "bg-slate-100"
            }`}
          >
            <FileText className="mr-2 inline" size={19} /> Documentos
          </button>
          <button
            type="button"
            onClick={() => setTab("employees")}
            className={`rounded-2xl px-5 py-3 font-black ${
              tab === "employees" ? "bg-red-600 text-white" : "bg-slate-100"
            }`}
          >
            <Users className="mr-2 inline" size={19} /> Empleados
          </button>
          <button
            type="button"
            onClick={() => {
              if (tab === "documents") {
                setDocumentModal(true);
              } else {
                setEmployeeForm({
                  id: "",
                  name: "",
                  document: "",
                  email: "",
                  role_name: "",
                  branch_id: branchId || "",
                  salary: "",
                  commission_percent: "",
                  permissions: {
                    sales: true,
                    cash: false,
                    stock: false,
                    documents: false,
                    reports: false,
                  },
                });
                setEmployeeModal(true);
              }
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

      {tab === "documents" ? (
        <>
          <label className="mt-5 flex h-14 items-center gap-3 rounded-2xl bg-slate-100 px-4">
            <Search className="text-slate-500" size={20} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar documento o cliente..."
              className="min-w-0 flex-1 bg-transparent font-bold outline-none"
            />
          </label>
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {filteredDocuments.map((document) => {
              const customer = customers.find(
                (entry) => entry.id === document.customer_id,
              );
              return (
                <article key={document.id} className="rounded-3xl border p-5">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-blue-600">
                        {LABELS[document.document_type]} N.º {document.document_number}
                      </p>
                      <h3 className="mt-2 text-xl font-black">
                        {customer?.name || "Consumidor final"}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {new Date(document.issue_date + "T12:00:00").toLocaleDateString("es-AR")}
                      </p>
                    </div>
                    <p className="text-xl font-black">{MONEY.format(document.total)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => printDocument(document)}
                    className="mt-4 w-full rounded-2xl bg-slate-950 px-4 py-3 font-black text-white"
                  >
                    <Printer className="mr-2 inline" size={19} /> Imprimir o guardar PDF
                  </button>
                  {document.document_type === "quote" &&
                    document.status === "issued" && (
                      <button
                        type="button"
                        onClick={() => convertQuote(document)}
                        className="mt-2 w-full rounded-2xl bg-emerald-600 px-4 py-3 font-black text-white"
                      >
                        Convertir presupuesto en venta
                      </button>
                    )}
                </article>
              );
            })}
          </div>
          {!filteredDocuments.length && (
            <div className="py-14 text-center text-slate-500">
              <ReceiptText className="mx-auto mb-3" size={46} />
              <p className="font-black">Todavía no hay documentos emitidos.</p>
            </div>
          )}
        </>
      ) : (
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {employees.map((employee) => {
            const branch = branches.find((entry) => entry.id === employee.branch_id);
            return (
              <article key={employee.id} className="rounded-3xl border p-5">
                <div className="flex gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-100 text-red-700">
                    <BriefcaseBusiness />
                  </div>
                  <div>
                    <h3 className="text-lg font-black">{employee.name}</h3>
                    <p className="text-sm text-slate-500">
                      {employee.role_name || "Sin puesto"} · {branch?.name || "Todas"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-2xl bg-slate-100 p-3">
                    <p className="text-slate-500">Sueldo</p>
                    <p className="font-black">{MONEY.format(employee.salary)}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-3">
                    <p className="text-slate-500">Comisión</p>
                    <p className="font-black">{employee.commission_percent || 0}%</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmployeeForm({
                        id: employee.id,
                        name: employee.name || "",
                        document: employee.document || "",
                        email: employee.email || "",
                        role_name: employee.role_name || "",
                        branch_id: employee.branch_id || "",
                        salary: employee.salary || "",
                        commission_percent: employee.commission_percent || "",
                        permissions: employee.permissions || {
                          sales: true,
                          cash: false,
                          stock: false,
                          documents: false,
                          reports: false,
                        },
                      });
                      setEmployeeModal(true);
                    }}
                    className="flex-1 rounded-2xl bg-blue-50 px-3 py-3 font-black text-blue-700"
                  >
                    <Pencil className="mr-1 inline" size={17} /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => deactivateEmployee(employee)}
                    className="flex-1 rounded-2xl bg-red-50 px-3 py-3 font-black text-red-700"
                  >
                    <Trash2 className="mr-1 inline" size={17} /> Desactivar
                  </button>
                </div>
              </article>
            );
          })}
          {!employees.length && (
            <div className="py-14 text-center text-slate-500 lg:col-span-2">
              <Users className="mx-auto mb-3" size={46} />
              <p className="font-black">Todavía no hay empleados registrados.</p>
            </div>
          )}
        </div>
      )}

      {documentModal && (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-slate-950/60 p-3 backdrop-blur-sm">
          <form onSubmit={saveDocument} className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-5">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-600">
                  Nuevo documento
                </p>
                <h2 className="text-2xl font-black">{LABELS[documentForm.document_type]}</h2>
              </div>
              <button type="button" onClick={() => setDocumentModal(false)} className="rounded-xl bg-slate-100 p-3">
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <label>
                  <span className="mb-2 block font-black">Tipo</span>
                  <select
                    value={documentForm.document_type}
                    onChange={(event) =>
                      setDocumentForm((current) => ({
                        ...current,
                        document_type: event.target.value,
                      }))
                    }
                    className="h-14 w-full rounded-2xl bg-slate-100 px-4 font-black"
                  >
                    <option value="quote">Presupuesto</option>
                    <option value="delivery_note">Remito</option>
                    <option value="internal_receipt">Comprobante interno</option>
                  </select>
                </label>
                <label>
                  <span className="mb-2 block font-black">Cliente</span>
                  <select
                    value={documentForm.customer_id}
                    onChange={(event) =>
                      setDocumentForm((current) => ({
                        ...current,
                        customer_id: event.target.value,
                      }))
                    }
                    className="h-14 w-full rounded-2xl bg-slate-100 px-4 font-black"
                  >
                    <option value="">Consumidor final</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="mb-2 block font-black">Válido hasta</span>
                  <input
                    type="date"
                    disabled={documentForm.document_type !== "quote"}
                    value={documentForm.valid_until}
                    onChange={(event) =>
                      setDocumentForm((current) => ({
                        ...current,
                        valid_until: event.target.value,
                      }))
                    }
                    className="h-14 w-full rounded-2xl bg-slate-100 px-4 font-black disabled:opacity-40"
                  />
                </label>
              </div>

              <div className="mt-6 space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="grid gap-3 rounded-3xl border p-4 md:grid-cols-[1.2fr_1.5fr_100px_150px_48px]">
                    <select
                      value={item.product_id}
                      onChange={(event) => updateItem(index, "product_id", event.target.value)}
                      className="h-12 rounded-xl bg-slate-100 px-3 font-bold"
                    >
                      <option value="">Concepto manual</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                    <input
                      required
                      value={item.description}
                      onChange={(event) => updateItem(index, "description", event.target.value)}
                      placeholder="Descripción"
                      className="h-12 rounded-xl bg-slate-100 px-3 font-bold"
                    />
                    <input
                      required
                      inputMode="decimal"
                      value={item.quantity}
                      onChange={(event) => updateItem(index, "quantity", event.target.value)}
                      placeholder="Cant."
                      className="h-12 rounded-xl bg-slate-100 px-3 font-bold"
                    />
                    <input
                      required
                      inputMode="decimal"
                      value={item.unit_price}
                      onChange={(event) => updateItem(index, "unit_price", event.target.value)}
                      placeholder="Precio"
                      className="h-12 rounded-xl bg-slate-100 px-3 font-bold"
                    />
                    <button
                      type="button"
                      disabled={items.length === 1}
                      onClick={() =>
                        setItems((current) => current.filter((_, position) => position !== index))
                      }
                      className="grid h-12 place-items-center rounded-xl bg-red-50 text-red-600 disabled:opacity-30"
                    >
                      <Trash2 size={19} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setItems((current) => [
                    ...current,
                    { product_id: "", description: "", quantity: "1", unit_price: "" },
                  ])
                }
                className="mt-3 rounded-2xl bg-slate-100 px-5 py-3 font-black"
              >
                <Plus className="mr-1 inline" size={19} /> Agregar concepto
              </button>
              <label className="mt-5 block">
                <span className="mb-2 block font-black">Observaciones</span>
                <textarea
                  value={documentForm.notes}
                  onChange={(event) =>
                    setDocumentForm((current) => ({ ...current, notes: event.target.value }))
                  }
                  className="min-h-20 w-full rounded-2xl bg-slate-100 p-4"
                />
              </label>
              <div className="mt-5 flex flex-col items-center justify-between gap-4 rounded-3xl bg-slate-950 p-5 text-white sm:flex-row">
                <div>
                  <p className="text-sm font-black uppercase tracking-widest text-slate-400">Total</p>
                  <p className="text-3xl font-black">{MONEY.format(documentTotal)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={previewDraft}
                    className="h-14 rounded-2xl bg-white px-5 font-black text-slate-950"
                  >
                    Vista previa
                  </button>
                  <button disabled={saving} className="h-14 rounded-2xl bg-blue-600 px-7 font-black disabled:opacity-50">
                    <FilePlus2 className="mr-2 inline" />
                    {saving ? "Guardando..." : "Emitir documento"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {employeeModal && (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-slate-950/60 p-3 backdrop-blur-sm">
          <form onSubmit={saveEmployee} className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="flex justify-between gap-3">
              <div>
                <UserRoundPlus className="text-red-600" size={38} />
                <h2 className="mt-2 text-2xl font-black">Nuevo empleado</h2>
              </div>
              <button type="button" onClick={() => setEmployeeModal(false)} className="h-fit rounded-xl bg-slate-100 p-3">
                <X size={20} />
              </button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ["Nombre completo *", "name"],
                ["DNI/CUIL", "document"],
                ["Correo de acceso", "email"],
                ["Puesto o función", "role_name"],
                ["Sueldo mensual", "salary"],
                ["Comisión %", "commission_percent"],
              ].map(([label, field]) => (
                <label key={field}>
                  <span className="mb-2 block font-black">{label}</span>
                  <input
                    required={field === "name"}
                    inputMode={["salary", "commission_percent"].includes(field) ? "decimal" : "text"}
                    value={employeeForm[field]}
                    onChange={(event) =>
                      setEmployeeForm((current) => ({ ...current, [field]: event.target.value }))
                    }
                    className="h-14 w-full rounded-2xl bg-slate-100 px-4 font-bold"
                  />
                </label>
              ))}
              <label>
                <span className="mb-2 block font-black">Sucursal</span>
                <select
                  value={employeeForm.branch_id}
                  onChange={(event) =>
                    setEmployeeForm((current) => ({ ...current, branch_id: event.target.value }))
                  }
                  className="h-14 w-full rounded-2xl bg-slate-100 px-4 font-bold"
                >
                  <option value="">Todas las sucursales</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </label>
              <fieldset className="rounded-2xl bg-slate-100 p-4 sm:col-span-2">
                <legend className="px-2 font-black">Permisos del empleado</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {[
                    ["sales", "Ventas"],
                    ["cash", "Caja"],
                    ["stock", "Stock"],
                    ["documents", "Documentos"],
                    ["reports", "Reportes"],
                  ].map(([permission, label]) => (
                    <label key={permission} className="flex items-center gap-2 font-bold">
                      <input
                        type="checkbox"
                        checked={Boolean(employeeForm.permissions?.[permission])}
                        onChange={(event) =>
                          setEmployeeForm((current) => ({
                            ...current,
                            permissions: {
                              ...current.permissions,
                              [permission]: event.target.checked,
                            },
                          }))
                        }
                        className="h-5 w-5"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
            <button disabled={saving} className="mt-5 h-14 w-full rounded-2xl bg-red-600 font-black text-white disabled:opacity-50">
              {saving
                ? "Guardando..."
                : employeeForm.id
                  ? "Guardar cambios"
                  : "Guardar empleado"}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
