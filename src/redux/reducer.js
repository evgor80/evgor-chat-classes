import io from "socket.io-client";

const socket = io("/");
const initialState = {
  socket,
  rooms: [],
  room: null,
  messages: [],
  members: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case "ADD_ROOMS":
      return {
        ...state,
        rooms: [...action.payload],
      };
    case "ADD_ROOM":
      return {
        ...state,
        room: { ...action.payload.room },
        messages: [...action.payload.messages],
        members: [...action.payload.members],
      };

    case "UPDATE_MEMBERS":
      return {
        ...state,
        members: [...action.payload],
      };
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case "ROOM_LEAVE":
      return {
        ...state,
        messages: [],
        members: [],
        room: null,
      };

    default:
      return state;
  }
}
