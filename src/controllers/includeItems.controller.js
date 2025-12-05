import supabase from "../db/supabaseClient.js";

export const getIncludeItems = async (req, res) => {
  const { data, error } = await supabase.from("include_items").select("*");

  if (error) return res.status(400).json({ error });
  res.json(data);
};

export const createIncludeItem = async (req, res) => {
  const { label } = req.body;

  const { data, error } = await supabase
    .from("include_items")
    .insert([{ label }])
    .select();

  if (error) return res.status(400).json({ error });
  res.json(data[0]);
};
