import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo-box">
        <div className="logo-icon">✚</div>
        <div>
          <h2>Медика Про</h2>
          <p>Медицински кабинет</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className="nav-link">
          🏠 Начало
        </NavLink>

        <NavLink to="/appointments" className="nav-link">
          🕜 Часове
        </NavLink>

        <NavLink to="/patients" className="nav-link">
          👥 Пациенти
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
