import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { apiRequest, getDoctorId } from "../api/client";

type Service = {
  id: number;
  name: string;
  description: string;
  price: number;
};

type ServiceFormData = {
  name: string;
  description: string;
  price: string;
};

function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    price: "",
  });

  const [editId, setEditId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadServices() {
    try {
      setIsLoading(true);
      setError("");
      const doctorId = getDoctorId();
      const data = await apiRequest<Service[]>(`/doctors/${doctorId}/services`);
      setServices(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Грешка при зареждане на услуги."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadServices();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

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
      formData.name === "" ||
      formData.description === "" ||
      formData.price === ""
    ) {
      alert("Моля, попълнете всички полета.");
      return;
    }

    const payload = {
        name: formData.name,
        description: formData.description,
      price: Number(formData.price),
    };

    try {
      setIsSaving(true);
      const doctorId = getDoctorId();
      const service =
        editId !== null
          ? await apiRequest<Service>(`/doctors/${doctorId}/services/${editId}`, {
              method: "PUT",
              body: JSON.stringify(payload),
            })
          : await apiRequest<Service>(`/doctors/${doctorId}/services`, {
              method: "POST",
              body: JSON.stringify(payload),
            });

      setServices((currentServices) =>
        editId !== null
          ? currentServices.map((currentService) =>
              currentService.id === editId ? service : currentService
            )
          : [...currentServices, service]
      );
      setEditId(null);
      setFormData({
        name: "",
        description: "",
        price: "",
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Грешка при запазване на услуга."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteService(id: number) {
    try {
      setError("");
      const doctorId = getDoctorId();
      await apiRequest(`/doctors/${doctorId}/services/${id}`, {
        method: "DELETE",
      });
      setServices((currentServices) =>
        currentServices.filter((service) => service.id !== id)
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Грешка при изтриване на услуга."
      );
    }
  }

  function editService(service: Service) {
    setFormData({
      name: service.name,
      description: service.description,
      price: String(service.price),
    });

    setEditId(service.id);
  }

  return (
    <section className="content">
      <div className="page-header">
        <div>
          <h2>Услуги</h2>
          <p>Управление на медицинските услуги в кабинета</p>
        </div>
      </div>

      <div className="form-card">
        <h3>
          {editId === null ? "Добавяне на услуга" : "Редактиране на услуга"}
        </h3>

        <form className="patient-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Име на услуга"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            type="text"
            name="description"
            placeholder="Описание"
            value={formData.description}
            onChange={handleChange}
          />

          <input
            type="number"
            name="price"
            placeholder="Цена"
            value={formData.price}
            onChange={handleChange}
          />

          <button type="submit" className="primary-btn" disabled={isSaving}>
            {isSaving
              ? "Запазване..."
              : editId === null
                ? "+ Добави услуга"
                : "Запази промените"}
          </button>
        </form>
      </div>

      <div className="patients-card">
        <h3>Списък с услуги</h3>

        {error && <p className="form-message form-message-error">{error}</p>}
        {isLoading && <p className="empty-message">Зареждане...</p>}

        <table className="patients-table">
          <thead>
            <tr>
              <th>Услуга</th>
              <th>Описание</th>
              <th>Цена</th>
              <th>Действия</th>
            </tr>
          </thead>

          <tbody>
            {services.map((service) => (
              <tr key={service.id}>
                <td>{service.name}</td>
                <td>{service.description}</td>
                <td>{Number(service.price).toFixed(2)} лв.</td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => editService(service)}
                  >
                    Редактирай
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => deleteService(service.id)}
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

export default Services;
