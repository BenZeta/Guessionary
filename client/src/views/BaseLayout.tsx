import { useEffect } from "react";
import { Outlet, useNavigate, useParams } from "react-router";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";
import axios from "axios";
import { baseUrl } from "../constants/baseUrl";

export default function BaseLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.access_token) {
      Swal.fire({
        title: "Please login first",
        icon: "error",
        confirmButtonText: "yes",
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
