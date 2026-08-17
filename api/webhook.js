const axios = require('axios');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

async function repondreAuCommentaire(commentId) {
  const message = "مرحباً! يمكنك مشاهدة المسلسل/الفيلم عبر الرابط التالي: https://cyber-flix-mu.vercel.app/";

  try {
    await axios.post(`https://graph.facebook.com/v19.0/${commentId}/comments`, {
      message: message,
      access_token: PAGE_ACCESS_TOKEN
    });
    console.log("Réponse envoyée au commentaire avec succès !");
  } catch (error) {
    console.error("Erreur Graph API :", error.response ? error.response.data : error.message);
  }
}

export default async function handler(req, res) {
  const VERIFY_TOKEN = "cyberflix_secret_token_2026";

  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log("Webhook Meta vérifié avec succès !");
      return res.status(200).send(challenge);
    } else {
      return res.status(403).send("Forbidden");
    }
  }

  if (req.method === 'POST') {
    const body = req.body;

    if (body && body.object === 'page') {
      for (const entry of (body.entry || [])) {
        const change = entry.changes?.[0];
        if (change && change.field === 'feed' && change.value.item === 'comment' && change.value.verb === 'add') {
          const commentId = change.value.comment_id;
          const userMessage = change.value.message;
          console.log(`Nouveau commentaire : "${userMessage}" | ID: ${commentId}`);
          
          // Exécute la réponse automatique
          if (commentId) {
            await repondreAuCommentaire(commentId);
          }
        }
      }
      return res.status(200).send('EVENT_RECEIVED');
    }
    return res.status(404).send('Not Found');
  }

  // Si la méthode n'est pas supportée
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
