import supabase from "../db/supabaseClient.js";

export const getTestimonials = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_visible", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Error fetching testimonials:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
