import { supabase } from "../db/supabase.js";
import { sendOwnerNotification } from "../services/mailer.js";

export const createServiceInterest = async (req, res) => {
  try {
    const { service_type, service_name, circuit_name, message, language } =
      req.body;

    // usuario desde auth (si existe)
    const user = req.user || null;

    const user_name = user?.full_name || req.body.user_name;
    const user_email = user?.email || req.body.user_email;

    if (!user_name || !user_email || !service_type || !service_name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data, error } = await supabase.from("service_interests").insert([
      {
        user_id: user?.id || null,
        user_name,
        user_email,
        service_type,
        service_name,
        circuit_name: circuit_name || null,
        message: message || null,
        language: language || "es",
      },
    ]);

    if (error) throw error;

    // 📧 enviar correo a la dueña
    await sendOwnerNotification({
      userName: user_name,
      userEmail: user_email,
      serviceType: service_type,
      serviceName: service_name,
      circuitName: circuit_name,
      message,
      language,
    });

    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
