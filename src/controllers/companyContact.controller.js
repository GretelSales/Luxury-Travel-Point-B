import supabase from "../db/supabaseClient.js";

export const getCompanyInfo = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("company_info")
      .select("*")
      .limit(1)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching company info" });
  }
};
