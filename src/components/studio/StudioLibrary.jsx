import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import {
  deleteStudioLibraryItem,
  duplicateStudioLibraryItem,
  getStudioLibrary,
  renameStudioLibraryItem,
} from "../../Studio/StudioLibraryService";

export default function StudioLibrary({
  selectedItem,
}) {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [workingId, setWorkingId] = useState("");

  useEffect(() => {
    loadLibrary();
  }, [selectedItem?.id]);

  async function loadLibrary() {
    if (!selectedItem?.id) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const data = await getStudioLibrary({
        userId: user.id,
        businessId: selectedItem.id,
      });

      setItems(data);
    } catch (error) {
      console.error(error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  function editItem(item) {
    const projectUrl =
      item?.metadata?.project_url || "";

    if (!projectUrl) {
      alert(
        "Este contenido no tiene un proyecto editable guardado."
      );
      return;
    }

    const entityType =
      selectedItem?.entityType === "workspace"
        ? "workspace"
        : "business";

    const editorPath =
      item.content_type === "carousel"
        ? "carrusel"
        : "imagen";

    navigate(`/studio/${editorPath}/${entityType}/${selectedItem.id}?project=${encodeURIComponent(projectUrl)}`);
  }

  async function renameItem(item) {
    const nextTitle = window.prompt(
      "Nuevo nombre para este contenido:",
      item.title || "Contenido de Studio"
    );
    if (!nextTitle?.trim()) return;
    try {
      setWorkingId(item.id);
      const updated = await renameStudioLibraryItem(item, nextTitle);
      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === item.id ? updated : currentItem
        )
      );
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo cambiar el nombre.");
    } finally {
      setWorkingId("");
    }
  }

  async function duplicateItem(item) {
    try {
      setWorkingId(item.id);
      const duplicated = await duplicateStudioLibraryItem(item);
      setItems((current) => [duplicated, ...current]);
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo duplicar el contenido.");
    } finally {
      setWorkingId("");
    }
  }

  async function deleteItem(item) {
    const confirmed = window.confirm(
      "¿Querés eliminar este contenido de la Biblioteca?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(item.id);

      await deleteStudioLibraryItem(item);

      setItems((current) =>
        current.filter(
          (currentItem) =>
            currentItem.id !== item.id
        )
      );
    } catch (error) {
      console.error(error);

      alert(
        "No se pudo eliminar el contenido."
      );
    } finally {
      setDeletingId("");
    }
  }

  const visibleItems = useMemo(() => {
    const cleanSearch = search
      .trim()
      .toLowerCase();

    return items.filter((item) => {
      const matchesFilter =
        filter === "all" ||
        item.content_type === filter;

      const matchesSearch =
        !cleanSearch ||
        String(item.title || "")
          .toLowerCase()
          .includes(cleanSearch);

      return (
        matchesFilter &&
        matchesSearch
      );
    });
  }, [items, filter, search]);

  return (
    <section className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-xl sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-950 md:text-3xl">
            Biblioteca
          </h2>

          <p className="mt-2 font-semibold text-slate-500">
            Todo el contenido creado para el comercio seleccionado.
          </p>
        </div>

        <button
          type="button"
          onClick={loadLibrary}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700"
        >
          Actualizar
        </button>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto]">
        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Buscar contenido..."
          className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 font-semibold outline-none focus:ring-4 focus:ring-blue-100"
        />

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <FilterButton
            active={filter === "all"}
            onClick={() => setFilter("all")}
          >
            Todo
          </FilterButton>

          <FilterButton
            active={filter === "image"}
            onClick={() => setFilter("image")}
          >
            Imágenes
          </FilterButton>

          <FilterButton
            active={filter === "reel"}
            onClick={() => setFilter("reel")}
          >
            Reels
          </FilterButton>

          <FilterButton
            active={filter === "carousel"}
            onClick={() => setFilter("carousel")}
          >
            Carruseles
          </FilterButton>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

            <p className="mt-4 font-black text-slate-600">
              Cargando Biblioteca...
            </p>
          </div>
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="mt-6 rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center">
          <div className="text-5xl">
            📚
          </div>

          <h3 className="mt-4 text-xl font-black text-slate-900">
            Todavía no hay contenido
          </h3>

          <p className="mt-2 font-semibold text-slate-500">
            Las imágenes, reels y carruseles exportados aparecerán automáticamente acá.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleItems.map((item) => {
            const editable =
              ["image", "carousel"].includes(item.content_type) &&
              Boolean(item?.metadata?.project_url);
            const isReel = item.content_type === "reel";
            const isCarousel = item.content_type === "carousel";
            const downloadUrl =
              item?.metadata?.download_url || item.file_url;

            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-lg"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  {isReel ? (
                    <video
                      src={
                        item.thumbnail_url ||
                        item.file_url
                      }
                      className="h-full w-full object-cover"
                      muted
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={
                        item.thumbnail_url ||
                        item.file_url
                      }
                      alt={item.title || ""}
                      className="h-full w-full object-cover"
                    />
                  )}

                  <div className="absolute left-3 top-3 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-black text-white">
                    {isReel
                      ? "🎬 Reel"
                      : isCarousel
                        ? "📚 Carrusel"
                        : "🖼️ Imagen"}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="line-clamp-2 font-black text-slate-950">
                    {item.title ||
                      "Contenido de Studio"}
                  </h3>

                  <p className="mt-2 text-xs font-bold text-slate-400">
                    {new Date(
                      item.created_at
                    ).toLocaleString("es-AR")}
                  </p>

                  {editable && (
                    <button
                      type="button"
                      onClick={() =>
                        editItem(item)
                      }
                      className="mt-4 min-h-11 w-full rounded-xl bg-violet-600 px-3 text-sm font-black text-white"
                    >
                      ✏️ Editar proyecto
                    </button>
                  )}

                  <div className={`${editable ? "mt-2" : "mt-4"} grid grid-cols-2 gap-2`}>
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-3 text-sm font-black text-white"
                    >
                      Ver
                    </a>

                    <a
                      href={downloadUrl}
                      download
                      className="flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-3 text-sm font-black text-white"
                    >
                      Descargar
                    </a>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => renameItem(item)}
                      disabled={workingId === item.id}
                      className="min-h-10 rounded-xl bg-slate-100 px-2 text-xs font-black text-slate-700 disabled:opacity-50"
                    >
                      Renombrar
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateItem(item)}
                      disabled={workingId === item.id}
                      className="min-h-10 rounded-xl bg-amber-50 px-2 text-xs font-black text-amber-700 disabled:opacity-50"
                    >
                      Duplicar
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      deleteItem(item)
                    }
                    disabled={
                      deletingId === item.id
                    }
                    className="mt-2 min-h-11 w-full rounded-xl bg-red-50 text-sm font-black text-red-600 disabled:opacity-50"
                  >
                    {deletingId === item.id
                      ? "Eliminando..."
                      : "Eliminar"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-12 rounded-2xl px-3 text-sm font-black transition ${
        active
          ? "bg-blue-600 text-white"
          : "border border-slate-200 bg-white text-slate-600"
      }`}
    >
      {children}
    </button>
  );
}
