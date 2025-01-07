import { useEffect, useState } from "react";
import { socket } from "../socket/socket";

export default function HomePage() {
  const [roomName, setRoomName] = useState<string>("");

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
    <div>

      <h1>Home Page</h1>
      <input
        onChange={(e) => setRoomName(e.target.value)}
        type="text"
      />

    </div>
  );
}
