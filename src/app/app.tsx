import { useRef, useState } from 'react';
import '../style/index.css';

const App = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder>(null);
  const mediaStreamRef = useRef<MediaStream>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handleDataAvailable = (ev: BlobEvent) => {
    recordedChunks.current.push(ev.data);
  };

  const handleStopRecording = async () => {
    const blob = new Blob(recordedChunks.current, { type: 'video/mp4' });
    const arrayBuffer = await blob.arrayBuffer();
    window.electronAPI.saveVideoBuffer(arrayBuffer);

    recordedChunks.current = [];
  };

  const handleStartRecording = () => {
    if (!isRecording && mediaStreamRef.current != null) {
      recorderRef.current = new MediaRecorder(mediaStreamRef.current, {
        audioBitsPerSecond: 2116800,
        videoBitsPerSecond: 8000000,
        mimeType: "video/mp4",
      });
      recorderRef.current.ondataavailable = handleDataAvailable;
      recorderRef.current.onstop = handleStopRecording;
      recorderRef.current.start();
      setIsRecording(true);
    } else {
      recorderRef.current?.stop();
      videoRef.current.pause();
      setIsRecording(false);
      setIsPlaying(false);
    }
  };

  const handleSelectVideoSource = async () => {
    videoRef.current?.pause();

    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: {
        autoGainControl: false,
        echoCancellation: true,
        noiseSuppression: false,
        channelCount: 2,
        sampleRate: 44100,
        sampleSize: 24,
      },
      video: {
        frameRate: 60
      },
    });

    if (stream == null) {
      return;
    }

    if (videoRef?.current != null) {
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      videoRef.current.play();
      setIsPlaying(true);
    }

    mediaStreamRef.current = stream;
  };

  return (
    <>
      <h1>Screen Recorder</h1>
      <video ref={videoRef}></video>
      <div id='controller'>
        <button
          disabled={!isPlaying}
          onClick={handleStartRecording}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        <button
          disabled={isRecording}
          onClick={handleSelectVideoSource}
        >
          Select Video Source
        </button>
      </div>
    </>
  );
}

export default App;