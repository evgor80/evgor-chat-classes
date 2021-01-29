import React from "react";
import {
  addRoom,
  updateMembers,
  addMessage,
  roomLeave,
} from "./../redux/actions";
import Message from "./Message";
import MessageInput from "./MessageInput";
import { connect } from "react-redux";

//окно чата с полем добавления сообщений

class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      typing: {
        action: false,
        user: "",
      },
    };
    this.conn_sound = new Audio("/sounds/connect.mp3");
    this.typing_sound = new Audio("/sounds/typing.mp3");
    this.msg_sound = new Audio("/sounds/message.mp3");
    this.username = sessionStorage.username;
    this.roomName = this.props.location.pathname.slice(1);
    this.messagesList = React.createRef();

    //коллбэк с отпиской пользователя от чата
    this.userLeave = () => {
      this.props.socket.emit("user-leave", {
        type: "leave",
        user: this.username,
        room: this.roomName,
      });
    };
  }

  componentDidMount() {
    //подписываемся на чат
    this.props.socket.emit("user-join", {
      type: "join",
      room: this.roomName,
      token: sessionStorage.token,
    });

    //переподписка на чат в случае потери связи
    this.props.socket.on("reconnect", () => {
      this.props.socket.emit("user-join", {
        type: "join",
        room: this.roomName,
        token: sessionStorage.token,
      });
    });

    //сообщаем о выходе при закрытии браузера
    window.addEventListener("unload", this.userLeave);

    //получаем список всех сообщений в чате
    this.props.socket.on("welcome", (data) => {
      this.props.addRoom(data);
    });
    //при попытке получить доступ к чату без токена
    //возвращаем пользователя на страницу регистрации/входа в систему
    this.props.socket.on("expired", () => {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("username");
      this.props.history.push({
        pathname: "/enter",
        state: {
          err: "Время сеанса истекло. Войдите в систему повторно",
        },
      });
    });

   //при попытке получить доступ к закрытому чату без пароля
   //возвращаем на страницу со списком чатов
    this.props.socket.on("access-denied", () => {
      this.props.history.push({
        pathname: "/",
        state: {
          error: "Вход в этот чат защищен паролем",
        },
      });
    });
    //при получении нового сообщения обновляем список и счетчик сообщений
    this.props.socket.on("message-broadcast", (data) => {
      this.props.addMessage(data);
      this.msg_sound.play();
    });
    //при входе нового пользователя в чат обновляем список участников
    //и добавляем соответствующее сообщение
    this.props.socket.on("user-join", (data) => {
      this.props.addMessage(data.message);
      this.props.updateMembers(data.members);
      this.conn_sound.play();
    });
    //при выходе пользователя из чата обновляем список участников
    //и добавляем соответствующее сообщение
    this.props.socket.on("user-leave", (data) => {
      this.props.addMessage(data.message);
      this.props.updateMembers(data.members);
      this.conn_sound.play();
    });
    //показываем, что пользователь печатает
    this.props.socket.on("user-typing", (data) => {
      this.setState({
        typing: {
          action: true,
          user: data.user,
        },
      });
      this.typing_sound.play();
      setTimeout(() => {
        this.setState({
          typing: {
            action: false,
            user: "",
          },
        });
      }, 1000);
    });
  }

  componentDidUpdate(prevProps) {
    //прокрутка к последним сообщениям
    this.messagesList.current.scrollTop = this.messagesList.current.scrollHeight;
  }

  componentWillUnmount() {
    //уведомляем сервер о своем выходе из чата и отписываемся от всех событий сокета
    this.userLeave();

    this.props.socket.removeListener("access-denied");
    this.props.socket.removeListener("expired");
    this.props.socket.removeListener("welcome");
    this.props.socket.removeListener("message-broadcast");
    this.props.socket.removeListener("user-join");
    this.props.socket.removeListener("user-leave");
    this.props.socket.removeListener("user-typing");
    this.props.socket.removeListener("reconnect");
    window.removeEventListener("unload", this.userLeave);

    this.props.roomLeave();
  }

  //отправка сообщения в чат
  msgSubmit(msg) {
    const msgObj = {
      message: {
        type: "message",
        author: { username: this.username },
        text: msg,
        createdAt: Date.now(),
      },
      room: this.roomName,
    };
    this.props.socket.emit("message", msgObj);
  }

  //уведомляем сервер, что пользователь набирает сообщение
  onTyping() {
    this.props.socket.emit("user-typing", {
      type: "typing",
      user: this.username,
      room: this.roomName,
    });
  }

  render() {
    return (
      <div className="chat">
        <section className="chat__head">
          <div className="chat__name">
            <span>{this.props.room && this.props.room.name}</span>
          </div>
          <div className="chat__info">
            <span>
              <i className="fa fa-users"></i>{" "}
              {this.props.members && this.props.members.length} /
              <i className="fa fa-comment"></i> {this.props.messagesCount}
            </span>
          </div>
        </section>
        <section className="chat__messages" ref={this.messagesList}>
        <ul >
          {this.props.messages &&
            this.props.messages.map((message) => (
              <Message message={message} key={message._id} user={this.username} />
            ))}
        </ul>
        </section>
        <div className="typing__wrapper">
          {this.state.typing.action && (
            <div className="typing__event">
              <span>{this.state.typing.user} печатает</span>
            </div>
          )}
        </div>
        <MessageInput
          msgSubmit={(e) => this.msgSubmit(e)}
          type={() => this.onTyping()}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    socket: state.socket,
    room: state.room,
    members: state.members,
    messages: state.messages,
    messagesCount: state.messages.filter(
      (message) => message.type === "message"
    ).length,
  };
}

export default connect(mapStateToProps, {
  addRoom,
  updateMembers,
  addMessage,
  roomLeave,
})(Chat);
