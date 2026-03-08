import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import userRoutes from "./routes/usuarioRoutes";
import commentRoutes from "./routes/comentarioRoutes";

const app = express();

/* Segurança de headers HTTP */
app.use(helmet());

/* Configuração segura de CORS */
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

/* Limite de tamanho de requisição */
app.use(express.json({
  limit: "10kb"
}));

/* Proteção contra spam e brute force */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(limiter);

/* Rotas da aplicação */
app.use("/usuario", userRoutes);
app.use("/comentario", commentRoutes);

app.listen(3001, () => {
  console.log("Servidor rodando com configurações seguras na porta 3001");
});