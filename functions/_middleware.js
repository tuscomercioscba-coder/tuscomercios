import {
  renderSocialPreview,
  shouldRenderSocialPreview,
} from "./lib/social-preview.js";
import { withSecurityHeaders } from "./lib/security.js";

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  if (
    !url.pathname.startsWith("/api") &&
    !url.pathname.includes(".") &&
    shouldRenderSocialPreview(
      request.url,
      request.headers.get("user-agent") || ""
    )
  ) {
    try {
      const preview = await renderSocialPreview({ request, env });
      if (preview) return preview;
    } catch (error) {
      console.error("SOCIAL PREVIEW ERROR", error);
    }
  }

  return withSecurityHeaders(await next());
}
