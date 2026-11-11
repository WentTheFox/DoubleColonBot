import { Express } from 'express';
import { expressPaths } from '../constants/express-paths';
import { AppHandlerDependencies } from '../model/app-handler-dependencies';
import { redirectTargetHandler } from '../handlers/redirect-target-handler';
import { authStartHandler } from '../handlers/auth-start-handler';

export const registerAppHandlers = (app: Express, deps: AppHandlerDependencies) => {
  // Liveness/readiness probe: 200 only when both PostgreSQL and Redis/Valkey answer
  app.get(expressPaths.getHealth(), async (req, res) => {
    try {
      await Promise.all([deps.db.query('SELECT 1'), deps.redisManager.ping()]);
      res.status(200).json({ status: 'ok' });
    } catch (error) {
      res.status(503).json({ status: 'unavailable' });
    }
  });

  app.get('/', (req, res) => {
    res.redirect(`https://twitch.tv/${deps.botUsername}`);
  });

  app.get(expressPaths.getRedirectTarget(), redirectTargetHandler(deps));

  app.get(expressPaths.getAuthStart(), authStartHandler(deps));
};
