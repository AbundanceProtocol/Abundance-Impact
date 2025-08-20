import React, { useEffect } from 'react';
import Link from 'next/link';
import { button } from '../../../../../pages/assets/button';
import { FaPen } from 'react-icons/fa';
import { useAppRouter } from '..\../../../../hooks/useAppRouter';
import useMatchBreakpoints from '../../../../../hooks/useMatchBreakpoints';

const NavItem = ({ menuHover, buttonName, setMobileMenuOpen, linkTarget }) => {
  const { isMobile, isTablet } = useMatchBreakpoints();
  const router = useAppRouter()

  // let btnHover = menuHover.in > menuHover.out
  let btn = button[buttonName]
  let Icon = btn.icon
  let menuVar = "pop-menu"
  let contentVar = "bg-blue"
  let textVar = ""
  let accountState = !btn.account
  if (button[linkTarget].link === btn.link && btn.link && btn.working && accountState) {
    menuVar = "red-menu"
    contentVar = "bg-red"
    textVar = "bg-red"
  }
  if (!accountState) {
    menuVar = "grey-menu"
    contentVar = "bg-inactive"
    textVar = "bg-inactive"
  }
  if (!btn.working) {
    menuVar = "grey-menu"
    contentVar = "bg-grey"
    textVar = "bg-grey"
  }
  let route = router.route
  let topBox = `sub-cat-top-box flex-row ${menuVar}`
  let iconClass = `sub-cat-icon ${contentVar} size-30`
  let titleClass = `sub-cat-title nav-frame-title ${textVar} full-w`
  let textClass = `sub-cat-desc nav-frame-desc ${textVar} full-w`
  if (typeof Icon == 'undefined') { Icon = FaPen }
  let attributes = {}
  if (!btn.link) {
    attributes = {target: '_blank', rel: 'noopener noreferrer', href: btn.url}
  }

  useEffect( () => {
    if (menuHover.in <= menuHover.out && typeof linkTarget !== 'object') {
      setNavMenu(button[linkTarget].menu)
    }
  }, [linkTarget, menuHover.in, menuHover.out])


  return isMobile ? (
    <Link href={(btn.link && btn.working) ? btn.link : route} legacyBehavior>
      <a className={topBox} style={{borderRadius: '18px', padding: '16px 8px'}} {...attributes} onClick={() => {
        setLinkTarget(buttonName)
        if (btn.link && btn.working) {
          setMobileMenuOpen(false)
        }
        }}>
          <div style={{display: 'grid', gridTemplateColumns: 'auto 1fr', gridGap: '8px', alignItems: 'center'}}>
            <div className="sub-cat-box" >
              <Icon className={iconClass} iconsize="25"  style={{width: '25px', height: '25px'}}/>
            </div>
            <div className="sub-cat-text flex-col" style={{pointerEvents: 'none'}}>
              <span className={titleClass} style={{fontSize: '15px', fontWeight:'800', paddingRight: '10px', pointerEvents: 'none', width: 'max-content'}}>{buttonName}</span>
              <span className={textClass} style={{fontSize: '12px', paddingRight: '10px', pointerEvents: 'none'}}>{btn.description}</span>
            </div>
          </div>
      </a>
    </Link>
  ) : (
    <Link href={(btn.link && btn.working) ? btn.link : route}>
      <a className={topBox}  {...attributes} onClick={() => {
        setLinkTarget(buttonName)
        }} legacyBehavior>
        <div className="sub-cat-box" style={{margin: btnHover ? '8px 0' : '0 10px 0 0', minWidth: btnHover ? '50px' : '15px'}}>
          <Icon className={iconClass} iconsize={btnHover ? isTablet ? '25' : '30' : '15'} style={{height: btnHover ? '30px' : '15px', width: btnHover ? '30px' : '15px'}} />
        </div>
        <div className="sub-cat-text flex-col" style={{width: btnHover ? 'auto' : 'min-content', minWidth: btnHover ? null : '50px', pointerEvents: 'none'}}>
          <span className={titleClass} style={{fontSize: btnHover ?  isTablet ? '15px' : '19px' : isTablet ? '13px' : '15px', fontWeight: btnHover ? '800' : '600',  pointerEvents: 'none', width: btnHover ? '100%' : 'max-content'}}>{buttonName}</span>
          <span className={textClass} style={{fontSize: btnHover ? isTablet ? '12px' : '15px' : '0', opacity: btnHover ? '1' : '0', pointerEvents: 'none'}}>{btn.description}</span>
        </div>
      </a>
    </Link>
  );
}

export default NavItem;