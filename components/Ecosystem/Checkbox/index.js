import { useState, useEffect } from 'react';
import useMatchBreakpoints from '../../../hooks/useMatchBreakpoints';

const Checkbox = ({option, text, description, target, setupEcosystem}) => {
  const [isChecked, setIsChecked] = useState(false);
  const { isMobile } = useMatchBreakpoints();

  const handleCheckbox = () => {
    setIsChecked(!isChecked);
    console.log(isChecked)
    setupEcosystem(target)
  };

  useEffect(() => {
    console.log(option)
    if (option || option == false) {
      setIsChecked(option)
    }
    
  }, [])


  return (
    <div className='flex-row' style={{width: 'auto', padding: '1px 5px', margin: isMobile ? '5px 10px 0px 10px' : '5px 10px 5px 10px', alignItems: 'center', justifyContent: 'flex-start', flexGrow: 1}}>

      <div>
        <input
          type="checkbox"
          checked={isChecked}
          style={{height: '20px', width: '20px', margin: '10px 15px 10px 5px'}}
          onChange={handleCheckbox}
        />
      </div>

      <div className='flex-col'>
        {text && (<div style={{fontSize: isMobile ? '15px' : '18px', fontWeight: '600', color: '', padding: '4px 3px'}}>{text}</div>)}
        {description && (<div style={{fontSize: isMobile ? '10px' : '12px', fontWeight: '400', color: '', padding: '0px 3px 4px 3px'}}>{description}</div>)}
      </div>
    </div>
  );
};

export default Checkbox;