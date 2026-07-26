import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { supabase } from "../supabase";
import { loadStudioEntity } from "../Studio/studioEntity";
import { uploadStudioFile } from "../Studio/StudioLibraryService";
import {
  claimStudioUsage,
  releaseStudioUsage,
} from "../Studio/studioUsage";
import { createBrandManager } from "../Studio/Brand/BrandEngine";
import BrandKitQuickPanel from "../Studio/Brand/components/BrandKitQuickPanel";
import Layout from "../components/Layout";
import StudioMentorPanel from "../MentorIA/Components/StudioMentorPanel";
import { buildImageStudioContext } from "../MentorIA/Studio/studioContext";

import {
  BackgroundPanel,
  CanvasStage,
  ELEMENT_TYPES,
  FORMAT_SIZES,
  ImageLibraryPanel,
  ElementsLibraryPanel,
  SafeAreaPanel,
  SocialResizePanel,
  ProfessionalTemplatesPanel,
  PositionPanel,
  DraftPanel,
  LayersPanel,
  ModeSwitcher,
  ProjectPanel,
  PropertiesPanel,
  QuickPanel,
  Toolbar,
  createElement,
  createInitialProject,
  deleteElement,
  downloadProjectFile,
  duplicateElement,
  adaptProjectToSize,
  applyDesignCategory,
  alignElement,
  saveDraft,
  loadDraft,
  removeDraft,
  exportStage,
  importProjectFile,
  moveLayer,
  readImageFile,
  updateElement,
  useCanvasHistory,
} from "../Studio/Editor";

