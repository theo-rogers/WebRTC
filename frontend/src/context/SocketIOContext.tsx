/* eslint-disable no-unused-vars */
import React, {createContext, useEffect, useState, useRef} from 'react';
import {useHistory, withRouter} from 'react-router-dom';
import PropTypes from 'prop-types';
import {io} from 'socket.io-client';
import env from 'react-dotenv';
import Peer, {MediaConnection} from 'peerjs';
import validator from 'validator';
import {v4 as uuidv4} from 'uuid';


import {
  Meeting,
  IExternalMedia,
  IPeers,
  ISocketIOContex,
  ChildrenProps,
} from '../types';

// const peerServer = env.PEER_SERVER;
// const peerServerPort = env.PEER_SERVER_PORT;

interface Props extends ChildrenProps {

}

// Context item to be passed to app
const SocketIOContext = createContext<Partial<ISocketIOContex>>({});
let roomParam = new URLSearchParams(window.location.search).get('room');
console.log('room param', roomParam);
if (roomParam && !validator.isUUID(roomParam)) roomParam = null;
/**
 * SocketIO server instance
 * URL of deplyed server goes here
 */
const connectionUrl = `http://localhost:5000?room=${roomParam}`;
console.log('socket url', connectionUrl);
const socket = io(connectionUrl);


