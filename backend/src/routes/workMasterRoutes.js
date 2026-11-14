const express = require('express');
const router = express.Router();
const {
  getWorkMasters,
  getWorkMasterById,
  createWorkMaster,
  updateWorkMaster,
  deleteWorkMaster,
} = require('../controllers/workMasterController');

router.route('/')
  .get(getWorkMasters)
  .post(createWorkMaster);

router.route('/:id')
  .get(getWorkMasterById)
  .put(updateWorkMaster)
  .delete(deleteWorkMaster);

module.exports = router;
