import { useState, useRef, useEffect } from "react";
import doctorImage from "../assets/doctor-ivanova.png";

function Topbar() {
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showDoctorInfo, setShowDoctorInfo] = useState<boolean>(false);
  const [showChangePassword, setShowChangePassword] = useState<boolean>(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [doctorInfo, setDoctorInfo] = useState({
    email: "",
    phone: "",
    cabinet: "",
    workingHours: "",
  });

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (profileRef.current && !profileRef.current.contains(target)) {
        setShowProfileMenu(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleDoctorInfoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    setDoctorInfo({
      ...doctorInfo,
      [name]: value,
    });
  };
  const handleDoctorInfoSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/doctor-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(doctorInfo),
      });

      if (!response.ok) {
        throw new Error("Грешка при изпращане на информацията.");
      }

      alert("Информацията е изпратена успешно.");
      setShowDoctorInfo(false);
    } catch (error) {
      alert("Възникна грешка при изпращане към сървъра.");
      console.error(error);
    }
  };
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:5000/api/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(passwordData),
        }
      );

      if (!response.ok) {
        throw new Error("Грешка при смяна на паролата.");
      }

      alert("Паролата е сменена успешно.");
      setShowChangePassword(false);

      setPasswordData({
        oldPassword: "",
        newPassword: "",
      });
    } catch (error) {
      alert("Възникна грешка при изпращане към сървъра.");
      console.error(error);
    }
  };
  return (
    <header className="topbar">
      <h1>Начало</h1>

      <div className="search-box">
        <span>⌕</span>
        <input type="text" placeholder="Търсене..." />
      </div>

      <div className="doctor-box">
        <div className="notification-wrapper" ref={notificationRef}>
          <button
            className="bell"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔
          </button>

          {showNotifications && (
            <div className="notifications-box">
              <h4>Известия</h4>
              <p>Проверете графика с прегледи за деня.</p>
              <p>Прегледайте списъка с нови пациенти.</p>
              <p>Не забравяйте да обновите информацията при промени.</p>
            </div>
          )}
        </div>

        <div className="profile-menu-wrapper" ref={profileRef}>
          <button
            className="profile-menu-button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <img src={doctorImage} alt="Д-р Иванова" className="avatar" />

            <span>Д-р Иванова</span>
            <span className="dropdown-arrow">▾</span>
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown-menu">
              <button
                className="profile-dropdown-item"
                onClick={() => {
                  setShowDoctorInfo(true);
                  setShowProfileMenu(false);
                }}
              >
                Информация за доктора
              </button>

              <button
                className="profile-dropdown-item"
                onClick={() => {
                  setShowChangePassword(true);
                  setShowProfileMenu(false);
                }}
              >
                Смяна на парола
              </button>

              <button
                className="profile-dropdown-item logout-item"
                onClick={() => {
                  setShowLogoutConfirm(true);
                  setShowProfileMenu(false);
                }}
              >
                Изход
              </button>
            </div>
          )}
        </div>
      </div>
      {showDoctorInfo && (
        <div className="modal-overlay">
          <div className="doctor-info-modal">
            <button
              className="modal-close-btn"
              onClick={() => setShowDoctorInfo(false)}
            >
              ×
            </button>

            <img
              src={doctorImage}
              alt="Д-р Иванова"
              className="doctor-modal-avatar"
            />

            <h2>Д-р Иванова</h2>
            <p className="doctor-specialty">Обща медицина</p>

            <form
              className="doctor-info-form"
              onSubmit={handleDoctorInfoSubmit}
            >
              <label>
                Имейл
                <input
                  type="email"
                  name="email"
                  value={doctorInfo.email}
                  onChange={handleDoctorInfoChange}
                  placeholder="ivanova@medikapro.bg"
                />
              </label>

              <label>
                Телефон
                <input
                  type="text"
                  name="phone"
                  value={doctorInfo.phone}
                  onChange={handleDoctorInfoChange}
                  placeholder="0888 123 456"
                />
              </label>

              <label>
                Кабинет
                <input
                  type="text"
                  name="cabinet"
                  value={doctorInfo.cabinet}
                  onChange={handleDoctorInfoChange}
                  placeholder="204"
                />
              </label>

              <label>
                Работно време
                <input
                  type="text"
                  name="workingHours"
                  value={doctorInfo.workingHours}
                  onChange={handleDoctorInfoChange}
                  placeholder="09:00 - 17:00"
                />
              </label>

              <button type="submit" className="doctor-info-save-btn">
                Запази информацията
              </button>
            </form>
          </div>
        </div>
      )}
      {showChangePassword && (
        <div className="modal-overlay">
          <div className="doctor-info-modal">
            <button
              className="modal-close-btn"
              onClick={() => setShowChangePassword(false)}
            >
              ×
            </button>

            <h2>Смяна на парола</h2>
            <p className="doctor-specialty">Въведете старата и новата парола</p>

            <form className="doctor-info-form" onSubmit={handlePasswordSubmit}>
              <label>
                Стара парола
                <input
                  type="password"
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  placeholder="Въведете стара парола"
                />
              </label>

              <label>
                Нова парола
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Въведете нова парола"
                />
              </label>

              <button type="submit" className="doctor-info-save-btn">
                Потвърди
              </button>
            </form>
          </div>
        </div>
      )}
      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="logout-modal">
            <h2>Сигурни ли сте?</h2>
            <p>Сигурни ли сте че искате да излезете от акаунта ви?</p>

            <div className="logout-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Отказ
              </button>

              <button
                className="confirm-btn"
                onClick={() => {
                  alert("Излязохте от системата"); // после тук ще сложим logout логика
                  setShowLogoutConfirm(false);
                }}
              >
                Продължи
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Topbar;
