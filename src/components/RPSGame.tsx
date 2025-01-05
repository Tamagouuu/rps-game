import React, { useState, useEffect } from "react";
import { useWebSocket } from "../websocket/WebSocketProvider";

const RPSGame: React.FC = () => {
  const { socket, joinRoom } = useWebSocket()!;
  const [room, setRoom] = useState<string>("");
  const [choice, setChoice] = useState<string | null>(null);
  const [opponentChoice, setOpponentChoice] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [waitingForOpponent, setWaitingForOpponent] = useState<boolean>(false);

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "opponentChoice") {
        setOpponentChoice(data.choice);
      } else if (data.type === "result") {
        setResult(data.result);
        setOpponentChoice(data.opponentChoice);
      } else if (data.type === "gameStart") {
        setGameStarted(true);
        setWaitingForOpponent(false);
      } else if (data.type === "roomJoined") {
        setWaitingForOpponent(true);
      } else if (data.type === "roomFull") {
        alert("Room is full. Please join another room.");
      }
    };
  }, [socket]);

  const handleJoinRoom = () => {
    if (room) {
      joinRoom(room);
    }
  };

  const makeChoice = (choice: string) => {
    setChoice(choice);
    if (socket) {
      socket.send(JSON.stringify({ type: "choice", choice }));
    }
  };

  return (
    <div>
      <h1>Rock Paper Scissors Multiplayer</h1>
      {!gameStarted && (
        <div>
          <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Enter room name" />
          <button onClick={handleJoinRoom}>Join Room</button>
        </div>
      )}
      {waitingForOpponent && <h2>Waiting for opponent to join...</h2>}
      {gameStarted && (
        <div>
          <div>
            <button onClick={() => makeChoice("rock")}>Rock</button>
            <button onClick={() => makeChoice("paper")}>Paper</button>
            <button onClick={() => makeChoice("scissors")}>Scissors</button>
          </div>
          <div>
            <h2>Your Choice: {choice}</h2>
            <h2>Opponent's Choice: {opponentChoice}</h2>
            <h2>Result: {result}</h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default RPSGame;
