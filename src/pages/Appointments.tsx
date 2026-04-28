import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { apiRequest, getDoctorId } from "../api/client";

type AppointmentStatus = "Предстоящ" | "Приключен" | "Отменен";

type Appointment = {
  id: number;
  appointmentDate: string;
  appointmentTime: string;
  patientId: number;
  serviceId: number;
  patientName: string;
  type: string;
  status: AppointmentStatus;
};

type Patient = {
  id: number;
  firstName: string;
  lastName: string;
};

type Service = {
  id: number;
  name: string;
};

type AppointmentFormData = {
  appointmentDate: string;
  appointmentTime: string;
  patientId: string;
  serviceId: string;
  status: AppointmentStatus;
};

const today = new Date().toISOString().slice(0, 10);

const emptyFormData: AppointmentFormData = {
  appointmentDate: today,
  appointmentTime: "",
  patientId: "",
  serviceId: "",
  status: "Предстоящ",
};

function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [formData, setFormData] = useState<AppointmentFormData>(emptyFormData);
  const [editId, setEditId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadPageData() {
    try {
      setIsLoading(true);
      setError("");
      const doctorId = getDoctorId();
      const [appointmentsData, patientsData, servicesData] = await Promise.all([
        apiRequest<Appointment[]>(`/doctors/${doctorId}/appointments`),
        apiRequest<Patient[]>(`/doctors/${doctorId}/patients`),
        apiRequest<Service[]>(`/doctors/${doctorId}/services`),
      ]);

      setAppointments(appointmentsData);
      setPatients(patientsData);
      setServices(servicesData);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Грешка при зареждане на часовете."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadPageData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (
      formData.appointmentDate === "" ||
      formData.appointmentTime === "" ||
      formData.patientId === "" ||
      formData.serviceId === ""
    ) {
      alert("Моля, попълнете всички полета.");
      return;
    }

    const payload = {
      appointmentDate: formData.appointmentDate,
      appointmentTime: formData.appointmentTime,
      patientId: Number(formData.patientId),
      serviceId: Number(formData.serviceId),
      status: formData.status,
    };

    try {
      setIsSaving(true);
      const doctorId = getDoctorId();
      const appointment =
        editId !== null
          ? await apiRequest<Appointment>(
              `/doctors/${doctorId}/appointments/${editId}`,
              {
                method: "PUT",
                body: JSON.stringify(payload),
              }
            )
          : await apiRequest<Appointment>(`/doctors/${doctorId}/appointments`, {
              method: "POST",
              body: JSON.stringify(payload),
            });

      setAppointments((currentAppointments) =>
        editId !== null
          ? currentAppointments.map((currentAppointment) =>
              currentAppointment.id === editId ? appointment : currentAppointment
            )
          : [...currentAppointments, appointment]
      );
      setEditId(null);
      setFormData(emptyFormData);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Грешка при запазване на час."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteAppointment(id: number) {
    try {
      setError("");
      const doctorId = getDoctorId();
      await apiRequest(`/doctors/${doctorId}/appointments/${id}`, {
        method: "DELETE",
      });
      setAppointments((currentAppointments) =>
        currentAppointments.filter((appointment) => appointment.id !== id)
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Грешка при изтриване на час."
      );
    }
  }

  function editAppointment(appointment: Appointment) {
    setFormData({
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      patientId: String(appointment.patientId),
      serviceId: String(appointment.serviceId),
      status: appointment.status,
    });

    setEditId(appointment.id);
  }

  return (
    <section className="content">
      <div className="page-header">
        <div>
          <h2>Часове</h2>
          <p>Управление на записаните часове за преглед</p>
        </div>
      </div>

      <div className="form-card">
        <h3>{editId === null ? "Добавяне на час" : "Редактиране на час"}</h3>

        <form className="patient-form" onSubmit={handleSubmit}>
          <input
            type="date"
            name="appointmentDate"
            value={formData.appointmentDate}
            onChange={handleChange}
          />

          <input
            type="time"
            name="appointmentTime"
            value={formData.appointmentTime}
            onChange={handleChange}
          />

          <select
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            className="form-select"
          >
            <option value="">Изберете пациент</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.firstName} {patient.lastName}
              </option>
            ))}
          </select>

          <select
            name="serviceId"
            value={formData.serviceId}
            onChange={handleChange}
            className="form-select"
          >
            <option value="">Изберете услуга</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="form-select"
          >
            <option value="Предстоящ">Предстоящ</option>
            <option value="Приключен">Приключен</option>
            <option value="Отменен">Отменен</option>
          </select>

          <button type="submit" className="primary-btn" disabled={isSaving}>
            {isSaving
              ? "Запазване..."
              : editId === null
                ? "+ Добави час"
                : "Запази промените"}
          </button>
        </form>
      </div>

      <div className="patients-card">
        <h3>Записани часове</h3>

        {error && <p className="form-message form-message-error">{error}</p>}
        {isLoading && <p className="empty-message">Зареждане...</p>}

        <table className="patients-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Час</th>
              <th>Пациент</th>
              <th>Тип преглед</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>

          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{appointment.appointmentDate}</td>
                <td>{appointment.appointmentTime}</td>
                <td>{appointment.patientName}</td>
                <td>{appointment.type}</td>
                <td>
                  <span className="status-badge">{appointment.status}</span>
                </td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => editAppointment(appointment)}
                  >
                    Редактирай
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => deleteAppointment(appointment.id)}
                  >
                    Изтрий
                  </button>
                </td>
              </tr>
            ))}
            {appointments.length === 0 && !isLoading && (
              <tr>
                <td colSpan={6} className="empty-message">
                  Няма записани часове.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Appointments;
