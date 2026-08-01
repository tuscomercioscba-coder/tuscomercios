import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../supabase";
import {
  getStoryVisitorId,
  markStorySeen,
  normalizeStoryPlan,
} from "./storyUtils";

export default function StoryViewer({
  businesses,
  stories,
  initialBusinessId,
  onClose,
}) {
  const timerRef = useRef(null);
  const groups = useMemo(() => {
    const businessMap = new Map(businesses.map((item) => [item.id, item]));
    return businesses
      .map((business) => ({
        business,
        stories: stories
          .filter((story) => story.business_id === business.id)
          .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at)),
      }))
      .filter((group) => group.stories.length)
      .sort((a, b) => {
        const order = { premium: 1, standard: 2, free: 3 };
        return (
          order[normalizeStoryPlan(a.business.plan)] -
            order[normalizeStoryPlan(b.business.plan)] ||
          a.business.negocio.localeCompare(b.business.negocio)
        );
      })
      .filter((group) => businessMap.has(group.business.id));
  }, [businesses, stories]);

  const initialGroup = Math.max(
    0,
    groups.findIndex((group) => group.business.id === initialBusinessId)
  );
  const [groupIndex, setGroupIndex] = useState(initialGroup);
  const [storyIndex, setStoryIndex] = useState(0);
  const group = groups[groupIndex];
  const story = group?.stories[storyIndex];

  useEffect(() => {
    setGroupIndex(initialGroup);
    setStoryIndex(0);
  }, [initialBusinessId, initialGroup]);

  useEffect(() => {
    if (!story) return;
    clearTimeout(timerRef.current);
    markStorySeen(story.id);
    supabase.from("story_views").insert({
      story_id: story.id,
      visitor_id: getStoryVisitorId(),
    }).then(() => {});

    if (story.media_type === "image") {
      timerRef.current = setTimeout(() => next(), 5000);
    }
    return () => clearTimeout(timerRef.current);
  }, [story?.id]);

  function next() {
    if (!group) return onClose();
    if (storyIndex < group.stories.length - 1) {
      setStoryIndex((value) => value + 1);
      return;
    }
    if (groupIndex < groups.length - 1) {
      setGroupIndex((value) => value + 1);
      setStoryIndex(0);
      return;
    }
    onClose();
  }

  function previous() {
    if (storyIndex > 0) {
      setStoryIndex((value) => value - 1);
      return;
    }
    if (groupIndex > 0) {
      const previousGroup = groups[groupIndex - 1];
      setGroupIndex((value) => value - 1);
      setStoryIndex(previousGroup.stories.length - 1);
    }
  }

  async function handleAction() {
    if (!story || story.cta_type === "none") return;
    await supabase.from("story_clicks").insert({
      story_id: story.id,
      business_id: story.business_id,
      visitor_id: getStoryVisitorId(),
      destination: story.cta_type,
    });
    if (story.cta_url) window.open(story.cta_url, "_blank", "noopener,noreferrer");
  }

  async function reportStory() {
    const reason = window.prompt(
      "¿Por qué querés denunciar esta historia? (contenido engañoso, ofensivo o inapropiado)"
    );
    if (!reason?.trim()) return;
    await supabase.from("story_reports").insert({
      story_id: story.id,
      visitor_id: getStoryVisitorId(),
      reason: reason.trim().slice(0, 100),
    });
    alert("Denuncia enviada. La revisará nuestro equipo.");
  }

  if (!story || !group) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/95 p-0 sm:p-4">
      <div className="relative h-full w-full overflow-hidden bg-black sm:h-[92vh] sm:max-w-md sm:rounded-[2rem]">
        <div className="absolute inset-x-0 top-0 z-20 p-3">
          <div className="mb-3 flex gap-1">
            {group.stories.map((item, itemIndex) => (
              <span
                key={item.id}
                className={`h-1 flex-1 rounded-full ${
                  itemIndex <= storyIndex ? "bg-white" : "bg-white/35"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3 text-white">
            <img
              src={group.business.image || "/no-image.jpg"}
              className="h-10 w-10 rounded-full border-2 border-white object-cover"
              alt=""
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-black">{group.business.negocio}</p>
              <p className="text-xs text-white/75">Historia de TusComercios</p>
            </div>
            <button onClick={reportStory} className="px-2 text-xl" title="Denunciar">
              ⋯
            </button>
            <button onClick={onClose} className="text-3xl" aria-label="Cerrar">
              ×
            </button>
          </div>
        </div>

        {story.media_type === "video" ? (
          <video
            key={story.id}
            src={story.media_url}
            autoPlay
            muted
            controls
            playsInline
            preload="metadata"
            onEnded={next}
            className="h-full w-full object-contain"
          />
        ) : (
          <img
            src={story.media_url}
            alt={story.caption || group.business.negocio}
            className="h-full w-full object-contain"
          />
        )}

        <button
          onClick={previous}
          className="absolute inset-y-24 left-0 z-10 w-1/3"
          aria-label="Historia anterior"
        />
        <button
          onClick={next}
          className="absolute inset-y-24 right-0 z-10 w-1/3"
          aria-label="Historia siguiente"
        />

        <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 to-transparent p-5 pt-20 text-white">
          {story.caption && (
            <p className="mb-4 text-center text-lg font-bold">{story.caption}</p>
          )}
          {story.cta_type !== "none" && (
            <button
              onClick={handleAction}
              className="w-full rounded-2xl bg-white px-5 py-4 font-black text-slate-950"
            >
              {story.cta_label || "Ver más"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
