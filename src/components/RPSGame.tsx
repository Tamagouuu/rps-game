import { useState, useEffect } from "react";
import { useWebSocket } from "../websocket/WebSocketProvider";
import RPSDetector from "./RPSDetector";

function RPSGame() {
  const { socket, joinRoom } = useWebSocket()!;
  const [room, setRoom] = useState<string>("");
  const [choice, setChoice] = useState<string | null>(null);
  const [opponentChoice, setOpponentChoice] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [waitingForOpponent, setWaitingForOpponent] = useState<boolean>(false);
  const [waitingForResult, setWaitingForResult] = useState<boolean>(false);
  const [opponentHasChosen, setOpponentHasChosen] = useState<boolean>(false);

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "opponentChoice") {
        setOpponentChoice(data.choice);
        setOpponentHasChosen(true);
      } else if (data.type === "result") {
        setResult(data.result);
        setOpponentChoice(data.opponentChoice);
        setWaitingForResult(false);
      } else if (data.type === "gameStart") {
        setGameStarted(true);
        setWaitingForOpponent(false);
        setWaitingForResult(true);
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-center">Rock Paper Scissors 🪨📃✂️</h1>
      {!gameStarted && (
        <div className="mb-8">
          <input
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Enter room name"
            className="px-4 py-2 border rounded-md mb-4"
          />
          <button
            onClick={handleJoinRoom}
            className="ms-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Join Room
          </button>
        </div>
      )}
      {waitingForOpponent && (
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-2xl mb-4">Waiting for opponent to join 🤔...</h2>
          <div className="flex space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-green-500 rounded-full animate-bounce "></div>
            <div className="w-4 h-4 bg-red-500 rounded-full animate-bounce"></div>
          </div>
          <p className="text-sm text-gray-400 mt-5">(Lebih lama nungguin kepastian kamu dari pada nunggu ini 😭)</p>
        </div>
      )}
      {gameStarted && (
        <div className="flex flex-wrap gap-5 items-center justify-center">
          <RPSDetector choice={choice} makeChoiceFn={makeChoice} />
          {opponentHasChosen && <h2 className="text-2xl mb-8">Opponent already chose</h2>}
          <div className="text-center p-4 bg-white shadow-md rounded-md px-8 self-start">
            <h1 className="text-center text-gray-400 text-lg font-bold mb-2 uppercase">
              OR, CHOOSE ONE OF BUTTONS BELOW ✨
            </h1>

            <div className="mb-8">
              <button
                onClick={() => makeChoice("rock")}
                className={`px-4 py-2 rounded-md mx-1 ${
                  choice ? "bg-gray-300 cursor-not-allowed" : "bg-slate-600 hover:bg-slate-700 text-white"
                }`}
                disabled={!!choice}
              >
                🪨 Rock
              </button>
              <button
                onClick={() => makeChoice("paper")}
                className={`px-4 py-2 rounded-md mx-1 ${
                  choice ? "bg-gray-300 cursor-not-allowed" : "bg-neutral-400 hover:bg-neutral-500 text-white"
                }`}
                disabled={!!choice}
              >
                📃 Paper
              </button>
              <button
                onClick={() => makeChoice("scissors")}
                className={`px-4 py-2 rounded-md mx-1 ${
                  choice ? "bg-gray-300 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white"
                }`}
                disabled={!!choice}
              >
                ✂️ Scissors
              </button>
            </div>
            <h2 className="text-2xl mb-4 font-semibold">
              🫵 Your Choice : <span className="text-blue-500 capitalize">{choice}</span>
            </h2>
            <h2 className="text-2xl mb-4 font-semibold">
              😈 Opponent's Choice : <span className="text-red-500 capitalize">{opponentChoice}</span>
            </h2>
            {waitingForResult && !opponentHasChosen && <div className="loader mx-auto"></div>}
            {result && (
              <h2
                className={`text-2xl font-bold ${
                  result == "Draw" ? "text-gray-500" : result == "You Win" ? "text-green-500" : "text-red-500"
                }`}
              >
                {result}
              </h2>
            )}
            <p className="text-sm text-gray-400 mt-5">
              Yang bikin game malah jadi <span className="font-bold">Second Choice</span> 😭 <br />{" "}
              <span className="italic">(Yakin second choice? dipilih aja kagak 😤)</span>
            </p>
          </div>
        </div>
      )}
      <div className="max-w-sm mt-5">
        <p className="text-center text-sm font-bold mb-2">Made with 💖 by Gautama</p>
        <p className="text-xs text-gray-400 text-center">
          This app might still have some bugs, either in the model or the business processes. But hey, it's just for
          fun, so I get to do whatever I want! 😁
        </p>
      </div>
    </div>
  );
}

export default RPSGame;
