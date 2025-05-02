import dotenv from "dotenv";
import path from "path";

import { ExpressApp } from "./lib/ExpressApp";
import { TestRoutes } from "./routes/TestRoute";

// Set up environment variables
dotenv.config();

// Create a new Express app instance
const publicPath = path.join(__dirname, "../", "public");
const app = new ExpressApp(
  undefined,
  publicPath
);
app.SetupRoute('/api', TestRoutes);
app.SetupErrorHandler();
app.SetupUnimplementedRouteHandler();

app.StartServer("8080", `http://localhost`);
