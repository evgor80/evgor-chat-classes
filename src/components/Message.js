import React from "react";
import beautifyDate from "../utils/beautifyDate";
import emojis from "../utils/emojis";
import { connect } from "react-redux";

//отдельное сообщение в окне чата

class Message extends React.Component {
  //назначаем цвет для аватара пользователя
  userAvatar(author) {
    const color = [
      "#3399ff",
      "#00ffff",
      "#ffcc00",
      "#99ff33",
      "#009900",
      "#0066ff",
      "#cc0066",
      "#ff0066",
      "#6600ff",
      "#00cc66",
    ];
    let hash = 0;
    for (let symbol of author) {
      hash += symbol.charCodeAt(0);
    }
    hash = hash % 10;
    return { backgroundColor: color[hash] };
  }

  //отображение изображений смайлов в тексте сообщения
  showEmojis(message) {
    emojis.forEach((emoji) => {
      let re = new RegExp(emoji.symbol, "g");
      message = message.replace(
        re,
        `<img src="/emoji/${emoji.name}.png" class="msg__smile" alt=""/>`
      );
    });
    return { __html: message };
  }

  render() {
    return (
      <li className="msg">
        {this.props.message.type === "message" && (
          <div
            className={
              "msg__message " +
              (this.props.message.author.username === this.props.user
                ? "msg__message--mine"
                : "")
            }
          >
            <div
              className="msg__author"
              style={
                this.props.message.author.username !== this.props.user
                  ? this.userAvatar(this.props.message.author.username)
                  : null
              }
            >
              <span>
                {this.props.message.author.username.charAt(0).toUpperCase()}
              </span>
              {this.props.message.author.username !== this.props.user && (
                <div className="msg__author-name">
                  {this.props.message.author.username}
                </div>
              )}
              <div
                className={
                  "msg__author-status " +
                  (this.props.members.includes(
                    this.props.message.author.username
                  )
                    ? "msg__author-status--online"
                    : "msg__author-status--offline")
                }
              ></div>
            </div>
            <div className="msg__body">
              <div
                className={
                  this.props.message.author.username === this.props.user
                    ? "msg__text--mine"
                    : "msg__text"
                }
              >
                <span
                  dangerouslySetInnerHTML={this.showEmojis(
                    this.props.message.text
                  )}
                ></span>
              </div>
              <div className="msg__time">
                <span>{beautifyDate(this.props.message.createdAt)}</span>
              </div>
            </div>
          </div>
        )}
        {(this.props.message.type === "join" ||
          this.props.message.type === "leave") && (
          <div className="msg__notification">
            <span>
              {this.props.message.user}
              {this.props.message.type === "join"
                ? " входит в"
                : " покидает"}{" "}
              чат
            </span>
          </div>
        )}
      </li>
    );
  }
}

function mapStateToProps(state) {
  return {
    members: state.members,
  };
}

export default connect(mapStateToProps, null)(Message);
