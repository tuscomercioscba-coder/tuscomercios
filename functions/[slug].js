import {
  renderSocialPreview,
  shouldRenderSocialPreview,
} from "./lib/social-preview.js";

export async function onRequest({ request, env }) {
  if (
    shouldRenderSocialPreview(
      request.url,
      request.headers.get("user-agent") || ""
    )
  ) {
    const preview = await renderSocialPreview({ request, env });
    if (preview) return preview;
  }

  return env.ASSETS.fetch(request);
}
