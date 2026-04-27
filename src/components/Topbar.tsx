import { useState } from "react";
import doctorImage from "../assets/doctor-ivanova.png";
function Topbar() {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="topbar">
      <h1>Начало</h1>

      <div className="search-box">
        <span>⌕</span>
        <input type="text" placeholder="Търсене..." />
      </div>

      <div className="doctor-box">
        <div className="notification-wrapper">
          <button
            className="bell"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔
          </button>

          {showNotifications && (
            <div className="notifications-box">
              <h4>Известия</h4>

              <p>Имате 3 предстоящи часа.</p>
              <p>Имате 2 нови пациента.</p>
              <p>Проверете графика за деня.</p>
            </div>
          )}
        </div>
        <img src={doctorImage} alt="Д-р Иванова" className="avatar" />
        <span>Д-р Иванова</span>
      </div>
    </header>
  );
}

export default Topbar;
