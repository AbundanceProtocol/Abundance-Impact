import axios from 'axios';
import CryptoJS from 'crypto-js';
import { ethers } from 'ethers';
import Moralis from 'moralis';
import qs from "querystring";

const apiKey = process.env.MORALIS_API_KEY
const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;

// shorten a hash address
export function metaButton(i, type, params, points) {

  if (type === 'refresh') {
    return `<meta property="fc:frame:button:${i}" content='Refresh' />
    <meta property="fc:frame:button:${i}:action" content="post" />
    <meta property="fc:frame:button:${i}:target" content='${baseURL}/api/frames/tip/auto-tip?${qs.stringify(params)}' />`
  } else if (type === 'login') {
    return `<meta property="fc:frame:button:${i}" content='Login' />
    <meta property="fc:frame:button:${i}:action" content="link" />
    <meta property="fc:frame:button:${i}:target" content='${baseURL}/?eco=${points}' />`
  } else if (type === 'back') {
    return `<meta property="fc:frame:button:${i}" content='< Back' />
    <meta property="fc:frame:button:${i}:action" content="post" />
    <meta property="fc:frame:button:${i}:target" content='${baseURL}/api/frames/tip/start?${qs.stringify(params)}' />`
  } else if (type === 'auto-tip') {
    return `<meta property="fc:frame:button:${i}" content='Auto-tip' />
    <meta property="fc:frame:button:${i}:action" content="post" />
    <meta property="fc:frame:button:${i}:target" content='${baseURL}/api/frames/tip/auto-tip?${qs.stringify(params)}' />`
  } else if (type === 'auto-tip-all') {
    return `<meta property="fc:frame:button:${i}" content='Auto-tip all' />
    <meta property="fc:frame:button:${i}:action" content="post" />
    <meta property="fc:frame:button:${i}:target" content='${baseURL}/api/frames/tip/auto-tip-all?${qs.stringify(params)}' />`
  } else if (type === 'auto-tip-add') {
    return `<meta property="fc:frame:button:${i}" content='Add 👤' />
    <meta property="fc:frame:button:${i}:action" content="post" />
    <meta property="fc:frame:button:${i}:target" content='${baseURL}/api/frames/tip/auto-tip-add?${qs.stringify(params)}' />`
  } else if (type === 'auto-tip-remove') {
    return `<meta property="fc:frame:button:${i}" content='Remove 👤' />
    <meta property="fc:frame:button:${i}:action" content="post" />
    <meta property="fc:frame:button:${i}:target" content='${baseURL}/api/frames/tip/auto-tip-remove?${qs.stringify(params)}' />`
  } else if (type === 'auto-tip-stop') {
    return `<meta property="fc:frame:button:${i}" content='Stop auto-tip' />
    <meta property="fc:frame:button:${i}:action" content="post" />
    <meta property="fc:frame:button:${i}:target" content='${baseURL}/api/frames/tip/auto-tip-stop?${qs.stringify(params)}' />`
  } else if (type === 'opt-in') {
    return `<meta property="fc:frame:button:${i}" content='Opt-in' />
    <meta property="fc:frame:button:${i}:action" content="post" />
    <meta property="fc:frame:button:${i}:target" content='${baseURL}/api/frames/tip/opt-in?${qs.stringify(params)}' />`
  } else if (type === 'opt-out') {
    return `<meta property="fc:frame:button:${i}" content='Confirm opt-out' />
    <meta property="fc:frame:button:${i}:action" content="post" />
    <meta property="fc:frame:button:${i}:target" content='${baseURL}/api/frames/tip/opt-out?${qs.stringify(params)}' />`
  } else {
    return `<meta property="fc:frame:button:${i}" content='Menu' />
    <meta property="fc:frame:button:${i}:action" content="post" />
    <meta property="fc:frame:button:${i}:target" content='${baseURL}/api/frames/tip/menu?${qs.stringify(params)}' />`
  }

}
  