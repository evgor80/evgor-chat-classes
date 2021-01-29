import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import App from "./App";
import axios from "axios";

//добавление к каждому запросу на сервер JWT-токена (при его наличии)
//при наличии токена, проверка срока его действия и возврат соответствующей ошибки
axios.interceptors.request.use(function (config) {
  if (sessionStorage.token) {
    const token = sessionStorage.token.split(" ")[1];
    const payload = JSON.parse(atob(token.split(".")[1]));

    if (payload.exp > Date.now() / 1000) {
      config.headers.Authorization = sessionStorage.token;
    } else {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("username");
      return Promise.reject({ status: "expired", error: "Сеанс истек" });
    }
  }
  return config;
});

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
