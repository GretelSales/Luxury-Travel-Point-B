import supabase from "../db/supabaseClient.js";

export const getAllCities = async (req, res) => {
  const { data, error } = await supabase.from("cities").select("*").order("id");

  if (error) return res.status(400).json({ error });
  res.json(data);
};

export const getCityById = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("cities")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return res.status(404).json({ error });
  res.json(data);
};

export const createCity = async (req, res) => {
  const { name, description } = req.body;

  const { data, error } = await supabase
    .from("cities")
    .insert([{ name, description }])
    .select();

  if (error) return res.status(400).json({ error });
  res.json(data[0]);
};

export const getUniqueCountries = async (req, res) => {
  const { data, error } = await supabase.from("cities").select("country");

  if (error) return res.status(400).json({ error });

  const uniqueCountries = [...new Set(data.map((c) => c.country))];

  res.json(uniqueCountries);
};

export const getCircuitsByCountry = async (req, res) => {
  const { country } = req.params;

  const { data, error } = await supabase.from("circuits").select(`
      id,
      title,
      description,
      price,
      cities (
        id,
        name,
        country
      )
    `);

  if (error) return res.status(400).json({ error });

  // Filtrar circuitos que tengan al menos una ciudad dentro del país
  const filtered = data.filter((c) =>
    c.cities.some((city) => city.country === country)
  );

  res.json(filtered);
};
