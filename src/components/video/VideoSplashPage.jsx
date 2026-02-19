import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './VideoSplashPage.module.scss';

const VIDEO_SRC = '/videos/intro.mp4';
const FALLBACK_TEXT = 'Кликните для продолжения';

const VideoSplashPage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const handleClick = () => {
    navigate('/menu');
  };

  return (
    <div
      className={`${styles.wrapper} ${videoLoaded ? styles.videoLoaded : ''}`}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      role='button'
      tabIndex={0}
      aria-label='Нажмите для перехода в меню'
    >
      <video
        ref={videoRef}
        className={styles.video}
        src={VIDEO_SRC}
        autoPlay
        muted
        loop
        playsInline
        onCanPlay={() => setVideoLoaded(true)}
        onError={() => {}}
      />
      <div className={styles.fallback}>{FALLBACK_TEXT}</div>
    </div>
  );
};

export default VideoSplashPage;
