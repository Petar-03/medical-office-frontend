import { type ChangeEvent, type FormEvent, useState } from "react";

type Service = {
  id: number;
  name: string;
  description: string;
  price: string;
};

type ServiceFormData = Omit<Service, "id">;

function Services() {
  const [services, setServices] = useState<Service[]>([
    {
      id: 1,
      name: "Първичен преглед",
      description: "Първоначален медицински преглед на пациент",
      price: "50",
    },
    {
      id: 2,
      name: "Контролен преглед",
      description: "Повторен преглед след проведено лечение",
      price: "30",
    },
    {
      id: 3,
      name: "Консултация",
      description: "Медицинска консултация със специалист",
      price: "40",
    },
  ]);

  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    price: "",
  });

  const [editId, setEditId] = useState<number | null>(null);

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
      formData.name === "" ||
      formData.description === "" ||
      formData.price === ""
    ) {
      alert("Моля, попълнете всички полета.");
      return;
    }

    if (editId !== null) {
      const updatedServices = services.map((service) => {
        if (service.id === editId) {
          return {
            ...service,
            name: formData.name,
            description: formData.description,
            price: formData.price,
          };
        }

        return service;
      });

      setServices(updatedServices);
      setEditId(null);
    } else {
      const newService = {
        id: Date.now(),
        name: formData.name,
        description: formData.description,
        price: formData.price,
      };

      setServices([...services, newService]);
    }

    setFormData({
      name: "",
      description: "",
      price: "",
    });
  }

  function deleteService(id: number) {
    const filteredServices = services.filter((service) => service.id !== id);
    setServices(filteredServices);
  }

  function editService(service: Service) {
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
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

          <button type="submit" className="primary-btn">
            {editId === null ? "+ Добави услуга" : "Запази промените"}
          </button>
        </form>
      </div>

      <div className="patients-card">
        <h3>Списък с услуги</h3>

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
                <td>{service.price} лв.</td>
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
