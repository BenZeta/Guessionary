import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";

export default function BaseLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.access_token) {
      Swal.fire({
        title: "please login first",
        text: "Do you want to continue",
        icon: "error",
        confirmButtonText: "Cool",
      });
      navigate("/login");
    }
  }, []);

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}
