import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { apiRequest, getDoctorId } from "../api/client";

type Patient = {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
};

type PatientFormData = Omit<Patient, "id">;

function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [formData, setFormData] = useState<PatientFormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
  });

  const [editId, setEditId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadPatients() {
    try {
      setIsLoading(true);
      setError("");
      const doctorId = getDoctorId();
      const data = await apiRequest<Patient[]>(`/doctors/${doctorId}/patients`);
      setPatients(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Грешка при зареждане на пациенти."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadPatients();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const filteredPatients = patients.filter((patient) => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();

    return (
      fullName.includes(searchText.toLowerCase()) ||
      patient.phone.includes(searchText) ||
      patient.email.toLowerCase().includes(searchText.toLowerCase()) ||
      patient.address.toLowerCase().includes(searchText.toLowerCase())
    );
  });
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
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
      formData.firstName === "" ||
      formData.lastName === "" ||
      formData.phone === "" ||
      formData.email === "" ||
      formData.address === ""
    ) {
      alert("Моля, попълнете всички полета.");
      return;
    }

    try {
      setIsSaving(true);
      const doctorId = getDoctorId();
      const patient =
        editId !== null
          ? await apiRequest<Patient>(`/doctors/${doctorId}/patients/${editId}`, {
              method: "PUT",
              body: JSON.stringify(formData),
            })
          : await apiRequest<Patient>(`/doctors/${doctorId}/patients`, {
              method: "POST",
              body: JSON.stringify(formData),
            });

      setPatients((currentPatients) =>
        editId !== null
          ? currentPatients.map((currentPatient) =>
              currentPatient.id === editId ? patient : currentPatient
            )
          : [...currentPatients, patient]
      );
      setEditId(null);
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        address: "",
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Грешка при запазване на пациент."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function deletePatient(id: number) {
    try {
      setError("");
      const doctorId = getDoctorId();
      await apiRequest(`/doctors/${doctorId}/patients/${id}`, {
        method: "DELETE",
      });
      setPatients((currentPatients) =>
        currentPatients.filter((patient) => patient.id !== id)
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Грешка при изтриване на пациент."
      );
    }
  }

  function editPatient(patient: Patient) {
    setFormData({
      firstName: patient.firstName,
      lastName: patient.lastName,
      phone: patient.phone,
      email: patient.email,
      address: patient.address,
    });

    setEditId(patient.id);
  }

  return (
    <section className="content">
      <div className="page-header">
        <div>
          <h2>Пациенти</h2>
          <p>Управление на пациентите в медицинския кабинет</p>
        </div>
      </div>

      <div className="form-card">
        <h3>
          {editId === null ? "Добавяне на пациент" : "Редактиране на пациент"}
        </h3>

        <form className="patient-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="firstName"
            placeholder="Име"
            value={formData.firstName}
            onChange={handleChange}
          />

          <input
            type="text"
            name="lastName"
            placeholder="Фамилия"
            value={formData.lastName}
            onChange={handleChange}
          />

          <input
            type="text"
            name="phone"
            placeholder="Телефон"
            value={formData.phone}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Имейл"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="text"
            name="address"
            placeholder="Адрес"
            value={formData.address}
            onChange={handleChange}
          />

          <button type="submit" className="primary-btn" disabled={isSaving}>
            {isSaving
              ? "Запазване..."
              : editId === null
                ? "+ Добави пациент"
                : "Запази промените"}
          </button>
        </form>
      </div>

      <div className="patients-card">
        <div className="table-header">
          <h3>Списък с пациенти</h3>

          <input
            type="text"
            className="table-search"
            placeholder="Търсене на пациент..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </div>

        {error && <p className="form-message form-message-error">{error}</p>}
        {isLoading && <p className="empty-message">Зареждане...</p>}

        <table className="patients-table">
          <thead>
            <tr>
              <th>Име</th>
              <th>Телефон</th>
              <th>Имейл</th>
              <th>Адрес</th>
              <th>Действия</th>
            </tr>
          </thead>

          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient.id}>
                <td>
                  {patient.firstName} {patient.lastName}
                </td>
                <td>{patient.phone}</td>
                <td>{patient.email}</td>
                <td>{patient.address}</td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => editPatient(patient)}
                  >
                    Редактирай
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => deletePatient(patient.id)}
                  >
                    Изтрий
                  </button>
                </td>
              </tr>
            ))}
            {filteredPatients.length === 0 && (
              <tr>
                <td colSpan={5} className="empty-message">
                  Няма намерени пациенти.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Patients;
