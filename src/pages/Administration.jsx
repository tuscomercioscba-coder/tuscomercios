import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeftRight,
  Barcode,
  Boxes,
  Building2,
  CalendarDays,
  Calculator,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Minus,
  PackagePlus,
  Pencil,
  Plus,
  ReceiptText,
  Search,
  Store,
  Trash2,
  Upload,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { supabase } from "../supabase";
import * as XLSX from "xlsx";
import CustomersPanel from "../Administration/CustomersPanel";
import DocumentsTeamPanel from "../Administration/DocumentsTeamPanel";
import AdvancedOperationsPanel from "../Administration/AdvancedOperationsPanel";

const MONEY = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 2,
});

const PAYMENT_LABELS = {
  cash: "Efectivo",
  debit: "Débito",
  credit: "Crédito",
  transfer: "Transferencia",
  mercadopago: "Mercado Pago",
  account: "Fiado",
};

const EMPTY_PRODUCT = {
  name: "",
  barcode: "",
  internal_code: "",
  description: "",
  unit: "unidad",
  cost: "",
  sale_price: "",
  profit_percent: "30",
  minimum_stock: "0",
  initial_stock: "0",
};

function cleanNumber(value) {
  const normalized = String(value ?? "")
    .trim()
    .replace(/\s/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function roundPrice(value, mode) {
  if (mode === "up") return Math.ceil(value / 100) * 100;
  if (mode === "down") return Math.floor(value / 100) * 100;
  return Math.round(value * 100) / 100;
}

function localDateKey(value = new Date()) {
  return new Date(value).toLocaleDateString("en-CA", {
    timeZone: "America/Argentina/Cordoba",
  });
}

function safeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm">
      <div className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <h2 className="text-xl font-black text-slate-950">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-700"
            aria-label="Cerrar"
          >
            <X size={22} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, detail, tone = "blue", icon: Icon }) {
  const tones = {
    blue: "bg-blue-600 text-white",
    red: "bg-red-600 text-white",
    white: "border border-slate-200 bg-white text-slate-950",
    dark: "bg-slate-950 text-white",
  };

  return (
    <article className={`rounded-[1.6rem] p-5 shadow-sm ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.12em] opacity-75">
            {label}
          </p>
          <p className="mt-2 text-3xl font-black">{value}</p>
          <p className="mt-1 text-sm font-semibold opacity-75">{detail}</p>
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/15">
          <Icon size={23} />
        </div>
      </div>
    </article>
  );
}

export default function Administration() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [businessId, setBusinessId] = useState("");
  const [subscription, setSubscription] = useState(null);
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [products, setProducts] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("summary");
  const [productModal, setProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [branchModal, setBranchModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [branchForm, setBranchForm] = useState({ name: "", address: "", phone: "" });
  const [rounding, setRounding] = useState("none");
  const [importRows, setImportRows] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [cashSession, setCashSession] = useState(null);
  const [cashMovements, setCashMovements] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [accountMovements, setAccountMovements] = useState([]);
  const [cashModal, setCashModal] = useState("");
  const [cashForm, setCashForm] = useState({
    amount: "",
    category: "",
    description: "",
    payment_method: "cash",
  });
  const [cart, setCart] = useState([]);
  const [saleSearch, setSaleSearch] = useState("");
  const [salePayment, setSalePayment] = useState("cash");
  const [saleCustomer, setSaleCustomer] = useState("");
  const [salePaid, setSalePaid] = useState("");
  const [saleError, setSaleError] = useState("");
  const [salesPeriod, setSalesPeriod] = useState("today");
  const [salesFrom, setSalesFrom] = useState("");
  const [salesTo, setSalesTo] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [calculator, setCalculator] = useState({
    cost: "",
    markup: "30",
    fixed: "",
    variableUnit: "",
    salePrice: "",
  });
  const importInput = useRef(null);

  const selectedBusiness = businesses.find((item) => item.id === businessId);
  const selectedBranch = branches.find((item) => item.id === branchId);
  const administrationDisplayName = isAdmin
    ? "TusComercios"
    : selectedBusiness?.negocio || "TusComercios";
  const hasAccess = isAdmin || subscription?.status === "authorized";

  useEffect(() => {
    bootstrap();
  }, []);

  useEffect(() => {
    if (businessId) loadBusinessData(businessId);
  }, [businessId]);

  useEffect(() => {
    if (branchId) {
      loadInventory(branchId);
      loadOperations(branchId);
    }
  }, [branchId]);

  async function bootstrap() {
    setLoading(true);
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      setLoading(false);
      return;
    }

    setUser(currentUser);
    const [{ data: profile }, { data: ownedBusinesses }] = await Promise.all([
      supabase.from("profiles").select("role").eq("id", currentUser.id).maybeSingle(),
      supabase
        .from("businesses")
        .select("id, negocio, image, ciudad, plan, user_id")
        .eq("user_id", currentUser.id)
        .order("negocio"),
    ]);

    const admin = String(profile?.role || "").toLowerCase() === "admin";
    setIsAdmin(admin);

    let available = ownedBusinesses || [];
    if (admin) {
      const { data: allBusinesses } = await supabase
        .from("businesses")
        .select("id, negocio, image, ciudad, plan, user_id")
        .order("negocio");
      available = allBusinesses || available;
    } else if (available.length) {
      const { data: activeSubscriptions } = await supabase
        .from("administration_subscriptions")
        .select("business_id")
        .eq("user_id", currentUser.id)
        .eq("status", "authorized");
      const allowedIds = new Set(
        (activeSubscriptions || []).map((item) => item.business_id),
      );
      available = available.filter((business) => allowedIds.has(business.id));
    }

    setBusinesses(available);
    if (available[0]) setBusinessId(available[0].id);
    setLoading(false);
  }

  async function loadOperations(nextBranchId = branchId) {
    if (!businessId || !nextBranchId) return;
    const { data: session } = await supabase
      .from("admin_cash_sessions")
      .select("*")
      .eq("business_id", businessId)
      .eq("branch_id", nextBranchId)
      .eq("status", "open")
      .maybeSingle();

    let movementQuery = supabase
      .from("admin_cash_movements")
      .select("*")
      .eq("business_id", businessId)
      .eq("branch_id", nextBranchId)
      .order("created_at", { ascending: false });

    movementQuery = session?.id
      ? movementQuery.eq("cash_session_id", session.id)
      : movementQuery.limit(50);

    const [{ data: movements }, { data: sales }, { data: accounts }] =
      await Promise.all([
        movementQuery,
        supabase
          .from("admin_sales")
          .select(
            "*, admin_sale_items(quantity, unit_cost, unit_price, subtotal)",
          )
          .eq("business_id", businessId)
          .eq("branch_id", nextBranchId)
          .order("created_at", { ascending: false })
          .limit(2000),
        supabase
          .from("admin_account_movements")
          .select("*")
          .eq("business_id", businessId)
          .order("created_at", { ascending: false }),
      ]);
    setCashSession(session || null);
    setCashMovements(movements || []);
    setSalesHistory(sales || []);
    setAccountMovements(accounts || []);
  }

  async function loadBusinessData(nextBusinessId) {
    setMessage("");
    const [{ data: sub }, { data: branchData }, { data: customerData }] = await Promise.all([
      supabase
        .from("administration_subscriptions")
        .select("*")
        .eq("business_id", nextBusinessId)
        .maybeSingle(),
      supabase
        .from("admin_branches")
        .select("*")
        .eq("business_id", nextBusinessId)
        .eq("active", true)
        .order("is_main", { ascending: false })
        .order("name"),
      supabase
        .from("admin_customers")
        .select("*")
        .eq("business_id", nextBusinessId)
        .eq("active", true)
        .order("name"),
    ]);

    setSubscription(sub || null);
    setBranches(branchData || []);
    setCustomers(customerData || []);
    const firstBranch = branchData?.[0]?.id || "";
    setBranchId(firstBranch);
    if (!firstBranch) {
      setProducts([]);
      setStocks([]);
    }
  }

  async function loadInventory(nextBranchId = branchId) {
    if (!businessId || !nextBranchId) return;
    const [{ data: productData, error: productError }, { data: stockData }] =
      await Promise.all([
        supabase
          .from("admin_products")
          .select("*")
          .eq("business_id", businessId)
          .eq("active", true)
          .order("name"),
        supabase
          .from("admin_branch_stock")
          .select("id, product_id, quantity")
          .eq("business_id", businessId)
          .eq("branch_id", nextBranchId),
      ]);

    if (productError) {
      setMessage("No se pudo cargar el inventario. Verificá la actualización de Supabase.");
      return;
    }
    setProducts(productData || []);
    setStocks(stockData || []);
  }

  function stockFor(productId) {
    return cleanNumber(stocks.find((item) => item.product_id === productId)?.quantity);
  }

  const filteredProducts = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return products;
    return products.filter((product) =>
      [product.name, product.barcode, product.internal_code]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle)),
    );
  }, [products, search]);

  const lowStock = products.filter(
    (product) => stockFor(product.id) <= cleanNumber(product.minimum_stock),
  );
  const inventoryCost = products.reduce(
    (total, product) => total + stockFor(product.id) * cleanNumber(product.cost),
    0,
  );
  const inventorySale = products.reduce(
    (total, product) => total + stockFor(product.id) * cleanNumber(product.sale_price),
    0,
  );

  function updateProductField(field, value) {
    setProductForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "cost" || field === "profit_percent") {
        const cost = cleanNumber(field === "cost" ? value : next.cost);
        const percent = cleanNumber(
          field === "profit_percent" ? value : next.profit_percent,
        );
        next.sale_price = String(roundPrice(cost * (1 + percent / 100), rounding));
      }
      return next;
    });
  }

  function changeRounding(value) {
    setRounding(value);
    const cost = cleanNumber(productForm.cost);
    const percent = cleanNumber(productForm.profit_percent);
    setProductForm((current) => ({
      ...current,
      sale_price: String(roundPrice(cost * (1 + percent / 100), value)),
    }));
  }

  async function saveBranch(event) {
    event.preventDefault();
    if (!branchForm.name.trim()) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("admin_branches")
      .insert({
        business_id: businessId,
        name: branchForm.name.trim(),
        address: branchForm.address.trim() || null,
        phone: branchForm.phone.trim() || null,
        is_main: branches.length === 0,
      })
      .select()
      .single();

    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    const nextBranches = [...branches, data];
    setBranches(nextBranches);
    setBranchId(data.id);
    setBranchForm({ name: "", address: "", phone: "" });
    setBranchModal(false);
    setMessage("Sucursal creada correctamente.");
  }

  async function saveProduct(event) {
    event.preventDefault();
    if (!productForm.name.trim() || !branchId) return;
    setSaving(true);

    if (editingProduct) {
      const { error } = await supabase.rpc("update_administration_product", {
        p_product_id: editingProduct.id,
        p_branch_id: branchId,
        p_name: productForm.name.trim(),
        p_barcode: productForm.barcode.trim(),
        p_internal_code: productForm.internal_code.trim(),
        p_description: productForm.description.trim(),
        p_unit: productForm.unit,
        p_cost: cleanNumber(productForm.cost),
        p_sale_price: cleanNumber(productForm.sale_price),
        p_profit_percent: cleanNumber(productForm.profit_percent),
        p_minimum_stock: cleanNumber(productForm.minimum_stock),
        p_stock_quantity: cleanNumber(productForm.initial_stock),
      });
      setSaving(false);
      if (error) {
        setMessage(error.message);
        return;
      }
      setEditingProduct(null);
      setProductForm(EMPTY_PRODUCT);
      setProductModal(false);
      setMessage("Producto actualizado correctamente.");
      loadInventory();
      return;
    }

    const payload = {
      business_id: businessId,
      name: productForm.name.trim(),
      barcode: productForm.barcode.trim() || null,
      internal_code: productForm.internal_code.trim() || null,
      description: productForm.description.trim() || null,
      unit: productForm.unit,
      cost: cleanNumber(productForm.cost),
      sale_price: cleanNumber(productForm.sale_price),
      profit_percent: cleanNumber(productForm.profit_percent),
      minimum_stock: cleanNumber(productForm.minimum_stock),
    };

    const { data: product, error } = await supabase
      .from("admin_products")
      .insert(payload)
      .select()
      .single();

    if (error) {
      setSaving(false);
      setMessage(
        error.code === "23505"
          ? "Ese código de barras ya pertenece a otro producto."
          : error.message,
      );
      return;
    }

    const quantity = cleanNumber(productForm.initial_stock);
    const { error: stockError } = await supabase.from("admin_branch_stock").insert({
      business_id: businessId,
      branch_id: branchId,
      product_id: product.id,
      quantity,
    });

    if (!stockError && quantity !== 0) {
      await supabase.from("admin_inventory_movements").insert({
        business_id: businessId,
        branch_id: branchId,
        product_id: product.id,
        movement_type: "initial",
        quantity,
        unit_cost: cleanNumber(productForm.cost),
        notes: "Inventario inicial",
      });
    }

    setSaving(false);
    if (stockError) {
      setMessage(stockError.message);
      return;
    }
    setProductForm(EMPTY_PRODUCT);
    setProductModal(false);
    setMessage("Producto agregado al inventario.");
    loadInventory();
  }

  function openNewProduct() {
    setEditingProduct(null);
    setProductForm(EMPTY_PRODUCT);
    setRounding("none");
    setProductModal(true);
  }

  function openEditProduct(product) {
    setEditingProduct(product);
    setProductForm({
      name: product.name || "",
      barcode: product.barcode || "",
      internal_code: product.internal_code || "",
      description: product.description || "",
      unit: product.unit || "unidad",
      cost: String(product.cost ?? ""),
      sale_price: String(product.sale_price ?? ""),
      profit_percent: String(product.profit_percent ?? "0"),
      minimum_stock: String(product.minimum_stock ?? "0"),
      initial_stock: String(stockFor(product.id)),
    });
    setRounding("none");
    setProductModal(true);
  }

  async function archiveProduct(product) {
    const confirmed = window.confirm(
      `¿Eliminar "${product.name}" del inventario?\n\nLas ventas y movimientos anteriores se conservarán.`,
    );
    if (!confirmed) return;
    setSaving(true);
    const { error } = await supabase.rpc("archive_administration_product", {
      p_product_id: product.id,
    });
    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Producto eliminado del inventario.");
    loadInventory();
  }

  function parseCsv(text) {
    const lines = text.split(/\r?\n/).filter((line) => line.trim());
    if (lines.length < 2) return [];
    const separator = lines[0].includes(";") ? ";" : ",";
    const headers = lines[0].split(separator).map((item) => item.trim().toLowerCase());
    return lines.slice(1).map((line, index) => {
      const values = line.split(separator).map((item) => item.trim().replace(/^"|"$/g, ""));
      const row = Object.fromEntries(headers.map((header, position) => [header, values[position] || ""]));
      return {
        row: index + 2,
        name: row.nombre || row.producto || row.descripcion || "",
        barcode: row.codigo_de_barras || row.codigo || row.barcode || "",
        internal_code: row.codigo_interno || row.sku || "",
        cost: cleanNumber(row.costo || row.precio_costo),
        sale_price: cleanNumber(row.precio || row.precio_venta),
        minimum_stock: cleanNumber(row.stock_minimo),
        initial_stock: cleanNumber(row.stock || row.cantidad),
      };
    });
  }

  function normalizeImportedRow(row, index) {
    const normalized = Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        String(key)
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "_"),
        value,
      ]),
    );
    return {
      row: index + 2,
      name:
        normalized.nombre ||
        normalized.producto ||
        normalized.descripcion ||
        "",
      barcode:
        normalized.codigo_de_barras ||
        normalized.codigo ||
        normalized.barcode ||
        "",
      internal_code:
        normalized.codigo_interno || normalized.sku || "",
      cost: cleanNumber(normalized.costo || normalized.precio_costo),
      sale_price: cleanNumber(
        normalized.precio || normalized.precio_de_venta || normalized.precio_venta,
      ),
      minimum_stock: cleanNumber(normalized.stock_minimo),
      initial_stock: cleanNumber(
        normalized.stock || normalized.cantidad,
      ),
    };
  }

  async function readImportFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportErrors([]);
    const extension = file.name.toLowerCase().split(".").pop();
    let rows = [];

    if (extension === "csv") {
      rows = parseCsv(await file.text());
    } else if (extension === "xlsx" || extension === "xls") {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      rows = XLSX.utils
        .sheet_to_json(firstSheet, { defval: "" })
        .map(normalizeImportedRow);
    } else {
      setImportRows([]);
      setImportErrors([
        "Los PDF pueden tener columnas y diseños muy diferentes. Se incorporarán mediante una importación asistida con revisión para evitar precios o cantidades incorrectas. Ahora podés usar Excel o CSV.",
      ]);
      return;
    }

    const valid = rows.filter((row) => row.name);
    setImportRows(valid);
    if (!valid.length) {
      setImportErrors([
        "No encontramos productos. La primera columna debe llamarse Nombre o Producto.",
      ]);
    }
  }

  async function importProducts() {
    if (!importRows.length || !branchId) return;
    setSaving(true);
    const errors = [];
    let imported = 0;

    for (const row of importRows) {
      const { data: product, error } = await supabase
        .from("admin_products")
        .insert({
          business_id: businessId,
          name: row.name,
          barcode: row.barcode || null,
          internal_code: row.internal_code || null,
          cost: row.cost,
          sale_price: row.sale_price,
          profit_percent:
            row.cost > 0 ? ((row.sale_price - row.cost) / row.cost) * 100 : 0,
          minimum_stock: row.minimum_stock,
        })
        .select()
        .single();

      if (error) {
        errors.push(`Fila ${row.row}: ${row.name} no se importó.`);
        continue;
      }

      await supabase.from("admin_branch_stock").insert({
        business_id: businessId,
        branch_id: branchId,
        product_id: product.id,
        quantity: row.initial_stock,
      });
      if (row.initial_stock !== 0) {
        await supabase.from("admin_inventory_movements").insert({
          business_id: businessId,
          branch_id: branchId,
          product_id: product.id,
          movement_type: "initial",
          quantity: row.initial_stock,
          unit_cost: row.cost,
          notes: "Importación CSV",
        });
      }
      imported += 1;
    }

    setSaving(false);
    setImportErrors(errors);
    setMessage(`${imported} productos importados correctamente.`);
    if (!errors.length) {
      setImportRows([]);
      setImportModal(false);
    }
    loadInventory();
  }

  function downloadExample() {
    const csv =
      "Nombre;Codigo de barras;Codigo interno;Costo;Precio de venta;Stock;Stock minimo\nYerba 1 kg;779000000001;YER001;1800;2500;20;5\n";
    const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "plantilla-productos-tuscomercios.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const cashIncome = cashMovements
    .filter((item) => item.movement_type === "income")
    .reduce((total, item) => total + cleanNumber(item.amount), 0);
  const cashExpense = cashMovements
    .filter((item) => item.movement_type === "expense")
    .reduce((total, item) => total + cleanNumber(item.amount), 0);
  const expectedCash =
    cleanNumber(cashSession?.opening_amount) + cashIncome - cashExpense;
  const cartTotal = cart.reduce(
    (total, item) => total + cleanNumber(item.sale_price) * item.quantity,
    0,
  );

  async function openCash(event) {
    event.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("admin_cash_sessions").insert({
      business_id: businessId,
      branch_id: branchId,
      opening_amount: cleanNumber(cashForm.amount),
    });
    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setCashForm({ amount: "", category: "", description: "", payment_method: "cash" });
    setCashModal("");
    setMessage("Caja abierta correctamente.");
    loadOperations();
  }

  async function saveCashMovement(event) {
    event.preventDefault();
    if (!cashSession) return;
    setSaving(true);
    const { error } = await supabase.from("admin_cash_movements").insert({
      business_id: businessId,
      branch_id: branchId,
      cash_session_id: cashSession.id,
      movement_type: cashModal,
      category: cashForm.category.trim() || (cashModal === "income" ? "Ingreso" : "Gasto"),
      description: cashForm.description.trim(),
      amount: cleanNumber(cashForm.amount),
      payment_method: cashForm.payment_method,
      fixed_expense: cashModal === "expense" && cashForm.category === "Gasto fijo",
      variable_expense: cashModal === "expense" && cashForm.category === "Gasto variable",
    });
    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setCashForm({ amount: "", category: "", description: "", payment_method: "cash" });
    setCashModal("");
    setMessage(cashModal === "income" ? "Ingreso registrado." : "Gasto registrado.");
    loadOperations();
  }

  async function closeCash(event) {
    event.preventDefault();
    if (!cashSession) return;
    const closing = cleanNumber(cashForm.amount);
    setSaving(true);
    const { error } = await supabase
      .from("admin_cash_sessions")
      .update({
        status: "closed",
        closed_at: new Date().toISOString(),
        closing_amount: closing,
        expected_amount: expectedCash,
        difference: closing - expectedCash,
        notes: cashForm.description.trim() || null,
      })
      .eq("id", cashSession.id);
    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setCashForm({ amount: "", category: "", description: "", payment_method: "cash" });
    setCashModal("");
    setMessage(
      closing === expectedCash
        ? "Caja cerrada sin diferencias."
        : `Caja cerrada. Diferencia: ${MONEY.format(closing - expectedCash)}.`,
    );
    loadOperations();
  }

  function addToCart(product) {
    const available = stockFor(product.id);
    if (available <= 0) {
      setMessage(`${product.name} no tiene stock disponible.`);
      return;
    }
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= available) {
          setMessage(`No hay más unidades disponibles de ${product.name}.`);
          return current;
        }
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
    setSaleSearch("");
  }

  function handleSaleSearch(event) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const needle = saleSearch.trim().toLowerCase();
    if (!needle) return;
    const exact = products.find(
      (product) =>
        String(product.barcode || "").toLowerCase() === needle ||
        String(product.internal_code || "").toLowerCase() === needle,
    );
    const partial =
      exact ||
      products.find((product) =>
        String(product.name || "").toLowerCase().includes(needle),
      );
    if (partial) addToCart(partial);
    else setMessage("No encontramos un producto con ese código o nombre.");
  }

  function changeCartQuantity(productId, difference) {
    setCart((current) =>
      current
        .map((item) => {
          if (item.id !== productId) return item;
          const next = Math.min(
            stockFor(productId),
            Math.max(0, item.quantity + difference),
          );
          return { ...item, quantity: next };
        })
        .filter((item) => item.quantity > 0),
    );
  }

  async function completeSale() {
    setSaleError("");
    if (!cashSession) {
      setSaleError("Primero abrí la caja para registrar ventas.");
      setActiveSection("cash");
      return;
    }
    if (!cart.length) return;
    setSaving(true);
    const creditSale = salePayment === "account";
    if (creditSale && !saleCustomer) {
      setSaleError("Elegí el cliente para registrar una venta fiada.");
      setSaving(false);
      return;
    }
    const { error } = await supabase.rpc("complete_administration_credit_sale", {
      p_business_id: businessId,
      p_branch_id: branchId,
      p_payment_method: salePayment,
      p_customer_id: creditSale ? saleCustomer : null,
      p_paid_amount: creditSale ? cleanNumber(salePaid) : cartTotal,
      p_items: cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
    });
    setSaving(false);
    if (error) {
      const selectedCustomer = customers.find(
        (customer) => customer.id === saleCustomer,
      );
      const currentDebt = accountMovements
        .filter((movement) => movement.customer_id === saleCustomer)
        .reduce(
          (total, movement) =>
            total +
            (movement.movement_type === "debit"
              ? cleanNumber(movement.amount)
              : -cleanNumber(movement.amount)),
          0,
        );
      const requestedCredit = Math.max(0, cartTotal - cleanNumber(salePaid));
      if (
        error.message?.toLowerCase().includes("límite") ||
        error.message?.toLowerCase().includes("limite")
      ) {
        const available = Math.max(
          0,
          cleanNumber(selectedCustomer?.credit_limit) - currentDebt,
        );
        setSaleError(
          `No se pudo realizar: supera el límite fiado de ${selectedCustomer?.name || "este cliente"}. Disponible: ${MONEY.format(available)}. Esta venta necesita financiar ${MONEY.format(requestedCredit)}.`,
        );
      } else {
        setSaleError(`No se pudo realizar la venta: ${error.message}`);
      }
      return;
    }
    setCart([]);
    setSalePaid("");
    setSaleError("");
    setMessage(`Venta realizada por ${MONEY.format(cartTotal)}.`);
    loadInventory();
    loadOperations();
  }

  async function subscribeAdministration() {
    try {
      setCheckoutLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setMessage("Volvé a iniciar sesión para continuar.");
        return;
      }
      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          type: "administration",
          business_id: businessId,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data?.init_point) {
        setMessage(data?.error || "No se pudo iniciar el pago.");
        return;
      }
      window.location.href = data.init_point;
    } catch {
      setMessage("No se pudo conectar con Mercado Pago.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function createDeliveryNote(saleId) {
    const { error } = await supabase.rpc("create_delivery_note_from_sale", {
      p_sale_id: saleId,
    });
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Remito generado. Lo encontrarás en Presupuestos y remitos.");
  }

  const calculatedPrice =
    cleanNumber(calculator.cost) * (1 + cleanNumber(calculator.markup) / 100);
  const contribution =
    cleanNumber(calculator.salePrice) - cleanNumber(calculator.variableUnit);
  const breakEven =
    contribution > 0 ? Math.ceil(cleanNumber(calculator.fixed) / contribution) : 0;
  const todayKey = localDateKey();
  const salesToday = salesHistory.filter(
    (sale) =>
      sale.status === "completed" &&
      localDateKey(sale.created_at) === todayKey,
  );
  const salesTodayTotal = salesToday.reduce(
    (total, sale) => total + cleanNumber(sale.total),
    0,
  );
  const receivableTotal = accountMovements
    .filter((movement) => movement.customer_id)
    .reduce(
      (total, movement) =>
        total +
        (movement.movement_type === "debit"
          ? cleanNumber(movement.amount)
          : -cleanNumber(movement.amount)),
      0,
    );
  const payableTotal = accountMovements
    .filter((movement) => movement.supplier_id)
    .reduce(
      (total, movement) =>
        total +
        (movement.movement_type === "debit"
          ? cleanNumber(movement.amount)
          : -cleanNumber(movement.amount)),
      0,
    );

  const periodBounds = (() => {
    const now = new Date();
    if (salesPeriod === "today") return { from: todayKey, to: todayKey };
    if (salesPeriod === "week") {
      const monday = new Date(now);
      const daysSinceMonday = (now.getDay() + 6) % 7;
      monday.setDate(now.getDate() - daysSinceMonday);
      return { from: localDateKey(monday), to: todayKey };
    }
    if (salesPeriod === "month") {
      return { from: `${todayKey.slice(0, 7)}-01`, to: todayKey };
    }
    if (salesPeriod === "custom") {
      return { from: salesFrom || "0000-01-01", to: salesTo || "9999-12-31" };
    }
    return { from: "0000-01-01", to: "9999-12-31" };
  })();

  const filteredSales = salesHistory.filter((sale) => {
    if (sale.status !== "completed") return false;
    const key = localDateKey(sale.created_at);
    return key >= periodBounds.from && key <= periodBounds.to;
  });
  const filteredSalesTotal = filteredSales.reduce(
    (total, sale) => total + cleanNumber(sale.total),
    0,
  );
  const filteredSalesAverage = filteredSales.length
    ? filteredSalesTotal / filteredSales.length
    : 0;
  const filteredSalesProfit = filteredSales.reduce(
    (total, sale) =>
      total +
      (sale.admin_sale_items || []).reduce(
        (saleProfit, item) =>
          saleProfit +
          (cleanNumber(item.unit_price) - cleanNumber(item.unit_cost)) *
            cleanNumber(item.quantity),
        0,
      ),
    0,
  );
  const salesByPayment = filteredSales.reduce((result, sale) => {
    const method = sale.payment_method || "other";
    result[method] = (result[method] || 0) + cleanNumber(sale.total);
    return result;
  }, {});

  function salesExportRows() {
    return filteredSales.map((sale) => {
      const customer = customers.find((item) => item.id === sale.customer_id);
      const cost = (sale.admin_sale_items || []).reduce(
        (total, item) =>
          total + cleanNumber(item.unit_cost) * cleanNumber(item.quantity),
        0,
      );
      return {
        Venta: sale.sale_number || "",
        Fecha: new Date(sale.created_at).toLocaleString("es-AR"),
        Cliente: customer?.name || "Consumidor final",
        "Medio de pago":
          PAYMENT_LABELS[sale.payment_method] || sale.payment_method || "",
        Total: cleanNumber(sale.total),
        Cobrado: cleanNumber(sale.paid_amount),
        "Saldo pendiente": cleanNumber(sale.balance_due),
        Costo: cost,
        "Ganancia estimada": cleanNumber(sale.total) - cost,
      };
    });
  }

  function exportSalesExcel() {
    const rows = salesExportRows();
    if (!rows.length) {
      setMessage("No hay ventas en el período elegido para exportar.");
      return;
    }
    const workbook = XLSX.utils.book_new();
    const summary = [
      ["REPORTE DE VENTAS", administrationDisplayName],
      ["Período", `${periodBounds.from} al ${periodBounds.to}`],
      ["Cantidad de ventas", filteredSales.length],
      ["Total vendido", filteredSalesTotal],
      ["Promedio por venta", filteredSalesAverage],
      ["Ganancia estimada", filteredSalesProfit],
    ];
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet(summary),
      "Resumen",
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(rows),
      "Ventas",
    );
    XLSX.writeFile(
      workbook,
      `ventas_${periodBounds.from}_${periodBounds.to}.xlsx`,
    );
  }

  function exportSalesPdf() {
    const rows = salesExportRows();
    if (!rows.length) {
      setMessage("No hay ventas en el período elegido para exportar.");
      return;
    }
    const report = window.open("", "_blank", "width=1100,height=800");
    if (!report) {
      setMessage("El navegador bloqueó el reporte. Habilitá las ventanas emergentes.");
      return;
    }
    report.document.write(`<!doctype html><html><head><meta charset="utf-8">
      <title>Reporte de ventas</title>
      <style>
        body{font-family:Arial,sans-serif;padding:28px;color:#0f172a}
        h1{margin:0;color:#1d4ed8} .meta{margin:8px 0 22px;color:#475569}
        .cards{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:22px}
        .card{border:1px solid #cbd5e1;border-radius:12px;padding:14px}
        .label{font-size:11px;text-transform:uppercase;font-weight:bold;color:#64748b}
        .value{font-size:20px;font-weight:bold;margin-top:6px}
        table{border-collapse:collapse;width:100%;font-size:12px}
        th{background:#0f172a;color:white;text-align:left;padding:9px}
        td{border-bottom:1px solid #e2e8f0;padding:9px}
        .number{text-align:right}@media print{button{display:none}}
      </style></head><body>
      <h1>Reporte de ventas</h1>
      <p class="meta">${safeHtml(administrationDisplayName)} · ${safeHtml(
        periodBounds.from,
      )} al ${safeHtml(periodBounds.to)}</p>
      <div class="cards">
        <div class="card"><div class="label">Total vendido</div><div class="value">${safeHtml(
          MONEY.format(filteredSalesTotal),
        )}</div></div>
        <div class="card"><div class="label">Cantidad</div><div class="value">${filteredSales.length}</div></div>
        <div class="card"><div class="label">Ganancia estimada</div><div class="value">${safeHtml(
          MONEY.format(filteredSalesProfit),
        )}</div></div>
      </div>
      <table><thead><tr><th>Venta</th><th>Fecha</th><th>Cliente</th><th>Pago</th><th class="number">Total</th><th class="number">Saldo</th></tr></thead>
      <tbody>${rows
        .map(
          (row) =>
            `<tr><td>${safeHtml(row.Venta)}</td><td>${safeHtml(
              row.Fecha,
            )}</td><td>${safeHtml(row.Cliente)}</td><td>${safeHtml(
              row["Medio de pago"],
            )}</td><td class="number">${safeHtml(
              MONEY.format(row.Total),
            )}</td><td class="number">${safeHtml(
              MONEY.format(row["Saldo pendiente"]),
            )}</td></tr>`,
        )
        .join("")}</tbody></table>
      <script>window.onload=()=>window.print()</script></body></html>`);
    report.document.close();
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100 p-5">
        <div className="max-w-lg rounded-[2rem] bg-white p-8 text-center shadow-xl">
          <Building2 className="mx-auto text-blue-600" size={54} />
          <h1 className="mt-4 text-3xl font-black">TusComercios Administración</h1>
          <p className="mt-3 text-slate-600">
            Ingresá con el correo titular de la suscripción para administrar tu negocio.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex rounded-2xl bg-blue-600 px-7 py-4 font-black text-white"
          >
            Ingresar
          </Link>
        </div>
      </div>
    );
  }

  if (!businesses.length) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100 p-5">
        <div className="max-w-lg rounded-[2rem] bg-white p-8 text-center shadow-xl">
          <Store className="mx-auto text-red-600" size={54} />
          <h1 className="mt-4 text-3xl font-black">Primero necesitás una vidriera</h1>
          <p className="mt-3 text-slate-600">
            Administración se conecta con los negocios publicados en TusComercios.
          </p>
          <Link
            to="/register-business"
            className="mt-6 inline-flex rounded-2xl bg-red-600 px-7 py-4 font-black text-white"
          >
            Crear mi negocio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f6fb] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-100 lg:hidden"
            >
              <Menu size={22} />
            </button>
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-red-600 font-black text-white">
              TC
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-black">TusComercios Administración</p>
              <p className="truncate text-xs font-bold text-slate-500">
                Control simple. Decisiones claras.
              </p>
            </div>
          </div>
          <Link
            to="/dashboard"
            className="hidden rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white sm:inline-flex"
          >
            Volver a mi panel
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[280px] overflow-y-auto bg-slate-950 p-4 pb-10 text-white transition-transform lg:sticky lg:top-[69px] lg:z-20 lg:h-[calc(100vh-69px)] lg:w-auto lg:translate-x-0 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="ml-auto grid h-10 w-10 place-items-center rounded-xl bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>
          <nav className="mt-8 space-y-2 lg:mt-2">
            {[
              ["summary", LayoutDashboard, "Resumen"],
              ["sales", Barcode, "Ventas"],
              ["cash", WalletCards, "Caja y movimientos"],
              ["stock", Boxes, "Productos y stock"],
              ["people", Users, "Clientes y proveedores"],
              ["management", FileText, "Presupuestos y remitos"],
              ["operations", ArrowLeftRight, "Compras y gestión"],
              ["calculators", Calculator, "Calculadoras"],
            ].map(([key, Icon, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setActiveSection(key);
                  setMenuOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-black ${
                  activeSection === key
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-white/10"
                }`}
              >
                <Icon size={21} />
                {label}
              </button>
            ))}
          </nav>
          <div className="mt-8 rounded-3xl bg-white/10 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-blue-300">
              Servicio
            </p>
            <p className="mt-2 text-2xl font-black">$59.999</p>
            <p className="text-sm text-slate-400">por mes</p>
          </div>
          <Link
            to="/dashboard"
            className="mt-5 flex items-center gap-3 rounded-2xl px-4 py-3 font-black text-slate-300 lg:hidden"
          >
            <LogOut size={20} /> Volver a mi panel
          </Link>
        </aside>

        <main className="min-w-0 p-3 sm:p-5 lg:p-7">
          <section className="rounded-[2rem] bg-gradient-to-r from-blue-700 via-blue-900 to-red-700 p-5 text-white shadow-xl sm:p-7">
            <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200">
                  Panel del titular
                </p>
                <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                  {administrationDisplayName}
                </h1>
                <p className="mt-2 font-semibold text-blue-100">
                  Productos, sucursales y stock en un solo lugar.
                </p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur">
                <p className="text-xs font-black uppercase tracking-widest text-blue-200">
                  Negocio contratado
                </p>
                <p className="mt-1 text-lg font-black">{administrationDisplayName}</p>
              </div>
            </div>
          </section>

          {!hasAccess && (
            <section className="mt-5 rounded-[2rem] border-2 border-amber-300 bg-amber-50 p-6">
              <p className="font-black text-amber-950">
                Administración todavía no está activa para este negocio.
              </p>
              <p className="mt-2 text-amber-900">
                El servicio adicional cuesta $59.999 mensuales y se activa
                automáticamente al confirmarse el pago.
              </p>
              <button
                type="button"
                disabled={checkoutLoading}
                onClick={subscribeAdministration}
                className="mt-4 rounded-2xl bg-blue-600 px-6 py-4 font-black text-white disabled:opacity-50"
              >
                {checkoutLoading
                  ? "Conectando con Mercado Pago..."
                  : "Contratar Administración"}
              </button>
            </section>
          )}

          {message && (
            <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-white p-4 font-bold shadow-sm">
              <span>{message}</span>
              <button type="button" onClick={() => setMessage("")}>
                <X size={19} />
              </button>
            </div>
          )}

          {!!branches.length && (
            <section className="mt-5 flex flex-col gap-3 rounded-[1.6rem] bg-white p-4 shadow-sm sm:flex-row sm:items-center">
              <div className="shrink-0">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Sucursal de trabajo
                </p>
              </div>
              <div className="flex flex-1 gap-2 overflow-x-auto">
                {branches.map((branch) => (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => setBranchId(branch.id)}
                    className={`whitespace-nowrap rounded-2xl px-4 py-3 font-black ${
                      branchId === branch.id
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {branch.name}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setBranchModal(true)}
                className="shrink-0 rounded-2xl bg-slate-950 px-4 py-3 font-black text-white"
              >
                <Plus className="mr-1 inline" size={18} /> Sucursal
              </button>
            </section>
          )}

          {!branches.length ? (
            <section className="mt-5 rounded-[2rem] bg-white p-8 text-center shadow-sm">
              <Building2 className="mx-auto text-blue-600" size={52} />
              <h2 className="mt-4 text-2xl font-black">Creá tu primera sucursal</h2>
              <p className="mx-auto mt-2 max-w-xl text-slate-600">
                El stock, la caja y las ventas se controlarán por sucursal. Podrás ver
                también el total general del negocio.
              </p>
              <button
                type="button"
                disabled={!hasAccess}
                onClick={() => setBranchModal(true)}
                className="mt-6 rounded-2xl bg-blue-600 px-7 py-4 font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="mr-2 inline" size={20} /> Crear sucursal
              </button>
            </section>
          ) : (
            <>
              {activeSection === "summary" && (
                <section className="mt-5 space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                      label="Ventas de hoy"
                      value={MONEY.format(salesTodayTotal)}
                      detail={`${salesToday.length} operaciones`}
                      tone="blue"
                      icon={Barcode}
                    />
                    <MetricCard
                      label="Caja"
                      value={cashSession ? "Abierta" : "Cerrada"}
                      detail={
                        cashSession
                          ? `Saldo esperado ${MONEY.format(expectedCash)}`
                          : selectedBranch?.name || ""
                      }
                      tone={cashSession ? "dark" : "red"}
                      icon={WalletCards}
                    />
                    <MetricCard
                      label="Por cobrar"
                      value={MONEY.format(Math.max(0, receivableTotal))}
                      detail="Deuda de clientes"
                      tone="white"
                      icon={Users}
                    />
                    <MetricCard
                      label="Stock bajo"
                      value={lowStock.length}
                      detail={
                        lowStock.length ? "Productos para reponer" : "Todo en orden"
                      }
                      tone={lowStock.length ? "red" : "white"}
                      icon={AlertTriangle}
                    />
                  </div>

                  <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
                    <article className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-7">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-blue-600">
                            Actividad reciente
                          </p>
                          <h2 className="mt-1 text-2xl font-black">Últimas ventas</h2>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveSection("sales")}
                          className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-700"
                        >
                          Ver todas
                        </button>
                      </div>
                      <div className="mt-5 space-y-2">
                        {salesHistory.slice(0, 5).map((sale) => {
                          const customer = customers.find(
                            (entry) => entry.id === sale.customer_id,
                          );
                          return (
                            <div
                              key={sale.id}
                              className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4"
                            >
                              <div>
                                <p className="font-black">
                                  Venta N.º {sale.sale_number}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {customer?.name || "Consumidor final"} ·{" "}
                                  {new Date(sale.created_at).toLocaleString("es-AR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                              <p className="font-black">{MONEY.format(sale.total)}</p>
                            </div>
                          );
                        })}
                        {!salesHistory.length && (
                          <p className="py-10 text-center font-bold text-slate-500">
                            Todavía no hay ventas registradas.
                          </p>
                        )}
                      </div>
                    </article>

                    <article className="rounded-[2rem] bg-slate-950 p-5 text-white shadow-xl sm:p-7">
                      <p className="text-xs font-black uppercase tracking-widest text-blue-300">
                        Acciones rápidas
                      </p>
                      <h2 className="mt-2 text-2xl font-black">¿Qué querés hacer?</h2>
                      <div className="mt-5 grid gap-3">
                        {[
                          ["sales", "Registrar una venta", Barcode, "bg-blue-600"],
                          ["cash", cashSession ? "Ver caja abierta" : "Abrir caja", WalletCards, "bg-red-600"],
                          ["stock", "Cargar o editar productos", Boxes, "bg-white/10"],
                          ["management", "Crear presupuesto o remito", FileText, "bg-white/10"],
                          ["people", "Clientes y cuentas", Users, "bg-white/10"],
                        ].map(([key, label, Icon, color]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setActiveSection(key)}
                            className={`flex items-center gap-3 rounded-2xl p-4 text-left font-black ${color}`}
                          >
                            <Icon size={21} /> {label}
                          </button>
                        ))}
                      </div>
                      <div className="mt-5 rounded-2xl bg-white/10 p-4">
                        <p className="text-sm text-slate-300">Cuentas por pagar</p>
                        <p className="mt-1 text-xl font-black">
                          {MONEY.format(Math.max(0, payableTotal))}
                        </p>
                      </div>
                    </article>
                  </div>
                </section>
              )}

              {activeSection === "stock" && (
                <>
              <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label="Productos"
                  value={products.length}
                  detail={`En ${selectedBranch?.name || "esta sucursal"}`}
                  tone="blue"
                  icon={Boxes}
                />
                <MetricCard
                  label="Stock bajo"
                  value={lowStock.length}
                  detail={lowStock.length ? "Requieren atención" : "Todo en orden"}
                  tone={lowStock.length ? "red" : "white"}
                  icon={AlertTriangle}
                />
                <MetricCard
                  label="Costo inventario"
                  value={MONEY.format(inventoryCost)}
                  detail="Capital invertido"
                  tone="white"
                  icon={WalletCards}
                />
                <MetricCard
                  label="Venta estimada"
                  value={MONEY.format(inventorySale)}
                  detail={`Ganancia bruta ${MONEY.format(inventorySale - inventoryCost)}`}
                  tone="dark"
                  icon={Calculator}
                />
              </section>

              <section className="mt-5 rounded-[2rem] bg-white p-4 shadow-sm sm:p-6">
                <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                  <div>
                    <h2 className="text-2xl font-black">Productos y stock</h2>
                    <p className="mt-1 text-slate-500">
                      Control correspondiente a {selectedBranch?.name}.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={!hasAccess}
                      onClick={() => setBranchModal(true)}
                      className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black disabled:opacity-40"
                    >
                      <Building2 className="mr-2 inline" size={18} /> Nueva sucursal
                    </button>
                    <button
                      type="button"
                      disabled={!hasAccess}
                      onClick={() => setImportModal(true)}
                      className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:opacity-40"
                    >
                      <Upload className="mr-2 inline" size={18} /> Importar
                    </button>
                    <button
                      type="button"
                      disabled={!hasAccess}
                      onClick={openNewProduct}
                      className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white disabled:opacity-40"
                    >
                      <PackagePlus className="mr-2 inline" size={18} /> Nuevo producto
                    </button>
                  </div>
                </div>

                <label className="mt-5 flex h-14 items-center gap-3 rounded-2xl bg-slate-100 px-4">
                  <Search className="text-slate-500" size={21} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar por nombre, código o código de barras..."
                    className="min-w-0 flex-1 bg-transparent font-semibold outline-none"
                  />
                </label>

                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[850px] text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                        <th className="px-3 py-3">Producto</th>
                        <th className="px-3 py-3">Código</th>
                        <th className="px-3 py-3">Costo</th>
                        <th className="px-3 py-3">Venta</th>
                        <th className="px-3 py-3">Ganancia</th>
                        <th className="px-3 py-3">Stock</th>
                        <th className="px-3 py-3">Estado</th>
                        <th className="px-3 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => {
                        const quantity = stockFor(product.id);
                        const low = quantity <= cleanNumber(product.minimum_stock);
                        const profit = cleanNumber(product.sale_price) - cleanNumber(product.cost);
                        return (
                          <tr key={product.id} className="border-b border-slate-100">
                            <td className="px-3 py-4">
                              <p className="font-black">{product.name}</p>
                              <p className="text-xs text-slate-500">{product.unit}</p>
                            </td>
                            <td className="px-3 py-4 font-mono text-sm">
                              {product.barcode || product.internal_code || "—"}
                            </td>
                            <td className="px-3 py-4 font-bold">{MONEY.format(product.cost)}</td>
                            <td className="px-3 py-4 font-black">{MONEY.format(product.sale_price)}</td>
                            <td className="px-3 py-4 font-bold text-emerald-700">
                              {MONEY.format(profit)}
                            </td>
                            <td className="px-3 py-4 text-lg font-black">{quantity}</td>
                            <td className="px-3 py-4">
                              <span
                                className={`rounded-full px-3 py-2 text-xs font-black ${
                                  low
                                    ? "bg-red-100 text-red-700"
                                    : "bg-emerald-100 text-emerald-700"
                                }`}
                              >
                                {low ? "Stock bajo" : "Disponible"}
                              </span>
                            </td>
                            <td className="px-3 py-4">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => openEditProduct(product)}
                                  className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100"
                                  aria-label={`Editar ${product.name}`}
                                  title="Editar producto"
                                >
                                  <Pencil size={18} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => archiveProduct(product)}
                                  className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-700 hover:bg-red-100"
                                  aria-label={`Eliminar ${product.name}`}
                                  title="Eliminar producto"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {!filteredProducts.length && (
                    <div className="py-12 text-center text-slate-500">
                      <Boxes className="mx-auto mb-3" size={42} />
                      <p className="font-black">Todavía no hay productos cargados.</p>
                    </div>
                  )}
                </div>
              </section>
                </>
              )}

              {activeSection === "cash" && (
                <section className="mt-5 space-y-5">
                  <div className="grid gap-4 md:grid-cols-3">
                    <MetricCard
                      label="Estado de caja"
                      value={cashSession ? "Abierta" : "Cerrada"}
                      detail={selectedBranch?.name || ""}
                      tone={cashSession ? "blue" : "red"}
                      icon={WalletCards}
                    />
                    <MetricCard
                      label="Ingresos"
                      value={MONEY.format(cashIncome)}
                      detail="Desde la apertura"
                      tone="white"
                      icon={Plus}
                    />
                    <MetricCard
                      label="Saldo esperado"
                      value={MONEY.format(expectedCash)}
                      detail={`Egresos: ${MONEY.format(cashExpense)}`}
                      tone="dark"
                      icon={Calculator}
                    />
                  </div>

                  <div className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-7">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                      <div>
                        <h2 className="text-2xl font-black">Caja diaria</h2>
                        <p className="mt-1 text-slate-500">
                          Apertura, ingresos, gastos y cierre de {selectedBranch?.name}.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!cashSession ? (
                          <button
                            type="button"
                            onClick={() => setCashModal("open")}
                            className="rounded-2xl bg-blue-600 px-5 py-3 font-black text-white"
                          >
                            Abrir caja
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setCashModal("income")}
                              className="rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white"
                            >
                              + Ingreso
                            </button>
                            <button
                              type="button"
                              onClick={() => setCashModal("expense")}
                              className="rounded-2xl bg-red-600 px-5 py-3 font-black text-white"
                            >
                              − Egreso
                            </button>
                            <button
                              type="button"
                              onClick={() => setCashModal("close")}
                              className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white"
                            >
                              Cerrar caja
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 overflow-x-auto">
                      <table className="w-full min-w-[680px] text-left">
                        <thead>
                          <tr className="border-b text-xs uppercase tracking-wider text-slate-500">
                            <th className="p-3">Hora</th>
                            <th className="p-3">Tipo</th>
                            <th className="p-3">Detalle</th>
                            <th className="p-3">Medio</th>
                            <th className="p-3 text-right">Importe</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cashMovements.map((movement) => (
                            <tr key={movement.id} className="border-b border-slate-100">
                              <td className="p-3">
                                {new Date(movement.created_at).toLocaleTimeString("es-AR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-black ${
                                    movement.movement_type === "income"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {movement.movement_type === "income"
                                    ? "Ingreso"
                                    : "Egreso"}
                                </span>
                              </td>
                              <td className="p-3">
                                <p className="font-bold">{movement.description}</p>
                                <p className="text-xs text-slate-500">{movement.category}</p>
                              </td>
                              <td className="p-3">{movement.payment_method}</td>
                              <td
                                className={`p-3 text-right font-black ${
                                  movement.movement_type === "income"
                                    ? "text-emerald-700"
                                    : "text-red-700"
                                }`}
                              >
                                {movement.movement_type === "income" ? "+" : "−"}
                                {MONEY.format(movement.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {!cashMovements.length && (
                        <p className="py-10 text-center font-bold text-slate-500">
                          Todavía no hay movimientos en esta sucursal.
                        </p>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {activeSection === "sales" && (
                <>
                <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
                  <div className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-7">
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-100 text-blue-700">
                        <Barcode size={25} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black">Venta rápida</h2>
                        <p className="text-sm text-slate-500">
                          Escaneá con el lector o buscá el producto.
                        </p>
                      </div>
                    </div>
                    <label className="mt-5 flex h-16 items-center gap-3 rounded-2xl border-2 border-blue-200 bg-blue-50 px-4">
                      <Barcode className="text-blue-700" />
                      <input
                        autoFocus
                        value={saleSearch}
                        onChange={(event) => setSaleSearch(event.target.value)}
                        onKeyDown={handleSaleSearch}
                        placeholder="Código de barras, código interno o nombre + Enter"
                        className="min-w-0 flex-1 bg-transparent text-lg font-black outline-none"
                      />
                    </label>

                    {!!saleSearch && (
                      <div className="mt-3 max-h-64 overflow-auto rounded-2xl border">
                        {products
                          .filter((product) =>
                            [product.name, product.barcode, product.internal_code]
                              .filter(Boolean)
                              .some((value) =>
                                String(value)
                                  .toLowerCase()
                                  .includes(saleSearch.toLowerCase()),
                              ),
                          )
                          .slice(0, 8)
                          .map((product) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => addToCart(product)}
                              className="flex w-full items-center justify-between border-b p-4 text-left hover:bg-slate-50"
                            >
                              <span>
                                <span className="block font-black">{product.name}</span>
                                <span className="text-sm text-slate-500">
                                  Stock: {stockFor(product.id)}
                                </span>
                              </span>
                              <span className="font-black">
                                {MONEY.format(product.sale_price)}
                              </span>
                            </button>
                          ))}
                      </div>
                    )}

                    <div className="mt-6 space-y-3">
                      {cart.map((item) => (
                        <article
                          key={item.id}
                          className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-black">{item.name}</p>
                            <p className="text-sm text-slate-500">
                              {MONEY.format(item.sale_price)} por unidad
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => changeCartQuantity(item.id, -1)}
                              className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100"
                            >
                              <Minus size={18} />
                            </button>
                            <span className="w-10 text-center text-lg font-black">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => changeCartQuantity(item.id, 1)}
                              className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white"
                            >
                              <Plus size={18} />
                            </button>
                          </div>
                          <p className="min-w-28 text-right text-lg font-black">
                            {MONEY.format(item.sale_price * item.quantity)}
                          </p>
                        </article>
                      ))}
                      {!cart.length && (
                        <div className="rounded-3xl border-2 border-dashed border-slate-200 py-16 text-center text-slate-500">
                          <Barcode className="mx-auto mb-3" size={44} />
                          <p className="font-black">Escaneá el primer producto</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <aside className="h-fit rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl xl:sticky xl:top-24">
                    <p className="text-xs font-black uppercase tracking-widest text-blue-300">
                      Total de la venta
                    </p>
                    <p className="mt-3 text-4xl font-black">{MONEY.format(cartTotal)}</p>
                    <label className="mt-6 block">
                      <span className="mb-2 block text-sm font-black">Medio de pago</span>
                      <select
                        value={salePayment}
                        onChange={(event) => setSalePayment(event.target.value)}
                        className="h-14 w-full rounded-2xl bg-white px-4 font-black text-slate-950"
                      >
                        <option value="cash">Efectivo</option>
                        <option value="debit">Débito</option>
                        <option value="credit">Crédito</option>
                        <option value="transfer">Transferencia</option>
                        <option value="mercadopago">Mercado Pago</option>
                        <option value="account">Fiado / cuenta corriente</option>
                      </select>
                    </label>
                    {salePayment === "account" && (
                      <div className="mt-4 space-y-4 rounded-2xl bg-white/10 p-4">
                        <label className="block">
                          <span className="mb-2 block text-sm font-black">Cliente *</span>
                          <select
                            value={saleCustomer}
                            onChange={(event) => setSaleCustomer(event.target.value)}
                            className="h-14 w-full rounded-2xl bg-white px-4 font-black text-slate-950"
                          >
                            <option value="">Elegir cliente</option>
                            {customers.map((customer) => (
                              <option key={customer.id} value={customer.id}>
                                {customer.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="block">
                          <span className="mb-2 block text-sm font-black">
                            Entrega inicial
                          </span>
                          <input
                            inputMode="decimal"
                            value={salePaid}
                            onChange={(event) => setSalePaid(event.target.value)}
                            placeholder="$ 0"
                            className="h-14 w-full rounded-2xl bg-white px-4 font-black text-slate-950"
                          />
                        </label>
                        <p className="text-sm font-bold text-blue-100">
                          Quedará debiendo{" "}
                          {MONEY.format(
                            Math.max(0, cartTotal - cleanNumber(salePaid)),
                          )}
                        </p>
                        {saleCustomer &&
                          (() => {
                            const customer = customers.find(
                              (item) => item.id === saleCustomer,
                            );
                            const currentDebt = accountMovements
                              .filter(
                                (movement) =>
                                  movement.customer_id === saleCustomer,
                              )
                              .reduce(
                                (total, movement) =>
                                  total +
                                  (movement.movement_type === "debit"
                                    ? cleanNumber(movement.amount)
                                    : -cleanNumber(movement.amount)),
                                0,
                              );
                            const limit = cleanNumber(customer?.credit_limit);
                            const available =
                              limit > 0
                                ? Math.max(0, limit - currentDebt)
                                : null;
                            return (
                              <div className="rounded-xl bg-slate-950/40 p-3 text-sm">
                                <p>
                                  Deuda actual:{" "}
                                  <strong>{MONEY.format(currentDebt)}</strong>
                                </p>
                                <p>
                                  Límite fiado:{" "}
                                  <strong>
                                    {limit > 0
                                      ? MONEY.format(limit)
                                      : "Sin límite configurado"}
                                  </strong>
                                </p>
                                {available !== null && (
                                  <p>
                                    Crédito disponible:{" "}
                                    <strong>{MONEY.format(available)}</strong>
                                  </p>
                                )}
                              </div>
                            );
                          })()}
                      </div>
                    )}
                    {saleError && (
                      <div
                        role="alert"
                        className="mt-4 rounded-2xl border border-red-400 bg-red-500/20 p-4 text-sm font-black text-red-100"
                      >
                        {saleError}
                      </div>
                    )}
                    <button
                      type="button"
                      disabled={!cart.length || saving}
                      onClick={completeSale}
                      className="mt-5 h-16 w-full rounded-2xl bg-emerald-500 text-lg font-black text-slate-950 disabled:opacity-40"
                    >
                      <CheckCircle2 className="mr-2 inline" />
                      {saving ? "Procesando..." : "Confirmar venta"}
                    </button>
                    {!cashSession && (
                      <p className="mt-4 rounded-2xl bg-red-500/20 p-3 text-sm font-bold text-red-200">
                        Para vender primero tenés que abrir la caja.
                      </p>
                    )}
                  </aside>
                </section>

                <section className="mt-5 rounded-[2rem] bg-white p-5 shadow-sm sm:p-7">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                        Reporte e historial
                      </p>
                      <h2 className="mt-1 text-2xl font-black">Ventas realizadas</h2>
                      <p className="text-sm text-slate-500">
                        Consultá cuánto vendiste y ganaste en cada período.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={exportSalesExcel}
                        className="rounded-2xl bg-emerald-600 px-4 py-3 font-black text-white"
                      >
                        <Download className="mr-2 inline" size={18} />
                        Excel
                      </button>
                      <button
                        type="button"
                        onClick={exportSalesPdf}
                        className="rounded-2xl bg-red-600 px-4 py-3 font-black text-white"
                      >
                        <FileText className="mr-2 inline" size={18} />
                        PDF
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 rounded-3xl bg-slate-100 p-4">
                    <div className="flex flex-wrap gap-2">
                      {[
                        ["today", "Hoy"],
                        ["week", "Esta semana"],
                        ["month", "Este mes"],
                        ["all", "Todo"],
                        ["custom", "Elegir fechas"],
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setSalesPeriod(value)}
                          className={`rounded-2xl px-4 py-3 text-sm font-black ${
                            salesPeriod === value
                              ? "bg-blue-600 text-white"
                              : "bg-white text-slate-700"
                          }`}
                        >
                          {value === "custom" && (
                            <CalendarDays className="mr-2 inline" size={17} />
                          )}
                          {label}
                        </button>
                      ))}
                    </div>
                    {salesPeriod === "custom" && (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <label>
                          <span className="mb-2 block text-sm font-black">Desde</span>
                          <input
                            type="date"
                            value={salesFrom}
                            onChange={(event) => setSalesFrom(event.target.value)}
                            className="h-14 w-full rounded-2xl border bg-white px-4 font-bold"
                          />
                        </label>
                        <label>
                          <span className="mb-2 block text-sm font-black">Hasta</span>
                          <input
                            type="date"
                            value={salesTo}
                            onChange={(event) => setSalesTo(event.target.value)}
                            className="h-14 w-full rounded-2xl border bg-white px-4 font-bold"
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                      label="Total vendido"
                      value={MONEY.format(filteredSalesTotal)}
                      detail={`${filteredSales.length} ventas`}
                      tone="blue"
                      icon={WalletCards}
                    />
                    <MetricCard
                      label="Promedio por venta"
                      value={MONEY.format(filteredSalesAverage)}
                      detail="Ticket promedio"
                      tone="dark"
                      icon={ReceiptText}
                    />
                    <MetricCard
                      label="Ganancia estimada"
                      value={MONEY.format(filteredSalesProfit)}
                      detail="Venta menos costo"
                      tone="white"
                      icon={Calculator}
                    />
                    <MetricCard
                      label="Saldo fiado"
                      value={MONEY.format(
                        filteredSales.reduce(
                          (total, sale) =>
                            total + cleanNumber(sale.balance_due),
                          0,
                        ),
                      )}
                      detail="Pendiente de cobro"
                      tone="red"
                      icon={Users}
                    />
                  </div>

                  <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {Object.entries(PAYMENT_LABELS).map(([method, label]) => (
                      <article
                        key={method}
                        className="rounded-2xl border border-slate-200 p-3"
                      >
                        <p className="text-xs font-black uppercase text-slate-500">
                          {label}
                        </p>
                        <p className="mt-1 font-black">
                          {MONEY.format(salesByPayment[method] || 0)}
                        </p>
                      </article>
                    ))}
                  </div>

                  <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full min-w-[760px] text-left">
                      <thead className="bg-slate-950 text-xs uppercase tracking-wider text-white">
                        <tr>
                          <th className="p-3">Venta</th>
                          <th className="p-3">Fecha</th>
                          <th className="p-3">Cliente</th>
                          <th className="p-3">Pago</th>
                          <th className="p-3 text-right">Total</th>
                          <th className="p-3 text-right">Saldo</th>
                          <th className="p-3">Estado</th>
                          <th className="p-3">Documento</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSales.map((sale) => {
                          const customer = customers.find(
                            (item) => item.id === sale.customer_id,
                          );
                          return (
                            <tr
                              key={sale.id}
                              className="border-t border-slate-100 text-sm"
                            >
                              <td className="p-3 font-black">
                                N.º {sale.sale_number || "—"}
                              </td>
                              <td className="p-3">
                                {new Date(sale.created_at).toLocaleString("es-AR", {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })}
                              </td>
                              <td className="p-3 font-bold">
                                {customer?.name || "Consumidor final"}
                              </td>
                              <td className="p-3 capitalize">
                                {PAYMENT_LABELS[sale.payment_method] ||
                                  sale.payment_method ||
                                  "—"}
                              </td>
                              <td className="p-3 text-right font-black">
                                {MONEY.format(Number(sale.total || 0))}
                              </td>
                              <td className="p-3 text-right font-black text-red-700">
                                {MONEY.format(Number(sale.balance_due || 0))}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-black ${
                                    sale.status === "completed"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {sale.status === "completed"
                                    ? "Completada"
                                    : sale.status || "Registrada"}
                                </span>
                              </td>
                              <td className="p-3">
                                <button
                                  type="button"
                                  onClick={() => createDeliveryNote(sale.id)}
                                  className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700"
                                >
                                  Crear remito
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {!filteredSales.length && (
                      <div className="py-12 text-center text-slate-500">
                        <Barcode className="mx-auto mb-3" size={38} />
                        <p className="font-black">
                          No hay ventas en el período seleccionado.
                        </p>
                      </div>
                    )}
                  </div>
                </section>
                </>
              )}

              {activeSection === "calculators" && (
                <section className="mt-5 grid gap-5 lg:grid-cols-2">
                  <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                    <Calculator className="text-blue-600" size={38} />
                    <h2 className="mt-3 text-2xl font-black">Precio de venta</h2>
                    <p className="mt-1 text-slate-500">
                      Calculá el precio desde el costo y el porcentaje deseado.
                    </p>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <label>
                        <span className="mb-2 block font-black">Costo</span>
                        <input
                          inputMode="decimal"
                          value={calculator.cost}
                          onChange={(event) =>
                            setCalculator((current) => ({
                              ...current,
                              cost: event.target.value,
                            }))
                          }
                          className="h-14 w-full rounded-2xl bg-slate-100 px-4 font-black"
                        />
                      </label>
                      <label>
                        <span className="mb-2 block font-black">Ganancia %</span>
                        <input
                          inputMode="decimal"
                          value={calculator.markup}
                          onChange={(event) =>
                            setCalculator((current) => ({
                              ...current,
                              markup: event.target.value,
                            }))
                          }
                          className="h-14 w-full rounded-2xl bg-slate-100 px-4 font-black"
                        />
                      </label>
                    </div>
                    <div className="mt-5 rounded-3xl bg-blue-600 p-5 text-white">
                      <p className="text-sm font-black uppercase tracking-widest text-blue-200">
                        Precio sugerido
                      </p>
                      <p className="mt-2 text-4xl font-black">
                        {MONEY.format(calculatedPrice)}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-xl bg-white/15 px-3 py-2 font-bold">
                          Arriba: {MONEY.format(roundPrice(calculatedPrice, "up"))}
                        </span>
                        <span className="rounded-xl bg-white/15 px-3 py-2 font-bold">
                          Abajo: {MONEY.format(roundPrice(calculatedPrice, "down"))}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                    <ReceiptText className="text-red-600" size={38} />
                    <h2 className="mt-3 text-2xl font-black">Punto de equilibrio</h2>
                    <p className="mt-1 text-slate-500">
                      Cuántas unidades necesitás vender para cubrir tus gastos.
                    </p>
                    <div className="mt-5 grid gap-4">
                      {[
                        ["Gastos fijos mensuales", "fixed"],
                        ["Costo variable por unidad", "variableUnit"],
                        ["Precio de venta por unidad", "salePrice"],
                      ].map(([label, field]) => (
                        <label key={field}>
                          <span className="mb-2 block font-black">{label}</span>
                          <input
                            inputMode="decimal"
                            value={calculator[field]}
                            onChange={(event) =>
                              setCalculator((current) => ({
                                ...current,
                                [field]: event.target.value,
                              }))
                            }
                            className="h-14 w-full rounded-2xl bg-slate-100 px-4 font-black"
                          />
                        </label>
                      ))}
                    </div>
                    <div className="mt-5 rounded-3xl bg-red-600 p-5 text-white">
                      <p className="text-sm font-black uppercase tracking-widest text-red-100">
                        Debés vender
                      </p>
                      <p className="mt-2 text-4xl font-black">{breakEven} unidades</p>
                      <p className="mt-2 font-bold text-red-100">
                        Facturación necesaria:{" "}
                        {MONEY.format(breakEven * cleanNumber(calculator.salePrice))}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {activeSection === "people" && (
                <CustomersPanel
                  businessId={businessId}
                  branchId={branchId}
                  cashSession={cashSession}
                  onCustomersChange={setCustomers}
                  onPaymentSaved={loadOperations}
                />
              )}

              {activeSection === "management" && (
                <DocumentsTeamPanel
                  businessId={businessId}
                  branchId={branchId}
                  branches={branches}
                  businessName={administrationDisplayName}
                />
              )}

              {activeSection === "operations" && (
                <AdvancedOperationsPanel
                  businessId={businessId}
                  branchId={branchId}
                  branches={branches}
                  businessName={administrationDisplayName}
                  cashSession={cashSession}
                  isAdmin={isAdmin}
                  onDataChange={() => {
                    loadInventory();
                    loadOperations();
                  }}
                />
              )}
            </>
          )}
        </main>
      </div>

      {branchModal && (
        <Modal title="Nueva sucursal" onClose={() => setBranchModal(false)}>
          <form onSubmit={saveBranch} className="space-y-4">
            {[
              ["Nombre de la sucursal *", "name", "Ejemplo: Casa central"],
              ["Dirección", "address", "Calle, número y localidad"],
              ["Teléfono", "phone", "Número de contacto"],
            ].map(([label, field, placeholder]) => (
              <label key={field} className="block">
                <span className="mb-2 block font-black">{label}</span>
                <input
                  required={field === "name"}
                  value={branchForm[field]}
                  onChange={(event) =>
                    setBranchForm((current) => ({
                      ...current,
                      [field]: event.target.value,
                    }))
                  }
                  placeholder={placeholder}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-semibold outline-none focus:border-blue-600"
                />
              </label>
            ))}
            <button
              disabled={saving}
              className="h-14 w-full rounded-2xl bg-blue-600 font-black text-white disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Crear sucursal"}
            </button>
          </form>
        </Modal>
      )}

      {cashModal && (
        <Modal
          title={
            cashModal === "open"
              ? "Abrir caja"
              : cashModal === "close"
                ? "Cerrar caja"
                : cashModal === "income"
                  ? "Registrar ingreso"
                  : "Registrar egreso"
          }
          onClose={() => setCashModal("")}
        >
          <form
            onSubmit={
              cashModal === "open"
                ? openCash
                : cashModal === "close"
                  ? closeCash
                  : saveCashMovement
            }
            className="space-y-4"
          >
            <label className="block">
              <span className="mb-2 block font-black">
                {cashModal === "open"
                  ? "Dinero inicial en caja"
                  : cashModal === "close"
                    ? "Dinero contado al cerrar"
                    : "Importe"}
              </span>
              <input
                required
                autoFocus
                inputMode="decimal"
                value={cashForm.amount}
                onChange={(event) =>
                  setCashForm((current) => ({
                    ...current,
                    amount: event.target.value,
                  }))
                }
                placeholder="$ 0"
                className="h-16 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-2xl font-black"
              />
            </label>

            {["income", "expense"].includes(cashModal) && (
              <>
                <label className="block">
                  <span className="mb-2 block font-black">Categoría</span>
                  <select
                    value={cashForm.category}
                    onChange={(event) =>
                      setCashForm((current) => ({
                        ...current,
                        category: event.target.value,
                      }))
                    }
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-black"
                  >
                    <option value="">Elegir categoría</option>
                    {cashModal === "income" ? (
                      <>
                        <option value="Ingreso adicional">Ingreso adicional</option>
                        <option value="Cobro de deuda">Cobro de deuda</option>
                        <option value="Aporte del titular">Aporte del titular</option>
                      </>
                    ) : (
                      <>
                        <option value="Gasto fijo">Gasto fijo</option>
                        <option value="Gasto variable">Gasto variable</option>
                        <option value="Compra">Compra</option>
                        <option value="Retiro del titular">Retiro del titular</option>
                      </>
                    )}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block font-black">Medio de pago</span>
                  <select
                    value={cashForm.payment_method}
                    onChange={(event) =>
                      setCashForm((current) => ({
                        ...current,
                        payment_method: event.target.value,
                      }))
                    }
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-black"
                  >
                    <option value="cash">Efectivo</option>
                    <option value="transfer">Transferencia</option>
                    <option value="debit">Débito</option>
                    <option value="credit">Crédito</option>
                    <option value="mercadopago">Mercado Pago</option>
                  </select>
                </label>
              </>
            )}

            {cashModal !== "open" && (
              <label className="block">
                <span className="mb-2 block font-black">
                  {cashModal === "close" ? "Observación" : "Descripción *"}
                </span>
                <textarea
                  required={cashModal !== "close"}
                  value={cashForm.description}
                  onChange={(event) =>
                    setCashForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 font-semibold"
                />
              </label>
            )}

            {cashModal === "close" && (
              <div className="rounded-2xl bg-blue-50 p-4 font-bold text-blue-950">
                El sistema espera {MONEY.format(expectedCash)}. Al cerrar te mostrará si
                existe una diferencia.
              </div>
            )}

            <button
              disabled={saving}
              className={`h-14 w-full rounded-2xl font-black text-white disabled:opacity-50 ${
                cashModal === "expense" || cashModal === "close"
                  ? "bg-red-600"
                  : "bg-blue-600"
              }`}
            >
              {saving
                ? "Guardando..."
                : cashModal === "open"
                  ? "Abrir caja"
                  : cashModal === "close"
                    ? "Confirmar cierre"
                    : "Guardar movimiento"}
            </button>
          </form>
        </Modal>
      )}

      {productModal && (
        <Modal
          title={editingProduct ? "Editar producto" : "Nuevo producto"}
          onClose={() => {
            setProductModal(false);
            setEditingProduct(null);
          }}
        >
          <form onSubmit={saveProduct} className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-2 block font-black">Nombre del producto *</span>
              <input
                required
                value={productForm.name}
                onChange={(event) => updateProductField("name", event.target.value)}
                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-semibold"
              />
            </label>
            {[
              ["Código de barras", "barcode"],
              ["Código interno", "internal_code"],
              ["Costo", "cost"],
              ["Ganancia %", "profit_percent"],
              ["Precio de venta", "sale_price"],
              [editingProduct ? "Stock actual" : "Stock inicial", "initial_stock"],
              ["Avisar cuando queden", "minimum_stock"],
            ].map(([label, field]) => (
              <label key={field}>
                <span className="mb-2 block font-black">{label}</span>
                <input
                  inputMode={["cost", "profit_percent", "sale_price", "initial_stock", "minimum_stock"].includes(field) ? "decimal" : "text"}
                  value={productForm[field]}
                  onChange={(event) => updateProductField(field, event.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-semibold"
                />
                {field === "barcode" && (
                  <span className="mt-2 block text-xs font-bold text-blue-700">
                    Hacé clic en este campo y escaneá con un lector USB o Bluetooth.
                  </span>
                )}
              </label>
            ))}
            <label>
              <span className="mb-2 block font-black">Redondeo del precio</span>
              <select
                value={rounding}
                onChange={(event) => changeRounding(event.target.value)}
                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-semibold"
              >
                <option value="none">Sin redondear</option>
                <option value="up">Hacia arriba (cada $100)</option>
                <option value="down">Hacia abajo (cada $100)</option>
              </select>
            </label>
            <label className="sm:col-span-2">
              <span className="mb-2 block font-black">Descripción</span>
              <textarea
                value={productForm.description}
                onChange={(event) => updateProductField("description", event.target.value)}
                className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 font-semibold"
              />
            </label>
            <div className="sm:col-span-2 rounded-2xl bg-blue-50 p-4 text-blue-950">
              <p className="font-black">
                Ganancia por unidad:{" "}
                {MONEY.format(
                  cleanNumber(productForm.sale_price) - cleanNumber(productForm.cost),
                )}
              </p>
            </div>
            <button
              disabled={saving}
              className="h-14 rounded-2xl bg-red-600 font-black text-white disabled:opacity-50 sm:col-span-2"
            >
              {saving
                ? "Guardando..."
                : editingProduct
                  ? "Guardar cambios"
                  : "Guardar producto"}
            </button>
          </form>
        </Modal>
      )}

      {importModal && (
        <Modal title="Importar productos" onClose={() => setImportModal(false)}>
          <div className="rounded-3xl bg-blue-50 p-5">
            <h3 className="font-black text-blue-950">Importación segura con vista previa</h3>
            <p className="mt-2 text-sm text-blue-900">
              No se carga nada hasta que revises la lista y confirmes.
            </p>
            <button
              type="button"
              onClick={downloadExample}
              className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-black text-blue-700 shadow-sm"
            >
              <Download className="mr-2 inline" size={18} /> Descargar archivo de ejemplo
            </button>
          </div>
          <input
            ref={importInput}
            type="file"
            accept=".csv,.xlsx,.xls,.pdf"
            onChange={readImportFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => importInput.current?.click()}
            className="mt-5 h-16 w-full rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 font-black"
          >
              <Upload className="mr-2 inline" /> Elegir CSV, Excel o PDF
          </button>
          {importErrors.map((error) => (
            <p key={error} className="mt-3 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">
              {error}
            </p>
          ))}
          {!!importRows.length && (
            <>
              <div className="mt-5 max-h-72 overflow-auto rounded-2xl border border-slate-200">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="sticky top-0 bg-slate-100">
                    <tr>
                      <th className="p-3">Producto</th>
                      <th className="p-3">Código</th>
                      <th className="p-3">Costo</th>
                      <th className="p-3">Venta</th>
                      <th className="p-3">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importRows.map((row) => (
                      <tr key={`${row.row}-${row.name}`} className="border-t">
                        <td className="p-3 font-bold">{row.name}</td>
                        <td className="p-3">{row.barcode || row.internal_code || "—"}</td>
                        <td className="p-3">{MONEY.format(row.cost)}</td>
                        <td className="p-3">{MONEY.format(row.sale_price)}</td>
                        <td className="p-3">{row.initial_stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={importProducts}
                className="mt-5 h-14 w-full rounded-2xl bg-blue-600 font-black text-white disabled:opacity-50"
              >
                {saving
                  ? "Importando..."
                  : `Confirmar importación de ${importRows.length} productos`}
              </button>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
