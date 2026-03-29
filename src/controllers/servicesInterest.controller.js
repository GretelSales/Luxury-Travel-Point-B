import supabase from "../db/supabaseClient.js";
import { sendOwnerNotification } from "../services/mailer.js";

export const createServiceInterest = async (req, res) => {
  try {
    // 🔹 tomamos todos los campos del body
    const {
      service_type,
      service_name,
      circuit_name,
      message,
      language,
      user_id,
      user_name: bodyUserName,
      user_email: bodyUserEmail,
      user_phone: bodyUserPhone, // <-- nuevo
    } = req.body;

    // usuario autenticado desde middleware, si existe
    const user = req.user || null;

    // prioridad: usuario autenticado > datos del body
    const user_name = user?.full_name || bodyUserName;
    const user_email = user?.email || bodyUserEmail;
    const finalUserId = user?.id || user_id || null;
    const user_phone = user?.phone || bodyUserPhone || null; // <-- nuevo

    // validación de campos obligatorios
    if (!user_name || !user_email || !service_type || !service_name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // insertar en la tabla service_interests
    const { data, error } = await supabase.from("service_interests").insert([
      {
        user_id: finalUserId,
        user_name,
        user_email,
        user_phone, // <-- agregado
        service_type,
        service_name,
        circuit_name: circuit_name || null,
        message: message || null,
        language: language || "es",
      },
    ]);

    if (error) throw error;

    // enviar notificación por correo (opcional, descomentado si quieres)
    /*
    await sendOwnerNotification({
      userName: user_name,
      userEmail: user_email,
      userPhone: user_phone, // <-- puedes enviar también
      serviceType: service_type,
      serviceName: service_name,
      circuitName: circuit_name,
      message,
      language,
    });
    */

    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
