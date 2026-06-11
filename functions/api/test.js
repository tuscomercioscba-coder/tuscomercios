export async function onRequest() {
  return Response.json({
    ok: true,
    message: "Cloudflare Functions funcionando",
  });
}