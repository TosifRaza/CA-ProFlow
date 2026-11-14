const taxGroupService = require('../services/taxGroupService');

const validateTaxGroupInput = (taxName) => {
  const errors = [];

  if (!taxName || typeof taxName !== 'string' || !taxName.trim()) {
    errors.push('Tax Name is required');
  }

  return errors;
};

// @desc    Get all Tax Groups
// @route   GET /api/tax-groups
const getTaxGroups = async (req, res, next) => {
  try {
    const taxGroups = await taxGroupService.getAllTaxGroups();
    res.status(200).json({
      success: true,
      count: taxGroups.length,
      data: taxGroups,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single Tax Group by ID
// @route   GET /api/tax-groups/:id
const getTaxGroupById = async (req, res, next) => {
  try {
    const taxGroup = await taxGroupService.getTaxGroupById(req.params.id);
    if (!taxGroup) {
      return res.status(404).json({
        success: false,
        message: `Tax Group with ID ${req.params.id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: taxGroup,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new Tax Group
// @route   POST /api/tax-groups
const createTaxGroup = async (req, res, next) => {
  try {
    const { taxName, frequency, date } = req.body;

    const validationErrors = validateTaxGroupInput(taxName);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
      });
    }

    const newTaxGroup = await taxGroupService.createTaxGroup({
      taxName,
      frequency: frequency || null,
      date: date || null,
    });

    res.status(201).json({
      success: true,
      message: 'Tax Group created successfully',
      data: newTaxGroup,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing Tax Group
// @route   PUT /api/tax-groups/:id
const updateTaxGroup = async (req, res, next) => {
  try {
    const { taxName, frequency, date } = req.body;

    if (taxName !== undefined && (!taxName || !taxName.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: ['Tax Name cannot be empty'],
      });
    }

    const updated = await taxGroupService.updateTaxGroup(req.params.id, {
      taxName,
      frequency,
      date,
    });

    res.status(200).json({
      success: true,
      message: 'Tax Group updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a Tax Group
// @route   DELETE /api/tax-groups/:id
const deleteTaxGroup = async (req, res, next) => {
  try {
    const deleted = await taxGroupService.deleteTaxGroup(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Tax Group deleted successfully',
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTaxGroups,
  getTaxGroupById,
  createTaxGroup,
  updateTaxGroup,
  deleteTaxGroup,
};
