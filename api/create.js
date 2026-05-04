export default async function handler(req, res) {

  if(req.method !== "POST"){
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try{

    const data = req.body;

    const token = process.env.GITHUB_TOKEN;
    const repo = "checklist-pages";
    const owner = "Sukrutaraj";

    const filename = `checklist-${Date.now()}.html`;

    // 🧠 skapa HTML från checklistData
    let html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:sans-serif;padding:20px;">
    <h2>${data.title}</h2>
    `;

    (data.steps || []).forEach((step,i)=>{
      if(!step.text) return;

      html += `<div style="margin-bottom:20px;">
      <b>${i+1}. ${step.text}</b><br>`;

      if(step.img){
        html += `<img src="${step.img}" style="max-width:300px;"><br>`;
      }

      if(step.audio){
        html += `<button onclick="new Audio('${step.audio}').play()">🔊</button>`;
      }

      html += `</div>`;
    });

    html += `</body></html>`;

    // 🔥 GitHub API upload
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filename}`, {
      method: "PUT",
      headers: {
        "Authorization": `token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "new checklist",
        content: Buffer.from(html).toString("base64")
      })
    });

    const result = await response.json();

    if(result.content){

      const url = `https://${owner}.github.io/${repo}/${filename}`;

      return res.status(200).json({
        success: true,
        url: url
      });

    }else{
      return res.status(500).json({ error: result });
    }

  }catch(err){
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
