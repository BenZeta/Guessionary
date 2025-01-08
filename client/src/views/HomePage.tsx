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
  // Add other properties as needed
}

type User = {
  id: string;
  avatar: string;
  username: string;
};

export default function HomePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [targetedRoomId, setTargetedRoomId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([])
  const isFirstRender = useRef(true);
  const navigate = useNavigate();

  const fetchRooms = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const { data } = await axios.get(`${baseUrl}/rooms`, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });

      setRooms(data);

      socket.emit("roomList", data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getUsers = async () => {
    try {
      const { data } = await axios.get(`${baseUrl}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });
      // console.log(data);
      
      setUsers(data);

      socket.emit("userList", data?.users);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
getUsers()
  }, [])
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

      await axios.patch(
        baseUrl + "/join-room",
        { targetedRoomId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.access_token}`,
          },
        }
      );

      socket.emit("joinRoom", `${targetedRoomId}`);
      navigate(`/lobby/${targetedRoomId}`);
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
        socket.emit("roomName", {
          roomName: result.value,
          username: localStorage.username,
        });

        // You can send this room name to your backend or show a toast message here.
        axios
          .post(
            baseUrl + "/create-room",
            { roomName: result.value },
            {
              headers: { Authorization: `Bearer ${localStorage.access_token}` },
            }
          )
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
console.log(users);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-700 via-purple-500 to-blue-600">
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Room List */}

        <div className="w-1/2 bg-white/10 p-4">
          <div className="bg-black bg-opacity-10 p-5 rounded-lg h-full flex flex-col">
            <h2 className="text-xl font-bold text-teal-300 mb-4 flex justify-center">Room List</h2>
            {loading ? (
              <div className="flex justify-center h-full items-center">
                <img
                  src="https://media.tenor.com/VwmFDyI4zrIAAAAM/cat.gif"
                  alt=""
                />
              </div>
            ) : (
              <div className="h-[calc(100%-100px)] overflow-y-auto flex flex-col gap-4 scrollbar">
                {rooms.map((room) => {
                  return (
                    <button
                      key={room.id}
                      onClick={() => {
                        setTargetedRoomId(room.id);
                      }}
                      className={`p-4 rounded-lg cursor-pointer hover:bg-teal-500 text-white ${targetedRoomId === room.id ? "bg-teal-500" : "bg-black/20"}`}>
                      {/* className={`p-4 rounded-lg cursor-pointer hover:bg-teal-500 text-white ${targetedRoomId === room.id ? "bg-teal-500" : "bg-black/20"}`}> */}
                      <div>{room.name}</div>
                    </button>
                  );
                })}
              </div>
            )}

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
            <h2 className="text-xl font-bold text-teal-300 mb-4 flex justify-center">Your Profile</h2>

            {/* Grid Content */}
            <div className="grid grid-cols-4 gap-5 rounded-xl w-full overflow-y-auto scrollbar p-1">
              {loading ? (
                <div className="flex justify-center h-full items-center">
                  <img
                    src="https://media.tenor.com/VwmFDyI4zrIAAAAM/cat.gif"
                    alt="loading"
                  />
                </div>
              ) : (
                <>
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="w-full h-fit group bg-transparant rounded-full flex flex-col items-center justify-between relative"
                    >
                      {/* Image placed in the background */}
                      <div className="relative overflow-hidden w-full rounded-full">
                        <img
                          src={user.avatar}
                          className="h-full w-full object-cover"
                          alt={user.username}
                        />
                        {/* Overlay div for animation */}
                        <div className="absolute h-full w-full bg-black/40 text-white flex items-center justify-center rounded-full -bottom-10 group-hover:bottom-0 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out">
                          <h2 className="mt-3 text-xl capitalize font-silkscreen text-center">
                            {user.username}
                          </h2>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
