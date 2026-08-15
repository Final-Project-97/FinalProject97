import { Navigate, Outlet } from "react-router"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import PreFooter from "../components/PreFooter"

export default function BaseLayout() {
  // if (!localStorage.getItem("access_token")) {
  //   return <Navigate to={"/login"} />
  // }

  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <PreFooter />
      <Footer />
    </>
  )
}