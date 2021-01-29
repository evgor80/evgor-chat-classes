export const addRooms = (rooms) => ({
  type: "ADD_ROOMS",
  payload: rooms,
});

export const addRoom = (room) => ({
  type: "ADD_ROOM",
  payload: {
    room: room.room,
    messages: room.messages,
    members: room.members,
  },
});

export const updateMembers = (members) => ({
  type: "UPDATE_MEMBERS",
  payload: members,
});

export const addMessage = (message) => ({
  type: "ADD_MESSAGE",
  payload: message,
});

export const roomLeave = () => ({
  type: "ROOM_LEAVE",
});
