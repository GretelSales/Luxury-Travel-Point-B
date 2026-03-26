import supabase from "../db/supabaseClient.js";

const BUCKET = "banners"; // 👈 nombre de tu bucket

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
      .maybeSingle();

    if (error) throw error;

    if (!data) return res.json(null);

    // 🔥 AQUÍ está la magia
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(data.image_url); // 👈 ahora es solo el nombre

    const banner = {
      ...data,
      image_url: publicUrlData.publicUrl,
    };

    return res.json(banner);
  } catch (err) {
    console.error("getPromoBanner error:", err);
    res.status(500).json({ error: "Error loading promo banner" });
  }
};
