import express, { Application, Router } from "express";
import cors from "cors";
import http from "http";

import { Logger, SetupLogger } from "./Logger";
import { HttpLogger } from "../middleware/HttpLogger";
import { UnimplementedRouteHandler } from "../middleware/UnimplementedRouteHandler";
import { HealthCheckHandler } from "../middleware/HealthCheckHandler";
import { ErrorHandler } from "../middleware/ErrorHandler";

/**
 * Wrapper class for Express' `.app()` function, with several quality of life functions and defaults for easing development.
 */
export class ExpressApp {
  private app: Application;
  private server: http.Server;
  private corsOptions: Object;
  private publicPath: string;

  private static DEFAULT_CORS_OPTIONS = {
    origin: "*",
    methods: "GET, POST",
    allowedHeaders: "Content-Type, Authorization"
  }

  constructor(
    corsOptions: Object = ExpressApp.DEFAULT_CORS_OPTIONS,
    publicPath: string,
  ) {
    this.app = express();
    this.corsOptions = corsOptions;
    this.publicPath = publicPath;
    this.server = http.createServer(this.app);

    this.Init(this.corsOptions, this.publicPath);
  }

  /**
   * Starts the server. Equivalent to Express' `app.listen()`.
   * @param port Server port to listen on
   * @param host Host URL, for route printing purposes
   */
  public StartServer(port: number, host: string) {
    Logger.info(`Server starting, listening on port ${port}`);
    const hostUrl = `${host}:${port}`;

    this.server.listen(port, host, undefined, () => {
      Logger.info(`Server running on port ${port}`);
      Logger.info(`Server available at ${hostUrl}`);

      this.PrintAppRoutes(hostUrl);
    });
  }

  /**
   * Internal initializer function for setting up important middlewares and routes.
   * @param corsOptions CORS options used by the server
   * @param publicPath Path to the `public` folder
   */
  private Init(corsOptions: Object, publicPath: string) {
    // Initialize console logger (winston)
    SetupLogger();

    // Set up CORS options
    this.app.use(cors(corsOptions));

    // Set up middleware functions
    this.app.use(express.json());
    this.app.use(HttpLogger);

    // Set up default routes
    this.app.get('/api/health-check', HealthCheckHandler);
  }

  /**
   * Quick setup for routes.
   * @param prefixEndpoint The base endpoint
   * @param router Express' `Router`
   */
  public SetupRoute(prefixEndpoint: string, router: Router) {
    this.app.use(prefixEndpoint, router);
  }

  /**
   * Generic function for middleware setup. Uses Express' `app.use()`
   * @param middleware The middleware function
   */
  public SetupMiddleware(middleware: any) {
    this.app.use(middleware);
  }

  /**
   * Default error handling middleware. It's used after all routes have been defined.
   */
  public SetupErrorHandler() {
    this.app.use(ErrorHandler);
  }

  /**
   * Error handling middleware. It's the last middleware that should be used.
   */
  public SetupUnimplementedRouteHandler() {
    UnimplementedRouteHandler(this.app);
  }

  /**
   * Return the Express' `app()` instance used by the wrapper. Useful for tweaking something outside the scope of this wrapper.
   * @returns Express' `app()`
   */
  public GetExpressApp() {
    return this.app;
  }

  /**
   * Returns the raw `http` server
   * @returns `http.server()`
   */
  public GetHTTPServer() {
    return this.server;
  }

  /**
   * Prints all available routes in the console.
   * @param hostUrl Host URL used by the server
   */
  private PrintAppRoutes(hostUrl: string = "") {
    const router = (this.app as any)._router;

    if (!router || !Array.isArray(router.stack)) {
      Logger.warn("No routes registered yet or Express router is not initialized.");
      return;
    }

    Logger.debug("===========================");
    Logger.debug("API ROUTES:");

    const printLayer = (layer: any, prefix: string = "") => {
      if (layer.route) {
        const path = prefix + layer.route.path;
        const methods = Object.keys(layer.route.methods)
          .map(m => m.toUpperCase())
          .join(", ");
        Logger.debug(`${methods} ${hostUrl}${path}`);
      } else if (layer.name === "router" && layer.handle.stack) {
        const newPrefix = prefix + this.SplitRegex(layer.regexp);
        for (const subLayer of layer.handle.stack) {
          printLayer(subLayer, newPrefix);
        }
      }
    };

    for (const layer of router.stack) {
      printLayer(layer);
    }

    Logger.debug("===========================");
  }

  private SplitRegex(thing: any) {
    if (typeof thing === 'string') {
      return thing.split('/')
    } else if (thing.fast_slash) {
      return ''
    } else {
      var match = thing.toString()
        .replace('\\/?', '')
        .replace('(?=\\/|$)', '$')
        .match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//)
      return match
        ? match[1].replace(/\\(.)/g, '$1')
        : '<complex:' + thing.toString() + '>'
    }
  }
}