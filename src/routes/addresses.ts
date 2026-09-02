import express from 'express';
import {
  getAddressById,
  getAllAddresses,
} from '../controllers/addressController';
import { authorizePermission } from '../middlewares/permissionAuthorization';

const router = express.Router();

router.get('/addresses/:id', authorizePermission('read-users'), getAddressById);
router.get('/addresses', authorizePermission('read-users'), getAllAddresses);

export default router;
