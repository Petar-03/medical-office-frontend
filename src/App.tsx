import { useState } from "react";
import Login from "./pages/Login";
import { Routes, Route } from "react-router-dom";
import "./App.css";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import Home from "./pages/Home";
import Patients from "./pages/Patients";
import Appointments from "./pages/Appointments";
import Services from "./pages/Services";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    localStorage.getItem("isLoggedIn") === "true"
  );

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }
  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <Topbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/services" element={<Services />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
