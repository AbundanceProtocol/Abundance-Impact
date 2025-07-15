import Head from 'next/head';
import Link from 'next/link';
import React, { useContext, useState, useRef, useEffect } from 'react'
import { AccountContext } from '../context'
import { useRouter } from 'next/router';
import { useInView } from 'react-intersection-observer'
import Item from '../components/Ecosystem/ItemWrap/Item';
import Description from '../components/Ecosystem/Description';
import ItemWrap from '../components/Ecosystem/ItemWrap';
import useMatchBreakpoints from '../hooks/useMatchBreakpoints';
import { FaLock, FaUsers, FaUser, FaGlobe, FaPlus, FaRegStar, FaCoins, FaAngleDown, FaShareAlt as Share } from "react-icons/fa";
import { HiOutlineAdjustmentsHorizontal as Adjust } from "react-icons/hi2";
import { GrSchedulePlay as Sched } from "react-icons/gr";
import { AiFillSafetyCertificate as Aligned } from "react-icons/ai";
import { GiRibbonMedal as Medal } from "react-icons/gi";
import { MdAdminPanelSettings as Mod } from "react-icons/md";
import { FaArrowTrendUp as Grow } from "react-icons/fa6";
import { RiVerifiedBadgeFill as Quality } from "react-icons/ri";
import LoginButton from '../components/Layout/Modals/FrontSignin';
import EcosystemMenu from '../components/Layout/EcosystemNav/EcosystemMenu';
import { IoMdTrophy } from "react-icons/io";
import { IoInformationCircleOutline as Info, IoLogIn } from "react-icons/io5";
import { PiSquaresFourLight as Actions, PiBankFill } from "react-icons/pi";
import { Logo } from './assets';
import useStore from '../utils/store';
import ProfilePage from './~/studio';
import axios from 'axios';
import { verifySignInMessage } from '@farcaster/auth-client';
import fetch from 'node-fetch'; // or global fetch if available

export default async function handler(req, res) {
  const { message, signature } = req.body;

  try {
    // 1. Verify Farcaster sign-in
    const result = await verifySignInMessage(message, signature);
    const fid = result.fid; // Farcaster user ID

    // 2. Use Neynar API to fetch signers for this user
    const neynarRes = await fetch(
      `https://api.neynar.com/v2/farcaster/user/signers?fid=${fid}`,
      { headers: { 'api_key': process.env.NEYNAR_API_KEY } }
    );
    const neynarData = await neynarRes.json();

    // 3. Get the signer UUID (if exists)
    const signerUuid = neynarData.signers?.[0]?.signer_uuid || null;

    // 4. Return combined info
    res.status(200).json({
      fid,
      signerUuid,
      user: result,
      neynarSigners: neynarData.signers,
    });
  } catch (e) {
    res.status(401).json({ error: 'Invalid Farcaster sign-in' });
  }
}