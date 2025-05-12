import dotenv from "dotenv";
import path from "path";

import { ExpressApp } from "./lib/ExpressApp";
import { GameSessionsRouter } from "./routes/GameSessionsRoutes";
import ViewerWebSocketService from "./services/ViewerWebSocketService";
import GameWebSocketService from "./services/GameWebSocketService";

// Set up environment variables
dotenv.config();

// Create a new Express app instance
const publicPath = path.join(__dirname, "../", "public");
const app = new ExpressApp(undefined, publicPath);

app.SetupRoute('/api', GameSessionsRouter);
app.SetupErrorHandler();
app.SetupUnimplementedRouteHandler();

const server = app.GetHTTPServer();
if (!server) throw new Error("HTTP server not initialized");

server.on("upgrade", (req, socket, head) => {
  const url = req.url || "";

  if (url.startsWith("/ws/view/")) {
    ViewerWebSocketService.handleUpgrade(req, socket, head);
  } else if (url === "/ws/game") {
    GameWebSocketService.handleUpgrade(req, socket, head);
  } else {
    socket.destroy(); // Don't let unknown requests hang
  }
});

app.StartServer("8080", `http://localhost`);
