import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./views/Home";
import BaseLayout from "./layout/BaseLayout";
import Login from "./views/Login";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<BaseLayout />}>
            <Route path="/" element={<Home />} />
            {/* <Route path="/car/:id" element={<CarDetail />} /> */}
            {/* aku bingung routenya :v */}
            {/* <Route path="/credit" element={<Credit />} /> */}
            {/* <Route path="/profile" element={<Profile />} /> */}
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
