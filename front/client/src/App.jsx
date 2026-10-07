import { useEffect, useRef } from "react";
import MenuView from "./components/MenuView";
import { startMenu } from "./startMenu";
import "./App.css";

function App() {
  const rootRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const stop = startMenu(rootRef.current, mapRef.current);
    return stop;
  }, []);

  return <MenuView rootRef={rootRef} mapRef={mapRef} />;
}

export default App;
