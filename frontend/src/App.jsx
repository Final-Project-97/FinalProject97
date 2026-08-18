import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./views/Home";
import BaseLayout from "./layout/BaseLayout";
import Login from "./views/Login";
import Register from "./views/Register";
import CarDetail from "./views/CarDetail";
import Catalog from "./views/Catalog";
import Recommend from "./views/Recommend";
import AuthProvider from "./context/AuthContext";
import ShowroomProvider from "./context/ShowroomContext";
import Showrooms from "./views/Showrooms";
import Credit from "./views/Credit";
import Wishlist from "./views/Wishlist";
import Upgrade from "./views/Upgrade";
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
            <Route
              path="/simulasi-kredit"
              element={
                <Credit />
              }
            />
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
            {/* Placeholder routes for Brian */}
            {/* <Route path="/credit" element={<Credit />} /> */}
            {/* <Route path="/profile" element={<Profile />} /> */}
          </Route>
        </Routes>
        </AuthProvider>
      </BrowserRouter>
      <ToastContainer position="top-right" theme="dark" />
    </>
  )
}

export default App;
