import { Router } from "express";
import authRouter from "./Authorisation.mjs";
import matchRouter from "./Match.mjs";
import homeRouter from "./HomePage.mjs";
import userRoutes from "./searchUser.mjs";
import leaderboardRouter from "./leaderboardRoute.mjs"
import weatherRouter from "./weather.mjs";

const router=Router();

router.use(authRouter);
router.use(matchRouter);
router.use(homeRouter);
router.use(userRoutes);
router.use(weatherRouter);
router.use(leaderboardRouter);

export default router;