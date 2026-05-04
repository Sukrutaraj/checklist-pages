export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(200).json({ message: "Only POST allowed" });
  }

  const data = req.body;

  const html = `
  <html>
  <body style="font-family:sans-serif;padding:20px;">
  <h2>${data.title}</h2>

  ${data.steps.map((s,i)=>`
    <div style="margin-bottom:20px;">
      <b>${i+1}. ${s.text || ""}</b><br>
      ${s.img ? `<img src="${s.img}" style="max-width:200px;"><br>` : ""}
      ${s.audio ? `<button onclick="new Audio('${s.audio}').play()">🔊</button>` : ""}
      <br><input type="checkbox"> Klar
    </div>
  `).join("")}

  </body>
  </html>
  `;

  const filename = "checklist-" + Date.now() + ".html";

  const response = await fetch(`https://api.github.com/repos/Sukrutaraj/checklist-pages/contents/${filename}`, {
    method: "PUT",
    headers: {
      "Authorization": `token ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "new checklist",
      content: Buffer.from(html).toString("base64")
    })
  });

  const result = await response.json();

  const url = `https://Sukrutaraj.github.io/checklist-pages/${filename}`;

  res.status(200).json({ url });
}
