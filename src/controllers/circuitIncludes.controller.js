import supabase from "../db/supabaseClient.js";

export const getIncludesByCircuit = async (req, res) => {
  const { circuitId } = req.params;

  const { data, error } = await supabase
    .from("circuit_includes")
    .select("item_id, include_items(label)")
    .eq("circuit_id", circuitId);

  if (error) return res.status(400).json({ error });
  res.json(data);
};

export const createCircuitInclude = async (req, res) => {
  const { circuit_id, item_id } = req.body;

  const { data, error } = await supabase
    .from("circuit_includes")
    .insert([{ circuit_id, item_id }])
    .select();

  if (error) return res.status(400).json({ error });
  res.json(data[0]);
};
