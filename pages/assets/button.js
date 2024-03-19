import { FaSearch, FaCode, FaUser, FaLightbulb, FaKey, FaLockOpen, FaGlobe, FaPen, FaCoins, FaLink, FaAddressCard, FaWallet, FaAward, FaQuestionCircle, FaMap, FaCogs, FaFileAlt, FaGithub, FaMediumM, FaYoutube, FaTwitter, FaAt, FaDiscord, FaFolderOpen, FaTasks, FaScroll, FaSearchDollar, FaHandshake, FaRegListAlt, FaToolbox, FaFlag } from 'react-icons/fa';
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

const Buttons = () => {
    return <div className="button" />
  }

export default Buttons;

const button = {
    'top-menu': ['main', 'user'],
    'side-menu': ['Feed', 'Search', 'Ecosystem', 'Reviews', 'Notifications', 'Profile', 'Funding', 'Challenge', 'Propose', 'Cast'],
    'bottom-nav': ['Feed', 'Search', 'Ecosystem', 'Reviews', 'Notifications'],
    'nav-menu': {
        'main': ['Feed', 'Search', 'Ecosystem'],
        'user': ['Profile', 'Reviews', 'Notifications', 'Funding', 'Challenge', 'Propose', 'Cast'],
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

    'Feed': {
        link: '/',
        menu: 'Home',
        description: 'Your feed',
        account: false,
        working: true,
        icon: AiFillHome
    },
    'Search': {
        link: '/search',
        menu: 'Search',
        description: 'Search for communities, projects, users, and proposals',
        account: false,
        working: true,
        icon: FaSearch
    },
    'Ecosystem': {
        link: '/ecosystem',
        menu: 'Ecosystem',
        description: 'Ecosystems',
        account: false,
        working: false,
        icon: FaGlobe
    },
    'Reviews': {
        link: '/reviews',
        menu: 'Reviews',
        description: 'Your reviews',
        account: true,
        working: false,
        icon: FaRegListAlt
    },
    'Notifications': {
        link: '/notifications',
        menu: 'Notifications',
        description: 'Your notifications',
        account: true,
        working: false,
        icon: IoNotifications
    },
    'Profile': {
        link: '/profile',
        menu: 'Profile',
        description: 'Your profile',
        account: true,
        working: false,
        icon: FaUser
    },
    'Funding': {
        link: '/funding',
        menu: 'Funding',
        description: 'Invest in public goods',
        account: true,
        working: false,
        icon: GiTwoCoins
    },
    'Challenge': {
        link: '/challenge',
        menu: 'Challenge',
        description: 'Challenge a review',
        account: true,
        working: false,
        icon: TiFlag
    },
    'Propose': {
        link: '/propose',
        menu: 'Propose',
        description: 'Create a proposal',
        account: true,
        working: false,
        icon: MdWork
    },
    'Cast': {
        link: '/cast',
        menu: 'Cast',
        description: 'Create a cast',
        account: true,
        working: false,
        icon: FaPen
    },

    // ////// MENUS //////

    // 'portal': {
    //     link: '/portal',
    //     menu: 'Portal',
    //     description: 'Your activity hub',
    //     account: true,
    //     working: true,
    //     icon: FaUser
    // },
    // 'studio': {
    //     link: '/create',
    //     menu: 'Studio',
    //     description: 'Create. Contribute. Collaborate',
    //     account: true,
    //     working: true,
    //     icon: FaPen
    // },
    // 'consensus': {
    //     link: '/consensus',
    //     menu: 'Consensus',
    //     description: 'Proof-of-Impact Consensus Validation',
    //     account: true,
    //     working: true,
    //     icon: FaHandshake
    // },
    // 'funding': {
    //     link: '/fund',
    //     menu: 'Funding',
    //     description: 'Give and get funding',
    //     account: true,
    //     working: true,
    //     icon: FaCoins
    // },





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