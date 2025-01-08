import axios from "axios";
import { useEffect, useState } from "react";
import { baseUrl } from "../constants/baseUrl";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";

export default function LoginPage() {
  const [username, setUsername] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.access_token) {
      Swal.fire({
        title: "you are already logged in",
        icon: "error",
        confirmButtonText: "yes",
      });
      navigate("/");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(baseUrl + "/login", {
        // avatar,
        username,
      });

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("username", data.username);

      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div>
        <img
          className="h-7"
          src="https://ik.imagekit.io/3a0xukows/Guessionary%20v1.png?updatedAt=1736265436299"
          alt="logo"
        />
      </div>
      <div>
        <form onSubmit={handleSubmit}>
          <input
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            placeholder="username..."
          />
        </form>
      </div>
    </div>
  );
}
