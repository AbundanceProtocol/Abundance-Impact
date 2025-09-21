import connectToDatabase from '../../../libs/mongodb';
import Cast from '../../../models/Cast';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { castHash, tag, fid } = req.body;

  if (!castHash || !tag || !fid) {
    return res.status(400).json({ error: 'Missing required parameters: castHash, tag, and fid are required' });
  }

  // Validate tag
  const validTags = ['content', 'image', 'video', 'app'];
  if (!validTags.includes(tag)) {
    return res.status(400).json({ error: 'Invalid tag. Must be one of: content, image, video, app' });
  }

  try {
    await connectToDatabase();

    // Find the cast by hash
    const cast = await Cast.findOne({ cast_hash: castHash });
    
    if (!cast) {
      return res.status(404).json({ error: 'Cast not found' });
    }

    // Check if the tag already exists for this user
    const existingTag = cast.cast_tags?.find(tagObj => tagObj.tag === tag && tagObj.fid === fid);
    
    if (existingTag) {
      return res.status(409).json({ error: 'Tag already exists for this user' });
    }

    // Add the new tag
    const newTag = { tag, fid };
    
    if (!cast.cast_tags) {
      cast.cast_tags = [];
    }
    
    cast.cast_tags.push(newTag);

    // Save the updated cast
    await cast.save();

    console.log(`Added tag "${tag}" to cast ${castHash} by user ${fid}`);

    return res.status(200).json({ 
      message: 'Tag added successfully',
      cast_tags: cast.cast_tags 
    });

  } catch (error) {
    console.error('Error updating cast with tag:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
