import express from 'express';
import {
  getAddressById,
  getAllAddresses,
  updateAddress,
} from '../controllers/addressController';
import { validateEditAddress } from '../middlewares/addressValidator';
import { validationHandler } from '../middlewares/validationHandler';

const router = express.Router();

router.get('/addresses/:id', getAddressById);
router.get('/addresses', getAllAddresses);
router.put(
  '/addresses/:id',
  validateEditAddress,
  validationHandler,
  updateAddress
);

export default router;
