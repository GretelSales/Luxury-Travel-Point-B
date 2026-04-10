import supabase from "../db/supabaseClient.js";

export const getServicesContent = async (req, res) => {
  try {
    const { lang = "es" } = req.query;

    const { data, error } = await supabase
      .from("services_content")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Service content not found" });
    }

    const response = data.map((service) => {
      const imageUrl = service.image_name
        ? `${process.env.SUPABASE_URL}/storage/v1/object/public/servicesImages/${service.image_name}`
        : null;

      return lang === "en"
        ? {
            id: service.id,
            title: service.title_en,
            badge: service.badge_en,
            summary: service.summary_en,
            details: service.details_en,
            image: imageUrl, // ✅ agregado
          }
        : {
            id: service.id,
            title: service.title_es,
            badge: service.badge_es,
            summary: service.summary_es,
            details: service.details_es,
            image: imageUrl, // ✅ agregado
          };
    });

    res.status(200).json(response);
  } catch (err) {
    console.error("getServicesContent error:", err);
    res.status(500).json({ message: "Error fetching services content" });
  }
};
