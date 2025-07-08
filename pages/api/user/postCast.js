import connectToDatabase from '../../../libs/mongodb';
import Cast from '../../../models/Cast';

export default async function handler(req, res) {
  const { hash, castContext, embeds } = req.body;
  if (req.method !== 'POST' || !castContext || !embeds || !hash) {
    res.status(405).json({ error: 'Method not allowed' });
  } else {
    try {

      function getCastMedia(embeds) {
        let media = []

        if (embeds && embeds?.length > 0) {
          for (const embed of embeds) {
            let embedData = {url: embed, content_type: 'other'}
            media.push(embedData)
          }
        }

        return media
      }


      async function createCast(hash, castContext, embeds) {
        try {
          await connectToDatabase();

          let cast = await Cast.findOne({ cast_hash: hash });
      
          if (!cast) {
            let castMedia = []
      
            castMedia = getCastMedia(embeds)
        
            cast = new Cast({
              author_fid: castContext.author_fid,
              author_pfp: castContext.author_pfp,
              author_username: castContext.author_username,
              author_display_name: castContext.author_display_name,
              points: '$IMPACT',
              cast_hash: castContext.cast_hash,
              cast_text: castContext.cast_text,
              quality_balance: 0,
              quality_absolute: 0,
              impact_total: 0,
              impact_points: [],
              wallet: castContext?.wallet,
              channel_id: castContext?.channel_id
            });
            
            cast.cast_media = [...castMedia]
        
            await cast.save()
          }

          return cast
          
        } catch (error) {
          console.error('Error fetching data:', error);
          return null;
        }

      }

      const cast = await createCast(hash, castContext, embeds)

      res.status(200).send({ message: `Cast saved successfully`, cast });
    } catch (error) {
      console.error("Error while fetching casts:", error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
