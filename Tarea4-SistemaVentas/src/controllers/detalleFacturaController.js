const { getRepository } = require("typeorm");

const getAll = async (req, res) => {
  try {
    const repo = getRepository("DetalleFactura");
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [data, total] = await repo
      .createQueryBuilder("detalle")
      .leftJoinAndSelect("detalle.factura", "factura")
      .leftJoinAndSelect("detalle.producto", "producto")
      .where("detalle.factura_id = :facturaId", { facturaId: req.params.facturaId })
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    res.json({ data, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener detalles de factura" });
  }
};

const getOne = async (req, res) => {
  try {
    const repo = getRepository("DetalleFactura");
    const detalle = await repo.findOne({
      where: { id: req.params.id, factura_id: req.params.facturaId },
      relations: ["factura", "producto"],
    });
    if (!detalle) return res.status(404).json({ error: "Detalle de factura no encontrado" });
    res.json(detalle);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener detalle de factura" });
  }
};

const create = async (req, res) => {
  try {
    const facturaRepo = getRepository("Factura");
    const factura = await facturaRepo.findOne({ where: { id: req.params.facturaId } });
    if (!factura) return res.status(404).json({ error: "Factura no encontrada" });

    const productoRepo = getRepository("Producto");
    const producto = await productoRepo.findOne({ where: { id: req.body.producto_id } });
    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });

    const repo = getRepository("DetalleFactura");
    const detalle = repo.create({ ...req.body, factura, producto });
    await repo.save(detalle);
    res.status(201).json(detalle);
  } catch (error) {
    res.status(400).json({ error: "Datos inválidos" });
  }
};

const update = async (req, res) => {
  try {
    const repo = getRepository("DetalleFactura");
    const detalle = await repo.findOne({
      where: { id: req.params.id, factura_id: req.params.facturaId },
    });
    if (!detalle) return res.status(404).json({ error: "Detalle de factura no encontrado" });

    if (req.body.producto_id) {
      const productoRepo = getRepository("Producto");
      const producto = await productoRepo.findOne({ where: { id: req.body.producto_id } });
      if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
      req.body.producto = producto;
    }

    repo.merge(detalle, req.body);
    await repo.save(detalle);
    res.json(detalle);
  } catch (error) {
    res.status(400).json({ error: "Datos inválidos" });
  }
};

const remove = async (req, res) => {
  try {
    const repo = getRepository("DetalleFactura");
    const detalle = await repo.findOne({
      where: { id: req.params.id, factura_id: req.params.facturaId },
    });
    if (!detalle) return res.status(404).json({ error: "Detalle de factura no encontrado" });
    await repo.remove(detalle);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar detalle de factura" });
  }
};

module.exports = { getAll, getOne, create, update, remove };