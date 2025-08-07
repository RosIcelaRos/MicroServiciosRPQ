import { Router } from 'express';
import {
  getContactos,
  getContactoById,
  createContacto,
  updateContacto,
  deleteContacto
} from '../controllers/contactoController';

const router = Router();

router.get('/', getContactos);
router.post('/', createContacto);
router.get('/:id', getContactoById);
router.put('/:id', updateContacto);
router.delete('/:id', deleteContacto);

export default router;