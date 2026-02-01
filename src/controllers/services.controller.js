import supabase from "../db/supabaseClient.js";

export const getServicesContent = async (req, res) => {
  try {
    const { lang = "es" } = req.query;

    const { data, error } = await supabase
      .from("services_content")
      .select("*")
      .limit(1);

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Service content not found" });
    }

    const service = data[0];

    const response =
      lang === "en"
        ? {
            title: service.title_en,
            badge: service.badge_en,
            summary: service.summary_en,
            details: service.details_en,
          }
        : {
            title: service.title_es,
            badge: service.badge_es,
            summary: service.summary_es,
            details: service.details_es,
          };

    res.status(200).json(response);
  } catch (err) {
    console.error("getServicesContent error:", err);
    res.status(500).json({ message: "Error fetching services content" });
  }
};
