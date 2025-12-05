import supabase from "../db/supabaseClient.js";

export const getImagesByCity = async (req, res) => {
  const { cityId } = req.params;

  const { data, error } = await supabase
    .from("city_images")
    .select("*")
    .eq("city_id", cityId);

  if (error) return res.status(400).json({ error });
  res.json(data);
};

export const createCityImage = async (req, res) => {
  const { city_id, image_url } = req.body;

  const { data, error } = await supabase
    .from("city_images")
    .insert([{ city_id, image_url }])
    .select();

  if (error) return res.status(400).json({ error });
  res.json(data[0]);
};
