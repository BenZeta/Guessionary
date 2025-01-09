import { Avatar } from "../helpers/Avatar";
import { useSound } from "../context/SoundContext";

export default function CardPage() {
  const avatars = Avatar;
  const { isPlaying, toggleAudio } = useSound();

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#9DE6FF] to-[#58BFE2] relative overflow-hidden">
      {/* navbar */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex justify-center items-center bg-hidden rounded-3xl w-60 h-14 gap-x-20 z-10">
        <a href="/login">
          <img
            src="https://ik.imagekit.io/3a0xukows/home.png?updatedAt=1736350418372"
            alt="home"
            className="w-10 animate-bounceUp"
          />
          <span className="font-bold font-silkscreen text-sm text-white animate-bounceUp">
            Home
          </span>
        </a>
        <a href="/avatars">
          <img
            src="https://ik.imagekit.io/3a0xukows/trading-card%20(4).png?updatedAt=1736350980793"
            alt="avatars"
            className="w-10 animate-bounceUp"
          />
          <span className="font-bold font-silkscreen text-sm text-white animate-bounceUp">
            Avatar
          </span>
        </a>
        <button onClick={toggleAudio}>
          <img
            src="https://ik.imagekit.io/3a0xukows/wave-sound.png?updatedAt=1736351115020"
            alt="sound"
            className="w-10 animate-bounceUp"
          />
          <span className="font-bold font-silkscreen text-sm text-white animate-bounceUp">
            {isPlaying ? "Pause Audio" : "Play Audio"}
          </span>
        </button>
      </div>
      {/* card */}
      <div className="flex items-center justify-center relative overflow-x-hidden mt-40 ">
        <div className="flex space-x-6  animate-slideshow">
          {/* Duplicate cards for seamless looping */}
          {avatars.concat(avatars).map((avatar, index) => (
            <div
              key={index}
              className="min-w-[250px] max-w-sm bg-[#58BFE2] rounded-xl border-2 border-white shadow-lg overflow-hidden transform transition-transform"
            >
              <img
                src={avatar}
                alt={`Avatar ${index}`} // Dynamic alt text
                className="w-full h-60 object-cover"
              />
              <div className="p-5">
                <h2 className="text-2xl font-silkscreen font-bold text-white">
                  NFT #{(index % avatars.length) + 1}
                </h2>
                <p className="text-white font-silkscreen text-sm">
                  Own your NFT's and kill the game!
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold font-silkscreen text-yellow-400">
                    0.0 ETH
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Keyframe Animation */}
      <style>{`
        @keyframes slideshow {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-slideshow {
          display: flex;
          animation: slideshow 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
