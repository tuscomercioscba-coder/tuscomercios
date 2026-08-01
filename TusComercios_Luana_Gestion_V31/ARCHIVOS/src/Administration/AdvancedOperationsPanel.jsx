import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeftRight,
  BarChart3,
  Building2,
  CalendarClock,
  Download,
  History,
  PackagePlus,
  Plus,
  Save,
  Settings,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "../supabase";
import { downloadExcel } from "./excelUtils";

const MONEY = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 2,
});

const EMPTY_LINE = { product_id: "", quantity: "1", unit_cost: "" };
const PAYMENT_LABELS = {
  cash: "Efectivo",
  debit: "Débito",
  credit: "Crédito",
  transfer: "Transferencia",
  mercadopago: "Mercado Pago",
  account: "Cuenta corriente",
};

function number(value) {
  const parsed = Number(String(value ?? "0").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function AdvancedOperationsPanel({
  businessId,
  branchId,
  branches,
  businessName,
  cashSession,
  isAdmin,
  onDataChange,
}) {
  const [tab, setTab] = useState("purchases");
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [movements, setMovements] = useState([]);
  const [salesItems, setSalesItems] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [audits, setAudits] = useState([]);
  const [settings, setSettings] = useState({
    display_name: isAdmin ? "TusComercios" : businessName || "",
    whatsapp: "",
    email: "",
    address: "",
    tax_id: "",
    logo_url: "",
    watermark_text: "TusComercios!",
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({
    supplier_id: "",
    payment_method: "cash",
    paid_amount: "",
    invoice_reference: "",
    notes: "",
  });
  const [purchaseItems, setPurchaseItems] = useState([EMPTY_LINE]);
  const [transferForm, setTransferForm] = useState({
    from_branch_id: branchId || "",
    to_branch_id: "",
    notes: "",
  });
  const [transferItems, setTransferItems] = useState([
    { product_id: "", quantity: "1" },
  ]);
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    category: "Gasto fijo",
    amount: "",
    frequency: "monthly",
    next_due_date: "",
  });

  useEffect(() => {
    load();
  }, [businessId]);

  useEffect(() => {
    setTransferForm((current) => ({
      ...current,
      from_branch_id: current.from_branch_id || branchId || "",
    }));
  }, [branchId]);

  async function load() {
    if (!businessId) return;
    const [
      { data: productData },
      { data: supplierData },
      { data: purchaseData },
      { data: transferData },
      { data: movementData },
      { data: saleItemData },
      { data: expenseData },
      { data: auditData },
      { data: settingData },
    ] = await Promise.all([
      supabase.from("admin_products").select("*").eq("business_id", businessId).eq("active", true).order("name"),
      supabase.from("admin_suppliers").select("*").eq("business_id", businessId).eq("active", true).order("name"),
      supabase.from("admin_purchases").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(200),
      supabase.from("admin_stock_transfers").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(200),
      supabase.from("admin_inventory_movements").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(1000),
      supabase.from("admin_sale_items").select("*, admin_sales!inner(created_at,status,branch_id)").eq("business_id", businessId).eq("admin_sales.status", "completed").limit(3000),
      supabase.from("admin_recurring_expenses").select("*").eq("business_id", businessId).eq("active", true).order("next_due_date"),
      supabase.from("admin_audit_log").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(200),
      supabase.from("admin_business_settings").select("*").eq("business_id", businessId).maybeSingle(),
    ]);
    setProducts(productData || []);
    setSuppliers(supplierData || []);
    setPurchases(purchaseData || []);
    setTransfers(transferData || []);
    setMovements(movementData || []);
    setSalesItems(saleItemData || []);
    setExpenses(expenseData || []);
    setAudits(auditData || []);
    if (settingData) setSettings(settingData);
    else
      setSettings((current) => ({
        ...current,
        display_name: isAdmin ? "TusComercios" : businessName || current.display_name,
      }));
  }

  function updatePurchaseItem(index, field, value) {
    setPurchaseItems((current) =>
      current.map((item, position) => {
        if (position !== index) return item;
        if (field === "product_id") {
          const product = products.find((entry) => entry.id === value);
          return {
            ...item,
            product_id: value,
            unit_cost: product ? String(product.cost) : item.unit_cost,
          };
        }
        return { ...item, [field]: value };
      }),
    );
  }

  const purchaseTotal = purchaseItems.reduce(
    (total, item) => total + number(item.quantity) * number(item.unit_cost),
    0,
  );

  async function savePurchase(event) {
    event.preventDefault();
    setSaving(true);
    const { error } = await supabase.rpc("create_administration_purchase", {
      p_business_id: businessId,
      p_branch_id: branchId,
      p_supplier_id: purchaseForm.supplier_id || null,
      p_payment_method: purchaseForm.payment_method,
      p_paid_amount: number(purchaseForm.paid_amount),
      p_invoice_reference: purchaseForm.invoice_reference,
      p_notes: purchaseForm.notes,
      p_items: purchaseItems.map((item) => ({
        product_id: item.product_id,
        quantity: number(item.quantity),
        unit_cost: number(item.unit_cost),
      })),
    });
    setSaving(false);
    if (error) return setMessage(error.message);
    setPurchaseForm({
      supplier_id: "",
      payment_method: "cash",
      paid_amount: "",
      invoice_reference: "",
      notes: "",
    });
    setPurchaseItems([EMPTY_LINE]);
    setMessage("Compra guardada y stock actualizado.");
    await load();
    onDataChange?.();
  }

  async function saveTransfer(event) {
    event.preventDefault();
    setSaving(true);
    const { error } = await supabase.rpc("create_administration_transfer", {
      p_business_id: businessId,
      p_from_branch_id: transferForm.from_branch_id,
      p_to_branch_id: transferForm.to_branch_id,
      p_notes: transferForm.notes,
      p_items: transferItems.map((item) => ({
        product_id: item.product_id,
        quantity: number(item.quantity),
      })),
    });
    setSaving(false);
    if (error) return setMessage(error.message);
    setTransferItems([{ product_id: "", quantity: "1" }]);
    setTransferForm((current) => ({ ...current, to_branch_id: "", notes: "" }));
    setMessage("Transferencia realizada correctamente.");
    await load();
    onDataChange?.();
  }

  async function saveExpense(event) {
    event.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("admin_recurring_expenses").insert({
      business_id: businessId,
      branch_id: branchId || null,
      description: expenseForm.description.trim(),
      category: expenseForm.category,
      amount: number(expenseForm.amount),
      frequency: expenseForm.frequency,
      next_due_date: expenseForm.next_due_date || null,
    });
    setSaving(false);
    if (error) return setMessage(error.message);
    setExpenseForm({
      description: "",
      category: "Gasto fijo",
      amount: "",
      frequency: "monthly",
      next_due_date: "",
    });
    setMessage("Gasto recurrente guardado.");
    load();
  }

  async function registerExpense(expense) {
    if (!cashSession) {
      setMessage("Abrí la caja para registrar este gasto.");
      return;
    }
    const { error } = await supabase.from("admin_cash_movements").insert({
      business_id: businessId,
      branch_id: branchId,
      cash_session_id: cashSession.id,
      movement_type: "expense",
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      payment_method: "cash",
      fixed_expense: expense.category === "Gasto fijo",
      variable_expense: expense.category === "Gasto variable",
    });
    if (error) return setMessage(error.message);
    setMessage("Gasto registrado en la caja.");
    onDataChange?.();
  }

  async function saveSettings(event) {
    event.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("admin_business_settings").upsert({
      ...settings,
      business_id: businessId,
      display_name: settings.display_name.trim() || "TusComercios",
      watermark_text: settings.watermark_text.trim() || "TusComercios!",
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    setMessage(error ? error.message : "Datos comerciales guardados.");
  }

  const productReport = useMemo(() => {
    const result = {};
    salesItems.forEach((item) => {
      const key = item.product_id || item.description;
      if (!result[key]) {
        result[key] = {
          name: item.description,
          quantity: 0,
          revenue: 0,
          profit: 0,
        };
      }
      result[key].quantity += number(item.quantity);
      result[key].revenue += number(item.subtotal);
      result[key].profit +=
        (number(item.unit_price) - number(item.unit_cost)) * number(item.quantity);
    });
    return Object.values(result).sort((a, b) => b.revenue - a.revenue);
  }, [salesItems]);

  async function exportStockHistory() {
    const rows = movements.map((movement) => ({
      Fecha: new Date(movement.created_at).toLocaleString("es-AR"),
      Producto:
        products.find((product) => product.id === movement.product_id)?.name ||
        "Producto",
      Movimiento: movement.movement_type,
      Cantidad: number(movement.quantity),
      Costo: number(movement.unit_cost),
      Notas: movement.notes || "",
    }));
    await downloadExcel("historial_stock.xlsx", [
      { name: "Movimientos de stock", rows },
    ]);
  }

  function downloadBackup() {
    const payload = {
      generated_at: new Date().toISOString(),
      business: settings,
      products,
      suppliers,
      purchases,
      transfers,
      inventory_movements: movements,
      recurring_expenses: expenses,
      audit_log: audits,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `respaldo_administracion_${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const tabs = [
    ["purchases", ShoppingCart, "Compras"],
    ["expenses", CalendarClock, "Gastos"],
    ["transfers", ArrowLeftRight, "Transferencias"],
    ["stock", History, "Historial de stock"],
    ["reports", BarChart3, "Rentabilidad"],
    ["settings", Settings, "Configuración"],
  ];

  return (
    <section className="mt-5 space-y-5">
      <div className="rounded-[2rem] bg-white p-4 shadow-sm">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map(([value, Icon, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`shrink-0 rounded-2xl px-4 py-3 text-sm font-black ${
                tab === value ? "bg-blue-600 text-white" : "bg-slate-100"
              }`}
            >
              <Icon className="mr-2 inline" size={18} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className="flex justify-between rounded-2xl bg-white p-4 font-bold shadow-sm">
          {message}
          <button type="button" onClick={() => setMessage("")}>
            <X size={18} />
          </button>
        </div>
      )}

      {tab === "purchases" && (
        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <form onSubmit={savePurchase} className="rounded-[2rem] bg-white p-5 shadow-sm">
            <PackagePlus className="text-blue-600" size={38} />
            <h2 className="mt-2 text-2xl font-black">Compra a proveedor</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <select
                value={purchaseForm.supplier_id}
                onChange={(event) =>
                  setPurchaseForm((current) => ({
                    ...current,
                    supplier_id: event.target.value,
                  }))
                }
                className="h-14 rounded-2xl bg-slate-100 px-4 font-bold"
              >
                <option value="">Proveedor</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
              <input
                value={purchaseForm.invoice_reference}
                onChange={(event) =>
                  setPurchaseForm((current) => ({
                    ...current,
                    invoice_reference: event.target.value,
                  }))
                }
                placeholder="N.º de factura del proveedor"
                className="h-14 rounded-2xl bg-slate-100 px-4 font-bold"
              />
            </div>
            <div className="mt-4 space-y-3">
              {purchaseItems.map((item, index) => (
                <div key={index} className="grid gap-2 rounded-2xl border p-3 sm:grid-cols-[1fr_110px_150px_46px]">
                  <select
                    required
                    value={item.product_id}
                    onChange={(event) => updatePurchaseItem(index, "product_id", event.target.value)}
                    className="h-12 rounded-xl bg-slate-100 px-3 font-bold"
                  >
                    <option value="">Producto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                  <input
                    required
                    inputMode="decimal"
                    value={item.quantity}
                    onChange={(event) => updatePurchaseItem(index, "quantity", event.target.value)}
                    placeholder="Cantidad"
                    className="h-12 rounded-xl bg-slate-100 px-3 font-bold"
                  />
                  <input
                    required
                    inputMode="decimal"
                    value={item.unit_cost}
                    onChange={(event) => updatePurchaseItem(index, "unit_cost", event.target.value)}
                    placeholder="Costo unitario"
                    className="h-12 rounded-xl bg-slate-100 px-3 font-bold"
                  />
                  <button
                    type="button"
                    disabled={purchaseItems.length === 1}
                    onClick={() => setPurchaseItems((current) => current.filter((_, i) => i !== index))}
                    className="grid h-12 place-items-center rounded-xl bg-red-50 text-red-600 disabled:opacity-30"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPurchaseItems((current) => [...current, { ...EMPTY_LINE }])}
              className="mt-3 rounded-2xl bg-slate-100 px-4 py-3 font-black"
            >
              <Plus className="mr-1 inline" size={18} /> Producto
            </button>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <select
                value={purchaseForm.payment_method}
                onChange={(event) =>
                  setPurchaseForm((current) => ({
                    ...current,
                    payment_method: event.target.value,
                  }))
                }
                className="h-14 rounded-2xl bg-slate-100 px-4 font-bold"
              >
                {Object.entries(PAYMENT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <input
                inputMode="decimal"
                value={purchaseForm.paid_amount}
                onChange={(event) =>
                  setPurchaseForm((current) => ({
                    ...current,
                    paid_amount: event.target.value,
                  }))
                }
                placeholder="Importe pagado"
                className="h-14 rounded-2xl bg-slate-100 px-4 font-bold"
              />
            </div>
            <button disabled={saving} className="mt-4 h-14 w-full rounded-2xl bg-blue-600 font-black text-white">
              Guardar compra y actualizar stock
            </button>
          </form>
          <aside className="h-fit rounded-[2rem] bg-slate-950 p-6 text-white">
            <p className="text-sm font-black uppercase text-blue-300">Total compra</p>
            <p className="mt-2 text-4xl font-black">{MONEY.format(purchaseTotal)}</p>
            <p className="mt-4 text-sm text-slate-300">
              El saldo no pagado quedará en la cuenta corriente del proveedor.
            </p>
            <h3 className="mt-7 font-black">Últimas compras</h3>
            {purchases.slice(0, 5).map((purchase) => (
              <div key={purchase.id} className="mt-2 rounded-xl bg-white/10 p-3 text-sm">
                N.º {purchase.purchase_number} · {MONEY.format(purchase.total)}
              </div>
            ))}
          </aside>
        </div>
      )}

      {tab === "expenses" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <form onSubmit={saveExpense} className="rounded-[2rem] bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-black">Gasto fijo o variable</h2>
            <div className="mt-5 grid gap-3">
              <input required value={expenseForm.description} onChange={(e) => setExpenseForm((c) => ({ ...c, description: e.target.value }))} placeholder="Descripción" className="h-14 rounded-2xl bg-slate-100 px-4 font-bold" />
              <div className="grid gap-3 sm:grid-cols-2">
                <select value={expenseForm.category} onChange={(e) => setExpenseForm((c) => ({ ...c, category: e.target.value }))} className="h-14 rounded-2xl bg-slate-100 px-4 font-bold">
                  <option>Gasto fijo</option><option>Gasto variable</option>
                </select>
                <input required inputMode="decimal" value={expenseForm.amount} onChange={(e) => setExpenseForm((c) => ({ ...c, amount: e.target.value }))} placeholder="Importe" className="h-14 rounded-2xl bg-slate-100 px-4 font-bold" />
                <select value={expenseForm.frequency} onChange={(e) => setExpenseForm((c) => ({ ...c, frequency: e.target.value }))} className="h-14 rounded-2xl bg-slate-100 px-4 font-bold">
                  <option value="weekly">Semanal</option><option value="monthly">Mensual</option><option value="yearly">Anual</option>
                </select>
                <input type="date" value={expenseForm.next_due_date} onChange={(e) => setExpenseForm((c) => ({ ...c, next_due_date: e.target.value }))} className="h-14 rounded-2xl bg-slate-100 px-4 font-bold" />
              </div>
              <button className="h-14 rounded-2xl bg-red-600 font-black text-white">Guardar gasto recurrente</button>
            </div>
          </form>
          <div className="rounded-[2rem] bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-black">Próximos gastos</h2>
            <div className="mt-4 space-y-2">
              {expenses.map((expense) => (
                <article key={expense.id} className="flex items-center justify-between gap-3 rounded-2xl border p-4">
                  <div><p className="font-black">{expense.description}</p><p className="text-sm text-slate-500">{expense.category} · {expense.frequency}</p></div>
                  <div className="text-right"><p className="font-black">{MONEY.format(expense.amount)}</p><button type="button" onClick={() => registerExpense(expense)} className="mt-1 text-sm font-black text-blue-600">Registrar ahora</button></div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "transfers" && (
        <form onSubmit={saveTransfer} className="rounded-[2rem] bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-black">Transferir entre sucursales</h2>
          {branches.length < 2 && <p className="mt-3 rounded-2xl bg-amber-50 p-4 font-bold text-amber-900">Creá una segunda sucursal para usar transferencias.</p>}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <select required value={transferForm.from_branch_id} onChange={(e) => setTransferForm((c) => ({ ...c, from_branch_id: e.target.value }))} className="h-14 rounded-2xl bg-slate-100 px-4 font-bold">
              <option value="">Desde</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
            </select>
            <select required value={transferForm.to_branch_id} onChange={(e) => setTransferForm((c) => ({ ...c, to_branch_id: e.target.value }))} className="h-14 rounded-2xl bg-slate-100 px-4 font-bold">
              <option value="">Hacia</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
            </select>
          </div>
          <div className="mt-4 space-y-2">
            {transferItems.map((item, index) => (
              <div key={index} className="grid gap-2 sm:grid-cols-[1fr_150px_46px]">
                <select required value={item.product_id} onChange={(e) => setTransferItems((current) => current.map((line, i) => i === index ? { ...line, product_id: e.target.value } : line))} className="h-14 rounded-2xl bg-slate-100 px-4 font-bold">
                  <option value="">Producto</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
                </select>
                <input required inputMode="decimal" value={item.quantity} onChange={(e) => setTransferItems((current) => current.map((line, i) => i === index ? { ...line, quantity: e.target.value } : line))} placeholder="Cantidad" className="h-14 rounded-2xl bg-slate-100 px-4 font-bold" />
                <button type="button" disabled={transferItems.length === 1} onClick={() => setTransferItems((c) => c.filter((_, i) => i !== index))} className="grid h-14 place-items-center rounded-2xl bg-red-50 text-red-600 disabled:opacity-30"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => setTransferItems((c) => [...c, { product_id: "", quantity: "1" }])} className="rounded-2xl bg-slate-100 px-4 py-3 font-black"><Plus className="mr-1 inline" size={18} /> Producto</button>
            <button disabled={saving || branches.length < 2} className="rounded-2xl bg-blue-600 px-6 py-3 font-black text-white disabled:opacity-40">Confirmar transferencia</button>
          </div>
          <p className="mt-5 text-sm text-slate-500">{transfers.length} transferencias registradas.</p>
        </form>
      )}

      {tab === "stock" && (
        <div className="rounded-[2rem] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-2xl font-black">Movimientos de stock</h2><p className="text-slate-500">Historial completo y auditable.</p></div>
            <button type="button" onClick={exportStockHistory} className="rounded-2xl bg-emerald-600 px-4 py-3 font-black text-white"><Download className="mr-2 inline" size={18} /> Excel</button>
          </div>
          <div className="mt-5 overflow-x-auto rounded-2xl border">
            <table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-950 text-white"><tr><th className="p-3">Fecha</th><th className="p-3">Producto</th><th className="p-3">Movimiento</th><th className="p-3">Sucursal</th><th className="p-3 text-right">Cantidad</th></tr></thead>
              <tbody>{movements.map((movement) => <tr key={movement.id} className="border-t"><td className="p-3">{new Date(movement.created_at).toLocaleString("es-AR")}</td><td className="p-3 font-black">{products.find((p) => p.id === movement.product_id)?.name || "Producto"}</td><td className="p-3">{movement.movement_type}</td><td className="p-3">{branches.find((b) => b.id === movement.branch_id)?.name || "—"}</td><td className="p-3 text-right font-black">{movement.quantity}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "reports" && (
        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
          <div className="rounded-[2rem] bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-black">Productos más vendidos</h2>
            <div className="mt-4 space-y-2">{productReport.slice(0, 30).map((item, index) => <article key={`${item.name}-${index}`} className="grid gap-2 rounded-2xl border p-4 sm:grid-cols-[1fr_110px_150px_150px]"><p className="font-black">{index + 1}. {item.name}</p><p>{item.quantity} un.</p><p className="font-black">{MONEY.format(item.revenue)}</p><p className="font-black text-emerald-700">{MONEY.format(item.profit)} ganancia</p></article>)}</div>
          </div>
          <div className="rounded-[2rem] bg-slate-950 p-5 text-white">
            <h2 className="text-xl font-black">Auditoría reciente</h2>
            <button
              type="button"
              onClick={downloadBackup}
              className="mt-3 w-full rounded-2xl bg-emerald-500 px-4 py-3 font-black text-slate-950"
            >
              <Download className="mr-2 inline" size={18} />
              Descargar respaldo
            </button>
            <div className="mt-4 max-h-[600px] space-y-2 overflow-auto">{audits.map((audit) => <article key={audit.id} className="rounded-xl bg-white/10 p-3 text-sm"><p className="font-black">{audit.action} · {audit.entity_type}</p><p className="text-slate-400">{new Date(audit.created_at).toLocaleString("es-AR")}</p></article>)}</div>
          </div>
        </div>
      )}

      {tab === "settings" && (
        <div className="grid gap-5 lg:grid-cols-[1fr_440px]">
          <form onSubmit={saveSettings} className="rounded-[2rem] bg-white p-5 shadow-sm">
            <Building2 className="text-blue-600" size={38} />
            <h2 className="mt-2 text-2xl font-black">Datos para documentos</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[["Nombre del negocio", "display_name"], ["WhatsApp", "whatsapp"], ["Correo", "email"], ["Dirección", "address"], ["CUIT", "tax_id"], ["URL del logo", "logo_url"], ["Marca de agua", "watermark_text"]].map(([label, field]) => <label key={field} className={field === "display_name" || field === "address" ? "sm:col-span-2" : ""}><span className="mb-2 block font-black">{label}</span><input value={settings[field] || ""} onChange={(e) => setSettings((c) => ({ ...c, [field]: e.target.value }))} className="h-14 w-full rounded-2xl bg-slate-100 px-4 font-bold" /></label>)}
            </div>
            <button disabled={saving} className="mt-5 h-14 w-full rounded-2xl bg-blue-600 font-black text-white"><Save className="mr-2 inline" /> Guardar configuración</button>
          </form>
          <div className="relative overflow-hidden rounded-[2rem] border bg-white p-6 shadow-sm">
            <div className="pointer-events-none absolute inset-0 grid place-items-center -rotate-12 text-5xl font-black text-slate-100">{settings.watermark_text || "TusComercios!"}</div>
            <div className="relative">
              <p className="text-xs font-black uppercase text-red-600">Vista previa</p>
              <div className="mt-4 flex justify-between border-b-4 border-blue-600 pb-4"><div>{settings.logo_url && <img src={settings.logo_url} alt="" className="mb-2 h-14 max-w-32 object-contain" />}<h3 className="text-2xl font-black">{settings.display_name || "TusComercios"}</h3><p className="text-sm text-slate-500">{settings.address}</p></div><div className="text-right"><h3 className="text-xl font-black text-red-600">PRESUPUESTO</h3><p>N.º 00001</p></div></div>
              <div className="my-5 rounded-2xl bg-slate-100 p-4"><p><strong>WhatsApp:</strong> {settings.whatsapp || "—"}</p><p><strong>Correo:</strong> {settings.email || "—"}</p><p><strong>CUIT:</strong> {settings.tax_id || "—"}</p></div>
              <div className="h-28 rounded-2xl border p-4 text-slate-400">Detalle de productos y servicios</div>
              <p className="mt-4 text-right text-2xl font-black">TOTAL: $ 0,00</p>
              <p className="mt-8 text-xs text-slate-500">Documento interno no válido como factura fiscal · Generado con TusComercios Gestión.</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