export default function StudioImage() {
  const { id, entityType = "business" } = useParams();
  const [searchParams] = useSearchParams();

  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const clipboardRef = useRef(null);

  const [business, setBusiness] = useState(null);
  const [brandKit, setBrandKit] = useState(null);
  const [isWorkspace, setIsWorkspace] = useState(false);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [mode, setMode] = useState("easy");
  const [format, setFormat] = useState("1:1");
  const [selectedId, setSelectedId] = useState("");
  const [editingImageId, setEditingImageId] = useState("");
  const [zoom, setZoom] = useState(0.45);

  const [exportScale, setExportScale] = useState(1);
  const [exportFormat, setExportFormat] = useState("png");
  const [showSafeMargins, setShowSafeMargins] = useState(true);
  const [safeMargin, setSafeMargin] = useState(80);
  const [lastSavedAt, setLastSavedAt] = useState("");
  const [hasLocalDraft, setHasLocalDraft] = useState(false);
  const [creationTool, setCreationTool] = useState("quick");
  const [selectionTool, setSelectionTool] = useState("properties");

  const {
    state: project,
    setState: setProject,
    reset: resetProject,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useCanvasHistory(null);

  useEffect(() => {
    loadPage();
  }, [id, entityType]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !project) return;

    const updateFit = () => {
      const available = Math.max(280, container.clientWidth - 28);
      setZoom(Math.max(0.18, Math.min(1, available / project.width)));
    };

    updateFit();

    const observer = new ResizeObserver(updateFit);
    observer.observe(container);

    return () => observer.disconnect();
  }, [project?.width]);

  const draftKey = `${entityType}:${id}`;

  const selectedElement = useMemo(() => {
    if (!project || !selectedId) return null;
    return project.elements.find((element) => element.id === selectedId) || null;
  }, [project, selectedId]);

  const updateCanvasElement = useCallback(
    (elementId, changes) => {
      setProject((current) => ({
        ...current,
        elements: updateElement(current.elements, elementId, changes),
      }));
    },
    [setProject]
  );

  useEffect(() => {
    function onKeyDown(event) {
      const tag = document.activeElement?.tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        event.shiftKey ? redo() : undo();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c") {
        if (selectedElement) clipboardRef.current = { ...selectedElement };
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v") {
        const copied = clipboardRef.current;
        if (!copied || !project) return;

        event.preventDefault();

        const next = {
          ...copied,
          id: `${copied.type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: `${copied.name} copia`,
          x: Number(copied.x || 0) + 30,
          y: Number(copied.y || 0) + 30,
          locked: false,
        };

        setProject((current) => ({
          ...current,
          elements: [...current.elements, next],
        }));
        setSelectedId(next.id);
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d") {
        event.preventDefault();
        duplicateSelected();
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedId) {
          event.preventDefault();
          deleteSelected();
        }
        return;
      }

      if (event.key === "Escape") {
        setSelectedId("");
        setEditingImageId("");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedElement, selectedId, project, undo, redo]);

  async function loadPage() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      setUserId(user.id);

      const result = await loadStudioEntity({ id, entityType, user });

      setBusiness(result.entity);
      setIsWorkspace(result.isWorkspace);

      const brandManager = createBrandManager({ supabase });
      const loadedBrandKit = await brandManager.loadBrandKit(result.entity.id);
      setBrandKit(loadedBrandKit);
      const size = FORMAT_SIZES["1:1"];
      const brandLogo =
        loadedBrandKit?.logos?.primary ||
        result.entity.logo ||
        "";

      const initialProject = createInitialProject({
        width: size.width,
        height: size.height,
        title: "NOVEDAD",
        subtitle:
          loadedBrandKit?.identity?.slogan ||
          "Nuevo ingreso disponible. Calidad, precio y atención personalizada.",
        image:
          result.entity.image ||
          result.entity.images?.[0] ||
          "",
        logo: brandLogo,
        background: {
          type: "linear",
          colors: [
            loadedBrandKit?.colors?.primary || "#020617",
            loadedBrandKit?.colors?.secondary || "#312e81",
            loadedBrandKit?.colors?.accent || "#0f172a",
          ],
          stops: [0, 0.55, 1],
        },
      });

      initialProject.elements = initialProject.elements.map((element) => {
        if (element.id === "title") {
          return {
            ...element,
            fill: loadedBrandKit?.colors?.text || element.fill,
            fontFamily:
              loadedBrandKit?.typography?.primaryFont ||
              element.fontFamily,
          };
        }

        if (element.id === "subtitle") {
          return {
            ...element,
            fill:
              loadedBrandKit?.colors?.textSoft ||
              element.fill,
            fontFamily:
              loadedBrandKit?.typography?.secondaryFont ||
              element.fontFamily,
          };
        }

        if (element.id === "main-image") {
          return {
            ...element,
            cornerRadius:
              loadedBrandKit?.style?.cornerRadius ||
              element.cornerRadius,
          };
        }

        return element;
      });

      resetProject(initialProject);

      const projectUrl =
        searchParams.get("project");

      if (projectUrl) {
        try {
          const response =
            await fetch(projectUrl);

          const editableProject =
            await response.json();

          resetProject(editableProject);

          setLoading(false);
          return;
        } catch (error) {
          console.error(error);
        }
      }

      const savedDraft = loadDraft(draftKey);
      setHasLocalDraft(Boolean(savedDraft?.project));
      setLastSavedAt(
        savedDraft?.savedAt
          ? new Date(savedDraft.savedAt).toLocaleString()
          : ""
      );
    } catch (error) {
      console.error(error);

      if (error?.code === "PLAN_REQUIRED") {
        navigate("/planes");
        return;
      }

      navigate("/studio");
    } finally {
      setLoading(false);
    }
  }

  function updateSelected(changes) {
    if (!selectedId) return;
    updateCanvasElement(selectedId, changes);
  }

  function changeFormat(nextFormat) {
    const nextSize = FORMAT_SIZES[nextFormat];
    if (!nextSize || !project) return;

    const scaleX = nextSize.width / project.width;
    const scaleY = nextSize.height / project.height;

    setFormat(nextFormat);
    setSelectedId("");
    setEditingImageId("");

    setProject((current) => ({
      ...current,
      width: nextSize.width,
      height: nextSize.height,
      elements: current.elements.map((element) => ({
        ...element,
        x: element.x * scaleX,
        y: element.y * scaleY,
        width: element.width * scaleX,
        height: element.height * scaleY,
      })),
    }));
  }

  function addText() {
    const element = createElement(ELEMENT_TYPES.TEXT, {
      name: "Nuevo texto",
      text: "Escribí tu texto",
      x: 100,
      y: 140,
      width: Math.min(620, project.width - 200),
    });

    setProject((current) => ({
      ...current,
      elements: [...current.elements, element],
    }));
    setSelectedId(element.id);
  }

  function addImage() {
    const element = createElement(ELEMENT_TYPES.IMAGE, {
      name: "Imagen extra",
      x: 160,
      y: 220,
      width: Math.min(560, project.width - 320),
      height: Math.min(560, project.height - 440),
    });

    setProject((current) => ({
      ...current,
      elements: [...current.elements, element],
    }));
    setSelectedId(element.id);
  }

  function applyBrandKitToCurrentProject() {
    if (!brandKit || !project) return;

    const primary = brandKit?.colors?.primary || "#2563eb";
    const secondary = brandKit?.colors?.secondary || "#0f172a";
    const accent = brandKit?.colors?.accent || "#22c55e";
    const titleFont = brandKit?.typography?.primaryFont || "Inter";
    const bodyFont = brandKit?.typography?.secondaryFont || titleFont;
    const titleColor = brandKit?.colors?.text || "#ffffff";
    const bodyColor = brandKit?.colors?.textSoft || titleColor;
    const logo = brandKit?.logos?.primary || business?.logo || "";

    setProject((current) => {
      let elements = current.elements.map((element) => {
        if (element.id === "title" || (element.type === ELEMENT_TYPES.TEXT && element.name === "Título")) {
          return { ...element, fill: titleColor, fontFamily: titleFont };
        }
        if (element.id === "subtitle" || (element.type === ELEMENT_TYPES.TEXT && element.name === "Subtítulo")) {
          return { ...element, fill: bodyColor, fontFamily: bodyFont };
        }
        return element;
      });

      const hasLogo = elements.some(
        (element) => element.type === ELEMENT_TYPES.LOGO && element.src
      );

      if (logo && !hasLogo) {
        elements = [
          ...elements,
          createElement(ELEMENT_TYPES.LOGO, {
            name: "Logo del Brand Kit",
            src: logo,
            x: 70,
            y: 70,
            width: 170,
            height: 170,
          }),
        ];
      }

      return {
        ...current,
        background: {
          type: "linear",
          colors: [primary, secondary, accent],
          stops: [0, 0.55, 1],
        },
        elements,
      };
    });
  }

  function addLogo() {
    const element = createElement(ELEMENT_TYPES.LOGO, {
      name: "Logo",
      src:
        brandKit?.logos?.primary ||
        business?.logo ||
        "",
      x: 80,
      y: 80,
      width: 180,
      height: 180,
    });

    setProject((current) => ({
      ...current,
      elements: [...current.elements, element],
    }));
    setSelectedId(element.id);
  }

  function addShape() {
    const element = createElement(ELEMENT_TYPES.SHAPE, {
      name: "Forma",
      x: 180,
      y: 200,
      width: 420,
      height: 180,
      fill: "#2563eb",
    });

    setProject((current) => ({
      ...current,
      elements: [...current.elements, element],
    }));
    setSelectedId(element.id);
  }

  function addIcon(icon) { const element = createElement(ELEMENT_TYPES.ICON, { name: icon.label, symbol: icon.symbol, x: 180, y: 180, width: 170, height: 170, fill: "#ffffff", fontSize: 140 }); setProject(c => ({ ...c, elements: [...c.elements, element] })); setSelectedId(element.id); }
  function addSticker(sticker) { const element = createElement(ELEMENT_TYPES.STICKER, { name: sticker.label, text: sticker.text, fill: sticker.fill, color: sticker.color, x: 160, y: 180, width: 300, height: 100 }); setProject(c => ({ ...c, elements: [...c.elements, element] })); setSelectedId(element.id); }
  function addLine() { const element = createElement(ELEMENT_TYPES.LINE, { name: "Línea", x: 180, y: 240, width: 420, height: 8, fill: "#ffffff" }); setProject(c => ({ ...c, elements: [...c.elements, element] })); setSelectedId(element.id); }

  function duplicateSelected() {
    if (!selectedId || !project) return;

    const next = duplicateElement(project.elements, selectedId);

    setProject((current) => ({
      ...current,
      elements: next,
    }));

    setSelectedId(next[next.length - 1]?.id || "");
  }

  function deleteSelected() {
    if (!selectedId || !project) return;

    setProject((current) => ({
      ...current,
      elements: deleteElement(current.elements, selectedId),
    }));

    setSelectedId("");
    setEditingImageId("");
  }

  function moveSelectedLayer(direction) {
    if (!selectedId) return;

    setProject((current) => ({
      ...current,
      elements: moveLayer(current.elements, selectedId, direction),
    }));
  }

  function alignSelected(axis) {
    if (!selectedElement || !project) return;

    if (axis === "horizontal") {
      updateSelected({
        x: (project.width - selectedElement.width) / 2,
      });
    } else {
      updateSelected({
        y: (project.height - selectedElement.height) / 2,
      });
    }
  }

  function toggleHidden(elementId) {
    const element = project.elements.find((item) => item.id === elementId);
    if (!element) return;
    updateCanvasElement(elementId, { hidden: !element.hidden });
  }

  function toggleLocked(elementId) {
    const element = project.elements.find((item) => item.id === elementId);
    if (!element) return;
    updateCanvasElement(elementId, { locked: !element.locked });
  }

  function applyTemplate(template) {
    setProject((current) => ({
      ...current,
      background: template.background,
      elements: current.elements.map((element) => {
        if (element.id === "title") {
          return {
            ...element,
            text: template.title,
            fill: template.titleColor,
          };
        }

        if (element.id === "subtitle") {
          return {
            ...element,
            text: template.subtitle,
            fill: template.subtitleColor,
          };
        }

        return element;
      }),
    }));
  }

  async function uploadToElement(event, elementId) {
    const file = event.target.files?.[0];
    event.target.value = "";

    try {
      const src = await readImageFile(file);

      updateCanvasElement(elementId, {
        src,
        imageScale: 1,
        cropOffsetX: 0,
        cropOffsetY: 0,
      });
    } catch (error) {
      alert(error.message);
    }
  }

  async function uploadMainImage(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    try {
      const src = await readImageFile(file);

      setProject((current) => ({
        ...current,
        elements: updateElement(current.elements, "main-image", {
          src,
          x: 0,
          y: 0,
          width: current.width,
          height: current.height,
          imageScale: 1,
          cropOffsetX: 0,
          cropOffsetY: 0,
        }),
      }));

      setSelectedId("main-image");
    } catch (error) {
      alert(error.message);
    }
  }

  async function loadProject(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    try {
      const imported = await importProjectFile(file);
      resetProject(imported);
      setSelectedId("");
      setEditingImageId("");
    } catch (error) {
      alert(error.message);
    }
  }


  function applySocialPreset(preset) {
    if (!project || !preset) return;

    setFormat(preset.format);
    setSelectedId("");
    setEditingImageId("");

    setProject((current) =>
      adaptProjectToSize(
        current,
        preset.width,
        preset.height
      )
    );
  }

  function applyProfessionalStyle(category) {
    setProject((current) =>
      applyDesignCategory(current, category)
    );
  }

  function positionSelected(position) {
    if (!selectedElement || !project) return;

    const next = alignElement(
      selectedElement,
      project,
      position
    );

    if (next) {
      updateSelected(next);
    }
  }

  function saveLocalDraft() {
    if (!project) return;

    saveDraft(draftKey, project);

    const now = new Date();
    setLastSavedAt(now.toLocaleString());
    setHasLocalDraft(true);
  }

  function recoverLocalDraft() {
    const saved = loadDraft(draftKey);

    if (!saved?.project) {
      alert("No hay un guardado local disponible.");
      return;
    }

    resetProject(saved.project);
    setSelectedId("");
    setEditingImageId("");
    setLastSavedAt(
      saved.savedAt
        ? new Date(saved.savedAt).toLocaleString()
        : ""
    );
  }

  function deleteLocalDraft() {
    removeDraft(draftKey);
    setHasLocalDraft(false);
    setLastSavedAt("");
  }

  async function exportDesign() {
    const stage = stageRef.current?.getStage();
    if (!stage || !project || !business || exporting) return;

    let usageClaim = null;

    try {
      setExporting(true);
      setSelectedId("");
      setEditingImageId("");

      if (!isWorkspace) {
        usageClaim = await claimStudioUsage({
          businessId: business.id,
          contentType: "image",
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 80));

      const safeName = String(business.negocio || "tuscomercios")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-");

      const extension =
        exportFormat === "jpg"
          ? "jpg"
          : exportFormat === "webp"
            ? "webp"
            : "png";

      const mimeType =
        exportFormat === "jpg"
          ? "image/jpeg"
          : exportFormat === "webp"
            ? "image/webp"
            : "image/png";

      const exported = await exportStage({
        stage,
        project,
        fileName: `${safeName || "tuscomercios"}-studio.${extension}`,
        mimeType,
        pixelRatio: exportScale,
        quality: 0.95,
      });

      await uploadStudioFile({
        userId,
        businessId: business.id,
        entityType: isWorkspace ? "workspace" : "business",
        contentType: "image",
        title: `${business.negocio || business.name || "Diseño"} - ${new Date().toLocaleDateString("es-AR")}`,
        blob: exported.blob,
        fileName: exported.fileName,
        projectData: project,
      });

    } catch (error) {
      console.error(error);

      if (usageClaim?.usage_id) {
        await releaseStudioUsage(usageClaim.usage_id);
      }

      alert("No se pudo descargar la imagen.");
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
          <div className="rounded-3xl bg-white p-8 text-center shadow-xl">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            <p className="mt-5 text-xl font-black text-slate-900">
              Cargando editor profesional...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!business || !project) return null;

  const selectedIsImage =
    selectedElement?.type === ELEMENT_TYPES.IMAGE ||
    selectedElement?.type === ELEMENT_TYPES.LOGO;

  const availableImages = Array.from(
    new Set(
      [
        brandKit?.logos?.primary,
        brandKit?.logos?.white,
        brandKit?.logos?.dark,
        brandKit?.logos?.symbol,
        business?.logo,
        business?.image,
        ...(Array.isArray(business?.images) ? business.images : []),
        ...project.elements
          .filter(
            (element) =>
              element.type === ELEMENT_TYPES.IMAGE ||
              element.type === ELEMENT_TYPES.LOGO
          )
          .map((element) => element.src),
      ].filter(Boolean)
    )
  );

  return (
    <Layout>
      <div className="min-h-screen w-full overflow-x-hidden bg-slate-100 pb-28">
        <div className="mx-auto max-w-[1850px] p-3 sm:p-4 md:p-6">
          <header className="relative mb-5 overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-violet-900 p-5 text-white shadow-2xl md:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <button
                  onClick={() => navigate("/studio")}
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-black"
                >
                  ← Volver a Studio
                </button>

                <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-blue-200">
                  TusComercios Studio
                </p>

                <h1 className="mt-2 text-3xl font-black md:text-5xl">
                  Editor profesional
                </h1>

                <p className="mt-3 font-semibold text-blue-100">
                  Diseñando para <strong>{business.negocio}</strong>
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <StudioMentorPanel
                  business={business}
                  entityType={entityType}
                  entityId={id}
                  editorLabel="Editor de Imágenes"
                  disabled={!project}
                  studioContext={buildImageStudioContext({
                    business,
                    brandKit,
                    project,
                    format,
                  })}
                />
                <ModeSwitcher mode={mode} onChange={setMode} />
              </div>
            </div>
          </header>

          <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <p className="px-2 pb-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
              Herramientas
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                ["quick", "Crear"],
                ["brand", "Marca"],
                ["background", "Fondo"],
                ["elements", "Elementos"],
                ["safe", "Zona segura"],
                ["project", "Proyecto"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCreationTool(value)}
                  className={`min-h-11 shrink-0 rounded-xl px-4 text-sm font-black ${
                    creationTool === value
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {label}
                </button>
              ))}
              {[
                ["properties", "Propiedades"],
                ["position", "Posición"],
                ["images", "Imágenes"],
                ["layers", "Capas"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectionTool(value)}
                  className={`min-h-11 shrink-0 rounded-xl px-4 text-sm font-black ${
                    selectionTool === value
                      ? "bg-violet-600 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)_310px]">
            <aside className="order-1 min-w-0 space-y-4 xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto xl:pr-2">
              {creationTool === "brand" && (
                <BrandKitQuickPanel
                  brandKit={brandKit}
                  onApply={applyBrandKitToCurrentProject}
                  onAddLogo={addLogo}
                />
              )}

              {creationTool === "quick" && (
                <QuickPanel
                  format={format}
                  onFormat={changeFormat}
                  onMainImage={uploadMainImage}
                  onAddText={addText}
                  onAddImage={addImage}
                  onAddLogo={addLogo}
                  onAddShape={addShape}
                  onApplyTemplate={applyTemplate}
                />
              )}

              {creationTool === "background" && (
                <BackgroundPanel
                  background={project.background}
                  onChange={(background) =>
                    setProject((current) => ({
                      ...current,
                      background,
                    }))
                  }
                />
              )}

              {creationTool === "elements" && (
                <ElementsLibraryPanel onAddIcon={addIcon} onAddSticker={addSticker} onAddLine={addLine} />
              )}

              {creationTool === "safe" && (
                <SafeAreaPanel visible={showSafeMargins} margin={safeMargin} onVisible={setShowSafeMargins} onMargin={setSafeMargin} />
              )}

              {creationTool === "project" && (
                <ProjectPanel
                  onSaveProject={() =>
                    downloadProjectFile(
                      project,
                      `${business.negocio || "proyecto"}-studio.json`
                    )
                  }
                  onLoadProject={loadProject}
                  exportScale={exportScale}
                  onExportScale={setExportScale}
                  exportFormat={exportFormat}
                  onExportFormat={setExportFormat}
                />
              )}

              <button
                onClick={exportDesign}
                disabled={exporting}
                className="min-h-16 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 text-lg font-black text-white shadow-xl disabled:opacity-50"
              >
                {exporting ? "Preparando..." : "Descargar diseño"}
              </button>
            </aside>

            <main className="order-2 min-w-0 xl:sticky xl:top-4">
              <Toolbar
                zoom={zoom}
                hasSelection={Boolean(selectedId)}
                isEditingImage={Boolean(editingImageId)}
                canUndo={canUndo}
                canRedo={canRedo}
                onZoomIn={() =>
                  setZoom((value) => Math.min(1.5, value + 0.1))
                }
                onZoomOut={() =>
                  setZoom((value) => Math.max(0.18, value - 0.1))
                }
                onFit={() => {
                  const available = Math.max(
                    280,
                    (containerRef.current?.clientWidth || 700) - 28
                  );
                  setZoom(
                    Math.max(0.18, Math.min(1, available / project.width))
                  );
                }}
                onUndo={undo}
                onRedo={redo}
                onDuplicate={duplicateSelected}
                onDelete={deleteSelected}
                onEditImage={() => {
                  if (selectedIsImage) setEditingImageId(selectedId);
                }}
                onFinishImageEdit={() => setEditingImageId("")}
                onLayerUp={() => moveSelectedLayer("up")}
                onLayerDown={() => moveSelectedLayer("down")}
                onAlignHorizontal={() => alignSelected("horizontal")}
                onAlignVertical={() => alignSelected("vertical")}
              />

              <section
                ref={containerRef}
                onWheel={(event) => {
                  if (!event.ctrlKey) return;
                  event.preventDefault();

                  setZoom((value) =>
                    Math.max(
                      0.18,
                      Math.min(1.5, value + (event.deltaY < 0 ? 0.08 : -0.08))
                    )
                  );
                }}
                className="mt-4 overflow-auto rounded-[2rem] border border-slate-200 bg-slate-200 p-3 shadow-inner sm:p-5"
              >
                <div
                  className="relative mx-auto"
                  style={{
                    width: `${project.width * zoom}px`,
                    height: `${project.height * zoom}px`,
                  }}
                >
                  <CanvasStage
                    ref={stageRef}
                    project={project}
                    zoom={zoom}
                    selectedId={selectedId}
                    editingImageId={editingImageId}
                    onSelect={(nextId) => {
                      setSelectedId(nextId);
                      if (nextId !== editingImageId) setEditingImageId("");
                    }}
                    onEditImage={setEditingImageId}
                    onElementChange={updateCanvasElement}
                    showSafeMargins={showSafeMargins}
                    safeMargin={safeMargin}
                  />
                </div>
              </section>
            </main>

            <aside className="order-1 min-w-0 space-y-4 xl:order-3 xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto xl:pl-2">
              {selectionTool === "properties" && <PropertiesPanel
                element={selectedElement}
                editingImage={editingImageId === selectedId}
                onChange={updateSelected}
                onUpload={(event) => uploadToElement(event, selectedId)}
                onStartImageEdit={() => {
                  if (selectedIsImage) setEditingImageId(selectedId);
                }}
                onFinishImageEdit={() => setEditingImageId("")}
              />}

              {selectionTool === "position" && <PositionPanel
                disabled={!selectedElement}
                onPosition={positionSelected}
              />}

              {selectionTool === "images" && selectedIsImage && (
                <ImageLibraryPanel
                  images={availableImages}
                  selectedId={selectedId}
                  onUseImage={(src) =>
                    updateSelected({
                      src,
                      imageScale: 1,
                      imageRotation: 0,
                      flipX: false,
                      flipY: false,
                      cropOffsetX: 0,
                      cropOffsetY: 0,
                    })
                  }
                />
              )}

              {selectionTool === "layers" && mode === "professional" && (
                <LayersPanel
                  elements={project.elements}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onToggleHidden={toggleHidden}
                  onToggleLocked={toggleLocked}
                />
              )}
            </aside>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-12px_35px_rgba(15,23,42,.14)] backdrop-blur-xl xl:hidden">
          <div className="mx-auto grid max-w-xl grid-cols-2 gap-3">
            <button
              onClick={() => setMode(mode === "easy" ? "professional" : "easy")}
              className="min-h-14 rounded-2xl border border-slate-200 bg-white font-black text-slate-700"
            >
              {mode === "easy" ? "Más herramientas" : "Modo fácil"}
            </button>

            <button
              onClick={exportDesign}
              disabled={exporting}
              className="min-h-14 rounded-2xl bg-emerald-600 font-black text-white"
            >
              {exporting ? "Preparando..." : "Descargar"}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
