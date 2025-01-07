import axios from "axios";
import { useState } from "react";
import { baseUrl } from "../constants/baseUrl";

export default function LoginPage() {
  const [username, setUsername] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(baseUrl + "/login", { username });

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("username", data.username);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
