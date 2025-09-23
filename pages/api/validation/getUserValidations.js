import connectToDatabase from '../../../libs/mongodb';
import Signal from '../../../models/Signal';
import Cast from '../../../models/Cast';

export default async function handler(req, res) {
  const { fid } = req.query;
  
  if (req.method !== 'GET' || !fid) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    // Get current date minus 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);

    // Find Signal documents where validators array contains validator_fid: fid and createdAt is in past 24 hours
    const signals = await Signal.find({
      'validators': {
        $elemMatch: {
          validator_fid: parseInt(fid),
          createdAt: { $gte: twentyFourHoursAgo }
        }
      }
     }).select('cast_hash validators impact').lean();

    console.log('Found signals for validation:', signals.length);

    // For each signal, get the cast data
    const validations = await Promise.all(
      signals.map(async (signal) => {
        try {
          // Find the cast by cast_hash
          const cast = await Cast.findOne({ cast_hash: signal.cast_hash })
            .select('author_pfp author_username author_display_name cast_text cast_hash')
            .lean();

          if (!cast) {
            return null;
          }

          // Find the specific validator entry for this user
          const validatorEntry = signal.validators.find(
            v => v.validator_fid === parseInt(fid) && v.createdAt >= twentyFourHoursAgo
          );

          return {
            signal_id: signal._id,
            cast_hash: signal.cast_hash,
            impact: signal.impact,
            author_pfp: cast.author_pfp,
            author_username: cast.author_username,
            author_display_name: cast.author_display_name,
            cast_text: cast.cast_text,
            validator_entry: validatorEntry,
            validation_created: validatorEntry?.createdAt
          };
        } catch (error) {
          console.error('Error fetching cast for signal:', signal._id, error);
          return null;
        }
      })
    );

    // Filter out null entries and return
    const validValidations = validations.filter(v => v !== null);

    console.log('Valid validations found:', validValidations.length);

    res.status(200).json({ 
      validations: validValidations,
      count: validValidations.length 
    });

  } catch (error) {
    console.error('Error fetching user validations:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
