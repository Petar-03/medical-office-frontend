function Home() {
  return (
    <section className="content">
      <div className="welcome">
        <h2>Добре дошли, Д-р Иванова</h2>
        <p>Общ преглед за деня</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">▦</div>
          <div>
            <p>Часове днес</p>
            <h3>12</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">👥</div>
          <div>
            <p>Пациенти</p>
            <h3>24</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">◴</div>
          <div>
            <p>Чакащи</p>
            <h3>3</h3>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="appointments-card">
          <h3>Следващи часове</h3>

          <div className="appointment-row">
            <span className="time-icon">◷</span>
            <span>09:00</span>
            <span>Мария Петрова</span>
            <span>Контролен преглед</span>
          </div>

          <div className="appointment-row">
            <span className="time-icon">◷</span>
            <span>10:30</span>
            <span>Иван Георгиев</span>
            <span>Консултация</span>
          </div>

          <div className="appointment-row">
            <span className="time-icon">◷</span>
            <span>12:00</span>
            <span>Елица Николова</span>
            <span>Първичен преглед</span>
          </div>
        </div>

        <div className="quick-card">
          <h3>Бърз преглед</h3>

          <div className="quick-row">
            <span className="quick-icon blue">▦</span>
            <p>Свободни часове:</p>
            <strong>4</strong>
          </div>

          <div className="quick-row">
            <span className="quick-icon green">👤</span>
            <p>Нови пациенти:</p>
            <strong>2</strong>
          </div>

          <div className="quick-row">
            <span className="quick-icon lightgreen">Rx</span>
            <p>Рецепти днес:</p>
            <strong>5</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;
