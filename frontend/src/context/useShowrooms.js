import { useContext } from "react";
import ShowroomContext from "./showroom-context";

function useShowrooms() {
  const context = useContext(ShowroomContext);

  if (!context) {
    throw new Error("useShowrooms must be used within a ShowroomProvider");
  }

  return context;
}

export default useShowrooms;
