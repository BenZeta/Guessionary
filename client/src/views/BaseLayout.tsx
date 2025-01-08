import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import Swal from "sweetalert2";

export default function BaseLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.access_token) {
      Swal.fire({
        title: "please login first",
        icon: "error",
        confirmButtonText: "yes",
      });
      navigate("/login");
    }
  }, []);

  return (
    <>
      <Outlet />
    </>
  );
}
