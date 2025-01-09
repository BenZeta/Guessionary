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

type User = {
  id: string;
  avatar: string;
  username: string;
};

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
    getUsers();
  }, []);
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

      socket.emit("joinRoom", { roomId: targetedRoomId, username: localStorage.username, avatar: localStorage.avatar, role: "Staff" });

      navigate(`/lobby/${targetedRoomId}`);
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
              users: [...room.users, data.username, data.avatar, data.role],
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
  console.log(users);

  return (
    
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-700 via-purple-500 to-blue-600">
      {/* Main Content */}
      
      <div className="flex flex-1 overflow-hidden">
        {/* Room List */}
        <div className="w-1/2 bg-white/10 p-4">
          <div className="bg-black bg-opacity-10 p-5 rounded-lg h-full flex flex-col">
            <h2 className="text-xl font-bold text-teal-300 mb-4 flex justify-center">Room List</h2>
            {loading ? (
              <div className="flex justify-center h-full items-center">
                <img
                  src="https://ik.imagekit.io/3a0xukows/Guessionary%20v1.png?updatedAt=1736265436299" className="animate-spin w-2/12 h-2/12"
                  alt="Loading"
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
            <div className="flex justify-center w-full space-x-5">
              
              <button
                className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg transition-all ease-out p-2 
hover:translate-y-1 hover:shadow-[0_2px_0px_rgb(0,0,0)]"
                onClick={handleCreateRoom}>
                Create New Room
              </button>
              <button
                className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg transition-all ease-out p-2 
hover:translate-y-1 hover:shadow-[0_2px_0px_rgb(0,0,0)]"
                onClick={handleJoinRoom}>
                Join Room
              </button>
            </div>
          </div>
        </div>

        {/* Profile */}
        <div className="w-1/2 bg-white/10 p-4">
          <div className="bg-black bg-opacity-10 p-5 rounded-lg h-full flex flex-col">
            <h2 className="text-xl font-bold text-teal-300 mb-4 flex justify-center">Players</h2>

            {/* Grid Content */}
            <div className="grid grid-cols-4 gap-5 rounded-xl w-full overflow-y-auto scrollbar p-1">
              {loading ? (
                <div className="flex justify-center h-full items-center">
                  <img
                    src="https://ik.imagekit.io/3a0xukows/Guessionary%20v1.png?updatedAt=1736265436299" className="animate-spin w-9/12 h-9/12"
                    alt="loading"
                  />
                </div>
              ) : (
                <>
                  {users?.map((user) => (
                    <div
                      key={user?.id}
                      className="w-full h-fit group bg-transparant rounded-full flex flex-col items-center justify-between relative">
                      {/* Image placed in the background */}
                      <div className="relative overflow-hidden w-full rounded-full">
                        <img
                          src={user?.avatar}
                          className="h-full w-full object-cover"
                          alt={user?.username}
                        />
                        {/* Overlay div for animation */}
                        <div className="absolute h-full w-full bg-black/40 text-white flex items-center justify-center rounded-full -bottom-10 group-hover:bottom-0 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out">
                          <h2 className="mt-3 text-xl capitalize font-silkscreen text-center">{user?.username}</h2>
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
    </div>
    
  );
}
