async function getEmbedTypes(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });

    if (response.ok) {
      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.startsWith('image/')) {
        return 'image'
      } else if (contentType && (contentType == 'application/x-mpegURL' || contentType.startsWith('video/'))) {
        return 'video'
      } else if (contentType && contentType.startsWith('text/html')) {
        return 'html'
      } else {
        return 'video'
      }
    } else {
      return 'other'
    }
  } catch (error) {
    console.error('Error checking image URL:', error);
    return 'other'
  }
}

export default async function handler(req, res) {
  const { url } = req.query;
  if (req.method === 'GET') {
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is missing' });
    }

    try {
      const embedType = await getEmbedTypes(url);
      if (embedType) {
        res.status(200).json({embed: embedType});
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}