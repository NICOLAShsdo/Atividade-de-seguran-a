import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  login,
  atualizarIptu,
  novoLogin,
  getIptuPorIdUsuario,
  getQRCodeOrCodBarras
} from "../controllers/usuarioController";

import { autenticarToken } from "../middlewares/authMiddleware";
import { verificarAdmin } from "../middlewares/adminMiddleware";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10
});

router.post("/login", loginLimiter, login);
router.post("/novo-login", novoLogin);

router.post(
  "/atualizar-iptu",
  autenticarToken,
  verificarAdmin,
  atualizarIptu
);

router.get(
  "/iptu-por-usuario",
  autenticarToken,
  getIptuPorIdUsuario
);

router.get(
  "/codigo-qr-ou-barra",
  autenticarToken,
  getQRCodeOrCodBarras
);

export default router;