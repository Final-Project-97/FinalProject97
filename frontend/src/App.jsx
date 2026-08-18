import { BrowserRouter, Routes, Route } from "react-router";
import AuthProvider from "./context/AuthContext";
import ShowroomProvider from "./context/ShowroomContext";
import Home from "./views/Home";
import BaseLayout from "./layout/BaseLayout";
import Login from "./views/login/Login";
import Register from "./views/Register";
import CarDetail from "./views/CarDetail";
import Catalog from "./views/Catalog";
import Recommend from "./views/recommend/Recommend";
import Showrooms from "./views/showroom/Showrooms";
import Credit from "./views/credit/Credit";
import Wishlist from "./views/wishlist/Wishlist";
import Upgrade from "./views/upgrade/Upgrade";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<BaseLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/cars/:id" element={<CarDetail />} />
              <Route
                path="/recommendation"
                element={
                  <ShowroomProvider>
                    <Recommend />
                  </ShowroomProvider>
                }
              />
              <Route
                path="/showrooms"
                element={
                  <ShowroomProvider>
                    <Showrooms />
                  </ShowroomProvider>
                }
              />
              <Route path="/credit" element={<Credit />} />
              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute>
                    <Wishlist />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upgrade"
                element={
                  <ProtectedRoute>
                    <Upgrade />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <ToastContainer position="top-right" theme="dark" />
    </>
  );
}

export default App;