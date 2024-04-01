export default async function handler(req, res) {
  const { url } = req.query;
  if (req.method === 'GET' && url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('Content-Type');
      const isImg = contentType && contentType.startsWith('image/');
      res.status(200).json(isImg);
    } catch (error) {
      console.error('Proxy request failed:', error);
      res.status(500).json({ error: 'Proxy request failed' });
    }
  } else {
    res.status(400).json({ error: 'Bad Request.' });
  }
}