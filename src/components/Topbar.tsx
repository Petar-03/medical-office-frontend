import { useState, useRef, useEffect } from "react";

const API_BASE_URL = "http://localhost:3001/api";
const APPOINTMENT_REMINDER_WINDOW_MINUTES = 10;

type StoredDoctor = {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  specialty: string;
  workingHours: string;
};

type Appointment = {
  id: number;
  appointmentDate: string;
  appointmentTime: string;
  patientName: string;
  type: string;
  status: string;
};

type AppointmentReminder = {
  id: number;
  appointmentTime: string;
  patientName: string;
  type: string;
  minutesUntil: number;
};

function getStoredDoctor(): StoredDoctor | null {
  const rawDoctor = localStorage.getItem("doctor");

  if (!rawDoctor) {
    return null;
  }

  try {
    return JSON.parse(rawDoctor) as StoredDoctor;
  } catch {
    return null;
  }
}

type TopbarProps = {
  onLogout: () => void;
};

type ApiResponse<T> = {
  data: T;
  message: string;
};

function getAuthContext() {
  return {
    token: localStorage.getItem("authToken") || "",
    doctorId: localStorage.getItem("doctorId") || "",
  };
}

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getAppointmentDateTime(appointment: Appointment): Date {
  const [year, month, day] = appointment.appointmentDate.split("-").map(Number);
  const [hours, minutes] = appointment.appointmentTime.split(":").map(Number);

  return new Date(year, month - 1, day, hours, minutes);
}

function getAppointmentReminders(
  appointments: Appointment[]
): AppointmentReminder[] {
  const now = new Date();

  return appointments
    .filter((appointment) => appointment.status === "Предстоящ")
    .map((appointment) => {
      const startsAt = getAppointmentDateTime(appointment);
      const minutesUntil = Math.ceil(
        (startsAt.getTime() - now.getTime()) / 60000
      );

      return {
        id: appointment.id,
        appointmentTime: appointment.appointmentTime,
        patientName: appointment.patientName,
        type: appointment.type,
        minutesUntil,
      };
    })
    .filter(
      (appointment) =>
        appointment.minutesUntil >= 0 &&
        appointment.minutesUntil <= APPOINTMENT_REMINDER_WINDOW_MINUTES
    );
}

function formatReminderTime(minutesUntil: number): string {
  if (minutesUntil === 0) {
    return "Започва сега";
  }

  if (minutesUntil === 1) {
    return "След 1 минута";
  }

  return `След ${minutesUntil} минути`;
}

