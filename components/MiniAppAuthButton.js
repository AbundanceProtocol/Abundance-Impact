'use client'
import { useState } from 'react';
// import { Warp } from '../pages/assets';
import { SiFarcaster } from "react-icons/si";

export default function MiniAppAuthButton({ onSuccess, onError, points = '$IMPACT', referrer = null }) {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      // 1. Fetch nonce from backend
      const nonceRes = await fetch('/api/auth/nonce');
      const { nonce } = await nonceRes.json();

      // 2. Use Mini App SDK to sign the nonce
      const { sdk } = await import('@farcaster/miniapp-sdk')
      const { message, signature } = await sdk.actions.signIn({ nonce });

      // 3. Send message and signature to backend to fetch signers
      const signersRes = await fetch(`/api/auth/signers?message=${encodeURIComponent(message)}&signature=${signature}`);
      const signersData = await signersRes.json();
      console.log('signersData:', signersData);

      // 4. If approved signer exists, store and call onSuccess
      let signer = signersData.signers?.find(s => s.status === 'approved');
      if (signer) {
        console.log('Approved signer found:', signer);
        localStorage.setItem('neynar_authenticated_user', JSON.stringify({
          isAuthenticated: true,
          user: signersData.user || null,
          signers: [signer],
        }));
        // Defensive: Only check eligibility if fid and uuid exist
        const fid = (signersData.signers && signersData.signers[0]?.fid) ? signersData.signers[0]?.fid : (signer && signer.fid ? signer.fid : null);
        const uuid = signer ? signer.signer_uuid : null;

        onSuccess && onSuccess(signersData.signers[0]?.fid || null, signersData.signers[0]?.signer_uuid || null, [signer]);
        setLoading(false);
        return;
      }

      // 5. If no approved signer, create one and handle approval
      const createRes = await fetch('/api/auth/signer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, signature }),
      });
      const createData = await createRes.json();

      // Show approval URL (QR code or deep link)
      if (createData.approvalUrl) {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          window.location.href = createData.approvalUrl;
        } else {
          alert('Scan this QR code to approve: ' + createData.approvalUrl);
        }
      }

      // Poll for approval
      let approved = false;
      let pollCount = 0;
      while (!approved && pollCount < 30) {
        await new Promise(r => setTimeout(r, 2000));
        const statusRes = await fetch(`/api/auth/signer?signerUuid=${createData.signerUuid}`);
        const statusData = await statusRes.json();
        if (statusData.status === 'approved') {
          signer = statusData;
          approved = true;
        }
        pollCount++;
      }
      if (!approved) throw new Error('Signer approval timed out');

      // 6. Store user and signer info
      localStorage.setItem('neynar_authenticated_user', JSON.stringify({
        isAuthenticated: true,
        user: signersData.user || null,
        signers: [signer],
      }));
      // Defensive: Only check eligibility if fid and uuid exist
      const fid = (signersData.signers && signersData.signers[0]?.fid) ? signersData.signers[0]?.fid : (signer && signer.fid ? signer.fid : null);
      const uuid = signer ? signer.signer_uuid : null;

      onSuccess && onSuccess(signersData.signers[0]?.fid || null, signersData.signers[0]?.signer_uuid || null, [signer]);
    } catch (err) {
      onError && onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className='flex-row' style={{padding: '6px', borderRadius: '6px', backgroundColor: '#369', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'}} onClick={handleSignIn} disabled={loading}>
      <SiFarcaster size={23} color={'#fff'} />
      <div style={{fontSize: '13px', fontWeight: '600', color: '#fff', padding: '0 5px 0 0', whiteSpace: 'nowrap'}}>{loading ? 'Connecting...' : 'Sign in'}</div> 
    </button>
  );
} 


// 7c65c1