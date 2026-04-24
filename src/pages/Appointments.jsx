import { useState } from "react";

function Appointments() {
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      time: "09:00",
      patientName: "Мария Петрова",
      type: "Контролен преглед",
      status: "Предстоящ",
    },
    {
      id: 2,
      time: "10:30",
      patientName: "Иван Георгиев",
      type: "Консултация",
      status: "Предстоящ",
    },
  ]);

  const [formData, setFormData] = useState({
    time: "",
    patientName: "",
    type: "",
    status: "Предстоящ",
  });
  const [editId, setEditId] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (
      formData.time === "" ||
      formData.patientName === "" ||
      formData.type === ""
    ) {
      alert("Моля, попълнете всички полета.");
      return;
    }

    if (editId !== null) {
      const updatedAppointments = appointments.map((appointment) => {
        if (appointment.id === editId) {
          return {
            ...appointment,
            time: formData.time,
            patientName: formData.patientName,
            type: formData.type,
            status: formData.status,
          };
        }

        return appointment;
      });

      setAppointments(updatedAppointments);
      setEditId(null);
    } else {
      const newAppointment = {
        id: Date.now(),
        time: formData.time,
        patientName: formData.patientName,
        type: formData.type,
        status: formData.status,
      };

      setAppointments([...appointments, newAppointment]);
    }

    setFormData({
      time: "",
      patientName: "",
      type: "",
      status: "Предстоящ",
    });
  }
  function deleteAppointment(id) {
    const filteredAppointments = appointments.filter(
      (appointment) => appointment.id !== id
    );

    setAppointments(filteredAppointments);
  }

  function editAppointment(appointment) {
    setFormData({
      time: appointment.time,
      patientName: appointment.patientName,
      type: appointment.type,
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
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
          />

          <input
            type="text"
            name="patientName"
            placeholder="Име на пациент"
            value={formData.patientName}
            onChange={handleChange}
          />

          <input
            type="text"
            name="type"
            placeholder="Тип преглед"
            value={formData.type}
            onChange={handleChange}
          />

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

          <button type="submit" className="primary-btn">
            {editId === null ? "+ Добави час" : "Запази промените"}
          </button>
        </form>
      </div>

      <div className="patients-card">
        <h3>Записани часове</h3>

        <table className="patients-table">
          <thead>
            <tr>
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
                <td>{appointment.time}</td>
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
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Appointments;
