import React from "react";
import emojis from "../utils/emojis";

//поле для ввода нового сообщения в окне чата

class MessageInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "",
      emojisWindow: false,
    };
    this.messageInput = React.createRef();
  }
  //отправка сообщения в чат
  submit() {
    if (this.state.message.trim().length >= 1) {
      this.setState({ emojisWindow: false });
      this.props.msgSubmit(this.state.message);
      this.setState({ message: "" });
    }
  }
  //обработка нажатия Enter вместо кнопки отправки
  enterPress(e) {
    if (e.key === "Enter") {
      this.submit();
    }
  }
  //добавление смайла в текст сообщения
  //и закрытие окна с набором смайлов
  addEmoji(i) {
    this.setState({
      message: this.state.message + " " + emojis[i]["symbol"] + " ",
    });
    this.setState({ emojisWindow: false });
    this.messageInput.current.focus();
  }
  render() {
    return (
      <section className="msg-form">
        <textarea
          ref={this.messageInput}
          name=""
          rows="3"
          placeholder="Введите свое сообщение"
          value={this.state.message}
          onChange={(e) => {
            this.setState({ message: e.target.value });
            this.props.type();
          }}
          onKeyUp={(e)=>this.enterPress(e)}
        ></textarea>
        <button
          className="msg-form__emoji-button"
          onClick={() =>
            this.setState({ emojisWindow: !this.state.emojisWindow })
          }
        >
          <img src="/emoji/slightly-smiling-face.png" alt="" />
        </button>
        <button className="msg-form__submit-button" onClick={()=>this.submit()}>
          <i className="fa fa-paper-plane"></i>
        </button>
        {this.state.emojisWindow && (
          <>
            <ul className="emojis">
              {emojis.map((emoji, index) => (
                <li key={emoji.name}>
                  <button
                    className="emoji"
                    onClick={() => this.addEmoji(index)}
                  >
                    <img src={`/emoji/${emoji.name}.png`} alt="" />
                  </button>
                </li>
              ))}
            </ul>
            <button
              className="emojis__close"
              onClick={() => {
                this.setState({ emojisWindow: !this.state.emojisWindow });
                this.messageInput.current.focus();
              }}
            >
              <span>X</span>
            </button>
          </>
        )}
      </section>
    );
  }
}

export default MessageInput;
