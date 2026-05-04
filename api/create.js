export default function handler(req, res) {

  if(req.method !== "POST"){
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const data = req.body;

  console.log("Mottagen data:", data);

  // 🔥 just nu skickar vi bara tillbaka test-svar
  return res.status(200).json({
    success: true,
    url: "TEST-LÄNK-FUNKAR"
  });
}
