import { useEffect, useState } from "react";
import { socket } from "../socket/socket";
import Swal from "sweetalert2";
import { baseUrl } from "../constants/baseUrl";
import axios from "axios";

export default function HomePage() {
  const [roomName, setRoomName] = useState<string>("");
  const [rooms, setRooms] = useState<[]>([]);

  const handleSwal = () => {
    Swal.fire({
      title: "Enter Room Name",
      input: "text", // Use text input
      inputPlaceholder: "Enter your room name",
      inputAttributes: {
        autocapitalize: "off",
        autocorrect: "off",
      },
      showCancelButton: true,
      confirmButtonText: "Create Room",
      confirmButtonColor: "#38b2ac", // teal-500 color to match theme
      cancelButtonText: "Cancel",
      cancelButtonColor: "#e53e3e", // red color for cancel
      background: "#2d3748", // darker background for a modern look
      color: "#edf2f7", // white text color for contrast
      customClass: {
        input: "px-4 py-2 rounded-md bg-teal-700 text-white", // Apply theme styles
        confirmButton: "bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg",
        cancelButton: "bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg",
      },
      preConfirm: (inputRoomName) => {
        if (!inputRoomName) {
          Swal.showValidationMessage("Room name is required!");
        } else {
          setRoomName(inputRoomName); // Update state with the room name
          return inputRoomName;
        }
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        // If a room name was successfully entered and confirmed, proceed with room creation
        socket.emit("roomName", { roomName: result.value, username: localStorage.username });

        // You can send this room name to your backend or show a toast message here.
        axios
          .post(baseUrl + "/create-room", { roomName: result.value }, { headers: { Authorization: `Bearer ${localStorage.access_token}` } })
          .then((response) => {
            console.log("Room created:", response.data);
          })
          .catch((error) => {
            console.log("Error creating room:", error);
          });
      }
    });
  };

  useEffect(() => {
    socket.auth = {
      token: localStorage.username,
    };

    socket.connect();

    socket.on("roomList", (data) => {
      console.log(data);
    });

    return () => {
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
            <h2 className="text-xl font-bold text-teal-300 mb-4 flex justify-center">Room List</h2>
            <div className="h-[calc(100%-100px)] overflow-y-auto flex flex-col gap-4 scrollbar">
              <button
                className="p-4 bg-black/20 text-white rounded-lg cursor-pointer hover:bg-teal-500"
                onClick={() => setRoomName("Halo")}>
                <div>Halo</div>
              </button>
              <div
                className="p-4 bg-black/20 text-white rounded-lg cursor-pointer hover:bg-teal-500"
                onClick={() => setRoomName("Room")}>
                <div>Room</div>
              </div>
              {/* Add more rooms dynamically if needed */}
            </div>

            {/* Create Room Button */}
            <button
              className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg"
              onClick={handleSwal}>
              Create New Room
            </button>
          </div>
        </div>

        {/* Right Panel: Profile */}
        <div className="w-1/2 bg-white/10 p-4 ">
          <div className="bg-black bg-opacity-10 rounded-lg h-full p-5">
            <h2 className="text-xl font-bold text-teal-300 mb-4 flex justify-center">Your Profile</h2>

            <div className="grid grid-cols-2 gap-5 rounded-lg w-full h-full p-5">
              <div className="bg-gray-300 rounded-xl"></div>
              <div className="bg-gray-300 rounded-xl"></div>
              <div className="bg-gray-300 rounded-xl"></div>
              <div className="bg-gray-300 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
