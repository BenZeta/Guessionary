import { useEffect, useState } from "react";
import { socket } from "../socket/socket";
import Swal from "sweetalert2";

export default function HomePage() {
  const [roomName, setRoomName] = useState<string>("");

  const handleSwal = () => {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Something went wrong!",
      footer: '<a href="#">Why do I have this issue?</a>',
    });
  };

  useEffect(() => {
    socket.auth = {
      token: localStorage.username,
    };

    socket.connect();

    socket.emit("roomName", roomName);

    return () => {
      //   socket.off("message:update");
      socket.disconnect();
    };
  }, []);
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-700 via-purple-500 to-blue-600">
      {/* Header */}
      <div className="flex justify-center items-center p-4 bg-black/20">
        <h1 className="text-2xl text-white font-bold">Welcome to Game Rooms</h1>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Room List */}
        <div className="w-1/2 bg-white/10 p-4">
          <div className="bg-black bg-opacity-10 p-5 rounded-lg h-full flex flex-col">
            <h2 className="text-xl font-bold text-teal-300 mb-4 flex justify-center">
              Room List
            </h2>
            <div className="h-[calc(100%-100px)] overflow-y-auto flex flex-col gap-4 scrollbar p-1">
              <div className="p-4 bg-black/20 text-white rounded-lg cursor-pointer hover:bg-teal-500">
                <div>Halo</div>
              </div>
              <div className="p-4 bg-black/20 text-white rounded-lg cursor-pointer hover:bg-teal-500">
                <div>Room </div>
              </div>
              {/* Add more rooms dynamically if needed */}
            </div>

            {/* Create Room Button */}
            <button
              className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg"
              onClick={() => handleSwal()}
            >
              Create New Room
            </button>
          </div>
        </div>

        {/* Right Panel: Profile */}
        <div className="w-1/2 bg-white/10 p-4">
          <div className="bg-black bg-opacity-10 p-5 rounded-lg h-full flex flex-col">
            <h2 className="text-xl font-bold text-teal-300 mb-4 flex justify-center">
              Your Profile
            </h2>

            {/* Grid Content */}
            <div className="grid grid-cols-2 gap-5 rounded-lg w-full overflow-y-auto scrollbar flex-1 p-1">
              <div className="bg-gray-300 rounded-xl min-h-[200px] flex items-center justify-center">
                {/* Content */}
              </div>
              <div className="bg-gray-300 rounded-xl min-h-[200px] flex items-center justify-center">
                {/* Content */}
              </div>
              <div className="bg-gray-300 rounded-xl min-h-[200px] flex items-center justify-center">
                {/* Content */}
              </div>
              <div className="bg-gray-300 rounded-xl min-h-[200px] flex items-center justify-center">
                {/* Content */}
              </div>
              <div className="bg-gray-300 rounded-xl min-h-[200px] flex items-center justify-center">
                {/* Content */}
              </div>
              <div className="bg-gray-300 rounded-xl min-h-[200px] flex items-center justify-center">
                {/* Content */}
              </div>
              <div className="bg-gray-300 rounded-xl min-h-[200px] flex items-center justify-center">
                {/* Content */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
