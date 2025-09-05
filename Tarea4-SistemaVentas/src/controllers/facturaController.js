const { getRepository } = require("typeorm");

const getAll = async (req, res) => {
  try {
    const repo = getRepository("Factura");
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [data, total] = await repo
      .createQueryBuilder("factura")
      .leftJoinAndSelect("factura.cliente", "cliente")
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    res.json({ data, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener facturas" });
  }
};

const getOne = async (req, res) => {
  try {
    const repo = getRepository("Factura");
    const factura = await repo.findOne({ where: { id: req.params.id }, relations: ["cliente"] });
    if (!factura) return res.status(404).json({ error: "Factura no encontrada" });
    res.json(factura);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener factura" });
  }
};

const create = async (req, res) => {
  try {
    const clienteRepo = getRepository("Cliente");
    const cliente = await clienteRepo.findOne({ where: { id: req.body.cliente_id } });
    if (!cliente) return res.status(404).json({ error: "Cliente no encontrado" });

    const repo = getRepository("Factura");
    const factura = repo.create({ ...req.body, cliente });
    await repo.save(factura);
    res.status(201).json(factura);
  } catch (error) {
    res.status(400).json({ error: "Datos inválidos" });
  }
};

const update = async (req, res) => {
  try {
    const repo = getRepository("Factura");
    const factura = await repo.findOne({ where: { id: req.params.id } });
    if (!factura) return res.status(404).json({ error: "Factura no encontrada" });

    if (req.body.cliente_id) {
      const clienteRepo = getRepository("Cliente");
      const cliente = await clienteRepo.findOne({ where: { id: req.body.cliente_id } });
      if (!cliente) return res.status(404).json({ error: "Cliente no encontrado" });
      req.body.cliente = cliente;
    }

    repo.merge(factura, req.body);
    await repo.save(factura);
    res.json(factura);
  } catch (error) {
    res.status(400).json({ error: "Datos inválidos" });
  }
};

const remove = async (req, res) => {
  try {
    const repo = getRepository("Factura");
    const factura = await repo.findOne({ where: { id: req.params.id } });
    if (!factura) return res.status(404).json({ error: "Factura no encontrada" });
    await repo.remove(factura);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar factura" });
  }
};

module.exports = { getAll, getOne, create, update, remove };