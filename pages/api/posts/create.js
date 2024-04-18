import connectToDatabase from '../../../libs/mongodb';
import Post from '../../../models/Post';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await connectToDatabase();
    
    const { title, content } = req.body;

    try {
      const newPost = await Post.create({ title, content });
      res.status(201).json(newPost);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ error: 'Could not create post' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
