import { createElement, ELEMENT_TYPES } from "../Utils/constants";

export function createInitialProject({
  width = 1080,
  height = 1080,
  background,
  title = "NOVEDAD",
  subtitle = "Nuevo ingreso disponible.",
  image = "",
  logo = "",
} = {}) {
  return {
    width,
    height,
    background:
      background || {
        type: "linear",
        colors: ["#020617", "#312e81", "#0f172a"],
        stops: [0, 0.5, 1],
      },
    elements: [
      createElement(ELEMENT_TYPES.IMAGE, {
        id: "main-image",
        name: "Imagen principal",
        x: 0,
        y: 0,
        width,
        height,
        src: image,
        cornerRadius: 0,
        shadowEnabled: false,
      }),
      createElement(ELEMENT_TYPES.TEXT, {
        id: "title",
        name: "Título",
        x: 80,
        y: Math.max(100, height - 390),
        width: Math.min(width - 160, 850),
        height: 150,
        text: title,
        fontSize: 108,
      }),
      createElement(ELEMENT_TYPES.TEXT, {
        id: "subtitle",
        name: "Subtítulo",
        x: 84,
        y: Math.max(250, height - 220),
        width: Math.min(width - 168, 760),
        height: 120,
        text: subtitle,
        fontSize: 38,
        fontStyle: "normal",
      }),
      ...(logo
        ? [
            createElement(ELEMENT_TYPES.LOGO, {
              id: "logo",
              name: "Logo",
              x: Math.max(40, width - 230),
              y: 60,
              width: 170,
              height: 170,
              src: logo,
            }),
          ]
        : []),
    ],
  };
}
