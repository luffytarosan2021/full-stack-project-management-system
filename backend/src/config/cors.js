import { env } from "./env.js";

export const corsOptions = {
  origin(origin, callback) {
    // Requests without an Origin header (native mobile app, curl) are not subject to CORS.
    if (!origin) return callback(null, true);
    return callback(null, env.CLIENT_ORIGIN.includes(origin));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
