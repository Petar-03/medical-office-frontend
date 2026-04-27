import { type ChangeEvent, type FormEvent, useState } from "react";

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
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 1,
      firstName: "Мария",
      lastName: "Петрова",
      phone: "0888123456",
      email: "maria@example.com",
      address: "Варна",
    },
    {
      id: 2,
      firstName: "Иван",
      lastName: "Георгиев",
      phone: "0877123456",
      email: "ivan@example.com",
      address: "Варна",
    },
    {
      id: 3,
      firstName: "Елица",
      lastName: "Николова",
      phone: "0899123456",
      email: "elitsa@example.com",
      address: "Добрич",
    },
  ]);

  const [formData, setFormData] = useState<PatientFormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
  });

  const [editId, setEditId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState("");

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

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

    if (editId !== null) {
      const updatedPatients = patients.map((patient) => {
        if (patient.id === editId) {
          return {
            ...patient,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
          };
        }

        return patient;
      });

      setPatients(updatedPatients);
      setEditId(null);
    } else {
      const newPatient = {
        id: Date.now(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
      };

      setPatients([...patients, newPatient]);
    }

    setFormData({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      address: "",
    });
  }

  function deletePatient(id: number) {
    const filteredPatients = patients.filter((patient) => patient.id !== id);
    setPatients(filteredPatients);
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

          <button type="submit" className="primary-btn">
            {editId === null ? "+ Добави пациент" : "Запази промените"}
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
