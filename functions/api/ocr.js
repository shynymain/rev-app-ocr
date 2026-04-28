export async function onRequestPost({ request, env }) {
  try {
    if (!env.AI) {
      return Response.json({
        ok: false,
        error: "Workers AI binding がありません。Cloudflareで AI binding を追加してください。"
      });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json({
        ok: false,
        error: "画像ファイルがありません"
      });
    }

    const imageBytes = new Uint8Array(await file.arrayBuffer());

    const aiResult = await env.AI.run("@cf/meta/llama-3.2-11b-vision-instruct", {
      image: imageBytes,
      temperature: 0,
      prompt: `
あなたは競馬画像専用OCRです。
必ずJSONだけで返してください。
説明文、Markdown、コードブロックは禁止。

出力形式：
{
  "raceInfo": {
    "date": "",
    "venue": "",
    "raceName": "",
    "grade": "",
    "surface": "",
    "distance": "",
    "heads": "",
    "condition": "",
    "age": ""
  },
  "horses": [
    {
      "frame": "",
      "number": "",
      "name": "",
      "last1": "",
      "last2": "",
      "last3": "",
      "odds": "",
      "popularity": ""
    }
  ],
  "result": {
    "first": "",
    "second": "",
    "third": "",
    "umaren": "",
    "umarenPay": "",
    "sanrenpuku": "",
    "sanrenpukuPay": ""
  },
  "text": ""
}

画像から読めない項目は空文字にしてください。
馬番は必ず数字だけ。
前走、前2走、前3走は着順数字だけ。
取消、中止、除外は「0」にしてください。
単勝オッズが読める場合は odds に入れてください。
人気が読めない場合は空文字でよいです。
`
    });

    let text = "";

    if (typeof aiResult === "string") {
      text = aiResult;
    } else if (aiResult.response) {
      text = aiResult.response;
    } else {
      text = JSON.stringify(aiResult);
    }

    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) {
      return Response.json({
        ok: false,
        error: "JSONを抽出できません",
        raw: text
      });
    }

    const jsonText = text.slice(start, end + 1);

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      return Response.json({
        ok: false,
        error: "JSON.parse失敗",
        raw: jsonText
      });
    }

    return Response.json({
      ok: true,
      data: parsed
    });

  } catch (e) {
    return Response.json({
      ok: false,
      error: String(e.message || e)
    });
  }
}
