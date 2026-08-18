import { Outlet, useLocation } from "react-router"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import PreFooter from "../components/home/PreFooter"

export default function BaseLayout() {
  const location = useLocation()
  const showPreFooter = !location.pathname.startsWith("/recommendation")
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      {showPreFooter && <PreFooter />}
      <Footer />
    </>
  )
}