const ContextProvider: React.FC<Props> = ({children}) => {
  const [currentUserID, setCurrentUserID] = useState(uuidv4());
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [externalMedia, setExternalMedia] = useState<IExternalMedia[]>([]);
  const [localMedia, setLocalMedia] = useState<MediaStream>();
  const [peers, setPeers] = useState<IPeers>({});
  const [hasJoinedMeeting, setHasJoinedMeeting] = useState<boolean>(false);
  const peerConnection = useRef<Peer | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const history = useHistory();


  /**
   * Waits for a meeting to exist before initiating functions that
   * require meeting data.
   */
  useEffect(() => {
    if (meeting && meeting.id && !hasJoinedMeeting && localMedia) {
      setConnectingPeersListener();
      setExternalUserListener();
      joinMeeting({id: meeting.id});
    }
  }, [meeting, localMedia]);

  /**
   * Calls startup functions on first load.
   */
  useEffect(() => {
    initPeerServerConnection();
    setupSocketListeners();
    return () => {
      endConnection();
    };
  }, []);

  /**
   * Sets socket connection listers
   */
  const setupSocketListeners= async () =>{
    // Listens for meeting from socket
    socket.on('NewMeeting', (meeting) => setMeeting(meeting));
    console.log('current user id before peer creation', currentUserID);
    // requests webcam access from end user
    await initializeMediaStream();

    /**
     * Disconnects from peer WebRTC stream,
     * removes information from peer list and removes media stream.
     */
    socket.on('UserDisconnected', (userID: string) => {
      if (userID in peers) {
        peers[userID].close();
      }
      removePeer(userID);
      removeMedia(userID);
    });
    socket.on('error', (error) => {
      console.log('Socket Responded With Error: ', error);
    });
  };

  /**
   * Initializes connection to peer server
   */
  const initPeerServerConnection = () => {
    peerConnection.current = new Peer(currentUserID, {
      host: '/',
      port: 5001,
    });
  };

  /**
   * Requests a new meeting id from server
   * @example calling getNewMeeting() from anywhere in the application
   * //Will have the backend server issue a new meeting.
   */
  const getNewMeeting = async () =>{
    socket.emit('NewMeeting'); ;
  };
  /**
   * Get audio and video stream from the browser
   * Will prompt user for permissions
   */
  const initializeMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
          {video: true, audio: true},
      );
      setLocalMedia(stream);
      // stores stream in ref to be used by video element
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch (err) {
      console.log(err);
    }
  };

  /**
   * Starts connection with peer server and retreives user id
   * initializes meeting and tells the backend server than its joining a meeting
   */
  const setPeerOpenedConnectionListner = async () => {
    if (!peerConnection.current) throw new Error('Peer connection missing');
    peerConnection.current.on('open', async (id:string) => {
      console.log('ID from peer', id);
      // check if room param is invalid and retrieve new id.
      if (!roomParam) await getNewMeeting();
    });
  };
  /**
   * Joins a new meeting.
   * Tells backend server that it would like to join the specified meeting
   * Pushes to reflect meeting after joining meeting and sets
   * hasJoinedMeeting to true.
   * @param {Meeting} newMeeting the meeting to join
   */
  const joinMeeting = (newMeeting?:Meeting) => {
    // If a meeting ID is not provided, attempt to use stored variable
    if (!newMeeting && meeting) newMeeting = meeting;
    if (!newMeeting) throw new Error('Unable to retrieve meeting');
    // If new meeting is not current meeting, update current meeting.
    if (meeting !== newMeeting) setMeeting(newMeeting);
    const meetingData = {
      userID: currentUserID,
      roomID: newMeeting.id,
    };
    console.log('joining meeting: ', newMeeting);
    socket.emit('JoinRoom', meetingData);
    history.push('?room='+meeting?.id);
    setHasJoinedMeeting(true);
  };
  /**
   * Helper function to remove a media stream from the
   * list of media streams to display
   * @param {string} id the id of the media to remove
   */
  const removeMedia = (id: string) => {
    setExternalMedia(externalMedia
        .filter((media:IExternalMedia) => media.id !== id));
  };
  /**
   * Helper function to add peer to peer list
   * @param {Peer} call the call information to be added to the peer list
   */
  const addPeer = (call:MediaConnection) => {
    console.log('New peer added', call);
    setPeers({
      ...peers,
      call,
    });
  };
  /**
   * Helper function to remove a peer from the peer list
   * @param {string} id the id of the peer
   */
  const removePeer = (id:string) => {
    const newPeers = {...peers};
    delete newPeers[id];
    setPeers(newPeers);
  };
  /**
   * Adds media stream to list of streams to display
   * @param {string} id  The peers id
   * @param {MediaStream} stream the media stream to add
   * @param {any} userData? any additional data
   */
  const addExternalMedia = (
      id: string, stream:MediaStream, userData?: Peer.CallOption,
  ) => {
    // Prevent local user from being added to the list.
    if (id === currentUserID) return;
    const newMediaItem = {
      id, stream, data: userData? userData: undefined,
    };

    setExternalMedia((oldState) => {
      // Prevent duplicates from being added
      if (oldState.find((item) => item.id === id)) return oldState;
      return [...oldState, newMediaItem];
    });
  };
  /**
   * Listen for a call from connecting peers
   * An incoming call is answered and the current user media (local webcam feed)
   * is sent. Cleans up connection on error or if far side closes connection
   * Adds peer to peer list
   * @param {MediaStream} localStream local webcam stream
   */
  const setConnectingPeersListener = () => {
    console.log('set conected peer lisener');
    if (!peerConnection.current) throw new Error('Missing peer connection');
    peerConnection.current.on('call', (call: MediaConnection) => {
      call.answer(localMedia);
      console.log('call answered', call);

      call.on('stream', (stream) => {
        addExternalMedia(call.peer, stream);
        console.log('adding stream');
      });
      call.on('close', ()=> removeMedia(call.metadata.id));
      call.on('error', () => {
        console.log('call error: ', call.metadata.id);
        removeMedia(call.metadata.id);
      });
      addPeer(call);
    });
  };
  /**
   * Listens for new user connectected event then calls user
   * Cleans up connection on error or if far side closes connection.
   * @param {MediaStream} localStream local webcam stream
   */
  const setExternalUserListener = () => {
    console.log('set external user listener');
    socket.on('NewUserConnected', (id) => {
      // Prevent local user from being added.
      if (id === currentUserID) return;
      console.log('new user connection, current user id', currentUserID);
      console.log('new user connection, userid: ', id);
      const callData: Peer.CallOption = {
        metadata: {
          id,
        },
      };
      if (!peerConnection.current) throw new Error('Missing peer connection');
      if (!localMedia) throw new Error('Missing webcam stream');
      const call = peerConnection.current.call(id, localMedia, callData);
      console.log('Placing call', call);
      // when a stream is received, add it to external media
      call.on('stream', (stream: MediaStream) => {
        addExternalMedia(call.peer, stream, callData);
        console.log('call stream', call);
        console.log('stream received', stream);
      });
      // remove media if closed by far side
      call.on('close', () => {
        removeMedia(call.metadata.id);
        console.log('call closed');
      });
      // remove media on call error
      call.on('error', () => {
        console.log('call error: ', call.metadata.id);
        removeMedia(call.metadata.id);
      });
    });
  };
  const startNewMeeting = () => {
    getNewMeeting();
    setupSocketListeners();
  };
  const leaveMeeting = () => {
    setMeeting(null);
    setHasJoinedMeeting(false);
    history.push('');
    setExternalMedia([]);
    Object.values(peers).forEach((peer) => peer.close());
  };

  /**
   * Cleans up media streams and connections
   */
  const endConnection = () => {
    socket?.disconnect();
    leaveMeeting();
    if (peerConnection.current) peerConnection.current.destroy();
  };

  return (
    <SocketIOContext.Provider
      value={{
        initializeConnection: setupSocketListeners,
        currentUserID,
        meeting,
        externalMedia,
        peers,
        peerConnection,
        localVideoRef,
        initializeMediaStream,
        initializeMeeting: setPeerOpenedConnectionListner,
        endConnection,
        setMeeting,
        joinMeeting,
        startNewMeeting,
        leaveMeeting,
      }}
    >
      {children}
    </SocketIOContext.Provider>
  );
};

export {ContextProvider, SocketIOContext};
