import express from 'express';
import {
  getAddressById,
  getAllAddresses,
} from '../controllers/addressController';

const router = express.Router();

router.get('/addresses/:id', getAddressById);
router.get('/addresses', getAllAddresses);

export default router;
