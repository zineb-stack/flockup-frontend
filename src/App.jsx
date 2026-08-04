import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Nav from "./components/Nav";
import Sidebar from "./components/Sidebar";
import FloatingAddButton from "./components/FloatingAddButton";
import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import TaskNew from "./pages/TaskNew";
import HabitNew from "./pages/HabitNew";
import Channels from "./pages/Channels";
import ChannelDetail from "./pages/ChannelDetail";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Pomodoro from "./pages/Pomodoro";
import ProPage from "./pages/ProPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "./App.css";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 900);
  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 900);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isDesktop;
}

function Layout() {
  const location = useLocation();
  const hideNav = ["/login", "/signup"].includes(location.pathname);
  const isDesktop = useIsDesktop();

  return (
    <div className={hideNav ? "" : "app-shell"}>
      {!hideNav && isDesktop && <Sidebar />}
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/new" element={<TaskNew />} />
          <Route path="/habits/new" element={<HabitNew />} />
          <Route path="/pro" element={<ProPage />} />
          <Route path="/pomodoro" element={<Pomodoro />} />
          <Route path="/channels" element={<Channels />} />
          <Route path="/channels/:channelId" element={<ChannelDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
      {!hideNav && !isDesktop && <Nav />}
      {!hideNav && <FloatingAddButton />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;