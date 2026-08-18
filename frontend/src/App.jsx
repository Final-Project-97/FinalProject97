import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./views/Home";
import BaseLayout from "./layout/BaseLayout";
import Login from "./views/Login";
import CarDetail from "./views/CarDetail";
import Catalog from "./views/Catalog";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<BaseLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/cars" element={<Catalog />} />
            <Route path="/cars/:id" element={<CarDetail />} />
            {/* Placeholder routes for Brian */}
            {/* <Route path="/credit" element={<Credit />} /> */}
            {/* <Route path="/profile" element={<Profile />} /> */}
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
