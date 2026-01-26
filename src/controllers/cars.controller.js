import supabase from "../db/supabaseClient.js";

export const getCars = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("disponible", true);

    if (error) throw error;

    const cars = data.map((car) => ({
      id: car.id,
      tipo: car.tipo,
      descripcion: car.descripcion,
      precio: car.precio,
      disponible: car.disponible,
      photoUrl: `${process.env.SUPABASE_URL}/storage/v1/object/public/cars/${car.photo_path}`,
    }));

    res.status(200).json(cars);
  } catch (err) {
    res.status(500).json({ message: "Error fetching cars" });
  }
};
