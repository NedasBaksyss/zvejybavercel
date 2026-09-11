import { useEffect, useRef } from "react";
import MenuView from "./components/MenuView";
import { startMenu } from "./startMenu";
import "./App.css";

function App() {
  const rootRef = useRef(null);

  useEffect(() => {
    const stop = startMenu(rootRef.current);
    return stop;
  }, []);

  return <MenuView rootRef={rootRef} />;
}

export default App;
