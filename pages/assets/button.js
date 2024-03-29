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
        menu: 'Feed',
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

    'portal': {
        link: '/portal',
        menu: 'Portal',
        description: 'Your activity hub',
        account: true,
        working: true,
        icon: FaUser
    },
    'studio': {
        link: '/create',
        menu: 'Studio',
        description: 'Create. Contribute. Collaborate',
        account: true,
        working: true,
        icon: FaPen
    },
    'consensus': {
        link: '/consensus',
        menu: 'Consensus',
        description: 'Proof-of-Impact Consensus Validation',
        account: true,
        working: true,
        icon: FaHandshake
    },
    'funding': {
        link: '/fund',
        menu: 'Funding',
        description: 'Give and get funding',
        account: true,
        working: true,
        icon: FaCoins
    },
    // 'ecosystem': {
    //     link: '/explore',
    //     menu: 'Ecosystem',
    //     description: 'Explore the ecosystem, your communities, and resources',
    //     account: false,
    //     working: false,
    //     icon: FaGlobe
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
    'Roadmap': {
        link: '/roadmap',
        menu: 'Home',
        description: "The Protocol's Master Plan",
        account: false,
        working: true,
        icon: FaMap
    },
    // 'Mechanism': {
    //     link: '/mechanism',
    //     menu: 'Home',
    //     description: 'How it all works',
    //     account: false,
    //     working: false,
    //     icon: FaCogs
    // },
    // 'Docs': {
    //     link: false,
    //     url: 'https://docs.abundance.id/',
    //     menu: 'Home',
    //     description: 'In-depth explanation of the Protocol',
    //     account: false,
    //     working: true,
    //     icon: FaFileAlt
    // },
    // 'FAQ': {
    //     link: '/faq',
    //     menu: 'Home',
    //     description: 'Frequently asked questions',
    //     account: false,
    //     working: false,
    //     icon: FaQuestionCircle
    // },
    // 'Blog': {
    //     link: '/blog',
    //     menu: 'Home',
    //     description: 'Read our articles',
    //     account: false,
    //     working: true,
    //     icon: SiSubstack
    // },
    // 'Contact': {
    //     link: '/contact',
    //     menu: 'Home',
    //     description: 'Connect with us',
    //     account: false,
    //     working: false,
    //     icon: FaLink
    // },

    

    ////// PORTAL //////

    // 'Profile': {
    //     link: '/profile',
    //     menu: 'Portal',
    //     description: 'Update your PFP and bio',
    //     account: true,
    //     working: true,
    //     icon: FaAddressCard
    // },
    // 'Wallet': {
    //     link: '/wallet',
    //     menu: 'Portal',
    //     description: 'Manage your funds, investments & bids',
    //     account: true,
    //     working: true,
    //     icon: FaWallet
    // },
    // 'Expertise': {
    //     link: '/expertise',
    //     menu: 'Portal',
    //     description: 'Review your scores across fields',
    //     account: true,
    //     working: false,
    //     icon: FaAward
    // },
    // 'Portfolio': {
    //     link: '/portfolio',
    //     menu: 'Portal',
    //     description: 'Check your projects & proposals',
    //     account: true,
    //     working: true,
    //     icon: FaFolderOpen
    // },

    


    ////// STUDIO //////

    // 'Create': {
    //     link: '/create-post',
    //     menu: 'Studio',
    //     description: 'Create a project',
    //     account: true,
    //     working: false,
    //     icon: MdWork
    // },
    // 'Contribute': {
    //     link: '/contribute',
    //     menu: 'Studio',
    //     description: 'Contribute to an existing project',
    //     account: true,
    //     working: false,
    //     icon: HiViewGridAdd
    // },
    // 'Collaborate': {
    //     link: '/collaboration',
    //     menu: 'Studio',
    //     description: 'Collaborate with others on a project',
    //     account: true,
    //     working: false,
    //     icon: RiTeamFill
    // },

    


    ////// CONSENSUS //////

    // 'Propose': {
    //     link: '/init-review',
    //     menu: 'Consensus',
    //     description: 'Create a proposal',
    //     account: true,
    //     working: false,
    //     icon: MdRequestPage
    // },
    // 'Validate': {
    //     link: '/validation-pool',
    //     menu: 'Consensus',
    //     description: 'Join a validation pool',
    //     account: true,
    //     working: false,
    //     icon: FaRegListAlt
    // },
    // 'Challenge': {
    //     link: '/challenge',
    //     menu: 'Consensus',
    //     description: 'Challenge a proposal',
    //     account: true,
    //     working: false,
    //     icon: BsFillHandThumbsDownFill
    // },
    // 'Explore': {
    //     link: '/explore-proposals',
    //     menu: 'Consensus',
    //     description: 'Explore proposals',
    //     account: false,
    //     working: false,
    //     icon: RiFileSearchFill
    // },
    // 'Notifications': {
    //     link: '/inbox',
    //     menu: 'Consensus',
    //     description: 'Validation notifications',
    //     account: true,
    //     working: false,
    //     icon: MdMail
    // },

    


    ////// FUNDING //////

    // 'Project Funding': {
    //     link: '/project-funding',
    //     menu: 'Funding',
    //     description: 'Request funding for a public goods project',
    //     account: true,
    //     working: false,
    //     icon: GiTwoCoins
    // },
    // 'Review Funding': {
    //     link: '/funding',
    //     menu: 'Funding',
    //     description: 'Request or auction funding for reviews',
    //     account: true,
    //     working: true,
    //     icon: GiReceiveMoney
    // },
    // 'Funding Proposal': {
    //     link: '/funding-proposal',
    //     menu: 'Funding',
    //     description: 'Create an ecosystem improvement proposal',
    //     account: true,
    //     working: false,
    //     icon: FaGlobe
    // },
    // 'Search Requests': {
    //     link: '/search-requests',
    //     menu: 'Funding',
    //     description: 'Find funding requests and auctions',
    //     account: false,
    //     working: true,
    //     icon: FaSearchDollar
    // },

    


    ////// ECOSYSTEM //////
    
    // 'Communities': {
    //     link: '/communities',
    //     menu: 'Ecosystem',
    //     description: 'Explore your communities',
    //     account: true,
    //     working: false,
    //     icon: HiUserGroup
    // },
    // 'Resources': {
    //     link: '/resources',
    //     menu: 'Ecosystem',
    //     description: 'Access resources from across the ecosystem',
    //     account: false,
    //     working: false,
    //     icon: FaToolbox
    // },
    // 'Trending': {
    //     link: '/trending',
    //     menu: 'Ecosystem',
    //     description: 'Trending projects',
    //     account: false,
    //     working: true,
    //     icon: BsBarChartFill
    // },
    // 'Curated': {
    //     link: '/curated',
    //     menu: 'Ecosystem',
    //     description: 'Curated projects',
    //     account: false,
    //     working: false,
    //     icon: MdFilterFrames
    // },
    // 'Favorites': {
    //     link: '/favorites',
    //     menu: 'Ecosystem',
    //     description: 'Your favorite project categories',
    //     account: true,
    //     working: false,
    //     icon: MdFavorite
    // },
    // 'Search': {
    //     link: '/searchbar',
    //     menu: 'Ecosystem',
    //     description: 'Search for communities, projects, users, and proposals',
    //     account: false,
    //     working: false,
    //     icon: FaSearch
    // },
    // 'Feed': {
    //     link: '/feed',
    //     menu: 'Ecosystem',
    //     description: 'Latest projects',
    //     account: true,
    //     working: true,
    //     icon: FaScroll
    // },

    


    // LINKS

    // 'GitHub': {
    //     link: false,
    //     url: 'https://github.com/AbundanceProtocol/abundance-protocol',
    //     menu: 'Connect',
    //     description: 'Help us develop the protocol on GitHub',
    //     account: false,
    //     working: true,
    //     icon: FaGithub
    // },
    // 'Discord': {
    //     link: false,
    //     url: 'https://discord.com/invite/sHcV7g3nqu',
    //     menu: 'Connect',
    //     description: 'Join our Discord community',
    //     account: false,
    //     working: true,
    //     icon: FaDiscord
    // },
    // 'OpenSea': {
    //     link: false,
    //     url: 'https://opensea.io/web4',
    //     menu: 'Connect',
    //     description: "Get our project's NFTs",
    //     account: false,
    //     working: true,
    //     icon: OpenSeaIcon
    // },
    // 'YouTube': {
    //     link: false,
    //     url: 'https://www.youtube.com/@AbundanceProtocol/',
    //     menu: 'Connect',
    //     description: 'Subscribe to our channel',
    //     account: false,
    //     working: true,
    //     icon: FaYoutube
    // },
    // 'Twitter': {
    //     link: false,
    //     url: 'https://twitter.com/Abundance_DAO',
    //     menu: 'Connect',
    //     description: 'Follow us on Twitter',
    //     account: false,
    //     working: true,
    //     icon: FaTwitter
    // },
    // 'Email': {
    //     link: false,
    //     url: 'mailto:info@abundance.id',
    //     menu: 'Connect',
    //     description: 'Contact us',
    //     account: false,
    //     working: true,
    //     icon: FaAt
    // },
  }

export { button }