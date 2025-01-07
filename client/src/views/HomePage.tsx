import { useEffect, useState } from "react";
import { socket } from "../socket/socket";
import { baseUrl } from "../constants/baseUrl";
import axios from "axios";

export default function HomePage() {
  const [roomName, setRoomName] = useState<string>("");

  const handleRoomNameSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit("roomName", { roomName, username: localStorage.username });

    try {
      const { data } = await axios.post(baseUrl + "/createRoom", { roomName });

      // toastify room has been created
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    socket.auth = {
      token: localStorage.username,
    };

    socket.connect();

    return () => {
      //   socket.off("message:update");
      socket.disconnect();
    };
  }, []);
  return (
    <div>
      <h1>Home Page</h1>
      <form onSubmit={handleRoomNameSubmit}>
        <input
          onChange={(e) => setRoomName(e.target.value)}
          type="text"
          placeholder="Enter room name"
        />
      </form>
    </div>
  );
}
