import connectToDatabase from '../../../libs/mongodb';
import Signal from '../../../models/Signal';

export default async function handler(req, res) {
  const { fid, signal_id, vote } = req.body;
  
  if (req.method !== 'POST' || !fid || !signal_id || vote === undefined) {
    return res.status(405).json({ error: 'Method not allowed or missing parameters' });
  }

  // Validate vote is between -2 and 2 (Too High to Very Low)
  if (vote < -2 || vote > 2) {
    return res.status(400).json({ error: 'Vote must be between -2 and 2' });
  }

  try {
    await connectToDatabase();

    // Update the Signal document to set the validator's vote and confirmed status
    const updatedSignal = await Signal.findOneAndUpdate(
      {
        _id: signal_id,
        'validators.validator_fid': parseInt(fid)
      },
      {
        $set: {
          'validators.$.vote': vote,
          'validators.$.confirmed': true
        }
      },
      { new: true }
    );

    if (!updatedSignal) {
      return res.status(404).json({ error: 'Signal or validator not found' });
    }

    console.log('Validation submitted:', { fid, signal_id, vote });

    res.status(200).json({ 
      success: true, 
      message: 'Validation submitted successfully',
      signal_id: signal_id,
      vote: vote
    });

  } catch (error) {
    console.error('Error submitting validation:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
