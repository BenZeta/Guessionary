import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";

// Type for the context state
type SoundContextType = {
  isPlaying: boolean;
  toggleAudio: () => void;
};

// Create the SoundContext
const SoundContext = createContext<SoundContextType | undefined>(undefined);

// Create the SoundProvider component to provide the context to the app
export const SoundProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying((prev) => !prev);
    }
  };

  // Automatically manage the playback state on change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = true; // Ensure the audio loops indefinitely
      if (isPlaying) {
        audioRef.current
          .play()
          .catch((error) => console.error("Error playing audio:", error));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]); // Effect runs when isPlaying changes

  return (
    <SoundContext.Provider value={{ isPlaying, toggleAudio }}>
      {/* Background Audio Element */}
      <audio
        ref={audioRef}
        src="https://ik.imagekit.io/3a0xukows/Game%20Soundtrack.mp3?updatedAt=1736396611218"
        onError={() => console.error("Error loading the audio")}
      />
      {children}
    </SoundContext.Provider>
  );
};

// Custom hook to access the SoundContext
export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
};
