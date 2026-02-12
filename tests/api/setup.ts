import express from 'express';
import { createServer, type Server } from 'http';
import { registerRoutes } from '../../server/routes';
import supertest from 'supertest';

let app: express.Express;
let httpServer: Server;

export async function createTestApp() {
  app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  httpServer = createServer(app);
  await registerRoutes(httpServer, app);
  return supertest(app);
}

export async function closeTestApp() {
  if (httpServer) {
    httpServer.close();
  }
}
