import React from "react";
import { Link } from "react-router-dom";

//страница с ссылками нп форму регистрации или входа пользователя в систему
//автоматическое перенаправление с других страниц, если пользователь не в системе или истек срок действия JWT

class Enter extends React.Component {
  render() {
    return (
      <div className="form">
        <div className="form__container">
          <h1 className="form__head">
            Доступ только для зарегистрированных пользователей
          </h1>
          {this.props.location.state && (
            <p className="form__error">{this.props.location.state.err}</p>
          )}
          <div className="form__button-wrapper">
            <Link
              to="/login"
              className=" form__button form__button--half-width"
            >
              Вход
            </Link>
          </div>
          <div className="form__divider">
            <span>или</span>
          </div>
          <div className=" form__button-wrapper">
            <Link
              to="/sign-up"
              className=" form__button form__button--half-width"
            >
              Регистрация
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default Enter;
