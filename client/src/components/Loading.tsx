import { useState, useEffect } from "react";

export default function WordsLoading() {
  const [showSpinner, setShowSpinner] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTo, setShowTo] = useState(false);
  const [showGuessionary, setShowGuessionary] = useState(false);
    const [showDelay, setShowDelay] = useState(false)
  useEffect(() => {
    // Sequence the animations
    const timer1 = setTimeout(() => setShowWelcome(true), 600); // Show "Welcome" after 0.5s
    const timer2 = setTimeout(() => setShowTo(true), 1400); // Show "To" after 1s
    const timer3 = setTimeout(() => setShowGuessionary(true), 2400); // Show "Guessionary" after 1.5s
    // Hide spinner after all animations are done
    const timer4 = setTimeout(() => setShowSpinner(false), 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  return (
    <>
      {showSpinner && (
        <div className="h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-[#9DE6FF] to-[#58BFE2] duration-1000">
          {/* Word animations */}
          {showWelcome && (
            <div className="text-black/60 text-4xl font-silkscreen mb-4 animate-bounceDown opacity-100 transition-opacity duration-500">
              Welcome
            </div>
          )}
          {!showWelcome && (
            <div className="text-black/60 text-4xl font-silkscreen mb-4 opacity-0">
              Welcome
            </div>
          )}

          {showTo && (
            <div className="text-black/60 text-4xl font-silkscreen mb-4 animate-bounceDown opacity-100 transition-opacity duration-500">
              To
            </div>
          )}
          {!showTo && (
            <div className="text-black/60 text-4xl font-silkscreen mb-4 opacity-0">
              To
            </div>
          )}

          {showGuessionary && (
            <div className="bg-black/20 rounded-lg text-white p-3 text-4xl font-silkscreen animate-bounceDown opacity-100 transition-opacity duration-2400">
              Guessionary
            </div>
          )}
          {!showGuessionary && (
            <div className="text-black text-4xl font-silkscreen opacity-0">
              Guessionary
            </div>
          )}
        </div>
      )}
    </>
  );
}
