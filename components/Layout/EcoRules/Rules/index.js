import React from 'react';
import Rule from './Rule';

const Rules = ({ecoData, isMobile}) => {

  return (
    <div className='flex-col' style={{gap: '0.25rem', margin: isMobile ? '10px 20px' : '10px 0 0 0'}}>

      {(ecoData?.ecosystem_rules.map((rule, index) => (
        <Rule show={ecoData?.ecosystem_rules?.length > 0} key={index}>
          {rule}
        </Rule>)))}

      <Rule show={ecoData?.points_per_tip}>
        Points per $1 tipped: {ecoData?.points_per_tip}
      </Rule>

      <Rule show={ecoData?.condition_points_threshold}>
        Curation points threshold: {ecoData?.condition_points_threshold}
      </Rule>

      <Rule show={ecoData?.condition_curators_threshold}>
        Curators threshold: {ecoData?.condition_curators_threshold}
      </Rule>

      <Rule show={ecoData?.percent_tipped || ecoData?.percent_tipped == 0}>
        Percent tipped to curators: {ecoData?.percent_tipped}%
      </Rule>

      <Rule show={((ecoData?.upvote_value || ecoData?.upvote_value == 0) && (ecoData?.downvote_value || ecoData?.downvote_value == 0))}>
        Upvote/Downvote effect: {ecoData?.upvote_value} / -{ecoData?.downvote_value} points
      </Rule>

    </div>
  )
}

export default Rules;