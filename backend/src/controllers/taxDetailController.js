const taxDetailService = require('../services/taxDetailService');

const VALID_FREQUENCIES = ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'];

const validateTaxDetailInput = (data) => {
  const {
    description,
    frequency,
    dateFrom,
    dateTo,
    submissionDate,
    reconciliationDate,
    extendDate,
  } = data;
  const errors = [];

  if (!description || typeof description !== 'string' || !description.trim()) {
    errors.push('Description is required');
  }

  if (frequency && !VALID_FREQUENCIES.includes(frequency.trim())) {
    errors.push(`Frequency must be one of: ${VALID_FREQUENCIES.join(', ')}`);
  }

  if (!dateFrom) {
    errors.push('From Date is required');
  } else if (isNaN(new Date(dateFrom).getTime())) {
    errors.push('From Date must be a valid date');
  }

  if (!dateTo) {
    errors.push('To Date is required');
  } else if (isNaN(new Date(dateTo).getTime())) {
    errors.push('To Date must be a valid date');
  }

  if (!submissionDate) {
    errors.push('Submission Date is required');
  } else {
    const parsed = new Date(submissionDate);
    if (isNaN(parsed.getTime())) {
      errors.push('Submission Date must be a valid date');
    }
  }

  if (!reconciliationDate) {
    errors.push('Reconciliation Date is required');
  } else {
    const parsed = new Date(reconciliationDate);
    if (isNaN(parsed.getTime())) {
      errors.push('Reconciliation Date must be a valid date');
    }
  }

  if (!extendDate) {
    errors.push('Extend Date is required');
  } else {
    const parsed = new Date(extendDate);
    if (isNaN(parsed.getTime())) {
      errors.push('Extend Date must be a valid date');
    }
  }

  return errors;
};

// @desc    Get all Tax Details
// @route   GET /api/tax-details
const getTaxDetails = async (req, res, next) => {
  try {
    const taxDetails = await taxDetailService.getAllTaxDetails();
    res.status(200).json({
      success: true,
      count: taxDetails.length,
      data: taxDetails,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single Tax Detail by ID
// @route   GET /api/tax-details/:id
const getTaxDetailById = async (req, res, next) => {
  try {
    const taxDetail = await taxDetailService.getTaxDetailById(req.params.id);
    if (!taxDetail) {
      return res.status(404).json({
        success: false,
        message: `Tax Detail with ID ${req.params.id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: taxDetail,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new Tax Detail
// @route   POST /api/tax-details
const createTaxDetail = async (req, res, next) => {
  try {
    const validationErrors = validateTaxDetailInput(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
      });
    }

    const newTaxDetail = await taxDetailService.createTaxDetail(req.body);

    res.status(201).json({
      success: true,
      message: 'Tax Detail created successfully',
      data: newTaxDetail,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing Tax Detail
// @route   PUT /api/tax-details/:id
const updateTaxDetail = async (req, res, next) => {
  try {
    const {
      frequency,
      dateFrom,
      dateTo,
      submissionDate,
      reconciliationDate,
      extendDate,
    } = req.body;

    const validationErrors = [];
    if (frequency && !VALID_FREQUENCIES.includes(frequency.trim())) {
      validationErrors.push(`Frequency must be one of: ${VALID_FREQUENCIES.join(', ')}`);
    }
    if (dateFrom && isNaN(new Date(dateFrom).getTime())) {
      validationErrors.push('From Date must be a valid date');
    }
    if (dateTo && isNaN(new Date(dateTo).getTime())) {
      validationErrors.push('To Date must be a valid date');
    }
    if (submissionDate && isNaN(new Date(submissionDate).getTime())) {
      validationErrors.push('Submission Date must be a valid date');
    }
    if (reconciliationDate && isNaN(new Date(reconciliationDate).getTime())) {
      validationErrors.push('Reconciliation Date must be a valid date');
    }
    if (extendDate && isNaN(new Date(extendDate).getTime())) {
      validationErrors.push('Extend Date must be a valid date');
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
      });
    }

    const updated = await taxDetailService.updateTaxDetail(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Tax Detail updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a Tax Detail
// @route   DELETE /api/tax-details/:id
const deleteTaxDetail = async (req, res, next) => {
  try {
    const deleted = await taxDetailService.deleteTaxDetail(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Tax Detail deleted successfully',
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTaxDetails,
  getTaxDetailById,
  createTaxDetail,
  updateTaxDetail,
  deleteTaxDetail,
};
