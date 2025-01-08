export default function Navbar() {
  return (
    <nav className="sticky top-0 flex justify-between items-center p-4 bg-black/20">
      <button className="border-2 border-black/20 rounded-xl bg-black/10 p-2 text-white">
        Back to Home
      </button>
      <h1 className="text-2xl text-white font-bold">Welcome to Game Rooms</h1>
    </nav>
  );
}
