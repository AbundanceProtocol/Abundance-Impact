import React, { useContext } from 'react';
import { BsStar, BsStarFill } from "react-icons/bs";
import { AccountContext } from '../../../../context';
import useMatchBreakpoints from '../../../../hooks/useMatchBreakpoints';

const version = process.env.NEXT_PUBLIC_VERSION || '2.0'

const TippingStreaksInfo = ({ tippingStreak = { streakData: [], totalDaysWithTips: 0 }, tippingCeloStreak = { streakData: [], totalDaysWithTips: 0 }, streaksLoading = false }) => {
  const context = useContext(AccountContext);
  
  if (!context) {
    return null; // Don't render if context is not available
  }
  
  const { isLogged, isMiniApp, adminTest } = context;
  const { isMobile } = useMatchBreakpoints();

  const renderStreakStars = (streakData = []) => {
    if (!streakData || streakData.length === 0) {
      return Array(7).fill(0).map((_, index) => (
        <BsStar key={index} size={16} color="#444" />
      ));
    }
    
    return streakData.map((day, index) => {
      const isLastDay = index === streakData.length - 1; // Today is the last day
      const hasStreak = day.hasTip;
      
      // Determine star component and styling
      const StarComponent = hasStreak ? BsStarFill : BsStar;
      let starColor = "#444"; // Default gray
      let starStyle = {};
      
      if (isLastDay) {
        // Last day (today) gets gold outline
        if (hasStreak) {
          // Has streak: filled gold star
          starColor = "#ffd700";
        } else {
          // No streak: gold outline
          starColor = "#ffd700";
          starStyle = {
            filter: "drop-shadow(0 0 2px #ffd700)",
            stroke: "#ffd700",
            strokeWidth: "1px"
          };
        }
      } else if (hasStreak) {
        // Regular day with streak: blue filled star
        starColor = "#0af";
      }
      
      return (
        <StarComponent 
          key={index} 
          size={16} 
          color={starColor}
          style={starStyle}
        />
      );
    });
  };

  return (
    (version == '2.0' || adminTest) && (<div className='flex-col' style={{backgroundColor: ''}}>

      <div className='shadow flex-col'
        style={{
          backgroundColor: isLogged ? "#002244" : '#333',
          borderRadius: "15px",
          border: isLogged ? "1px solid #11447799" : "1px solid #555",
          width: '100%',
          maxWidth: '320px',
          margin: isMiniApp || isMobile ? '15px auto 0 auto' : '15px auto 0 auto',
        }} >
        
        <div
          className="shadow flex-row"
          style={{
            backgroundColor: isLogged ? "#11448888" : "#444",
            width: '100%',
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px", 
            borderRadius: "15px",
            margin: '0 0 10px 0'
          }} >

          <div
            className="flex-row"
            style={{
              width: '100%',
              justifyContent: "flex-start",
              alignItems: "center",
              padding: "0px 0 0 4px",
              margin: '0 0 0px 0'
            }} >

            <BsStar style={{ fill: "#cde" }} size={20} />

            <div>
              <div style={{border: '0px solid #777', padding: '2px', borderRadius: '10px', backgroundColor: '', maxWidth: 'fit-content', cursor: 'pointer', color: '#cde'}}>
                <div className="top-layer flex-row">
                  <div className="flex-row" style={{padding: "4px 0 4px 10px", marginBottom: '0px', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '0.00rem', width: '', alignItems: 'center'}}>
                    <div style={{fontSize: isMobile ? '18px' : '22px', fontWeight: '600', color: '', padding: '0px 3px'}}>
                      Tipping Streaks
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='flex-col' style={{backgroundColor: isLogged ? "#002244ff" : '#333', padding: '0px 18px 12px 18px', borderRadius: '0 0 15px 15px', color: isLogged ? '#ace' : '#ddd', fontSize: '12px', gap: '0.75rem', position: 'relative'}}>
          
          <div style={{fontSize: '15px', fontWeight: '600', color: '#ace', margin: '8px 0 0px 0'}}>
            Tipping Streak
          </div>
          <div style={{fontSize: '11px', fontWeight: '400', color: '#ace', margin: '-6px 0 0px 0'}}>
            Tipped over $0.25 in the last 7 days
          </div>
          <div className='flex-row' style={{gap: '1.2rem', alignItems: 'center', justifyContent: 'center', margin: '-12px 0 0px 0'}}>
            {renderStreakStars(tippingStreak.streakData)}

            <div className='flex-row' style={{padding: '1px 5px 1px 5px', border: `1px solid ${(tippingStreak?.totalDaysWithTips > 0) ? '#0af' : '#aaa'}`, borderRadius: '8px', backgroundColor: '', alignItems: 'center', gap: '0.15rem', height: '30px'}}>
              <div style={{fontSize: '13px', fontWeight: '700', color: (tippingStreak?.totalDaysWithTips > 0) ? '#0af' : '#aaa'}}>
                {tippingStreak.totalDaysWithTips || 0}/7
              </div>
            </div>
          </div>

          <div style={{fontSize: '15px', fontWeight: '600', color: '#ace', margin: '8px 0 0px 0'}}>
            Tipping Streak (Celo)
          </div>
          <div style={{fontSize: '11px', fontWeight: '400', color: '#ace', margin: '-6px 0 0px 0'}}>
            Tipped over $0.25 in the last 7 days on Celo
          </div>
          <div className='flex-row' style={{gap: '1.2rem', alignItems: 'center', justifyContent: 'center', margin: '-12px 0 0px 0'}}>
            {renderStreakStars(tippingCeloStreak.streakData)}

            <div className='flex-row' style={{padding: '1px 5px 1px 5px', border: `1px solid ${(tippingCeloStreak?.totalDaysWithTips > 0) ? '#0af' : '#aaa'}`, borderRadius: '8px', backgroundColor: '', alignItems: 'center', gap: '0.15rem', height: '30px'}}>
              <div style={{fontSize: '13px', fontWeight: '700', color: (tippingCeloStreak?.totalDaysWithTips > 0) ? '#0af' : '#aaa'}}>
                {tippingCeloStreak.totalDaysWithTips || 0}/7
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>)
  );
};

export default TippingStreaksInfo;
