import { Router } from 'express';
import { AppDataSource } from '../lib/data-source';
import { Event } from '../entities/Event';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const eventRepository = AppDataSource.getRepository(Event);

router.get('/', async (req, res) => {
  try {
    const events = await eventRepository.find({ order: { id: 'ASC' } });
    res.json(events);
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const event = await eventRepository.findOne({ where: { id: parseInt(id) } });

    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error al obtener evento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { placa, tipo, capacidad, estado } = req.body;

    if (!placa || !tipo || !capacidad || !estado ) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    if (capacidad < 1 ) {
      return res.status(400).json({ error: 'Capacidad debe ser >=1 y precio >=0' });
    }

    const newEvent = eventRepository.create({
      placa,
      tipo,
      capacidad,
      estado,
    });

    const savedEvent = await eventRepository.save(newEvent);
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Error al crear evento:', error);
    res.status(400).json({ error: 'Error al crear el evento' });
  }
});

// router.put('/:id', authMiddleware, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, date, place, capacity, price } = req.body;

//     const event = await eventRepository.findOne({ where: { id: parseInt(id) } });
//     if (!event) {
//       return res.status(404).json({ error: 'Evento no encontrado' });
//     }

//     if (placa) event.placa = placa;
//     if (date) event.date = new Date(date);
//     if (place) event.place = place;
//     if (capacity !== undefined) event.capacity = capacity;
//     if (price !== undefined) event.price = price;

//     const updatedEvent = await eventRepository.save(event);
//     res.json(updatedEvent);
//   } catch (error) {
//     console.error('Error al actualizar evento:', error);
//     res.status(400).json({ error: 'Error al actualizar el evento' });
//   }
// });

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const event = await eventRepository.findOne({ where: { id: parseInt(id) } });
    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    await eventRepository.remove(event);
    res.json({ message: 'Evento eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    res.status(500).json({ error: 'Error al eliminar el evento' });
  }
});

export default router;