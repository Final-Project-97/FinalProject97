import { Outlet } from "react-router"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import PreFooter from "../components/home/PreFooter"

export default function BaseLayout() {

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