import supabase from "../db/supabaseClient.js";

export const getCircuitDays = async (req, res) => {
  const { data, error } = await supabase
    .from("circuit_days")
    .select("*, cities(name, description)")
    .order("day_number");

  if (error) return res.status(400).json({ error });
  res.json(data);
};

export const getDaysByCircuit = async (req, res) => {
  const { circuitId } = req.params;

  const { data, error } = await supabase
    .from("circuit_days")
    .select("*, cities(name, description)")
    .eq("circuit_id", circuitId)
    .order("day_number");

  if (error) return res.status(400).json({ error });
  res.json(data);
};

export const createCircuitDay = async (req, res) => {
  const { circuit_id, day_number, city_id } = req.body;

  const { data, error } = await supabase
    .from("circuit_days")
    .insert([{ circuit_id, day_number, city_id }])
    .select();

  if (error) return res.status(400).json({ error });
  res.json(data[0]);
};
