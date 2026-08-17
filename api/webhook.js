export default function handler(req, res) {
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
      body.entry?.forEach(entry => {
        const change = entry.changes?.[0];
        if (change && change.field === 'feed') {
          const commentId = change.value.comment_id;
          const message = change.value.message;
          console.log(`Nouveau commentaire : "${message}" | ID: ${commentId}`);
          // Ici on ajoutera plus tard la logique de réponse automatique (Graph API)
        }
      });
      return res.status(200).send('EVENT_RECEIVED');
    }
    return res.status(404).send('Not Found');
  }

  // Si la méthode n'est pas supportée
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
