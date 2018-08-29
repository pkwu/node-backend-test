import express from 'express';
import { addUser, fetchAllUser, fetchSingleUser, updateUser, deleteUser } from './userControllers';
import { fetchUserLocationCoordinates } from './mapboxControllers';

const router = express.Router();

router.route('/mapbox/:_id')
  .get(fetchUserLocationCoordinates);

router.route('/:_id')
  .get(fetchSingleUser)
  .put(updateUser)
  .delete(deleteUser);

router.route('/')
  .get(fetchAllUser)
  .post(addUser);

export default router;