# Base de conocimiento de Mentor IA

Esta carpeta es el manual operativo que usa la Edge Function `mentor-ia`.

## Regla de mantenimiento
Cuando se agrega, elimina o cambia una función de Studio, actualizar únicamente el archivo del módulo correspondiente. `index.ts` reúne los módulos automáticamente mediante importaciones estáticas compatibles con Supabase Edge Functions.

## Archivos activos
- `rules.ts`: reglas de veracidad.
- `platform.ts`: plataforma, buscador y vidrieras.
- `plans.ts`: acceso y límites.
- `brand-kit.ts`: identidad de marca.
- `image-editor.ts`: editor de imágenes.
- `reels-studio.ts`: editor de reels.
- `library.ts`: biblioteca.
- `analytics.ts`: métricas y panel.
- `mentor.ts`: capacidades de Mentor.
- `help-roadmap.ts`: ayuda y futuro.

Los `.ts` son la fuente que realmente lee Mentor. No importar archivos `.md` directamente en la Edge Function.
