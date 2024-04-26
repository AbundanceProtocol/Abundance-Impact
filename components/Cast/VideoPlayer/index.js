import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

const VideoPlayer = ({ src, width }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    if (Hls.isSupported()) {
      hlsRef.current = new Hls();
      hlsRef.current.loadSource(src);
      hlsRef.current.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [src]);

  return <video ref={videoRef} controls width={width} style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: '8px', marginTop: '10px' }} />;
};

export default VideoPlayer;
