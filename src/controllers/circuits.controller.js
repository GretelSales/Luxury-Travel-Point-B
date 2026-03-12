import supabase from "../db/supabaseClient.js";

export const getAllCircuits = async (req, res) => {
  const { data, error } = await supabase
    .from("circuits")
    .select("*")
    .order("id", { ascending: true });

  if (error) return res.status(400).json({ error });

  res.json(data);
};

export const getCircuitsFullPaginated = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 9;
  const offset = (page - 1) * limit;

  const { data, count, error } = await supabase
    .from("circuits")
    .select("*", { count: "exact" })
    .range(offset, offset + limit - 1);

  if (error) return res.status(400).json({ error });

  res.json({
    page,
    total: count,
    totalPages: Math.ceil(count / limit),
    circuits: data,
  });
};

export const createCircuit = async (req, res) => {
  const { name, days, starting_point, base_price } = req.body;

  const { data, error } = await supabase
    .from("circuits")
    .insert([
      { name, days, starting_point, base_price, created_at: new Date() },
    ])
    .select();

  if (error) return res.status(400).json({ error });

  res.json({ message: "Circuit created", circuit: data[0] });
};

export const updateCircuit = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const { data, error } = await supabase
    .from("circuits")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) return res.status(400).json({ error });

  res.json({ message: "Circuit updated", circuit: data[0] });
};

export const deleteCircuit = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from("circuits").delete().eq("id", id);

  if (error) return res.status(400).json({ error });

  res.json({ message: "Circuit deleted" });
};

