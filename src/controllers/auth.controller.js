// controllers/authController.js
import supabase from "../db/supabaseClient.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 12;

export const register = async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Check duplicate email
    const { data: existing, error: existingErr } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .limit(1);

    if (existingErr) throw existingErr;
    if (existing && existing.length > 0)
      return res.status(409).json({ error: "Email ya registrado" });

    // Hash password
    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const { data, error } = await supabase
      .from("users")
      .insert([{ full_name, email, phone, password_hash: hash }])
      .select("*")
      .single();

    if (error) throw error;

    // crear token JWT
    const token = jwt.sign({ userId: data.id, email: data.email }, JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.json({
      user: {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        phone: data.phone,
      },
      token,
    });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ error: err.message || "Error en registro" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email y contraseña requeridos" });

    const { data, error } = await supabase
      .from("users")
      .select("id, email, full_name, phone, password_hash")
      .eq("email", email)
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      /* Supabase single returns error if not found */
      // ignore code semantics, just handle not found below
    }

    if (!data || !data.password_hash) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const match = await bcrypt.compare(password, data.password_hash);
    if (!match)
      return res.status(401).json({ error: "Credenciales inválidas" });

    const token = jwt.sign({ userId: data.id, email: data.email }, JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    // No devuelvas password_hash
    const user = {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      phone: data.phone,
    };

    res.json({ user, token });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ error: err.message || "Error en login" });
  }
};

export const me = async (req, res) => {
  try {
    // token en Authorization: Bearer <token>
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: "No autorizado" });
    const token = auth.split(" ")[1];
    const payload = jwt.verify(token, JWT_SECRET);
    const userId = payload.userId;

    const { data, error } = await supabase
      .from("users")
      .select("id, email, full_name, phone")
      .eq("id", userId)
      .single();
    if (error) throw error;
    res.json({ user: data });
  } catch (err) {
    console.error("me error:", err);
    res.status(401).json({ error: "Token inválido o expirado" });
  }
};
