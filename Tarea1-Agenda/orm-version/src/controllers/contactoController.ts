import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Contacto } from '../entities/Contacto';

// Función auxiliar para manejo seguro de errores
function handleError(res: Response, error: unknown, statusCode: number = 500) {
  if (error instanceof Error) {
    res.status(statusCode).json({ error: error.message });
  } else {
    res.status(statusCode).json({ error: 'Ocurrió un error desconocido' });
  }
}

export const getContactos = async (req: Request, res: Response) => {
  try {
    const contactoRepository = getRepository(Contacto);
    const contactos = await contactoRepository.find();
    res.json(contactos);
  } catch (error) {
    handleError(res, error);
  }
};

export const getContactoById = async (req: Request, res: Response) => {
  try {
    const contactoRepository = getRepository(Contacto);
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID debe ser un número' });
    }
    
    const contacto = await contactoRepository.findOne({ where: { id } });
    if (!contacto) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }
    res.json(contacto);
  } catch (error) {
    handleError(res, error);
  }
};

export const createContacto = async (req: Request, res: Response) => {
  try {
    const contactoRepository = getRepository(Contacto);
    const nuevoContacto = contactoRepository.create(req.body);
    const resultado = await contactoRepository.save(nuevoContacto);
    res.status(201).json(resultado);
  } catch (error) {
    handleError(res, error, 400);
  }
};

export const updateContacto = async (req: Request, res: Response) => {
  try {
    const contactoRepository = getRepository(Contacto);
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID debe ser un número' });
    }

    const contacto = await contactoRepository.findOne({ where: { id } });
    if (!contacto) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }
    
    contactoRepository.merge(contacto, req.body);
    const resultado = await contactoRepository.save(contacto);
    res.json(resultado);
  } catch (error) {
    handleError(res, error, 400);
  }
};

export const deleteContacto = async (req: Request, res: Response) => {
  try {
    const contactoRepository = getRepository(Contacto);
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID debe ser un número' });
    }

    const resultado = await contactoRepository.delete(id);
    if (resultado.affected === 0) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }
    res.json({ message: 'Contacto eliminado' });
  } catch (error) {
    handleError(res, error);
  }
};