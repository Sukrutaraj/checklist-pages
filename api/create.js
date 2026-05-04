export default async function handler(req, res) {

  // 🔥 CORS (löser fetch error)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 🔥 preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {

    const data = req.body;

    const token = process.env.GITHUB_TOKEN;
    const owner = "Sukrutaraj";
    const repo = "checklist-pages";

    const filename = `checklist-${Date.now()}.html`;

    // 🎯 bygg HTML
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${data.title}</title>
    </head>
    <body style="font-family:sans-serif;padding:20px;">
      <h2>${data.title}</h2>
    `;

    (data.steps || []).forEach((step, i) => {

      if (!step.text && !step.img && !step.audio) return;

      html += `<div style="margin-bottom:20px;">`;

      html += `<b>${i + 1}. ${step.text || ""}</b><br>`;

      if (step.img) {
        html += `<img src="${step.img}" style="max-width:300px;"><br>`;
      }

      if (step.audio) {
        html += `<button onclick="new Audio('${step.audio}').play()">🔊 Spela</button><br>`;
      }

      html += `</div>`;
    });

    html += `</body></html>`;

    // 🔥 skicka till GitHub
    const githubRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filename}`,
      {
        method: "PUT",
        headers: {
          "Authorization": `token ${token}`, // ✅ viktigt
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: "create checklist",
          content: Buffer.from(html).toString("base64")
        })
      }
    );

    const result = await githubRes.json();

    // 🔥 om lyckad
    if (result.content) {

      const url = `https://${owner}.github.io/${repo}/${filename}`;

      return res.status(200).json({
        success: true,
        url: url
      });

    } else {

      // 🔥 visa exakt GitHub-fel
      return res.status(500).json({
        error: "GitHub error",
        details: result
      });

    }

  } catch (err) {

    return res.status(500).json({
      error: "Server error",
      message: err.message
    });

  }
}
