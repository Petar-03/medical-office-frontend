import { useState } from "react";

type LoginProps = {
  onLogin: () => void;
};

function Login({ onLogin }: LoginProps) {
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    specialty: "",
    password: "",
    workingHours: "",
  });

  const handleLoginChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setLoginData({
      ...loginData,
      [name]: value,
    });
  };

  const handleRegisterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setRegisterData({
      ...registerData,
      [name]: value,
    });
  };

  const handleLoginSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (loginData.email === "" || loginData.password === "") {
      alert("Моля, попълнете имейл и парола.");
      return;
    }

    localStorage.setItem("isLoggedIn", "true");
    onLogin();
  };

  const handleRegisterSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (
      registerData.firstName === "" ||
      registerData.lastName === "" ||
      registerData.email === "" ||
      registerData.specialty === "" ||
      registerData.password === "" ||
      registerData.workingHours === ""
    ) {
      alert("Моля, попълнете всички полета.");
      return;
    }

    localStorage.setItem("registeredDoctor", JSON.stringify(registerData));
    alert("Регистрацията е успешна. Вече можете да влезете.");
    setIsRegisterMode(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">✚</div>
          <div>
            <h2>Медика Про</h2>
            <p>Медицински кабинет</p>
          </div>
        </div>

        {!isRegisterMode ? (
          <>
            <h1>Вход в системата</h1>
            <p className="login-subtitle">Въведете данните си за достъп</p>

            <form className="login-form" onSubmit={handleLoginSubmit}>
              <label>
                Имейл
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  placeholder="doctor@example.com"
                />
              </label>

              <label>
                Парола
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  placeholder="Въведете парола"
                />
              </label>

              <button type="submit" className="login-btn">
                Влез в системата
              </button>
            </form>

            <button
              className="register-link-btn"
              onClick={() => setIsRegisterMode(true)}
            >
              Регистриране ако сте нов потребител
            </button>
          </>
        ) : (
          <>
            <h1>Регистрация</h1>
            <p className="login-subtitle">Създайте нов лекарски профил</p>

            <form className="login-form" onSubmit={handleRegisterSubmit}>
              <label>
                Име
                <input
                  type="text"
                  name="firstName"
                  value={registerData.firstName}
                  onChange={handleRegisterChange}
                  placeholder="Име"
                />
              </label>

              <label>
                Фамилия
                <input
                  type="text"
                  name="lastName"
                  value={registerData.lastName}
                  onChange={handleRegisterChange}
                  placeholder="Фамилия"
                />
              </label>

              <label>
                Имейл
                <input
                  type="email"
                  name="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  placeholder="doctor@example.com"
                />
              </label>

              <label>
                Специалност
                <input
                  type="text"
                  name="specialty"
                  value={registerData.specialty}
                  onChange={handleRegisterChange}
                  placeholder="Обща медицина"
                />
              </label>

              <label>
                Парола
                <input
                  type="password"
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  placeholder="Парола"
                />
              </label>

              <label>
                Работно време
                <input
                  type="text"
                  name="workingHours"
                  value={registerData.workingHours}
                  onChange={handleRegisterChange}
                  placeholder="09:00 - 17:00"
                />
              </label>

              <button type="submit" className="login-btn">
                Регистрирай се
              </button>
            </form>

            <button
              className="register-link-btn"
              onClick={() => setIsRegisterMode(false)}
            >
              Вече имате акаунт? Влезте
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
