import {
  V5_REEL_GOALS,
  V5_SCENE_LENGTHS,
} from "./reelV5Presets";

export function buildAutomaticStoryboard({
  goal = "promotion",
  media = [],
  business = {},
  idea = "",
  targetDuration,
}) {
  const goalConfig =
    V5_REEL_GOALS.find((item) => item.id === goal) ||
    V5_REEL_GOALS[0];

  const duration =
    Number(targetDuration || goalConfig.duration || 15);

  const usable = media.filter((item) => item?.src);
  const maxScenes = Math.max(3, Math.min(8, usable.length || 3));

  const selected = usable.slice(0, maxScenes);

  if (!selected.length) {
    selected.push({
      id: "empty-scene",
      src: business.image || business.logo || "",
      type: "image",
      source: "business",
    });
  }

  const sceneDuration = Math.max(
    1.8,
    duration / selected.length
  );

  return selected.map((item, index) => {
    const isFirst = index === 0;
    const isLast = index === selected.length - 1;

    return {
      id: `scene-${Date.now()}-${index}`,
      media: item.src,
      mediaType: item.type || "image",
      mediaSource: item.source || "business",
      duration: Math.max(
        V5_SCENE_LENGTHS[item.type] || 2.5,
        sceneDuration
      ),
      title: getSceneTitle({
        index,
        isFirst,
        isLast,
        goal,
        business,
        idea,
      }),
      subtitle: getSceneSubtitle({
        index,
        isFirst,
        isLast,
        goal,
        business,
      }),
      cameraMovement: getCameraMovement(index, item.type),
      cameraEasing: index % 2 === 0 ? "cinematic" : "smooth",
      transition: getTransition(index),
      transitionDuration: 0.45,
      textPosition: isLast ? "center" : index % 2 === 0 ? "bottom" : "top",
      textAlign: "center",
      textAnimation: isFirst ? "fade" : index % 2 === 0 ? "slideUp" : "pop",
      showLogo: isFirst || isLast,
      showCta: isLast,
      cta:
        business.whatsapp || business.telefono
          ? "Consultá ahora"
          : "Conocé más",
      project: item.project || null,
    };
  });
}

function getSceneTitle({
  index,
  isFirst,
  isLast,
  goal,
  business,
  idea,
}) {
  const name =
    business.negocio ||
    business.name ||
    "Tu comercio";

  if (isFirst) {
    return idea?.trim() || name;
  }

  if (isLast) {
    return goal === "platform"
      ? "Encontrá todo en TusComercios"
      : "Estamos para ayudarte";
  }

  const titles = {
    promotion: ["Una oportunidad especial", "Calidad y buen precio", "No te lo pierdas"],
    presentation: ["Conocenos", "Todo lo que necesitás", "Atención personalizada"],
    product: ["Mirá estos productos", "Elegí tu favorito", "Consultá disponibilidad"],
    branding: ["Una propuesta diferente", "Calidad que se nota", "Pensado para vos"],
    platform: ["Buscá por categoría", "Descubrí comercios", "Contactá fácilmente"],
  };

  const options = titles[goal] || titles.promotion;
  return options[(index - 1) % options.length];
}

function getSceneSubtitle({
  index,
  isFirst,
  isLast,
  goal,
  business,
}) {
  if (isFirst) {
    return business.descripcion || business.rubro || "";
  }

  if (isLast) {
    return business.ciudad
      ? `${business.ciudad} · Contactanos`
      : "Contactanos";
  }

  return goal === "platform"
    ? "Comercios, servicios y profesionales en un solo lugar."
    : "Consultanos para recibir más información.";
}

function getCameraMovement(index, mediaType) {
  if (mediaType === "video") {
    return index % 2 === 0 ? "pushIn" : "floating";
  }

  const movements = [
    "kenBurns",
    "pushIn",
    "panRight",
    "pushOut",
    "panLeft",
    "diagonalPush",
  ];

  return movements[index % movements.length];
}

function getTransition(index) {
  const transitions = [
    "fade",
    "smooth",
    "zoom",
    "flash",
    "push",
  ];

  return transitions[index % transitions.length];
}
