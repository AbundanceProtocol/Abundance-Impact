import React from 'react';

const ScoreDashboard = ({ score, rank, total }) => {
  const percentage = ((total - rank) / total) * 100; // Calculate percentage for the progress arc

  return (
    <div className="dashboard">
      <div className="circleWrapper">
        {/* Progress Arc */}
        <div
          className="arc"
          style={{
            background: `conic-gradient(
              #7e57c2 ${percentage * 2.7}deg,
              #e0e0e0 ${percentage * 2.7}deg 270deg
            )`,
          }}
        >
          {/* Mask to clip the circle into a horseshoe */}
          <div className="mask"></div>

          {/* Inner Circle */}
          <div className="innerCircle">
            <span className="score">{score}</span>
          </div>
        </div>
      </div>

      {/* Labels */}
      <p className="label">Score</p>
      <p className="rank">
        Rank <span>{rank.toLocaleString()}</span> / <span>{total.toLocaleString()}</span>
      </p>
    </div>
  );
};

export default ScoreDashboard;
