import { useState, useRef, useEffect, Fragment } from "react";
import styles from "./App.module.css";

const TIMEOUT_DELAY = 5000;
const DEFAULT_VIDEO_WIDTH = 750;
const DEFAULT_VIDEO_HEIGHT = 500;

function App() {
  const [error, setError] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  useEffect(() => {
    return () => {
      if (!timeoutRef.current) return;
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const captureVideoSnapshot = () => {
    timeoutRef.current = setTimeout(() => {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (!video || !canvas) return;
      const canvasContext = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height);
      const tracks = video.srcObject?.getTracks() ?? [];
      tracks.forEach((track) => track.stop());
      
      setIsCapturing(false);
      timeoutRef.current = null;
    }, TIMEOUT_DELAY);
  };

  const handleOnClick = async () => {
    setIsCapturing(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (!stream) return;

      setMediaStream(stream);
      captureVideoSnapshot();
    } catch (error) {
      setError(error);
      setIsCapturing(false);
    }
  };

  return (
    <div className={styles["container"]}>
      <h1>Video capture</h1>
      <p>
        Click the button to allow camera access. A photo will be taken
        automatically after a few seconds.
      </p>
      <button onClick={handleOnClick} disabled={isCapturing}>
        {isCapturing ? "Capturing..." : "Start"}
      </button>
      {error ? (
        <p className={styles["error"]}>
          Error accessing media devices. Please check your permissions.
        </p>
      ) : (
        <Fragment>
          {mediaStream && (
            <video
              ref={videoRef}
              autoPlay
              width={DEFAULT_VIDEO_WIDTH}
              height={DEFAULT_VIDEO_HEIGHT}
              className={styles["media-container"]}
            />
          )}
          <canvas ref={canvasRef} className={styles["media-container"]} />
        </Fragment>
      )}
    </div>
  );
}

export default App;
