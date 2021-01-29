import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import PasswordInput from "./PasswordInput";

//шаблон формы для регистрации/входа пользователя и создания нового чата

class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      password: "",
      confirmPassword: "",
      private: false,
      submitButtonState: true,
      errors: {
        name: "",
        password: "",
        confirmPassword: "",
      },
    };
  }

  componentDidUpdate(prevProps, prevState) {
    //сбрасываем форму при переходе на другую страницу
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.setState({
        name: "",
        password: "",
        confirmPassword: "",
        errors: {
          name: "",
          password: "",
          confirmPassword: "",
        },
      });
    }
    if (
      //активируем кнопку отправки формы, только если все поля заполнены без ошибок
      this.state.name !== prevState.name ||
      this.state.password !== prevState.password ||
      this.state.confirmPassword !== prevState.confirmPassword ||
      this.state.errors.name !== prevState.errors.name ||
      this.state.private !== prevState.private ||
      this.state.errors.password !== prevState.errors.password ||
      this.state.errors.confirmPassword !== prevState.errors.confirmPassword
    )
      this.checkForm();

    //сбрасываем сообщение о неверном логине/пароле
    //при вводе нового имени пользователя/пароля
    if (this.props.location.pathname === "/login") {
      if (
        this.state.name !== prevState.name ||
        this.state.password !== prevState.password
      ) {
        if (this.state.errors.name) this.setState({ errors: { name: "" } });
      }
    }

    //проверяем имя пользователя/чата на соответствие требованиям
    //при несоответствии выдаем ошибку
    //на странице регистрации сразу проверяем, что имя пользователя/чата свободно
    if (this.props.location.pathname !== "/login") {
      if (this.state.name !== prevState.name) {
        if (this.state.name.length > 0 && this.state.name.length < 5) {
          this.setState({
            errors: {
              ...this.state.errors,
              name: "Должно содержать не менее 5 символов",
            },
          });
        } else if (this.state.name.length > 15) {
          this.setState({
            errors: {
              ...this.state.errors,
              name: "Должно содержать не более 10 символов",
            },
          });
        } else if (this.state.name.match(/[@#$%^?&*)(+="/|:;\\]/g)) {

          this.setState({
            errors: {
              ...this.state.errors,
              name: "Не может содержать специальные символы",
            },
          });
       } else {
          this.setState({ errors: { ...this.state.errors, name: "" } });
          if (
            this.props.location.pathname === "/sign-up" &&
            this.state.name.length > 1
          ) {
            this.checkName(
              "/api/user/name",
              {
                username: this.state.name,
              },
              "Имя пользователя уже занято"
            );
          }
          if (
            this.props.location.pathname === "/new-room" &&
            this.state.name.length > 1
          ) {
            this.checkName(
              "/api/room/name",
              {
                name: this.state.name,
              },
              "Такой чат уже существует"
            );
          }
        }
      }

      //проверяем пароль на соответствие требованиям
      //проверяем совпадение обоих паролей в форме регистрации
      //при несоответствии выдаем ошибку
      if (this.state.password !== prevState.password) {
        if (
          this.state.password.length > 0 &&
          this.state.password.length < 8 &&
          this.state.confirmPassword.length > 0 &&
          this.state.confirmPassword !== this.state.password
        ) {
          this.setState({
            errors: {
              ...this.state.errors,
              password: "Пароль должен содержать не менее 8 символов",
              confirmPassword: "Пароли не совпадают",
            },
          });
        } else if (
          this.state.password.length > 0 &&
          this.state.password.length < 8
        ) {
          this.setState({
            errors: {
              ...this.state.errors,
              password: "Пароль должен содержать не менее 8 символов",
              confirmPassword: "",
            },
          });
        } else if (
          this.state.confirmPassword.length > 0 &&
          this.state.confirmPassword !== this.state.password
        ) {
          this.setState({
            errors: {
              ...this.state.errors,
              password: "",
              confirmPassword: "Пароли не совпадают",
            },
          });
        } else {
          this.setState({
            errors: { ...this.state.errors, password: "", confirmPassword: "" },
          });
        }
      }

      if (this.state.confirmPassword !== prevState.confirmPassword) {
        if (
          this.state.confirmPassword.length > 0 &&
          this.state.confirmPassword !== this.state.password
        ) {
          this.setState({
            errors: {
              ...this.state.errors,
              confirmPassword: "Пароли не совпадают",
            },
          });
        } else {
          this.setState({
            errors: { ...this.state.errors, confirmPassword: "" },
          });
        }
      }
    }
  }
  //кнопка отправки формы активируется только при правильном заполнении всех полей
  checkForm() {
    if (this.props.location.pathname === "/new-room" && !this.state.private) {
      if (this.state.name && !this.state.errors.name) {
        this.setState({ submitButtonState: false });
      } else {
        this.setState({ submitButtonState: true });
      }
    } else if (this.props.location.pathname === "/login") {
      if (this.state.name && this.state.password) {
        this.setState({ submitButtonState: false });
      } else {
        this.setState({ submitButtonState: true });
      }
    } else {
      if (
        this.state.name &&
        this.state.password &&
        this.state.confirmPassword &&
        !this.state.errors.name &&
        !this.state.errors.password &&
        !this.state.errors.confirmPassword
      ) {
        this.setState({ submitButtonState: false });
      } else {
        this.setState({ submitButtonState: true });
      }
    }
  }
  //шаблон подключения к серверу
  connectToServer(url, form, resCallback) {
    axios
      .post(url, form)
      .then((response) => {
        resCallback(response);
      })
      .catch((err) => {
        if (err.status === "expired") {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("username");
          this.props.history.push({
            pathname: "/enter",
            state: {
              err: "Время сеанса истекло. Войдите в систему повторно",
            },
          });
        } else if (err.response.status === 401)
          this.setState({
            errors: {
              ...this.state.errors,
              name: "Неверное имя пользователя или пароль",
            },
          });
        else
          this.setState({
            errors: { ...this.state.errors, name: "Сервер не отвечает" },
          });
      });
  }
  //проверка доступности имени пользователя/чата на сервере
  checkName(url, nameObj, error) {
    this.connectToServer(url, nameObj, (response) => {
      if (response.data.status === "success") {
        this.setState({ errors: { ...this.state.errors, name: "" } });
      } else if (response.data.status === "failed") {
        this.setState({ errors: { ...this.state.errors, name: error } });
      }
    });
  }

  //отправка формы
  submit(e) {
    e.preventDefault();

    if (this.props.location.pathname === "/login") {
      this.authUser("/api/user/login", {
        username: e.target.name.value,
        password: e.target.password.value,
      });
    }

    if (this.props.location.pathname === "/sign-up") {
      this.authUser("/api/user/register", {
        username: e.target.name.value,
        password: e.target.password.value,
      });
    }

    if (this.props.location.pathname === "/new-room") {
      this.connectToServer(
        "/api/room/new",
        {
          name: e.target.name.value,
          password: e.target.password ? e.target.password.value : "",
          private: e.target.private.checked,
          slug: this.slugify(e.target.name.value),
        },
        () => {
          this.props.history.push("/");
        }
      );
    }
  }

  //регистрация/вход пользователя в систему

  authUser(url, form) {
    this.connectToServer(url, form, (response) => {
      sessionStorage.username = response.data.user.username;
      sessionStorage.token = response.data.token;
      this.props.history.push("/");
    });
  }

  //создаем слаг из названия чата
  slugify(name) {
    let slug = name.toLowerCase().split(" ").join("-");
    return slug;
  }

  render() {
    const titles = {
      "/login": "Вход в систему",
      "/sign-up": "Регистрация",
      "/new-room": "Создание нового чата",
    };

    const buttonLabels = {
      "/login": "Войти",
      "/sign-up": "Зарегистрироваться",
      "/new-room": "Создать",
    };
    return (
      <div className="form">
        <div className="form__container">
          {this.props.location.pathname !== "/new-room" && (
            <div className="form__top-buttons">
              <Link
                to="/login"
                className={
                  "form__button form__button--half-width " +
                  (this.props.location.pathname === "/login"
                    ? "form__button--disabled"
                    : "")
                }
              >
                Вход
              </Link>

              <Link
                to="/sign-up"
                className={
                  "form__button form__button--half-width " +
                  (this.props.location.pathname === "/sign-up"
                    ? "form__button--disabled"
                    : "")
                }
              >
                Регистрация
              </Link>
            </div>
          )}
          <form onSubmit={(e) => this.submit(e)}>
            <h1 className="form__head">
              {titles[this.props.location.pathname]}
            </h1>

            <div className="form__divider"></div>
            <div className="form__input">
              <label htmlFor="name">
                {this.props.location.pathname === "/new-room"
                  ? "Название чата"
                  : "Ваше имя"}
              </label>
              <input
                className="form__input-field"
                type="text"
                name="name"
                required
                value={this.state.name}
                onChange={(e) => {
                  this.setState({ name: e.target.value });
                }}
              />
              {this.state.errors.name && (
                <p className="form__error">{this.state.errors.name}</p>
              )}
            </div>

            {this.props.location.pathname === "/new-room" && (
              <div className="form__toggle">
                <ul>
                  <li>Приватный</li>
                  <li>
                    <label htmlFor="">
                      <input
                        type="checkbox"
                        name="private"
                        onChange={() =>
                          this.setState({ private: !this.state.private })
                        }
                      />
                      <span className="form__slider"></span>
                    </label>
                  </li>
                  <li>Общий</li>
                </ul>
              </div>
            )}
            {(this.props.location.pathname !== "/new-room" ||
              this.state.private) && (
              <Fragment>
                <div className="form__input">
                  <label htmlFor="password">
                    {this.props.location.pathname === "/new-room"
                      ? "Пароль для входа в чат"
                      : "Пароль"}
                  </label>
                  <PasswordInput
                    name="password"
                    value={this.state.password}
                    setValue={(e) =>
                      this.setState({ password: e.target.value })
                    }
                  />
                  {this.state.errors.password && (
                    <p className="form__error">{this.state.errors.password}</p>
                  )}
                </div>
                {this.props.location.pathname !== "/login" && (
                  <div className="form__input">
                    <label htmlFor="confirmPassword">Подтвердите пароль</label>
                    <PasswordInput
                      name="confirmPassword"
                      value={this.state.confirmPassword}
                      setValue={(e) =>
                        this.setState({ confirmPassword: e.target.value })
                      }
                    />
                    {this.state.errors.confirmPassword && (
                      <p className="form__error">
                        {this.state.errors.confirmPassword}
                      </p>
                    )}
                  </div>
                )}
              </Fragment>
            )}
            <button
              type="submit"
              className="form__button form__button--full-width"
              disabled={this.state.submitButtonState}
            >
              {buttonLabels[this.props.location.pathname]}
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default Form;
