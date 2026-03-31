import supabase from "../db/supabaseClient.js";

export const getTestimonials = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("visible", true) // 🔹 solo traemos visibles
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
