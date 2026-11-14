const express = require('express');
const router = express.Router();
const {
  getTaxGroups,
  getTaxGroupById,
  createTaxGroup,
  updateTaxGroup,
  deleteTaxGroup,
} = require('../controllers/taxGroupController');

router.route('/')
  .get(getTaxGroups)
  .post(createTaxGroup);

router.route('/:id')
  .get(getTaxGroupById)
  .put(updateTaxGroup)
  .delete(deleteTaxGroup);

module.exports = router;
