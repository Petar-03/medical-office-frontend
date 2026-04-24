function Topbar() {
  return (
    <header className="topbar">
      <h1>Начало</h1>

      <div className="search-box">
        <span>⌕</span>
        <input type="text" placeholder="Търсене..." />
      </div>

      <div className="doctor-box">
        <span className="bell">🔔</span>
        <div className="avatar">👩‍⚕️</div>
        <span>Д-р Иванова</span>
      </div>
    </header>
  );
}

export default Topbar;
