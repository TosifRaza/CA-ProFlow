const express = require('express');
const router = express.Router();
const {
  getTaxDetails,
  getTaxDetailById,
  createTaxDetail,
  updateTaxDetail,
  deleteTaxDetail,
} = require('../controllers/taxDetailController');

router.route('/')
  .get(getTaxDetails)
  .post(createTaxDetail);

router.route('/:id')
  .get(getTaxDetailById)
  .put(updateTaxDetail)
  .delete(deleteTaxDetail);

module.exports = router;
