import { useRef, useState } from 'react';
import '../style/index.css';

const App = (props: object) => {
  console.log('pops', props)
  const videoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder>(null);
  const mediaStreamRef = useRef<MediaStream>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const handleDataAvailable = (ev: BlobEvent) => {
    console.log('video data available');
    recordedChunks.current.push(ev.data);
  };

  const handleStopRecording = async (ev: Event) => {
    const blob = new Blob(recordedChunks.current, {
      type: 'video/webm; codecs=vp9'
    });

    const arrayBuffer = await blob.arrayBuffer();
    window.electronAPI.saveVideoBuffer(arrayBuffer);

    recordedChunks.current = [];
  };

  const handleStartRecording = () => {
    if (!isRecording && mediaStreamRef.current != null) {
      recorderRef.current = new MediaRecorder(mediaStreamRef.current, { mimeType: 'video/webm; codecs=vp9' });
      recorderRef.current.ondataavailable = handleDataAvailable;
      recorderRef.current.onstop = handleStopRecording;
      recorderRef.current.start();
      setIsRecording(true);
    } else {
      recorderRef.current?.stop();
      setIsRecording(false);
    }

  };

  const handleSelectVideoSource = async () => {
    videoRef.current?.pause();

    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: {
        echoCancellation: true, // Reduces echo effect
        noiseSuppression: true,  // Reduces background noise
        sampleRate: 44100        // Sets the sample rate
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
    }

    mediaStreamRef.current = stream;
  };

  const handleSelectVideoSource2 = async () => {
    const sources = await window.electronAPI.getVideoSources();

    // Create a Stream
    const stream = await (navigator.mediaDevices as any).getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'desktop'
        }
      },
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: sources[0].id
        }
      }
    });

    if (stream == null) {
      return;
    }

    if (videoRef?.current != null) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }

    mediaStreamRef.current = stream;
  };

  return (
    <>
      <h1>Electron React Screen Recorder</h1>
      <video ref={videoRef}></video>
      {isRecording ? <p>Recording...</p> : <p>...</p>}
      <button
        onClick={handleStartRecording}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>

      <br />

      <button
        disabled={isRecording}
        onClick={handleSelectVideoSource}
      >
        Choose a Video Source
      </button>
    </>
  );
}

export default App;