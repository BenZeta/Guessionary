import { useEffect, useState, useRef } from "react";
import { socket } from "../socket/socket";
import Swal from "sweetalert2";
import { baseUrl } from "../constants/baseUrl";
import axios from "axios";

interface Room {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: Date;
  gameId: string;
  // Add other properties as needed
}

export default function HomePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [targetedRoomId, setTargetedRoomId] = useState<string>("");
  const isFirstRender = useRef(true);

  const fetchRooms = async () => {
    try {
      const { data } = await axios.get(`${baseUrl}/rooms`, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });

      setRooms(data);

      socket.emit("roomList", data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleJoinRoom = async () => {
    try {
      if (!targetedRoomId) {
        return;
      }

      const { data } = await axios.patch(
        baseUrl + "/join-room",
        { targetedRoomId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.access_token}`,
          },
        }
      );

      socket.emit("joinRoom", `${targetedRoomId}`);
    } catch (error) {
      console.log(error);
    }
  };

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
            socket.emit("roomCreated", response.data);
          })
          .catch((error) => {
            console.log("Error creating room:", error);
          });
      }
    });
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false; // Mark the first render as handled
      fetchRooms(); // Call the function only once
    }
  }, []);

  useEffect(() => {
    socket.auth = {
      token: localStorage.username,
    };

    socket.connect();

    socket.on("roomCreated:server", (newRoom: Room) => {
      setRooms((prev) => {
        return [...prev, newRoom];
      });
    });

    return () => {
      socket.off("roomCreated:server");
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
              {rooms.map((room) => {
                return (
                  <button
                    key={room.id}
                    onClick={() => setTargetedRoomId(room.id)}
                    className="p-4 bg-black/20 text-white rounded-lg cursor-pointer hover:bg-teal-500">
                    <div>{room.name}</div>
                  </button>
                );
              })}
              {/* <button className="p-4 bg-black/20 text-white rounded-lg cursor-pointer hover:bg-teal-500">
            <h2 className="text-xl font-bold text-teal-300 mb-4 flex justify-center">
              Room List
            </h2>
            <div className="h-[calc(100%-100px)] overflow-y-auto flex flex-col gap-4 scrollbar p-1">
              <div className="p-4 bg-black/20 text-white rounded-lg cursor-pointer hover:bg-teal-500">
                <div>Halo</div>
              </button>
              <div className="p-4 bg-black/20 text-white rounded-lg cursor-pointer hover:bg-teal-500">
                <div>Room</div>
              </div> */}
              {/* Add more rooms dynamically if needed */}
            </div>

            {/* Create Room Button */}
            <div className="flex justify-center w-full space-x-5">
              <button
                className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg"
                onClick={handleSwal}>
                Create New Room
              </button>
              <button
                className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg"
                onClick={handleJoinRoom}>
                Join Room
              </button>
            </div>
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
