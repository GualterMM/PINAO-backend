import dotenv from "dotenv";
import path from "path";

import { ExpressApp } from "./lib/ExpressApp";
import { GameSessionsRouter } from "./routes/GameSessionsRoutes";
import WebSocketService from "./services/WebSocketService";

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
WebSocketService.Init(server);

app.StartServer("8080", `http://localhost`);
