import { Router } from "express";
import rateLimit from "express-rate-limit";
import { criarComentario, listarComentarios } from "../controllers/comentarioController";
import { autenticarToken } from "../middlewares/authMiddleware";

const router = Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

router.use(limiter);

router.post(
  "/",
  autenticarToken,
  criarComentario
);

router.get(
  "/",
  autenticarToken,
  listarComentarios
);

export default router;