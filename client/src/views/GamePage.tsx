import axios from "axios";
import { useEffect, useState } from "react";
import { baseUrl } from "../constants/baseUrl";
import { useParams } from "react-router";

type User = {
  id: string;
  username: string;
  avatar: string;
};

type Room = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  users: User[];
};

export default function GamePage() {
  const [room, setRoom] = useState<Room | null>(null);
  const { roomId } = useParams();

  const getUser = async () => {
    try {
      const { data } = await axios.get(`${baseUrl}/users/${roomId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      });

      // const data = await response.json();

      setRoom(data);
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-700 via-purple-500 to-blue-600">
      {/* Header */}
      <div className="flex justify-center items-center p-4 bg-black/20">
        <h1 className="text-2xl text-white font-bold hover:animate-flyInRight">Round</h1>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Room List */}
        <div className="w-3/12 bg-white/10 p-4">
          <div className="bg-black bg-opacity-10 p-5 rounded-lg h-full flex flex-col">
            <h2 className="text-xl font-bold text-teal-300 mb-4 flex justify-center">Player</h2>
            <div className="h-[calc(100%-100px)] overflow-y-auto flex flex-col gap-4 scrollbar p-1">
              {room?.users.map((user, index) => (
                <div className="p-4 bg-black/20 text-white rounded-lg cursor-pointer flex items-center gap-3 ">
                  <img src={user?.avatar} className="w-20 h-20 rounded-full" />
                  <div className="ml-3 text-2xl">{user?.username}</div>
                </div>
              ))}
            </div>

            {/* Create Room Button */}
            <button className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg">
              Create New Room
            </button>
          </div>
        </div>

        {/* Right Panel: Profile */}
        <div className="w-9/12 bg-white/10 p-4">
          <div className="bg-black bg-opacity-10 p-5 rounded-lg h-full flex flex-col">
            <h2 className="text-xl font-bold text-teal-300 mb-4 flex justify-center">
              Your Profile
            </h2>

            {/* Grid Content */}
            <div className="gap-5 rounded-lg w-full h-full overflow-y-auto scrollbar flex-1 p-1">
              <div className="bg-gray-300/50 p-5 h-full rounded-lg">
                <div className="bg-gray-200/10 h-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
