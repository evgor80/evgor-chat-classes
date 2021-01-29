import React from "react";

//поле для ввода пароля

class PasswordInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      eyeIconClass: "fa fa-eye-slash",
    };
  }
  render() {
    return (
      <>
        <input
          className="form__input-field"
          type={
            this.state.eyeIconClass === "fa fa-eye-slash" ? "password" : "text"
          }
          name={this.props.name}
          required
          value={this.props.value}
          onChange={(e) => this.props.setValue(e)}
          onKeyUp={this.props.enter ? (e) => this.props.enter(e) : null}
        />
        <div
          onClick={() =>
            this.setState({
              eyeIconClass:
                this.state.eyeIconClass === "fa fa-eye-slash"
                  ? "fa fa-eye"
                  : "fa fa-eye-slash",
            })
          }
        >
          <i className={this.state.eyeIconClass}></i>
        </div>
      </>
    );
  }
}

export default PasswordInput;
