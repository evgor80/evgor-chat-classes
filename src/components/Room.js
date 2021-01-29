//отдельный чат в списке чатов с указанием
//кол-ва пользователей онлайн и сообщений

export default function Room({room}) {
  return (
    <div className="room">
      <div className="room__name">
        <span>{room.name}</span>
      </div>
      <div className="room__details">
        <span className="room__members">
          <i className="fas fa-users"></i> {room.members}
        </span>

        <span className="room__messages">
          <i className="fas fa-comment"></i> {room.messages}
        </span>

        <span className="room__access">
          <i
            className={"fa " + (room.private ? "fa-user-lock" : "fa-lock-open")}
          ></i>
          {room.private ? "  Закрытый" : "  Общий"}
        </span>
      </div>
    </div>
  );
}
