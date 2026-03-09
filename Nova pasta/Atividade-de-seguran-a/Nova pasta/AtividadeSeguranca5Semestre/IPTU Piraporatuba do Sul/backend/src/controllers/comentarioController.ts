import { Request, Response } from "express";
import db from "../database";
import xss from "xss";

export const criarComentario = async (req: Request, res: Response) => {
    try {

        const { texto } = req.body;

        // usuario deve vir da autenticação
        const usuarioId = (req as any).user?.id;

        if (!usuarioId) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        if (!texto || typeof texto !== "string") {
            return res.status(400).json({ error: "Texto inválido" });
        }

        if (texto.length > 500) {
            return res.status(400).json({ error: "Comentário muito grande" });
        }

        const textoLimpo = xss(texto);

        const query = `
            INSERT INTO comentario (texto, usuario_id)
            VALUES ($1, $2)
        `;

        await db.query(query, [textoLimpo, usuarioId]);

        res.status(201).json({ message: "Comentário criado" });

    } catch (err) {

        console.error("Erro ao criar comentário:", err);

        res.status(500).json({
            error: "Erro interno do servidor"
        });
    }
};

export const listarComentarios = async (_req: Request, res: Response) => {
    try {

        const result = await db.query(
            "SELECT id, texto, usuario_id FROM comentario"
        );

        res.json(result.rows);

    } catch (err) {

        console.error("Erro ao listar comentários:", err);

        res.status(500).json({
            error: "Erro interno do servidor"
        });
    }
};