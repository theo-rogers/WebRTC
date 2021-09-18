const {v4: uuidV4, validate: uuidValidate} = require('uuid'); ;
const userList = [];
const meetingList = {};

module.exports = function(io) {
  const createNewMeeting = (id) => {
    // TODO add meeting functionality
    const newMeeting = {
      id: id? id : uuidV4(),
      title: 'Test Meeting Title',
      users: [],
    };
    meetingList[newMeeting.id]= newMeeting;
    return newMeeting;
  };

  const joinRoom = (socket, roomID) => {
    //* If meeting exists in meeting list, send meeting.
    if (!(roomID in meetingList)) {
      socket.emit('NewMeeting', meetingList[roomID]);
    //* If meeting does not exist, create a new one with that id.
    } else {
      socket.emit('NewMeeting', createNewMeeting(roomID) );
    }
  };

  /**
  * Setup socket connection behaviors
  */
  io.on('connection', (socket) => {
    const newUserID = uuidV4();
    //* Add user to user list.
    userList.push(newUserID);
    //* Send user id
    socket.emit('CurrentUserID', newUserID);
    //* Get room parameter from url.
    const roomID = socket.handshake.query.room;
    //* Check if a room id parameter was supplied
    //* If so, join that meeting.
    if (uuidValidate(roomID)) {
      joinRoom(socket, roomID);
    }
    //* if no parameter was supplied, do not join a meeting.

    /**
     * Listens for a the user to request a new meeting id.
     * Sends ID of newly created meeting to user.
     */
    socket.on('NewMeeting', () => {
      socket.emit('NewMeeting', createNewMeeting());
    });

    socket.on('JoinMeeting', (meetingData) => {
      const {user, roomID} = meetingData;
      joinRoom(socket, roomID);
      io.to(roomID).emit('NewUserConnected', user);
      socket.join(roomID);
      if (roomID in meetingList) meetingList[roomID].users.push(user);
      socket.on('disconnect', () => {
        socket.to(roomID).emit('UserDisconnected', user);
        // TODO: clean up room attendees.
      });
    });
    // socket.on('LeaveRoom', ())
  });
};

