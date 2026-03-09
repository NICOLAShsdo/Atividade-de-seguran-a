import { Request, Response } from "express";
import db from "../database";
import bcrypt from "bcrypt";

export const login = async (req: Request, res: Response) => {

  const { email, password } = req.body;

  try {

    const result = await db.query(
      "SELECT * FROM usuario WHERE email = $1",
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ success: false });
    }

    const usuario = result.rows[0];

    const senhaValida = await bcrypt.compare(password, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ success: false });
    }

    res.json({
      success: true,
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    });

  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};


export const novoLogin = async (req: Request, res: Response) => {

  const { email, password, nome } = req.body;

  const nomeNormalizado = normalizarNome(nome);

  try {

    const iptuResult = await db.query(
      "SELECT * FROM iptu WHERE nome = $1",
      [nomeNormalizado]
    );

    if (iptuResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: `Nome '${nome}' não encontrado`
      });
    }

    const senhaHash = await bcrypt.hash(password, 10);

    const result = await db.query(
      "INSERT INTO usuario (email, senha, nome, tipo_usuario_id) VALUES ($1,$2,$3,$4) RETURNING id",
      [email, senhaHash, nome, 3]
    );

    const usuarioId = result.rows[0].id;

    await db.query(
      "UPDATE iptu SET usuario_id = $1 WHERE nome = $2",
      [usuarioId, nomeNormalizado]
    );

    res.json({
      success: true,
      user: {
        id: usuarioId,
        email,
        nome
      }
    });

  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};


export const atualizarIptu = async (req: Request, res: Response) => {

  const { usuarioId, novoValor } = req.body;

  try {

    await db.query(
      "UPDATE iptu SET valor = $1 WHERE usuario_id = $2",
      [novoValor, usuarioId]
    );

    res.json({ message: "IPTU atualizado" });

  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};


export const getIptuPorIdUsuario = async (req: Request, res: Response) => {

  const usuarioId = req.query.usuarioId;

  try {

    const result = await db.query(
      "SELECT * FROM iptu WHERE usuario_id = $1",
      [usuarioId]
    );

    res.json({ iptu: result.rows });

  } catch (err) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};


export const getQRCodeOrCodBarras = async (req: Request, res: Response) => {

  const tipo = req.query.tipo as string;

  let codigo = "";

  if (tipo === "codigoDeBarras") {
    codigo = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=123456789";
  } else if (tipo === "qrcode") {
    codigo = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=QRCodeDemo";
  }

  res.json({
    tipo,
    codigo
  });
};


export function normalizarNome(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}