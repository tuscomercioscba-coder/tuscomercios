import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import JSZip from "jszip";
import Layout from "../components/Layout";
import { supabase } from "../supabase";
import { loadStudioEntity } from "../Studio/studioEntity";
import { createBrandManager } from "../Studio/Brand/BrandEngine";
import { claimStudioUsage, releaseStudioUsage } from "../Studio/studioUsage";
import { uploadStudioFile } from "../Studio/StudioLibraryService";
import StudioMentorPanel from "../MentorIA/Components/StudioMentorPanel";
import { buildCarouselStudioContext } from "../MentorIA/Studio/studioContext";
import {
  CAROUSEL_FORMATS,
  CAROUSEL_OBJECTIVES,
  CAROUSEL_VISUAL_STYLES,
  createCarouselTemplate,
  resolveRubroProfile,
} from "../CarouselStudio/carouselTemplates";

const FONTS = [
  "Poppins", "Montserrat", "Arial", "Helvetica", "Verdana",
  "Trebuchet MS", "Georgia", "Times New Roman", "Courier New",
  "Impact", "Tahoma", "Palatino", "Garamond",
];

const STICKERS = [
  "✨", "🔥", "⭐", "💡", "🎯", "🛍️", "🎁", "💬", "📲", "📍",
  "❤️", "👏", "🚀", "💯", "⏰", "📅", "✅", "🤝", "🛡️", "👀",
  "🎉", "🎂", "🥐", "🍽️", "🚗", "🛠️", "💼", "🌷", "🌼", "🎄",
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function imageId() {
  return `carousel-image-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function fitImageBox(naturalAspect, format) {
  const canvasAspect = Number(format?.width || 1) / Number(format?.height || 1);
  const safeAspect = Math.max(0.08, Number(naturalAspect || 1));
  let width = 84;
  let height = (width * canvasAspect) / safeAspect;
  if (height > 55) {
    height = 55;
    width = (height * safeAspect) / canvasAspect;
  }
  return {
    width: Math.max(12, Math.min(90, width)),
    height: Math.max(12, Math.min(70, height)),
  };
}

function normalizeImages(page) {
  if (Array.isArray(page?.images)) return page.images;
  if (!page?.image) return [];
  return [{
    id: imageId(),
    src: page.image,
    x: 50,
    y: 29.5,
    width: 84,
    height: 43,
    rotation: 0,
    opacity: 1,
    filter: page.imageFilter || "none",
    isBackground: ["full", "cinema", "luxury"].includes(page.imageStyle),
    zIndex: 1,
  }];
}

function normalizePages(sourcePages) {
  return sourcePages.map((page) => ({
    ...page,
    images: normalizeImages(page),
    image: undefined,
  }));
}

export default function StudioCarousel() {
  const { id, entityType = "business" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [business, setBusiness] = useState(null);
  const [brandKit, setBrandKit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileExportPages, setMobileExportPages] = useState([]);
  const [format, setFormat] = useState("square");
  const [objective, setObjective] = useState("sell");
  const [styleId, setStyleId] = useState("bold");
  const [pageCount, setPageCount] = useState(6);
  const [pages, setPages] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activePanel, setActivePanel] = useState("content");
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [isWorkspace, setIsWorkspace] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    loadPage();
  }, [id, entityType]);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener?.("change", sync);
    return () => query.removeEventListener?.("change", sync);
  }, []);

  useEffect(
    () => () => {
      mobileExportPages.forEach((page) => URL.revokeObjectURL(page.url));
    },
    [mobileExportPages]
  );

  async function loadPage() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setUserId(user.id);
      const result = await loadStudioEntity({ id, entityType, user });
      const manager = createBrandManager({ supabase });
      const loadedBrandKit = await manager.loadBrandKit(result.entity.id);
      setBusiness(result.entity);
      setBrandKit(loadedBrandKit);
      setIsWorkspace(result.isWorkspace);
      const initial = createCarouselTemplate({
        rubro: result.entity?.rubro,
        businessName: result.entity?.negocio || result.entity?.name,
        objective,
        styleId,
        pageCount,
        format,
      });
      const projectUrl = searchParams.get("project");
      if (projectUrl) {
        const response = await fetch(projectUrl);
        if (!response.ok) {
          throw new Error("No se pudo abrir el carrusel guardado.");
        }
        const saved = await response.json();
        const restoredPages = normalizePages(saved?.pages || []);
        if (restoredPages.length < 4) {
          throw new Error("El proyecto guardado no contiene un carrusel válido.");
        }
        setFormat(saved.format || "square");
        setObjective(saved.objective || "sell");
        setStyleId(saved.styleId || "bold");
        setPageCount(restoredPages.length);
        setPages(restoredPages);
      } else {
        setPages(normalizePages(applyBrand(initial.pages, loadedBrandKit)));
      }
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo abrir el Editor de Carruseles.");
    } finally {
      setLoading(false);
    }
  }

  function applyBrand(sourcePages, kit = brandKit) {
    if (!kit) return sourcePages;
    const colors = kit.colors || {};
    const primaryFont = kit.typography?.primaryFont;
    return sourcePages.map((page, index) => ({
      ...page,
      background: index % 2
        ? colors.secondary || page.background
        : colors.primary || page.background,
      accent: colors.accent || page.accent,
      textColor: colors.text || page.textColor,
      font: primaryFont || page.font,
    }));
  }

  const selectedPage = pages[selectedIndex] || null;
  const formatData = CAROUSEL_FORMATS[format];
  const profile = useMemo(
    () => resolveRubroProfile(business?.rubro),
    [business?.rubro]
  );

  function generateTemplate(next = {}) {
    if (pages.some((page) => normalizeImages(page).length) &&
      !window.confirm("¿Querés cambiar la plantilla? Se reemplazará el carrusel actual.")) {
      return;
    }
    const nextObjective = next.objective || objective;
    const nextStyle = next.styleId || styleId;
    const nextCount = Number(next.pageCount || pageCount);
    const nextFormat = next.format || format;
    const generated = createCarouselTemplate({
      rubro: business?.rubro,
      businessName: business?.negocio || business?.name,
      objective: nextObjective,
      styleId: nextStyle,
      pageCount: nextCount,
      format: nextFormat,
    });
    setObjective(nextObjective);
    setStyleId(nextStyle);
    setPageCount(nextCount);
    setFormat(nextFormat);
    setPages(normalizePages(applyBrand(generated.pages)));
    setSelectedIndex(0);
    setSelectedImageId(null);
  }

  function updatePage(changes) {
    setPages((current) =>
      current.map((page, index) =>
        index === selectedIndex ? { ...page, ...changes } : page
      )
    );
  }

  function addPage() {
    if (pages.length >= 10) return;
    const source = selectedPage || pages[pages.length - 1];
    const next = {
      ...clone(source),
      id: `page-${Date.now()}`,
      eyebrow: "NUEVA PÁGINA",
      title: "ESCRIBÍ TU TÍTULO",
      body: "Agregá la información que querés comunicar.",
      cta: "DESLIZÁ",
      images: [],
    };
    setPages((current) => [...current, next]);
    setSelectedIndex(pages.length);
    setPageCount(pages.length + 1);
  }

  function duplicatePage() {
    if (!selectedPage || pages.length >= 10) return;
    const next = { ...clone(selectedPage), id: `page-${Date.now()}` };
    const list = [...pages];
    list.splice(selectedIndex + 1, 0, next);
    setPages(list);
    setSelectedIndex(selectedIndex + 1);
    setPageCount(list.length);
  }

  function deletePage() {
    if (pages.length <= 4) {
      alert("Un carrusel debe tener al menos 4 páginas.");
      return;
    }
    const list = pages.filter((_, index) => index !== selectedIndex);
    setPages(list);
    setSelectedIndex(Math.max(0, Math.min(selectedIndex, list.length - 1)));
    setPageCount(list.length);
  }

  function movePage(direction) {
    const target = selectedIndex + direction;
    if (target < 0 || target >= pages.length) return;
    const list = [...pages];
    [list[selectedIndex], list[target]] = [list[target], list[selectedIndex]];
    setPages(list);
    setSelectedIndex(target);
  }

  function uploadImage(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const source = String(reader.result || "");
      const probe = new Image();
      probe.onload = () => {
        const naturalAspect = probe.naturalWidth / Math.max(1, probe.naturalHeight);
        const fitted = fitImageBox(naturalAspect, formatData);
      const nextImage = {
        id: imageId(),
        src: source,
        x: 50,
        y: 30,
        width: fitted.width,
        height: fitted.height,
        naturalAspect,
        rotation: 0,
        opacity: 1,
        filter: selectedPage?.imageFilter || "none",
        isBackground: false,
        zIndex: normalizeImages(selectedPage).length + 1,
      };
      updatePage({ images: [...normalizeImages(selectedPage), nextImage] });
      setSelectedImageId(nextImage.id);
      setActivePanel("photo");
      };
      probe.src = source;
    };
    reader.readAsDataURL(file);
  }

  function applyBrandKit() {
    setPages((current) => applyBrand(current));
  }

  function applyVisualStyle(nextStyleId) {
    const style =
      CAROUSEL_VISUAL_STYLES.find((item) => item.id === nextStyleId) ||
      CAROUSEL_VISUAL_STYLES[0];
    setStyleId(nextStyleId);
    setPages((current) =>
      current.map((page, index) => ({
        ...page,
        background: index % 2 ? style.colors[1] : style.colors[0],
        accent: index % 3 === 2 ? style.colors[2] : style.colors[1],
        textColor: style.colors[3],
        font: style.font,
        imageFilter: style.filter,
        imageStyle: style.imageStyle,
        decoration: style.decoration,
        images: normalizeImages(page).map((image) => ({
          ...image,
          filter: style.filter,
        })),
      }))
    );
  }

  function updateSelectedImage(changes) {
    if (!selectedImageId) return;
    updatePage({
      images: normalizeImages(selectedPage).map((image) =>
        image.id === selectedImageId ? { ...image, ...changes } : image
      ),
    });
  }

  function removeSelectedImage() {
    if (!selectedImageId) return;
    updatePage({
      images: normalizeImages(selectedPage).filter(
        (image) => image.id !== selectedImageId
      ),
    });
    setSelectedImageId(null);
  }

  function duplicateSelectedImage() {
    const source = normalizeImages(selectedPage).find(
      (image) => image.id === selectedImageId
    );
    if (!source) return;
    const copy = {
      ...clone(source),
      id: imageId(),
      x: Math.min(95, Number(source.x) + 4),
      y: Math.min(95, Number(source.y) + 4),
      isBackground: false,
      zIndex: normalizeImages(selectedPage).length + 1,
    };
    updatePage({ images: [...normalizeImages(selectedPage), copy] });
    setSelectedImageId(copy.id);
  }

  async function exportCarousel() {
    if (!pages.length || exporting) return;
    let usageClaim = null;
    try {
      setExporting(true);
      if (!isWorkspace) {
        usageClaim = await claimStudioUsage({
          businessId: business.id,
          contentType: "carousel",
        });
      }
      const zip = new JSZip();
      const renderedPages = [];
      for (let index = 0; index < pages.length; index += 1) {
        const blob = await renderPageToBlob(pages[index], formatData, index, pages.length);
        renderedPages.push(blob);
        zip.file(`carrusel-${String(index + 1).padStart(2, "0")}.png`, blob);
      }
      zip.file(
        "ORDEN-DE-PUBLICACION.txt",
        `Carrusel creado con TusComercios Studio.\nPublicar las imágenes desde 01 hasta ${String(pages.length).padStart(2, "0")} respetando este orden.`
      );
      const result = await zip.generateAsync({ type: "blob" });
      const businessName =
        business?.negocio || business?.name || "TusComercios";
      const safeName = String(businessName)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-");
      const zipFileName = `carrusel-${safeName || "tuscomercios"}-${Date.now()}.zip`;

      await uploadStudioFile({
        userId,
        businessId: business.id,
        entityType: isWorkspace ? "workspace" : "business",
        contentType: "carousel",
        title: `Carrusel de ${businessName} - ${new Date().toLocaleDateString("es-AR")}`,
        blob: renderedPages[0],
        fileName: `vista-previa-${safeName || "carrusel"}.png`,
        projectData: {
          version: 1,
          type: "carousel",
          format,
          objective,
          styleId,
          pages,
        },
        downloadBlob: result,
        downloadFileName: zipFileName,
      });

      if (isMobile) {
        setMobileExportPages((previous) => {
          previous.forEach((page) => URL.revokeObjectURL(page.url));
          return renderedPages.map((blob, pageIndex) => ({
            url: URL.createObjectURL(blob),
            fileName: `carrusel-${String(pageIndex + 1).padStart(2, "0")}.png`,
          }));
        });
      } else {
        const url = URL.createObjectURL(result);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = zipFileName;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
        alert("Carrusel descargado y guardado como proyecto editable en la Biblioteca.");
      }
    } catch (error) {
      console.error(error);
      if (usageClaim?.usage_id) {
        await releaseStudioUsage(usageClaim.usage_id);
      }
      alert(error?.message || "No se pudo exportar el carrusel.");
    } finally {
      setExporting(false);
    }
  }

  if (loading || !selectedPage) {
    return (
      <Layout>
        <div className="grid min-h-screen place-items-center bg-slate-100">
          <p className="rounded-3xl bg-white p-8 text-xl font-black shadow-xl">
            Preparando tu carrusel...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen overflow-x-hidden bg-slate-100 pb-24">
        {mobileExportPages.length > 0 && (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/80 p-3 backdrop-blur-sm">
            <div className="mx-auto max-w-lg rounded-3xl bg-white p-4 shadow-2xl">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-slate-950">
                    Carrusel listo
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Guardá cada imagen en orden. El proyecto también quedó en tu Biblioteca.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileExportPages([])}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-xl font-black"
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>

              <div className="grid gap-4">
                {mobileExportPages.map((page, pageIndex) => (
                  <article
                    key={page.url}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                  >
                    <img
                      src={page.url}
                      alt={`Página ${pageIndex + 1} del carrusel`}
                      className="aspect-square w-full object-contain"
                    />
                    <a
                      href={page.url}
                      download={page.fileName}
                      className="block bg-blue-600 px-4 py-3 text-center font-black text-white"
                    >
                      Guardar imagen {pageIndex + 1}
                    </a>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="mx-auto max-w-[1800px] p-3 md:p-4">
          <header className="rounded-[1.7rem] bg-gradient-to-r from-slate-950 via-blue-950 to-violet-950 p-4 text-white shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <button onClick={() => navigate("/studio")} className="text-xs font-black text-blue-200">
                  ← Volver a Studio
                </button>
                <h1 className="mt-1 text-2xl font-black md:text-3xl">Editor de Carruseles</h1>
                <p className="mt-1 text-sm font-semibold text-blue-100">
                  {profile.emoji} Contenido preparado para {profile.label}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StudioMentorPanel
                  business={business}
                  entityType={entityType}
                  entityId={id}
                  editorLabel="Editor de Carruseles"
                  studioContext={buildCarouselStudioContext({
                    business,
                    brandKit,
                    pages,
                    format,
                    objective,
                    styleId,
                    selectedIndex,
                  })}
                />
                <button onClick={applyBrandKit} className="min-h-11 rounded-xl bg-amber-400 px-4 font-black text-slate-950">
                  Aplicar marca
                </button>
                <button onClick={exportCarousel} disabled={exporting} className="min-h-11 rounded-xl bg-emerald-500 px-5 font-black text-slate-950 disabled:opacity-50">
                  {exporting
                    ? "Preparando..."
                    : isMobile
                      ? `Guardar ${pages.length} imágenes`
                      : `Descargar ${pages.length} páginas`}
                </button>
              </div>
            </div>
          </header>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={uploadImage}
            className="hidden"
          />

          <div className="sticky top-0 z-40 mt-3 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur">
            <div className="flex gap-2 overflow-x-auto">
              {[
                ["template", "Plantillas y contexto"],
                ["content", "Texto"],
                ["photo", "Foto"],
                ["design", "Diseño"],
                ["stickers", "Stickers y emojis"],
                ["pages", "Páginas"],
              ].map(([key, label]) => (
                <button key={key} onClick={() => setActivePanel(key)}
                  className={`min-h-11 shrink-0 rounded-xl px-4 text-sm font-black ${activePanel === key ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 grid items-start gap-3 xl:grid-cols-[310px_minmax(420px,1fr)_340px]">
            <aside className="space-y-3">
              <Panel title="Páginas del carrusel" eyebrow={`${pages.length} DE 10`}>
                <div className="grid grid-cols-2 gap-2">
                  {pages.map((page, index) => (
                    <button key={page.id} onClick={() => setSelectedIndex(index)}
                      className={`overflow-hidden rounded-xl border-2 text-left ${index === selectedIndex ? "border-blue-600 shadow-lg" : "border-slate-100"}`}>
                      <SlideThumbnail page={page} index={index} total={pages.length} format={formatData} />
                    </button>
                  ))}
                </div>
                <button onClick={addPage} disabled={pages.length >= 10} className="mt-3 min-h-11 w-full rounded-xl bg-blue-600 font-black text-white disabled:opacity-40">
                  + Agregar página
                </button>
              </Panel>
            </aside>

            <main className="min-w-0">
              <div className="rounded-[2rem] border border-slate-200 bg-slate-200/70 p-3 shadow-xl">
                <div className="mx-auto w-full max-w-[620px] overflow-hidden rounded-[1.8rem] shadow-2xl"
                  style={{ aspectRatio: formatData.ratio }}>
                  <SlidePreview
                    page={selectedPage}
                    index={selectedIndex}
                    total={pages.length}
                    onChange={updatePage}
                    onChooseImage={() => fileInputRef.current?.click()}
                    selectedImageId={selectedImageId}
                    onSelectImage={(nextId) => {
                      setSelectedImageId(nextId);
                      setActivePanel("photo");
                    }}
                    onImageChange={(nextId, changes) =>
                      updatePage({
                        images: normalizeImages(selectedPage).map((image) =>
                          image.id === nextId ? { ...image, ...changes } : image
                        ),
                      })
                    }
                  />
                </div>
              </div>
            </main>

            <aside className="space-y-3">
              {activePanel === "template" && (
                <Panel title="Carrusel inteligente" eyebrow="CONTEXTO AUTOMÁTICO">
                  <p className="text-sm font-semibold text-slate-500">
                    El guion se adapta a <strong>{business?.rubro || profile.label}</strong>.
                  </p>
                  <Label text="Objetivo">
                    <div className="grid grid-cols-2 gap-2">
                      {CAROUSEL_OBJECTIVES.map((item) => (
                        <button key={item.id} onClick={() => generateTemplate({ objective: item.id })}
                          className={`rounded-xl p-3 text-left text-xs font-black ${objective === item.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}>
                          <span className="block text-xl">{item.emoji}</span>{item.label}
                        </button>
                      ))}
                    </div>
                  </Label>
                  <Label text="Cantidad de páginas">
                    <select value={pageCount} onChange={(event) => generateTemplate({ pageCount: Number(event.target.value) })} className="input">
                      {[4,5,6,7,8,9,10].map((count) => <option key={count} value={count}>{count} páginas</option>)}
                    </select>
                  </Label>
                  <Label text="Formato">
                    <select value={format} onChange={(event) => generateTemplate({ format: event.target.value })} className="input">
                      {Object.entries(CAROUSEL_FORMATS).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
                    </select>
                  </Label>
                </Panel>
              )}

              {activePanel === "content" && (
                <Panel title={`Editar página ${selectedIndex + 1}`} eyebrow="CONTENIDO">
                  <TextField label="Texto superior" value={selectedPage.eyebrow} onChange={(eyebrow) => updatePage({ eyebrow })} />
                  <TextArea label="Título principal" value={selectedPage.title} onChange={(title) => updatePage({ title })} />
                  <TextArea label="Explicación" value={selectedPage.body} onChange={(body) => updatePage({ body })} />
                  <TextField label="Llamado a la acción" value={selectedPage.cta} onChange={(cta) => updatePage({ cta })} />
                </Panel>
              )}

              {activePanel === "photo" && (
                <Panel title="Imágenes de esta página" eyebrow="EDICIÓN INDEPENDIENTE">
                  <button onClick={() => fileInputRef.current?.click()} className="min-h-14 w-full rounded-xl bg-blue-600 font-black text-white">
                    + Agregar otra imagen
                  </button>
                  <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
                    Arrastrá cada imagen sobre la diapositiva. Los textos siempre quedan por delante.
                  </p>
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {normalizeImages(selectedPage).map((image, imageIndex) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImageId(image.id)}
                        className={`aspect-square overflow-hidden rounded-xl border-2 ${
                          selectedImageId === image.id
                            ? "border-blue-600 ring-2 ring-blue-100"
                            : "border-slate-200"
                        }`}
                        title={`Imagen ${imageIndex + 1}`}
                      >
                        <img src={image.src} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                  {normalizeImages(selectedPage).length === 0 && (
                    <p className="mt-3 text-center text-sm font-bold text-slate-400">
                      Todavía no agregaste imágenes.
                    </p>
                  )}
                  {selectedImageId && (() => {
                    const image = normalizeImages(selectedPage).find(
                      (item) => item.id === selectedImageId
                    );
                    if (!image) return null;
                    return (
                      <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
                        <Range label="Ancho" value={image.width} min={10} max={120} onChange={(width) => updateSelectedImage({ width })} suffix="%" />
                        <Range label="Alto" value={image.height} min={10} max={120} onChange={(height) => updateSelectedImage({ height })} suffix="%" />
                        <Range label="Rotación" value={image.rotation} min={-180} max={180} onChange={(rotation) => updateSelectedImage({ rotation })} suffix="°" />
                        <Range label="Opacidad" value={Math.round(image.opacity * 100)} min={10} max={100} onChange={(opacity) => updateSelectedImage({ opacity: opacity / 100 })} suffix="%" />
                        <Label text="Filtro">
                          <select value={image.filter || "none"} onChange={(event) => updateSelectedImage({ filter: event.target.value })} className="input">
                            <option value="none">Sin filtro</option>
                            <option value="contrast(1.08) saturate(1.12)">Nítido</option>
                            <option value="saturate(1.32) contrast(1.08)">Intenso</option>
                            <option value="sepia(.22) saturate(1.12) contrast(1.05)">Cálido</option>
                            <option value="hue-rotate(175deg) saturate(.82)">Frío</option>
                            <option value="grayscale(1) contrast(1.12)">Blanco y negro</option>
                            <option value="contrast(1.18) saturate(.72) brightness(.88)">Cinematográfico</option>
                          </select>
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Action onClick={() => updateSelectedImage({
                            isBackground: true,
                            x: 50,
                            y: 50,
                            width: 100,
                            height: 100,
                            rotation: 0,
                            zIndex: 0,
                          })} text="Usar de fondo" />
                          <Action onClick={() => updateSelectedImage({
                            isBackground: false,
                            zIndex: normalizeImages(selectedPage).length + 1,
                          })} text="Traer adelante" />
                          <Action onClick={duplicateSelectedImage} text="Duplicar" />
                          <Action onClick={removeSelectedImage} text="Eliminar" danger />
                        </div>
                      </div>
                    );
                  })()}
                </Panel>
              )}

              {activePanel === "design" && (
                <Panel title="Estilo visual" eyebrow="DISEÑO">
                  <div className="grid grid-cols-2 gap-2">
                    {CAROUSEL_VISUAL_STYLES.map((style) => (
                      <button key={style.id} onClick={() => applyVisualStyle(style.id)}
                        className={`rounded-xl border-2 p-2 text-left ${styleId === style.id ? "border-blue-600" : "border-slate-100"}`}>
                        <span className="block h-12 rounded-lg" style={{ background: `linear-gradient(135deg,${style.colors.join(",")})` }} />
                        <span className="mt-2 block text-xs font-black">{style.name}</span>
                      </button>
                    ))}
                  </div>
                  <Label text="Tipografía">
                    <select value={selectedPage.font} onChange={(event) => updatePage({ font: event.target.value })} className="input">
                      {FONTS.map((font) => <option key={font}>{font}</option>)}
                    </select>
                  </Label>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <Color label="Fondo" value={selectedPage.background} onChange={(background) => updatePage({ background })} />
                    <Color label="Acento" value={selectedPage.accent} onChange={(accent) => updatePage({ accent })} />
                    <Color label="Texto" value={selectedPage.textColor} onChange={(textColor) => updatePage({ textColor })} />
                  </div>
                </Panel>
              )}

              {activePanel === "stickers" && (
                <Panel title="Stickers y emojis" eyebrow="ELEMENTOS">
                  <div className="grid grid-cols-5 gap-2">
                    {STICKERS.map((sticker) => (
                      <button key={sticker} onClick={() => updatePage({ emoji: sticker })}
                        className={`grid aspect-square place-items-center rounded-xl text-2xl ${selectedPage.emoji === sticker ? "bg-blue-100 ring-2 ring-blue-600" : "bg-slate-100"}`}>
                        {sticker}
                      </button>
                    ))}
                  </div>
                </Panel>
              )}

              {activePanel === "pages" && (
                <Panel title="Organizar páginas" eyebrow="ORDEN">
                  <div className="grid grid-cols-2 gap-2">
                    <Action onClick={() => movePage(-1)} text="← Mover" disabled={selectedIndex === 0} />
                    <Action onClick={() => movePage(1)} text="Mover →" disabled={selectedIndex === pages.length - 1} />
                    <Action onClick={duplicatePage} text="Duplicar" disabled={pages.length >= 10} />
                    <Action onClick={deletePage} text="Eliminar" danger disabled={pages.length <= 4} />
                  </div>
                </Panel>
              )}
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function SlideThumbnail({ page, index, total, format }) {
  const images = normalizeImages(page);
  return (
    <div
      className="relative w-full overflow-hidden text-white"
      style={{
        aspectRatio: format.ratio,
        background: `linear-gradient(145deg,${page.background},${page.accent})`,
        color: page.textColor,
        fontFamily: page.font,
      }}
    >
      <SlideDecoration type={page.decoration} accent={page.accent} />
      {[...images]
        .sort((a, b) => Number(a.zIndex || 0) - Number(b.zIndex || 0))
        .map((image) => {
          const style = image.isBackground
            ? { inset: 0, width: "100%", height: "100%", zIndex: 1 }
            : {
                left: `${image.x}%`,
                top: `${image.y}%`,
                width: `${image.width}%`,
                height: `${image.height}%`,
                zIndex: Math.min(15, 5 + Number(image.zIndex || 1)),
                transform: `translate(-50%, -50%) rotate(${image.rotation || 0}deg)`,
              };
          return (
            <img
              key={image.id}
              src={image.src}
              alt=""
              className={`absolute ${image.isBackground ? "object-cover" : "object-contain"}`}
              style={{
                ...style,
                opacity: image.opacity,
                filter: image.filter || "none",
                borderRadius: image.isBackground ? 0 : "3px",
              }}
            />
          );
        })}
      {images.some((image) => image.isBackground) && (
        <div className="absolute inset-0 z-[4] bg-gradient-to-t from-black/55 via-black/10 to-black/15" />
      )}
      <div className="absolute inset-x-[8%] top-[12%] z-20">
        <span className="block text-[5px] font-black uppercase tracking-wider opacity-80">
          {page.eyebrow}
        </span>
        <span className="mt-1 block text-[10px] font-black uppercase leading-[.95]">
          {page.title}
        </span>
        <span className="mt-1 block text-[5px] font-semibold leading-tight opacity-90">
          {page.body}
        </span>
      </div>
      <span className="absolute right-[7%] top-[5%] z-20 text-sm">{page.emoji}</span>
      <div className="absolute inset-x-[8%] bottom-[6%] z-20 flex justify-between border-t border-white/30 pt-1 text-[5px] font-black">
        <span>{page.cta}</span>
        <span>{index + 1}/{total}</span>
      </div>
    </div>
  );
}

function SlidePreview({
  page,
  index,
  total,
  onChange,
  onChooseImage,
  selectedImageId,
  onSelectImage,
  onImageChange,
}) {
  const images = normalizeImages(page);

  return (
    <div
      data-carousel-canvas
      className="relative h-full w-full overflow-hidden"
      style={{
        background: `linear-gradient(145deg,${page.background},${page.accent})`,
        color: page.textColor,
        fontFamily: page.font,
      }}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onSelectImage(null);
      }}
    >
      <SlideDecoration type={page.decoration} accent={page.accent} />
      {[...images]
        .sort((a, b) => Number(a.zIndex || 0) - Number(b.zIndex || 0))
        .map((image) => (
          <EditableSlideImage
            key={image.id}
            image={image}
            selected={selectedImageId === image.id}
            onSelect={() => onSelectImage(image.id)}
            onChange={(changes) => onImageChange(image.id, changes)}
          />
        ))}
      {images.some((image) => image.isBackground) && (
        <div className="pointer-events-none absolute inset-0 z-[4] bg-gradient-to-t from-black/55 via-black/10 to-black/15" />
      )}
      <button
        type="button"
        onClick={onChooseImage}
        className="absolute right-[3%] top-[3%] z-20 rounded-full bg-white/95 px-3 py-2 text-xs font-black text-slate-900 shadow-lg"
      >
        📷 Agregar imagen
      </button>
      <div className="absolute inset-x-[8%] top-[13%] z-20">
        <InlineText value={page.eyebrow} onChange={(eyebrow) => onChange({ eyebrow })} className="text-[clamp(9px,1.2vw,16px)] font-black uppercase tracking-[.2em] opacity-80" />
        <InlineText value={page.title} onChange={(title) => onChange({ title })} tag="h2" className="mt-[3%] text-[clamp(25px,4.2vw,58px)] font-black leading-[.95]" />
        <InlineText value={page.body} onChange={(body) => onChange({ body })} className="mt-[4%] max-w-[95%] text-[clamp(12px,1.75vw,24px)] font-semibold leading-snug opacity-90" />
      </div>
      <span className="pointer-events-none absolute right-[7%] top-[6%] z-20 text-[clamp(28px,5vw,68px)]">{page.emoji}</span>
      <div className="absolute inset-x-[8%] bottom-[6%] z-20 flex items-center justify-between gap-4 border-t border-white/30 pt-[3%]">
        <InlineText value={page.cta} onChange={(cta) => onChange({ cta })} className="text-[clamp(9px,1.25vw,17px)] font-black tracking-wide" />
        <span className="shrink-0 text-[clamp(10px,1.3vw,18px)] font-black">{index + 1}/{total}</span>
      </div>
    </div>
  );
}

function EditableSlideImage({ image, selected, onSelect, onChange }) {
  function beginMove(event) {
    event.preventDefault();
    event.stopPropagation();
    onSelect();
    if (image.isBackground) return;
    const canvas = event.currentTarget.closest("[data-carousel-canvas]");
    const bounds = canvas?.getBoundingClientRect();
    if (!bounds) return;
    const startX = event.clientX;
    const startY = event.clientY;
    const originX = Number(image.x || 50);
    const originY = Number(image.y || 50);

    function move(moveEvent) {
      onChange({
        x: Math.max(0, Math.min(100, originX + ((moveEvent.clientX - startX) / bounds.width) * 100)),
        y: Math.max(0, Math.min(100, originY + ((moveEvent.clientY - startY) / bounds.height) * 100)),
      });
    }
    function end() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
  }

  function beginResize(event) {
    event.preventDefault();
    event.stopPropagation();
    const canvas = event.currentTarget.closest("[data-carousel-canvas]");
    const bounds = canvas?.getBoundingClientRect();
    if (!bounds) return;
    const startX = event.clientX;
    const startY = event.clientY;
    const originWidth = Number(image.width || 40);
    const originHeight = Number(image.height || 40);
    function resize(moveEvent) {
      const deltaX = ((moveEvent.clientX - startX) / bounds.width) * 100;
      const deltaY = ((moveEvent.clientY - startY) / bounds.height) * 100;
      if (image.naturalAspect) {
        const canvasAspect = bounds.width / Math.max(1, bounds.height);
        let width = Math.max(10, Math.min(120, originWidth + deltaX));
        let height = (width * canvasAspect) / image.naturalAspect;
        if (height > 120) {
          height = 120;
          width = (height * image.naturalAspect) / canvasAspect;
        }
        onChange({ width, height });
      } else {
        onChange({
          width: Math.max(10, Math.min(120, originWidth + deltaX)),
          height: Math.max(10, Math.min(120, originHeight + deltaY)),
        });
      }
    }
    function end() {
      window.removeEventListener("pointermove", resize);
      window.removeEventListener("pointerup", end);
    }
    window.addEventListener("pointermove", resize);
    window.addEventListener("pointerup", end);
  }

  const style = image.isBackground
    ? {
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
        opacity: image.opacity,
        filter: image.filter || "none",
      }
    : {
        left: `${image.x}%`,
        top: `${image.y}%`,
        width: `${image.width}%`,
        height: `${image.height}%`,
        zIndex: Math.min(15, 5 + Number(image.zIndex || 1)),
        opacity: image.opacity,
        filter: image.filter || "none",
        transform: `translate(-50%, -50%) rotate(${image.rotation || 0}deg)`,
      };

  return (
    <div
      className={`absolute touch-none ${selected ? "ring-2 ring-white ring-offset-2 ring-offset-blue-500" : ""}`}
      style={style}
      onPointerDown={beginMove}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      <img
        src={image.src}
        alt=""
        draggable={false}
        onLoad={(event) => {
          if (image.isBackground || image.naturalAspect) return;
          const naturalAspect =
            event.currentTarget.naturalWidth /
            Math.max(1, event.currentTarget.naturalHeight);
          const canvas = event.currentTarget.closest("[data-carousel-canvas]");
          const bounds = canvas?.getBoundingClientRect();
          const fitted = fitImageBox(naturalAspect, {
            width: bounds?.width || 1,
            height: bounds?.height || 1,
          });
          onChange({ naturalAspect, ...fitted });
        }}
        className={`h-full w-full select-none ${image.isBackground ? "object-cover" : "rounded-xl object-contain shadow-2xl"}`}
      />
      {selected && !image.isBackground && (
        <>
          <span className="pointer-events-none absolute left-1 top-1 rounded-md bg-blue-600 px-2 py-1 text-[9px] font-black text-white">
            ARRASTRAR
          </span>
          <button
            type="button"
            aria-label="Cambiar tamaño"
            onPointerDown={beginResize}
            className="absolute -bottom-3 -right-3 h-7 w-7 cursor-se-resize rounded-full border-2 border-white bg-blue-600 shadow-lg"
          />
        </>
      )}
    </div>
  );
}

function InlineText({ value, onChange, className, tag: Tag = "p" }) {
  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      spellCheck
      title="Tocá para editar"
      onBlur={(event) => onChange(event.currentTarget.textContent || "")}
      onKeyDown={(event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
      className={`${className} cursor-text rounded-md outline-none transition hover:bg-white/10 focus:bg-white/15 focus:ring-2 focus:ring-white/70`}
    >
      {value}
    </Tag>
  );
}

function SlideDecoration({ type, accent }) {
  if (type === "grid") {
    return <div className="pointer-events-none absolute inset-0 opacity-15" style={{ backgroundImage: "linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)", backgroundSize: "38px 38px" }} />;
  }
  if (type === "lines" || type === "frame") {
    return <div className="pointer-events-none absolute inset-[4%] rounded-[1.4rem] border border-white/30" />;
  }
  if (type === "bubbles" || type === "orbs") {
    return <><span className="pointer-events-none absolute -right-[8%] -top-[6%] h-[34%] w-[34%] rounded-full bg-white/15" /><span className="pointer-events-none absolute -bottom-[9%] -left-[8%] h-[38%] w-[38%] rounded-full" style={{ backgroundColor: accent, opacity: .25 }} /></>;
  }
  if (type === "wave") {
    return <div className="pointer-events-none absolute -left-[10%] top-[35%] h-[25%] w-[120%] -rotate-6 rounded-[50%] bg-white/10" />;
  }
  if (type === "sun" || type === "spark" || type === "leaf") {
    return <span className="pointer-events-none absolute -left-[7%] top-[5%] text-[clamp(70px,14vw,180px)] opacity-10">{type === "sun" ? "☀" : type === "leaf" ? "◒" : "✦"}</span>;
  }
  return null;
}

function Panel({ title, eyebrow, children }) {
  return <section className="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-lg">
    <p className="text-[10px] font-black uppercase tracking-[.18em] text-blue-600">{eyebrow}</p>
    <h3 className="mt-1 text-xl font-black text-slate-950">{title}</h3>
    <div className="mt-4">{children}</div>
  </section>;
}

function Label({ text, children }) {
  return <label className="mt-4 block"><span className="mb-2 block text-sm font-black text-slate-700">{text}</span>{children}</label>;
}

function TextField({ label, value, onChange }) {
  return <Label text={label}><input value={value} onChange={(event) => onChange(event.target.value)} className="input" /></Label>;
}

function TextArea({ label, value, onChange }) {
  return <Label text={label}><textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} className="input resize-none" /></Label>;
}

function Color({ label, value, onChange }) {
  return <label className="text-center text-xs font-black text-slate-600"><input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="mb-1 h-12 w-full rounded-lg" />{label}</label>;
}

function Range({ label, value, min, max, onChange, suffix = "" }) {
  return <label className="block">
    <span className="mb-1 flex justify-between text-xs font-black text-slate-600">
      <span>{label}</span><span>{Math.round(Number(value || 0))}{suffix}</span>
    </span>
    <input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-blue-600" />
  </label>;
}

function Action({ text, onClick, disabled, danger }) {
  return <button onClick={onClick} disabled={disabled} className={`min-h-12 rounded-xl font-black disabled:opacity-35 ${danger ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-700"}`}>{text}</button>;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function wrapText(context, text, x, y, maxWidth, lineHeight, maxLines = 5) {
  const words = String(text || "").split(/\s+/);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (context.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  lines.slice(0, maxLines).forEach((item, index) => context.fillText(item, x, y + index * lineHeight));
  return lines.slice(0, maxLines).length;
}

async function renderPageToBlob(page, format, index, total) {
  const canvas = document.createElement("canvas");
  canvas.width = format.width;
  canvas.height = format.height;
  const context = canvas.getContext("2d");
  const gradient = context.createLinearGradient(0, 0, format.width, format.height);
  gradient.addColorStop(0, page.background);
  gradient.addColorStop(1, page.accent);
  context.fillStyle = gradient;
  context.fillRect(0, 0, format.width, format.height);
  drawExportDecoration(context, page, format);

  const exportImages = [...normalizeImages(page)].sort(
    (a, b) => Number(a.zIndex || 0) - Number(b.zIndex || 0)
  );
  for (const imageData of exportImages) {
    const image = await loadImage(imageData.src);
    const boxW = format.width * (Number(imageData.width || 40) / 100);
    const boxH = format.height * (Number(imageData.height || 40) / 100);
    const centerX = format.width * (Number(imageData.x || 50) / 100);
    const centerY = format.height * (Number(imageData.y || 50) / 100);
    context.save();
    context.globalAlpha = Number(imageData.opacity ?? 1);
    context.filter = imageData.filter || "none";
    context.translate(centerX, centerY);
    context.rotate((Number(imageData.rotation || 0) * Math.PI) / 180);
    const scale = imageData.isBackground
      ? Math.max(format.width / image.width, format.height / image.height)
      : Math.min(boxW / image.width, boxH / image.height);
    context.drawImage(
      image,
      (-image.width * scale) / 2,
      (-image.height * scale) / 2,
      image.width * scale,
      image.height * scale
    );
    context.restore();
  }
  if (exportImages.some((image) => image.isBackground)) {
    const overlay = context.createLinearGradient(0, 0, 0, format.height);
    overlay.addColorStop(0, "rgba(0,0,0,.16)");
    overlay.addColorStop(.55, "rgba(0,0,0,.20)");
    overlay.addColorStop(1, "rgba(0,0,0,.58)");
    context.fillStyle = overlay;
    context.fillRect(0, 0, format.width, format.height);
  }

  const contentTop = format.height * 0.13;
  const contentWidth = format.width * 0.82;

  const x = format.width * 0.08;
  const maxWidth = contentWidth;
  context.fillStyle = page.textColor;
  context.font = `900 ${Math.round(format.width * 0.028)}px ${page.font}`;
  context.fillText(String(page.eyebrow || "").toUpperCase(), x, contentTop);
  context.font = `900 ${Math.round(format.width * 0.072)}px ${page.font}`;
  const titleLines = wrapText(context, String(page.title || "").toUpperCase(), x, contentTop + format.height * 0.065, maxWidth, format.width * 0.072, 4);
  context.globalAlpha = 0.9;
  context.font = `600 ${Math.round(format.width * 0.032)}px ${page.font}`;
  wrapText(context, page.body, x, contentTop + format.height * 0.09 + titleLines * format.width * 0.072, maxWidth, format.width * 0.045, 4);
  context.globalAlpha = 1;
  context.font = `${Math.round(format.width * 0.065)}px Arial`;
  context.textAlign = "right";
  context.fillText(page.emoji || "✨", format.width * 0.92, format.height * 0.095);
  context.textAlign = "left";
  context.strokeStyle = "rgba(255,255,255,.35)";
  context.beginPath();
  context.moveTo(x, format.height * 0.91);
  context.lineTo(format.width * 0.92, format.height * 0.91);
  context.stroke();
  context.font = `900 ${Math.round(format.width * 0.022)}px ${page.font}`;
  context.fillText(page.cta || "", x, format.height * 0.95);
  context.textAlign = "right";
  context.fillText(`${index + 1}/${total}`, format.width * 0.92, format.height * 0.95);

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Exportación vacía")), "image/png")
  );
}

function drawExportDecoration(context, page, format) {
  context.save();
  context.globalAlpha = 0.14;
  context.strokeStyle = page.textColor;
  context.fillStyle = page.textColor;
  if (page.decoration === "grid") {
    const step = Math.round(format.width / 14);
    context.lineWidth = 1;
    for (let x = 0; x < format.width; x += step) {
      context.beginPath(); context.moveTo(x, 0); context.lineTo(x, format.height); context.stroke();
    }
    for (let y = 0; y < format.height; y += step) {
      context.beginPath(); context.moveTo(0, y); context.lineTo(format.width, y); context.stroke();
    }
  } else if (["lines", "frame"].includes(page.decoration)) {
    context.lineWidth = 2;
    context.strokeRect(format.width * .04, format.height * .04, format.width * .92, format.height * .92);
  } else if (["bubbles", "orbs"].includes(page.decoration)) {
    context.beginPath(); context.arc(format.width * .94, format.height * .06, format.width * .22, 0, Math.PI * 2); context.fill();
    context.beginPath(); context.arc(format.width * .03, format.height * .94, format.width * .25, 0, Math.PI * 2); context.fill();
  } else if (page.decoration === "wave") {
    context.beginPath();
    context.ellipse(format.width * .5, format.height * .48, format.width * .7, format.height * .13, -.12, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}
