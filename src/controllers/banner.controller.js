import supabase from "../db/supabaseClient.js";

export const getPromoBanner = async (req, res) => {
  try {
    const { lang } = req.query;

    const { data, error } = await supabase
      .from("promo_banners")
      .select("*")
      .eq("is_active", true)
      .eq("lang", lang || "es")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(); // 👈 mejor que single()

    if (error) throw error;

    // 👇 clave: devolver null si no hay banner
    return res.json(data || null);
  } catch (err) {
    console.error("getPromoBanner error:", err);
    res.status(500).json({ error: "Error loading promo banner" });
  }
};
