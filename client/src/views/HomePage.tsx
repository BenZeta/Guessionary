import { useEffect, useState, useRef } from "react";
import { socket } from "../socket/socket";
import Swal from "sweetalert2";
import { baseUrl } from "../constants/baseUrl";
import axios from "axios";
import { useNavigate } from "react-router";

interface Room {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: Date;
  gameId: string;
  users: User[];
}

interface User {
  id: string;
  username: string;
  avatar: string;
}

export default function HomePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [targetedRoomId, setTargetedRoomId] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const isFirstRender = useRef(true);
  const navigate = useNavigate();

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${baseUrl}/rooms`, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });

      console.log(data, "FETCH ROOMS");

      setRooms(data);
      setUsers(data.users);

      socket.emit("roomList", data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    try {
      if (!targetedRoomId) {
        Swal.fire({
          title: "No Room Selected",
          text: "Please select a room to join!",
          icon: "warning",
          confirmButtonText: "OK",
        });
        return;
      }
      console.log(targetedRoomId);

      await axios.patch(
        `${baseUrl}/join-room`,
        { targetedRoomId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.access_token}`,
          },
        }
      );

      socket.emit("joinRoom", { roomId: targetedRoomId, username: localStorage.username, avatar: localStorage.avatar });

      navigate(`/lobby/${targetedRoomId}`);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateRoom = () => {
    Swal.fire({
      title: "Enter Room Name",
      input: "text",
      inputPlaceholder: "Enter your room name",
      showCancelButton: true,
      confirmButtonText: "Create Room",
      confirmButtonColor: "#38b2ac",
      cancelButtonText: "Cancel",
      cancelButtonColor: "#e53e3e",
      background: "#2d3748",
      color: "#edf2f7",
      preConfirm: (inputRoomName) => {
        if (!inputRoomName) {
          Swal.showValidationMessage("Room name is required!");
        }
        return inputRoomName;
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const roomName = result.value;

        axios
          .post(
            `${baseUrl}/create-room`,
            { roomName },
            {
              headers: { Authorization: `Bearer ${localStorage.access_token}` },
            }
          )
          .then((response) => {
            const newRoom = response.data;
            socket.emit("roomCreated", newRoom);
            navigate(`/lobby/${newRoom.id}`); // Navigate to the newly created room
          })
          .catch((error) => {
            console.error("Error creating room:", error);
          });
      }
    });
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchRooms();
    }
  }, []);

  useEffect(() => {
    socket.auth = {
      token: localStorage.username,
    };

    socket.connect();

    socket.on("roomCreated:server", (newRoom: Room) => {
      setRooms((prev) => {
        // Check if the room already exists in the state
        if (prev.some((room) => room.id === newRoom.id)) {
          return prev;
        }
        return [...prev, newRoom];
      });
    });

    socket.on("joinRoom:server", (data) => {
      console.log("User joined room", data.roomId);
      console.log(data);

      // Update the room list or any other state as needed
      setRooms((prev) => {
        return prev.map((room) => {
          if (room.id === data.roomId) {
            return {
              ...room,
              users: [...room.users, data.username, data.avatar],
            };
          }
          return room;
        });
      });
      // For example, you can fetch the updated room list from the server
      fetchRooms();
    });

    return () => {
      socket.off("roomCreated:server");
      socket.off("joinRoom:server");
      socket.disconnect();
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-700 via-purple-500 to-blue-600">
      <div className="flex flex-1 overflow-hidden">
        {/* Room List */}
        <div className="w-1/2 bg-white/10 p-4">
          <div className="bg-black bg-opacity-10 p-5 rounded-lg h-full flex flex-col">
            <h2 className="text-xl font-bold text-teal-300 mb-4 flex justify-center">Room List</h2>
            {loading ? (
              <div className="flex justify-center h-full items-center">
                <img src="https://media.tenor.com/VwmFDyI4zrIAAAAM/cat.gif" alt="Loading" />
              </div>
            ) : (
              <div className="h-[calc(100%-100px)] overflow-y-auto flex flex-col gap-4 scrollbar">
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setTargetedRoomId(room.id)}
                    className={`p-4 rounded-lg cursor-pointer hover:bg-teal-500 text-white ${
                      targetedRoomId === room.id ? "bg-teal-500" : "bg-black/20"
                    }`}
                  >
                    <div>{room.name}</div>
                  </button>
                ))}
              </div>
            )}
            <div className="flex justify-center w-full space-x-5">
              <button
                className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg"
                onClick={handleCreateRoom}
              >
                Create New Room
              </button>
              <button
                className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg"
                onClick={handleJoinRoom}
              >
                Join Room
              </button>
            </div>
          </div>
        </div>

        {/* Profile */}
        <div className="w-1/2 bg-white/10 p-4">
          <div className="bg-black bg-opacity-10 p-5 rounded-lg h-full flex flex-col">
            <h2 className="text-xl font-bold text-teal-300 mb-4 flex justify-center">
              Your Profile
            </h2>
            <div className="grid grid-cols-2 gap-5 rounded-lg w-full overflow-y-auto scrollbar flex-1 p-1">
              {/* Placeholder Content */}
              <div className="bg-gray-300 rounded-xl min-h-[200px] flex items-center justify-center" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
