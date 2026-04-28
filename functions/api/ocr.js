export async function onRequestPost({ request, env }) {
  try {
    if (!env.AI) {
      return Response.json({
        ok: false,
        error: "Workers AI binding がありません。Cloudflareで変数名 AI の binding を追加してください。"
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

    const prompt = `
あなたは競馬画像専用OCRです。
必ずJSONだけで返してください。
説明文、Markdown、コードブロックは禁止です。

画像から読み取れる情報だけを返してください。
不明な値は空文字 "" にしてください。
推測は禁止です。

出馬表・オッズ・結果・払戻のどれかを判定して、以下のJSON形式で返してください。

{
  "ok": true,
  "type": "race_card | odds | result | unknown",
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
  "results": {
    "first": {
      "number": "",
      "name": ""
    },
    "second": {
      "number": "",
      "name": ""
    },
    "third": {
      "number": "",
      "name": ""
    },
    "quinella": [
      {
        "numbers": "",
        "payout": ""
      }
    ],
    "trio": [
      {
        "numbers": "",
        "payout": ""
      }
    ]
  }
}

単勝オッズ画像の場合：
- 先頭の数字は必ず馬番として扱う
- 馬名の後ろの数字は単勝オッズとして扱う
- 人気が無い場合 popularity は空文字
- odds に単勝オッズを入れる

出馬表画像の場合：
- 馬番、馬名、前走、前2走、前3走を読む
- 中止、取消、除外はその文字で返す
- 読めない着順は空文字

結果画像の場合：
- 1着、2着、3着の馬番と馬名を読む
- 馬連、3連複の組み合わせと払戻を読む
- 同着などで複数組み合わせがある場合は配列に複数入れる

必ずJSONのみ。
`;

    const aiResult = await env.AI.run(
      "@cf/meta/llama-3.2-11b-vision-instruct",
      {
        image: imageBytes,
        prompt,
        temperature: 0,
        max_tokens: 2000
      }
    );

    let text = "";

    if (typeof aiResult === "string") {
      text = aiResult;
    } else if (aiResult && typeof aiResult.response === "string") {
      text = aiResult.response;
    } else if (aiResult && typeof aiResult.text === "string") {
      text = aiResult.text;
    } else {
      text = JSON.stringify(aiResult);
    }

    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch (e) {
      parsed = {
        ok: false,
        type: "unknown",
        raw: text,
        error: "AIの返答をJSONとして解析できませんでした"
      };
    }

    return Response.json({
      ok: true,
      data: parsed,
      raw: text
    });

  } catch (error) {
    return Response.json({
      ok: false,
      error: error.message || String(error)
    });
  }
}

export async function onRequestGet() {
  return Response.json({
    ok: true,
    message: "OCR API is running. Use POST with image file."
  });
}  },
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
  }
}
`
    });

    let text = "";

    if (typeof  },
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
  }
}
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

    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) {
      return Response.json({ ok: false, error: "JSON抽出失敗", raw: text });
    }

    const parsed = JSON.parse(text.slice(start, end + 1));

    return Response.json({ ok: true, data: parsed });

  } catch (e) {
    return Response.json({ ok: false, error: String(e.message || e) });
  }
}

export async function onRequestGet() {
  return Response.json({
    ok: true,
    message: "OCR API is running"
  });
}    "age": ""
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

読めない項目は空文字。
馬番・枠・着順は数字だけ。
取消/中止/除外は0。
`
    });

    let text = "";

    if (typeof aiResult === "string") {
      text = aiResult;
    } else if (aiResult.response) {
      text = aiResult.response;
    } else if (aiResult.result) {
      text = aiResult.result;
    } else if (aiResult.text) {
      text = aiResult.text;
    } else {
      text = JSON.stringify(aiResult);
    }

    text = String(text)
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) {
      return Response.json({ ok: false, error: "JSONを抽出できません", raw: text });
    }

    const parsed = JSON.parse(text.slice(start, end + 1));

    return Response.json({ ok: true, data: parsed });

  } catch (e) {
    return Response.json({ ok: false, error: String(e.message || e) });
  }
}

export async function onRequestGet() {
  return Response.json({
    ok: true,
    message: "OCR API is running. Use POST with image file."
  });
}    "third": "",
    "umaren": "",
    "umarenPay": "",
    "sanrenpuku": "",
    "sanrenpukuPay": ""
  },
  "text": ""
}

ルール：
- 読めない項目は空文字にする
- 馬番は数字だけ
- 枠は数字だけ
- 前走、前2走、前3走は着順数字だけ
- 取消、中止、除外は 0
- 単勝オッズは odds に入れる
- 人気が読める場合は popularity に入れる
- 結果画像なら first / second / third / umaren / sanrenpuku を入れる
- 出馬表画像なら horses をできるだけ全頭入れる
`
    });

    let text = "";

    if (typeof aiResult === "string") {
      text = aiResult;
    } else if (aiResult.response) {
      text = aiResult.response;
    } else if (aiResult.result) {
      text = aiResult.result;
    } else if (aiResult.text) {
      text = aiResult.text;
    } else {
      text = JSON.stringify(aiResult);
    }

    text = String(text)
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

export async function onRequestGet() {
  return Response.json({
    ok: true,
    message: "OCR API is running. Use POST with image file."
  });
}    "age": ""
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

ルール：
- 読めない項目は空文字
- 馬番は数字だけ
- 枠は数字だけ
- 前走、前2走、前3走は着順数字だけ
- 取消/中止/除外は0
- 単勝オッズは odds
- 人気は分かる場合のみ popularity
`
    });

    let text = "";

    if (typeof aiResult === "string") {
      text = aiResult;
    } else if (aiResult.response) {
      text = aiResult.response;
    } else if (aiResult.result) {
      text = aiResult.result;
    } else {
      text = JSON.stringify(aiResult);
    }

    text = String(text)
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
}    "surface": "",
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
