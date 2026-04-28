export async function onRequestPost({ request }) {
  return new Response(JSON.stringify({
    ok: true,
    message: "OCR API動作OK"
  }), {
    headers: { "Content-Type": "application/json" }
  });
}