export const getCircuitsFull = async (req, res) => {
  try {
    const lang = req.query.lang === "en" ? "en" : "es"; // valor por defecto: español

    // 1) Traer todos los circuitos básicos
    const { data: circuits, error: circuitsError } = await supabase
      .from("circuits")
      .select("id, name, days, base_price, starting_point")
      .order("id");

    if (circuitsError) return res.status(400).json({ error: circuitsError });

    const circuitIds = circuits.map((c) => c.id);

    // 2) Traer schedules
    const { data: schedulesAll, error: schedulesError } = await supabase
      .from("circuit_schedules")
      .select("id, circuit_id, start_date, end_date")
      .in("circuit_id", circuitIds)
      .order("start_date", { ascending: true });

    if (schedulesError) return res.status(400).json({ error: schedulesError });

    // 3) Traer días, ciudades, imágenes y includes
    const { data: daysAll, error: daysError } = await supabase
      .from("circuit_days")
      .select(
        `circuit_id, day_number, city_id, cities(id, name, country, description_${lang})`,
      )
      .in("circuit_id", circuitIds)
      .order("circuit_id, day_number");

    if (daysError) return res.status(400).json({ error: daysError });

    const cityIds = [...new Set(daysAll.map((d) => d.city_id))].filter(Boolean);
    const { data: imagesAll } = await supabase
      .from("city_images")
      .select("id, city_id, image_path")
      .in("city_id", cityIds || []);

    const { data: includesAll } = await supabase
      .from("circuit_includes")
      .select(`circuit_id, include_items(label_${lang})`)
      .in("circuit_id", circuitIds || []);

    // 4) Agrupar por circuito
    const schedulesByCircuit = {};
    schedulesAll.forEach((s) => {
      if (!schedulesByCircuit[s.circuit_id])
        schedulesByCircuit[s.circuit_id] = [];
      schedulesByCircuit[s.circuit_id].push(s);
    });

    const daysByCircuit = {};
    daysAll.forEach((d) => {
      if (!daysByCircuit[d.circuit_id]) daysByCircuit[d.circuit_id] = [];
      daysByCircuit[d.circuit_id].push(d);
    });

    const imagesByCity = {};
    (imagesAll || []).forEach((img) => {
      if (!imagesByCity[img.city_id]) imagesByCity[img.city_id] = [];
      imagesByCity[img.city_id].push(
        `${process.env.SUPABASE_URL}/storage/v1/object/public/circuit-images/${img.image_path}`,
      );
    });

    const includesByCircuit = {};
    (includesAll || []).forEach((inc) => {
      if (!includesByCircuit[inc.circuit_id])
        includesByCircuit[inc.circuit_id] = [];
      includesByCircuit[inc.circuit_id].push(
        inc.include_items[`label_${lang}`],
      );
    });

    // 5) Construir respuesta enriquecida
    const enriched = circuits.map((c) => {
      const days = daysByCircuit[c.id] || [];

      const circuitCities = days.map((d) => d.cities);

      const countries = Array.from(
        new Set(
          (circuitCities || []).map((city) => city?.country).filter(Boolean),
        ),
      );

      const images = days.flatMap((d) => imagesByCity[d.city_id] || []);

      const circuitSchedules = (schedulesByCircuit[c.id] || []).map((s) => ({
        id: s.id,
        start_date: s.start_date,
        end_date: s.end_date,
      }));

      const firstDate =
        circuitSchedules.length > 0 ? circuitSchedules[0].start_date : null;

      return {
        id: c.id,
        name: c.name,
        days: c.days,
        base_price: c.base_price,
        starting_point: c.starting_point,

        schedules: circuitSchedules,
        firstDate,

        includes: includesByCircuit[c.id] || [],

        daysData: days.map((d) => ({
          day: d.day_number,
          city: d.cities?.name,
          country: d.cities?.country,
          description: d.cities?.[`description_${lang}`],
        })),

        countries: countries || [],

        mainImage: images[images.length - 1] || null,
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error("getCircuitsFull error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getCircuitFullById = async (req, res) => {
  const { id } = req.params;
  const lang = req.query.lang === "en" ? "en" : "es"; // español por defecto

  try {
    // 1️⃣ Circuito base
    const { data: circuit, error: circuitError } = await supabase
      .from("circuits")
      .select("*")
      .eq("id", id)
      .single();

    if (circuitError || !circuit)
      return res.status(404).json({ message: "Circuit not found" });

    // 2️⃣ Schedules
    const { data: schedules } = await supabase
      .from("circuit_schedules")
      .select("id, start_date, end_date")
      .eq("circuit_id", id)
      .order("start_date", { ascending: true });

    // 3️⃣ Días + ciudades
    const { data: days } = await supabase
      .from("circuit_days")
      .select(
        `day_number, city_id, cities(id, name, country, description_${lang})`,
      )
      .eq("circuit_id", id)
      .order("day_number");

    const cityIds = days.map((d) => d.city_id).filter(Boolean);

    // 4️⃣ Imágenes
    const { data: images } = await supabase
      .from("city_images")
      .select("*")
      .in("city_id", cityIds);

    // 5️⃣ Includes
    const { data: includes } = await supabase
      .from("circuit_includes")
      .select(`include_items(label_${lang})`)
      .eq("circuit_id", id);

    // 6️⃣ Construir respuesta
    res.json({
      ...circuit,
      schedules: schedules || [],
      daysData: days.map((d) => ({
        day: d.day_number,
        city: d.cities?.name,
        country: d.cities?.country,
        description: d.cities?.[`description_${lang}`],
        images: images
          .filter((img) => img.city_id === d.city_id)
          .map(
            (img) =>
              `${process.env.SUPABASE_URL}/storage/v1/object/public/circuit-images/${img.image_path}`,
          ),
      })),
      includes: includes?.map((i) => i.include_items[`label_${lang}`]) || [],
    });
  } catch (err) {
    console.error("getCircuitFullById error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getAvailableCircuits = async (req, res) => {
  const { from, to, lang } = req.query;
  const language = lang === "en" ? "en" : "es"; // español por defecto

  if (!from || !to)
    return res.status(400).json({ error: "from and to required" });

  // 1️⃣ Obtener circuitos disponibles
  const { data: schedules, error } = await supabase
    .from("circuit_schedules")
    .select("circuit_id")
    .gte("start_date", from)
    .lte("end_date", to)
    .distinct("circuit_id");

  if (error) return res.status(400).json({ error });

  const ids = schedules.map((s) => s.circuit_id);

  // 2️⃣ Traer información básica de circuitos con nombre en idioma correcto
  const { data: circuits } = await supabase
    .from("circuits")
    .select(`id, name, days, base_price`)
    .in("id", ids);

  // ⚠️ Si quieres traducir también el nombre del circuito, necesitarías agregar columnas name_es / name_en
  // Por ahora se deja name como está
  res.json(circuits || []);
};

export const getCircuitById = async (req, res) => {
  const { id } = req.params;
  const lang = req.query.lang === "en" ? "en" : "es"; // español por defecto

  try {
    // Circuito base
    const { data: circuit, error: circuitError } = await supabase
      .from("circuits")
      .select("id, name, days, base_price, starting_point")
      .eq("id", id)
      .single();

    if (circuitError || !circuit)
      return res.status(404).json({ error: "Circuit not found" });

    // schedules
    const { data: schedules, error: schedulesError } = await supabase
      .from("circuit_schedules")
      .select("id, start_date, end_date")
      .eq("circuit_id", id)
      .order("start_date", { ascending: true });

    if (schedulesError) return res.status(400).json({ error: schedulesError });

    // días + ciudades
    const { data: days } = await supabase
      .from("circuit_days")
      .select(`day_number, city_id, cities(name, description_${lang})`)
      .eq("circuit_id", id)
      .order("day_number");

    // imágenes
    const cityIds = days.map((d) => d.city_id).filter(Boolean);
    const { data: images } = await supabase
      .from("city_images")
      .select("id, city_id, image_path")
      .in("city_id", cityIds || []);

    const imagesWithUrl = (images || []).map((img) => ({
      ...img,
      image_url: `${process.env.SUPABASE_URL}/storage/v1/object/public/circuit-images/${img.image_path}`,
    }));

    // includes
    const { data: includes } = await supabase
      .from("circuit_includes")
      .select(`include_items(label_${lang})`)
      .eq("circuit_id", id);

    res.json({
      ...circuit,
      schedules: schedules || [],
      days: days.map((d) => ({
        ...d,
        description: d.cities?.[`description_${lang}`],
      })),
      images: imagesWithUrl,
      includes: includes?.map((i) => i.include_items[`label_${lang}`]) || [],
    });
  } catch (err) {
    console.error("getCircuitById error:", err);
    res.status(500).json({ error: err.message });
  }
};
