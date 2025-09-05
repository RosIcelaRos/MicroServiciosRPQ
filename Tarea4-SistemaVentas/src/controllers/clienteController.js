const { getRepository } = require("typeorm");

const getAll = async (req, res) => {
  try {
    const repo = getRepository("Cliente");
    const { page = 1, limit = 10, nombres } = req.query;
    const skip = (page - 1) * limit;

    let query = repo.createQueryBuilder("cliente");
    if (nombres) query = query.where("cliente.nombres LIKE :nombres", { nombres: `%${nombres}%` });

    const [data, total] = await query.skip(skip).take(limit).getManyAndCount();
    res.json({ data, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener clientes" });
  }
};

const getOne = async (req, res) => {
  try {
    const repo = getRepository("Cliente");
    const cliente = await repo.findOne({ where: { id: req.params.id } });
    if (!cliente) return res.status(404).json({ error: "Cliente no encontrado" });
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener cliente" });
  }
};

const create = async (req, res) => {
  try {
    const repo = getRepository("Cliente");
    const cliente = repo.create(req.body);
    await repo.save(cliente);
    res.status(201).json(cliente);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Datos inválidos" });
  }
};

const update = async (req, res) => {
  try {
    const repo = getRepository("Cliente");
    const cliente = await repo.findOne({ where: { id: req.params.id } });
    if (!cliente) return res.status(404).json({ error: "Cliente no encontrado" });
    repo.merge(cliente, req.body);
    await repo.save(cliente);
    res.json(cliente);
  } catch (error) {
    res.status(400).json({ error: "Datos inválidos" });
  }
};

const remove = async (req, res) => {
  try {
    const repo = getRepository("Cliente");
    const cliente = await repo.findOne({ where: { id: req.params.id } });
    if (!cliente) return res.status(404).json({ error: "Cliente no encontrado" });
    await repo.remove(cliente);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar cliente" });
  }
};

const getFacturasByCliente = async (req, res) => {
  try {
    const repo = getRepository("Factura");
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [data, total] = await repo
      .createQueryBuilder("factura")
      .where("factura.cliente_id = :id", { id: req.params.clienteId })
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    res.json({ data, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener facturas del cliente" });
  }
};

module.exports = { getAll, getOne, create, update, remove, getFacturasByCliente };