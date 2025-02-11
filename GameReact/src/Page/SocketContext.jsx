// SocketContext.js
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const socket = useMemo(() => io('https://react-17nc.onrender.com'), []);
  //const socket = useMemo(() => io('http://localhost:3000'), []);  

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
