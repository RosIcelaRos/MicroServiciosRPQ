const { getRepository } = require("typeorm");

const getAll = async (req, res) => {
  try {
    const repo = getRepository("Producto");
    const { page = 1, limit = 10, nombre } = req.query;
    const skip = (page - 1) * limit;

    let query = repo.createQueryBuilder("producto");
    if (nombre) query = query.where("producto.nombre LIKE :nombre", { nombre: `%${nombre}%` });

    const [data, total] = await query.skip(skip).take(limit).getManyAndCount();
    res.json({ data, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

const getOne = async (req, res) => {
  try {
    const repo = getRepository("Producto");
    const producto = await repo.findOne({ where: { id: req.params.id } });
    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener producto" });
  }
};

const create = async (req, res) => {
  try {
    const repo = getRepository("Producto");
    const producto = repo.create(req.body);
    await repo.save(producto);
    res.status(201).json(producto);
  } catch (error) {
    res.status(400).json({ error: "Datos inválidos" });
  }
};

const update = async (req, res) => {
  try {
    const repo = getRepository("Producto");
    const producto = await repo.findOne({ where: { id: req.params.id } });
    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
    repo.merge(producto, req.body);
    await repo.save(producto);
    res.json(producto);
  } catch (error) {
    res.status(400).json({ error: "Datos inválidos" });
  }
};

const remove = async (req, res) => {
  try {
    const repo = getRepository("Producto");
    const producto = await repo.findOne({ where: { id: req.params.id } });
    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
    await repo.remove(producto);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar producto" });
  }
};

module.exports = { getAll, getOne, create, update, remove };