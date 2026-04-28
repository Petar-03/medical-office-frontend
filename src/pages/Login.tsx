import { useState } from "react";

const API_BASE_URL = "http://localhost:3001/api";

type Doctor = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  specialty: string;
  workingHours: string;
};

type AuthResponse = {
  data: {
    token: string;
    doctor: Doctor;
  };
  message: string;
};

type LoginProps = {
  onLogin: () => void;
};

function Login({ onLogin }: LoginProps) {
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    specialty: "",
    password: "",
    workingHours: "",
  });
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

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

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError("");

    if (loginData.email === "" || loginData.password === "") {
      alert("Моля, попълнете имейл и парола.");
      return;
    }

    try {
      setIsLoggingIn(true);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const result = (await response.json()) as AuthResponse;

      if (!response.ok) {
        throw new Error(result.message || "Входът беше неуспешен.");
      }

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("authToken", result.data.token);
      localStorage.setItem("doctorId", String(result.data.doctor.id));
      localStorage.setItem("doctor", JSON.stringify(result.data.doctor));
      onLogin();
    } catch (error) {
      setLoginError(
        error instanceof Error
          ? error.message
          : "Възникна грешка при вход."
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setRegisterError("");
    setRegisterSuccess("");

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

    try {
      setIsRegistering(true);

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Регистрацията беше неуспешна.");
      }

      setRegisterData({
        firstName: "",
        lastName: "",
        email: "",
        specialty: "",
        password: "",
        workingHours: "",
      });
      setRegisterSuccess("Регистрацията е успешна. Вече можете да влезете.");
      setIsRegisterMode(false);
    } catch (error) {
      setRegisterError(
        error instanceof Error
          ? error.message
          : "Възникна грешка при регистрацията."
      );
    } finally {
      setIsRegistering(false);
    }
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

              {loginError && (
                <p className="form-message form-message-error">{loginError}</p>
              )}

              <button type="submit" className="login-btn" disabled={isLoggingIn}>
                {isLoggingIn ? "Влизане..." : "Влез в системата"}
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

              {registerError && (
                <p className="form-message form-message-error">{registerError}</p>
              )}

              <button type="submit" className="login-btn" disabled={isRegistering}>
                {isRegistering ? "Регистриране..." : "Регистрирай се"}
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
        {!isRegisterMode && registerSuccess && (
          <p className="form-message form-message-success">{registerSuccess}</p>
        )}
      </div>
    </div>
  );
}

export default Login;
