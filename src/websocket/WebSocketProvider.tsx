import React, { createContext, useContext, useEffect, useState } from "react";

const WebSocketContext = createContext<{ socket: WebSocket | null; joinRoom: (room: string) => void } | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const connectWebSocket = () => {
      // Replace 'your-public-ip-or-domain' with your actual public IP address or domain name
      const ws = new WebSocket("ws://192.168.1.8:9999");
      setSocket(ws);

      ws.onopen = () => {
        console.log("WebSocket connection established");
        setRetryCount(0); // Reset retry count on successful connection
      };

      ws.onerror = (error) => {
        console.error("WebSocket error: ", error);
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed");
        if (retryCount < 5) {
          // Retry up to 5 times
          setTimeout(() => {
            setRetryCount(retryCount + 1);
            connectWebSocket();
          }, 1000 * retryCount); // Exponential backoff
        }
      };
    };

    connectWebSocket();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [retryCount]);

  const joinRoom = (room: string) => {
    if (socket) {
      socket.send(JSON.stringify({ type: "joinRoom", room }));
    }
  };

  return <WebSocketContext.Provider value={{ socket, joinRoom }}>{children}</WebSocketContext.Provider>;
};

export const useWebSocket = () => useContext(WebSocketContext);
