import connectToDatabase from '../../../libs/mongodb';
import Impact from '../../../models/Impact';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    
    const { fid } = req.query;
    
    if (!fid) {
      return res.status(400).json({ error: 'fid is required' });
    }

    // Calculate dates for the last 7 days in EST timezone
    // Current day (today) should be last in array (rightmost in UI)
    const now = new Date();
    const estOffset = -5; // EST is UTC-5 (during standard time)
    const estNow = new Date(now.getTime() + (estOffset * 60 * 60 * 1000));
    
    const last7Days = [];
    
    for (let i = 6; i >= 0; i--) {
      // Create date in EST, starting from 6 days ago going to today
      const estDate = new Date(estNow);
      estDate.setDate(estDate.getDate() - i);
      
      // Set to midnight EST for this day
      const dayStart = new Date(estDate.getFullYear(), estDate.getMonth(), estDate.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      // Convert back to UTC for database query
      const utcDayStart = new Date(dayStart.getTime() - (estOffset * 60 * 60 * 1000));
      const utcDayEnd = new Date(dayEnd.getTime() - (estOffset * 60 * 60 * 1000));
      
      last7Days.push({
        date: utcDayStart,
        endDate: utcDayEnd,
        dayIndex: 6 - i // 0 = 6 days ago, 6 = today
      });
    }

    // Query for impacts in the last 7 days where impact_points > 0
    const streakData = await Promise.all(
      last7Days.map(async ({ date, endDate, dayIndex }) => {
        const impacts = await Impact.find({
          curator_fid: parseInt(fid),
          createdAt: {
            $gte: date,
            $lt: endDate
          },
          impact_points: { $gt: 0 }
        }).lean();

        return {
          date: date.toISOString().split('T')[0],
          dayIndex,
          hasImpact: impacts.length > 0,
          impactCount: impacts.length,
          totalPoints: impacts.reduce((sum, impact) => sum + (impact.impact_points || 0), 0)
        };
      })
    );

    // Calculate current streak (consecutive days from today going backwards)
    let currentStreak = 0;
    for (let i = streakData.length - 1; i >= 0; i--) {
      if (streakData[i].hasImpact) {
        currentStreak++;
      } else {
        break;
      }
    }

    return res.status(200).json({
      success: true,
      streakData,
      currentStreak,
      totalDaysWithImpacts: streakData.filter(day => day.hasImpact).length
    });

  } catch (error) {
    console.error('Curation streak API error:', error);
    return res.status(500).json({ error: 'Failed to fetch curation streak data' });
  }
}
