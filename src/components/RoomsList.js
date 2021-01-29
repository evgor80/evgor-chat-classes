import React from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import PasswordInput from "./PasswordInput";
import Room from "./Room";
import { connect } from "react-redux";
import { addRooms } from "../redux/actions";

//домашняя страница со списком доступных чатов
//отобрражается только аутентифицированным пользователям

class RoomsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sortDisplay: false,
      search: "",
      roomsList: [],
      clickedRoom: null,
      password: "",
      error: "",
    };

    //удаление токена с истекшим сроком
    //и перенаправление для нового входа в систему
    this.handleExpToken = () => {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("username");
      this.props.history.push({
        pathname: "/enter",
        state: { err: "Время сеанса истекло. Войдите в систему повторно" },
      });
    };
  }

  componentDidMount() {
    //если нет JWT-токена или токен просрочен,
    //отправляем пользователя на страницу логина/регистрации
    if (sessionStorage.token) {
      const token = sessionStorage.token.split(" ")[1];
      const payload = JSON.parse(atob(token.split(".")[1]));

      if (payload.exp > Date.now() / 1000) {
        //получаем список чатов и подписываемся на его обновление
        this.getRoomsList();
        this.props.socket.on("rooms-list", (data) => {
          this.setState({ roomsList: data });
          this.props.addRooms(data);
        });
      } else {
        this.handleExpToken();
      }
      //если пользователь был перенаправлен на страницу из-за возникшей ошибки,
      //отобразить ошибку
      if (this.props.location.state) {
        this.setState({ error: this.props.location.state.error });
        setTimeout(() => {
          this.setState({ error: "" });
          const state = undefined;
          this.props.history.replace({ ...this.props.location, state });
        }, 5000);
      }
    } else {
      this.props.history.push("/enter");
    }
  }

  componentDidUpdate(_, prevState) {
    //сброс сообщения о неверном пароле при вводе нового пароля
    if (this.state.password !== prevState.password) {
      this.setState({ error: "" });
    }
  }

  componentWillUnmount() {
    //отписка от обновлений списка чатов
    this.props.socket.removeListener("rooms-list");
  }

  //получаем список чатов и добавляем его в локальное состояние и хранилище
  getRoomsList() {
    axios
      .get("/api/room/")
      .then((res) => {
        this.setState({ roomsList: res.data.rooms });
        this.props.addRooms(res.data.rooms);
      })
      .catch((err) => {
        if (err.status === "expired") {
          this.handleExpToken();
        }
      });
  }

  //поиск по списку чатов
  searchRoom(name) {
    this.setState({
      roomsList: this.props.rooms.filter((room) =>
        room.name.toLowerCase().match(name.trim().toLowerCase())
      ),
    });
  }

  //проверка типа чата
  //если чат общий, переход на страницу с окном этого чата
  //если чат приватный, вызов всплывающего окна с формой ввода пароля
  clickRoom(room) {
    if (room.private) {
      this.setState({ clickedRoom: room });
    } else {
      this.props.history.push(`/${room.slug}`);
    }
  }

  //передача пароля от приватного чата на сервер и обработка возможных ошибок
  enterPrivateRoom(e) {
    if (e.key === "Enter" && this.state.password.length >= 1) {
      axios
        .post(`/api/room/${this.state.clickedRoom.slug}`, {
          password: this.state.password,
        })
        .then((response) => {
          if (response.data.status === "success") {
            this.props.history.push(`/${this.state.clickedRoom.slug}`);
            this.setState({ clickedRoom: null });
          } else if (response.data.status === "failed") {
            this.setState({ error: response.data.error });
          }
        })
        .catch((err) => {
          if (err.status === "expired") {
            this.handleExpToken();
          } else if (err.response.status === 401)
            this.setState({ error: "Неверный пароль" });
          else this.setState({ error: "Сервер не отвечает" });
        });
    }
  }

  //сортировка списка чатов по указанному критерию
  //закрытие всплывающего окна с вариантами сортировки
  sort(type) {
    if (type === "default") this.setState({ roomsList: this.props.rooms });
    else if (type === "private") {
      let privated = [];
      let opened = [];
      this.props.rooms.forEach((room) => {
        if (room.private) privated.push(room);
        else opened.push(room);
      });
      this.setState({ roomsList: [...opened, ...privated] });
    } else {
      const quickSort = (array) => {
        if (array.length < 2) {
          return array;
        }
        const chosenIndex = array.length - 1;
        const chosen = array[chosenIndex];
        const a = [];
        const b = [];
        for (let i = 0; i < chosenIndex; i++) {
          const temp = array[i];
          temp[type] > chosen[type] ? a.push(temp) : b.push(temp);
        }

        const output = [...quickSort(a), chosen, ...quickSort(b)];
        return output;
      };

      this.setState({ roomsList: quickSort(this.state.roomsList) });
    }
    this.setState({ sortDisplay: false });
  }

  render() {
    return (
      <div className="container">
        <div className="rooms">
          <section className="search">
            <div className="search__box">
              <input
                type="text"
                name="search"
                id=""
                placeholder="Искать чат"
                onChange={(e) => {
                  this.setState({ search: e.target.value });
                  this.searchRoom(e.target.value);
                }}
                value={this.state.search}
              />
              {this.state.search && (
                <button
                  className="search__stop"
                  onClick={() => {
                    this.setState({ search: "" });
                    this.setState({ roomsList: this.props.rooms });
                  }}
                >
                  <span>X</span>
                </button>
              )}
              <button
                className="search__sort-icon"
                onClick={() =>
                  this.setState({ sortDisplay: !this.state.sortDisplay })
                }
                data-desc="Сортировать"
              >
                <i className="fa fa-sort-amount-up"></i>
              </button>
              {this.state.sortDisplay && (
                <ul className="search__sort-container">
                  <li
                    className="search__sort-item"
                    onClick={() => this.sort("default")}
                  >
                    <span>По умолчанию</span>
                  </li>
                  <li
                    className="search__sort-item"
                    onClick={() => this.sort("members")}
                  >
                    <span>По количеству участников</span>
                  </li>
                  <li
                    className="search__sort-item"
                    onClick={() => this.sort("messages")}
                  >
                    <span>По количеству сообщений</span>
                  </li>
                  <li
                    className="search__sort-item"
                    onClick={() => this.sort("private")}
                  >
                    <span>По типу чата</span>
                  </li>
                </ul>
              )}
            </div>
          </section>
          <section className="rooms__list">
            <ul>
              {this.state.roomsList &&
                this.state.roomsList.map((room) => (
                  <li key={room._id}>
                    <a
                      href={`/${room.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        this.clickRoom(room);
                      }}
                    >
                      <Room room={room} />
                    </a>
                  </li>
                ))}
            </ul>
          </section>
          <section className="rooms__button">
            <Link
              to="/new-room"
              className="form__button form__button--full-width"
            >
              Создать новый чат
            </Link>
          </section>
        </div>

        {this.state.error && !this.state.clickedRoom && (
          <div className="rooms__error">
            <span>{this.state.error}</span>
          </div>
        )}

        {this.state.clickedRoom && (
          <div className="pop-up">
            <div className="pop-up__container">
              <span className="form__head">
                Доступ в этот чат защищен паролем
              </span>
              <div className="form__divider"></div>
              <div className="form__input">
                <label htmlFor="password">Пароль для входа в чат</label>
                <PasswordInput
                  name="password"
                  value={this.state.password}
                  setValue={(e) => this.setState({ password: e.target.value })}
                  enter={(e) => this.enterPrivateRoom(e)}
                />

                {this.state.error && (
                  <p className="form__error">{this.state.error}</p>
                )}
              </div>
              <button
                className="pop-up__close"
                onClick={() => {
                  this.setState({ clickedRoom: null });
                  this.setState({ password: "" });
                }}
              >
                <span>X</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    socket: state.socket,
    rooms: state.rooms,
  };
}

export default connect(mapStateToProps, { addRooms })(RoomsList);
