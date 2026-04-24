function Appointments() {
  return (
    <section className="content">
      <div className="page-header">
        <div>
          <h2>Часове</h2>
          <p>Списък със записани часове за преглед</p>
        </div>

        <button className="primary-btn">+ Добави час</button>
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
            <tr>
              <td>09:00</td>
              <td>Мария Петрова</td>
              <td>Контролен преглед</td>
              <td>Предстоящ</td>
              <td>
                <button className="edit-btn">Редактирай</button>
                <button className="delete-btn">Изтрий</button>
              </td>
            </tr>

            <tr>
              <td>10:30</td>
              <td>Иван Георгиев</td>
              <td>Консултация</td>
              <td>Предстоящ</td>
              <td>
                <button className="edit-btn">Редактирай</button>
                <button className="delete-btn">Изтрий</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Appointments;
