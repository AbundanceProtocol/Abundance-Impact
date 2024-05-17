import { FaSearch, FaCode, FaUser, FaLightbulb, FaKey, FaLockOpen, FaGlobe, FaPen, FaCoins, FaLink, FaAddressCard, FaWallet, FaAward, FaQuestionCircle, FaMap, FaCogs, FaFileAlt, FaGithub, FaMediumM, FaYoutube, FaTwitter, FaAt, FaDiscord, FaFolderOpen, FaTasks, FaScroll, FaSearchDollar, FaHandshake, FaRegListAlt, FaToolbox, FaFlag, FaRegClock } from 'react-icons/fa';
import { AiFillHome } from "react-icons/ai";
import OpenSeaIcon from './OpenSeaIcon';
import { GiTwoCoins, GiReceiveMoney } from 'react-icons/gi'
import { BsBarChartFill, BsFillDiagram3Fill, BsFillHandThumbsDownFill, BsListColumnsReverse } from 'react-icons/bs'
import { MdCastConnected, MdNotifications, MdFavorite, MdFilterFrames, MdMail, MdWork, MdRequestPage } from 'react-icons/md'
import { RiTeamFill, RiFileSearchFill } from 'react-icons/ri'
import { TiFlag } from "react-icons/ti";
import { HiBadgeCheck, HiThumbDown, HiUserGroup, HiViewGridAdd } from 'react-icons/hi'
import { IoReader, IoNotifications } from 'react-icons/io5'
import { SiSubstack } from 'react-icons/si'
import { PiSquaresFourLight as Actions } from "react-icons/pi";

const Buttons = () => {
    return <div className="button" />
  }

export default Buttons;

const button = {
    // 'top-menu': ['main', 'user'],
    'top-menu': ['main'],
    'side-menu': ['Impact', 'Studio', 'Schedule'],
    // 'side-menu': ['Impact', 'Search', 'Ecosystem', 'Reviews', 'Notifications', 'Studio', 'Funding', 'Challenge', 'Propose', 'Cast'],
    'bottom-nav': ['Impact', 'Studio', 'Cast Actions', 'Schedule'],
    // 'bottom-nav': ['Impact', 'Search', 'Ecosystem', 'Reviews', 'Notifications'],
    'nav-menu': {
        'main': ['Impact', 'Studio', 'Schedule'],
        // 'user': ['Studio'],
        // 'main': ['Impact', 'Search', 'Ecosystem'],
        // 'user': ['Studio', 'Reviews', 'Notifications', 'Funding', 'Challenge', 'Propose', 'Cast'],
    },

    ////// TOP MENU //////

    'main': {
        link: '/',
        menu: 'main',
        description: 'Your feed',
        account: false,
        working: true,
        icon: AiFillHome
    },
    'user': {
        link: '/',
        menu: 'user',
        description: 'Your feed',
        account: false,
        working: true,
        icon: FaUser
    },


    ////// LEFT MENU //////

    'Impact': {
        link: '/',
        menu: 'Home',
        description: 'Your feed',
        account: false,
        working: true,
        icon: AiFillHome
    },
    'Search': {
        link: '/~/search',
        menu: 'Search',
        description: 'Search for communities, projects, users, and proposals',
        account: false,
        working: true,
        icon: FaSearch
    },
        'Schedule': {
        link: '/~/schedule',
        menu: 'Search',
        description: 'Schedule tipping and casts',
        account: true,
        working: true,
        icon: FaRegClock
    },
        'Cast Actions': {
        link: false,
        menu: 'Home',
        description: 'Install Cast Actions for client',
        account: false,
        working: true,
        icon: Actions
    },
    'Ecosystem': {
        link: '/~/ecosystems',
        menu: 'Ecosystem',
        description: 'Ecosystems',
        account: false,
        working: false,
        icon: FaGlobe
    },
    'Reviews': {
        link: '/~/reviews',
        menu: 'Reviews',
        description: 'Your reviews',
        account: true,
        working: false,
        icon: FaRegListAlt
    },
    'Notifications': {
        link: '/~/notifications',
        menu: 'Notifications',
        description: 'Your notifications',
        account: true,
        working: false,
        icon: IoNotifications
    },
    'Studio': {
        link: '/~/studio',
        menu: 'main',
        description: 'Your curation studio',
        account: true,
        working: true,
        icon: FaUser
    },
    'Funding': {
        link: '/~/funding',
        menu: 'Funding',
        description: 'Invest in public goods',
        account: true,
        working: false,
        icon: GiTwoCoins
    },
    'Challenge': {
        link: '/~/challenge',
        menu: 'Challenge',
        description: 'Challenge a review',
        account: true,
        working: false,
        icon: TiFlag
    },
    'Propose': {
        link: '/~/propose',
        menu: 'Propose',
        description: 'Create a proposal',
        account: true,
        working: false,
        icon: MdWork
    },
    'Cast': {
        link: '/~/cast',
        menu: 'Cast',
        description: 'Create a cast',
        account: true,
        working: false,
        icon: FaPen
    },

    ////// HOME //////

    'Vision': {
        link: '/',
        menu: 'Home',
        description: 'The Abundance Protocol vision for a decentralized economy',
        account: false,
        working: true,
        icon: FaLightbulb
    },
  }

export { button }