function Topbar({ onLogout }: TopbarProps) {
  const [doctor, setDoctor] = useState<StoredDoctor | null>(() =>
    getStoredDoctor()
  );
  const doctorName = doctor
    ? `Д-р ${doctor.firstName} ${doctor.lastName}`
    : "Д-р";
  const doctorSpecialty = doctor?.specialty || "Медицински специалист";

  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showDoctorInfo, setShowDoctorInfo] = useState<boolean>(false);
  const [showChangePassword, setShowChangePassword] = useState<boolean>(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);
  const [doctorInfoError, setDoctorInfoError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [logoutError, setLogoutError] = useState("");
  const [notificationError, setNotificationError] = useState("");
  const [appointmentReminders, setAppointmentReminders] = useState<
    AppointmentReminder[]
  >([]);
  const [isSavingDoctorInfo, setIsSavingDoctorInfo] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [doctorInfo, setDoctorInfo] = useState({
    firstName: doctor?.firstName || "",
    lastName: doctor?.lastName || "",
    email: doctor?.email || "",
    specialty: doctor?.specialty || "",
    workingHours: doctor?.workingHours || "",
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

  async function loadAppointmentReminders() {
    const { token, doctorId } = getAuthContext();

    if (!token || !doctorId) {
      return;
    }

    try {
      const today = getLocalDateKey(new Date());
      const response = await fetch(
        `${API_BASE_URL}/doctors/${doctorId}/appointments?date=${today}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = (await response.json()) as ApiResponse<Appointment[]>;

      if (!response.ok) {
        throw new Error(result.message || "Грешка при зареждане на известия.");
      }

      setAppointmentReminders(getAppointmentReminders(result.data || []));
      setNotificationError("");
    } catch (error) {
      setNotificationError(
        error instanceof Error
          ? error.message
          : "Грешка при зареждане на известия."
      );
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadAppointmentReminders();
    }, 0);
    const intervalId = window.setInterval(() => {
      void loadAppointmentReminders();
    }, 60000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
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
    setDoctorInfoError("");

    const { token, doctorId } = getAuthContext();

    try {
      setIsSavingDoctorInfo(true);

      const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(doctorInfo),
      });

      const result = (await response.json()) as ApiResponse<StoredDoctor>;

      if (!response.ok) {
        throw new Error(result.message || "Грешка при запазване на информацията.");
      }

      localStorage.setItem("doctor", JSON.stringify(result.data));
      setDoctor(result.data);
      setShowDoctorInfo(false);
    } catch (error) {
      setDoctorInfoError(
        error instanceof Error
          ? error.message
          : "Възникна грешка при запазване на информацията."
      );
    } finally {
      setIsSavingDoctorInfo(false);
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
    setPasswordError("");

    const { token, doctorId } = getAuthContext();

    try {
      setIsChangingPassword(true);

      const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Грешка при смяна на паролата.");
      }

      alert("Паролата е сменена успешно.");
      setShowChangePassword(false);

      setPasswordData({
        currentPassword: "",
        newPassword: "",
      });
    } catch (error) {
      setPasswordError(
        error instanceof Error
          ? error.message
          : "Възникна грешка при смяна на паролата."
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    setLogoutError("");
    const { token } = getAuthContext();

    try {
      setIsLoggingOut(true);

      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Грешка при изход от акаунта.");
      }

      setShowLogoutConfirm(false);
      onLogout();
    } catch (error) {
      setLogoutError(
        error instanceof Error
          ? error.message
          : "Възникна грешка при изход от акаунта."
      );
    } finally {
      setIsLoggingOut(false);
    }
  };
  return (
    <header className="topbar">
      <h1>Начало</h1>

      <div className="doctor-box">
        <div className="notification-wrapper" ref={notificationRef}>
          <button
            className={`bell ${
              appointmentReminders.length > 0 ? "bell-active" : ""
            }`}
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Известия"
          >
            🔔
            {appointmentReminders.length > 0 && (
              <span className="notification-badge">
                {appointmentReminders.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="notifications-box">
              <h4>Известия</h4>
              {notificationError && (
                <p className="notification-error">{notificationError}</p>
              )}

              {!notificationError &&
                appointmentReminders.map((appointment) => (
                  <div className="notification-alert" key={appointment.id}>
                    <strong>
                      {formatReminderTime(appointment.minutesUntil)}:{" "}
                      {appointment.appointmentTime}
                    </strong>
                    <span>{appointment.patientName}</span>
                    <small>{appointment.type}</small>
                  </div>
                ))}

              {!notificationError && appointmentReminders.length === 0 && (
                <p>Няма часове в следващите 10 минути.</p>
              )}
            </div>
          )}
        </div>

        <div className="profile-menu-wrapper" ref={profileRef}>
          <button
            className="profile-menu-button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <span>{doctorName}</span>
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

            <h2>{doctorName}</h2>
            <p className="doctor-specialty">{doctorSpecialty}</p>

            <form
              className="doctor-info-form"
              onSubmit={handleDoctorInfoSubmit}
            >
              <label>
                Име
                <input
                  type="text"
                  name="firstName"
                  value={doctorInfo.firstName}
                  onChange={handleDoctorInfoChange}
                  placeholder="Анна"
                />
              </label>

              <label>
                Фамилия
                <input
                  type="text"
                  name="lastName"
                  value={doctorInfo.lastName}
                  onChange={handleDoctorInfoChange}
                  placeholder="Иванова"
                />
              </label>

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
                Специалност
                <input
                  type="text"
                  name="specialty"
                  value={doctorInfo.specialty}
                  onChange={handleDoctorInfoChange}
                  placeholder="Обща медицина"
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

              {doctorInfoError && (
                <p className="form-message form-message-error">{doctorInfoError}</p>
              )}

              <button
                type="submit"
                className="doctor-info-save-btn"
                disabled={isSavingDoctorInfo}
              >
                {isSavingDoctorInfo ? "Запазване..." : "Запази информацията"}
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
                  name="currentPassword"
                  value={passwordData.currentPassword}
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

              {passwordError && (
                <p className="form-message form-message-error">{passwordError}</p>
              )}

              <button
                type="submit"
                className="doctor-info-save-btn"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? "Запазване..." : "Потвърди"}
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

            {logoutError && (
              <p className="form-message form-message-error">{logoutError}</p>
            )}

            <div className="logout-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Отказ
              </button>

              <button
                className="confirm-btn"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Излизане..." : "Продължи"}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Topbar;
