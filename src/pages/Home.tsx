import { useEffect, useState } from "react";
import { apiRequest, getDoctorId } from "../api/client";

type Appointment = {
  id: number;
  appointmentDate: string;
  appointmentTime: string;
  patientName: string;
  type: string;
  status: string;
};

type Patient = {
  id: number;
};

type DashboardStats = {
  todayAppointments: number;
  patients: number;
  waiting: number;
};

type StoredDoctor = {
  firstName?: string;
  lastName?: string;
};

const emptyStats: DashboardStats = {
  todayAppointments: 0,
  patients: 0,
  waiting: 0,
};

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getLocalTimeKey(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

function getDoctorDisplayName(): string {
  const savedDoctor = localStorage.getItem("doctor");

  if (!savedDoctor) {
    return "доктор";
  }

  try {
    const doctor = JSON.parse(savedDoctor) as StoredDoctor;
    const fullName = [doctor.firstName, doctor.lastName].filter(Boolean).join(" ");

    return fullName ? `Д-р ${fullName}` : "доктор";
  } catch {
    return "доктор";
  }
}

function getUpcomingAppointments(appointments: Appointment[]): Appointment[] {
  const now = new Date();
  const today = getLocalDateKey(now);
  const currentTime = getLocalTimeKey(now);

  return appointments
    .filter((appointment) => appointment.status === "Предстоящ")
    .filter(
      (appointment) =>
        appointment.appointmentDate > today ||
        (appointment.appointmentDate === today &&
          appointment.appointmentTime >= currentTime)
    )
    .slice(0, 5);
}

function getDashboardStats(
  appointments: Appointment[],
  patients: Patient[]
): DashboardStats {
  const now = new Date();
  const today = getLocalDateKey(now);
  const currentTime = getLocalTimeKey(now);
  const todayAppointments = appointments.filter(
    (appointment) => appointment.appointmentDate === today
  );
  const waitingAppointments = todayAppointments.filter(
    (appointment) =>
      appointment.status === "Предстоящ" &&
      appointment.appointmentTime >= currentTime
  );

  return {
    todayAppointments: todayAppointments.length,
    patients: patients.length,
    waiting: waitingAppointments.length,
  };
}

function Home() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const doctorName = getDoctorDisplayName();

  async function loadDashboardData() {
    try {
      setIsLoading(true);
      setError("");
      const doctorId = getDoctorId();
      const [appointmentsData, patientsData] = await Promise.all([
        apiRequest<Appointment[]>(`/doctors/${doctorId}/appointments`),
        apiRequest<Patient[]>(`/doctors/${doctorId}/patients`),
      ]);

      setAppointments(getUpcomingAppointments(appointmentsData));
      setStats(getDashboardStats(appointmentsData, patientsData));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Грешка при зареждане на началната страница."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDashboardData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <section className="content">
      <div className="welcome">
        <h2>Добре дошли, {doctorName}</h2>
        <p>Общ преглед за деня</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">▦</div>
          <div>
            <p>Часове днес</p>
            <h3>{isLoading ? "..." : stats.todayAppointments}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">👥</div>
          <div>
            <p>Пациенти</p>
            <h3>{isLoading ? "..." : stats.patients}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">◴</div>
          <div>
            <p>Чакащи</p>
            <h3>{isLoading ? "..." : stats.waiting}</h3>
          </div>
        </div>
      </div>

      <div className="dashboard-grid dashboard-grid-expanded">
        <div className="appointments-card">
          <h3>Следващи часове</h3>

          {error && <p className="form-message form-message-error">{error}</p>}
          {isLoading && <p className="empty-message">Зареждане...</p>}

          {!isLoading &&
            appointments.map((appointment) => (
              <div className="appointment-row" key={appointment.id}>
                <span className="time-icon">◷</span>
                <span>{appointment.appointmentTime}</span>
                <span>{appointment.patientName}</span>
                <span>{appointment.type}</span>
              </div>
            ))}

          {!isLoading && appointments.length === 0 && !error && (
            <p className="empty-message">Няма предстоящи часове.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default Home;
