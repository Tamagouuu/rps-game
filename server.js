import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 9999 });
const rooms = {};

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const data = JSON.parse(message);
    console.log("Received:", data);

    if (data.type === "joinRoom") {
      const room = data.room;
      if (!rooms[room]) {
        rooms[room] = { players: [], choices: {} };
      }
      if (rooms[room].players.length < 2) {
        rooms[room].players.push(ws);
        ws.room = room;
        ws.id = `${room}-${rooms[room].players.length}`; // Assign a unique ID to each player
        ws.send(JSON.stringify({ type: "roomJoined", room }));
        if (rooms[room].players.length === 2) {
          rooms[room].players.forEach((player) => {
            player.send(JSON.stringify({ type: "gameStart" }));
          });
        }
      } else {
        ws.send(JSON.stringify({ type: "roomFull" }));
      }
    } else if (data.type === "choice") {
      const room = ws.room;
      if (room && rooms[room]) {
        rooms[room].choices[ws.id] = data.choice;
        if (Object.keys(rooms[room].choices).length === 2) {
          const [player1, player2] = rooms[room].players;
          const choice1 = rooms[room].choices[player1.id];
          const choice2 = rooms[room].choices[player2.id];
          const result = getResult(choice1, choice2);
          const result1 = result === "Draw" ? "Draw" : result === "Player 1 wins" ? "You Win" : "You Lose";
          const result2 = result === "Draw" ? "Draw" : result === "Player 2 wins" ? "You Win" : "You Lose";
          player1.send(JSON.stringify({ type: "result", result: result1, opponentChoice: choice2 }));
          player2.send(JSON.stringify({ type: "result", result: result2, opponentChoice: choice1 }));
          rooms[room].choices = {}; // Reset choices for next round
        }
      }
    }
  });

  ws.on("close", () => {
    const room = ws.room;
    if (room && rooms[room]) {
      rooms[room].players = rooms[room].players.filter((client) => client !== ws);
      if (rooms[room].players.length === 0) {
        delete rooms[room];
      }
    }
  });
});

const getResult = (choice1, choice2) => {
  if (choice1 === choice2) return "Draw";
  if (
    (choice1 === "rock" && choice2 === "scissors") ||
    (choice1 === "scissors" && choice2 === "paper") ||
    (choice1 === "paper" && choice2 === "rock")
  ) {
    return "Player 1 wins";
  }
  return "Player 2 wins";
};

console.log("WebSocket server is running on ws://localhost:9999");
