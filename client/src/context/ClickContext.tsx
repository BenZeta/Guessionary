import React, { createContext, useContext, useRef } from "react";

const ClickContext = createContext<any>(null); // Default to `null`

export const ClickProvider = ({ children }: { children: React.ReactNode }) => {
  const clickSoundRef = useRef(
    new Audio(
      "https://ik.imagekit.io/3a0xukows/pop-sound-effect-226108.mp3?updatedAt=1736400738568"
    )
  );

  const playClickSound = () => {
    if (clickSoundRef.current) {
      clickSoundRef.current.currentTime = 0; // Reset playback to the start
      clickSoundRef.current.play();
    }
  };

  return (
    <ClickContext.Provider value={{ playClickSound }}>
      {children}
    </ClickContext.Provider>
  );
};

export const clickSound = () => useContext(ClickContext); // Properly access context
