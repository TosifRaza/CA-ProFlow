const workMasterService = require('../services/workMasterService');

const validateWorkMasterInput = (data) => {
  const { workName, typeOfWork, taxGroup } = data;
  const errors = [];

  if (!workName || typeof workName !== 'string' || !workName.trim()) {
    errors.push('Work Name is required');
  }

  if (taxGroup !== undefined && taxGroup !== null && typeof taxGroup === 'string' && !taxGroup.trim()) {
    errors.push('Tax Group cannot be empty');
  }

  if (!typeOfWork || typeof typeOfWork !== 'string' || !typeOfWork.trim()) {
    errors.push('Type of Work is required');
  }

  return errors;
};

// @desc    Get all Work Masters
// @route   GET /api/work-masters
const getWorkMasters = async (req, res, next) => {
  try {
    const workMasters = await workMasterService.getAllWorkMasters();
    res.status(200).json({
      success: true,
      count: workMasters.length,
      data: workMasters,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single Work Master by ID
// @route   GET /api/work-masters/:id
const getWorkMasterById = async (req, res, next) => {
  try {
    const workMaster = await workMasterService.getWorkMasterById(req.params.id);
    if (!workMaster) {
      return res.status(404).json({
        success: false,
        message: `Work Master with ID ${req.params.id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: workMaster,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new Work Master
// @route   POST /api/work-masters
const createWorkMaster = async (req, res, next) => {
  try {
    const validationErrors = validateWorkMasterInput(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
      });
    }

    const newWorkMaster = await workMasterService.createWorkMaster(req.body);

    res.status(201).json({
      success: true,
      message: 'Work Master created successfully',
      data: newWorkMaster,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing Work Master
// @route   PUT /api/work-masters/:id
const updateWorkMaster = async (req, res, next) => {
  try {
    const { workName, typeOfWork } = req.body;

    const validationErrors = [];
    if (workName !== undefined && (!workName || !workName.trim())) {
      validationErrors.push('Work Name cannot be empty');
    }
    if (typeOfWork !== undefined && (!typeOfWork || !typeOfWork.trim())) {
      validationErrors.push('Type of Work cannot be empty');
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
      });
    }

    const updated = await workMasterService.updateWorkMaster(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Work Master updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a Work Master
// @route   DELETE /api/work-masters/:id
const deleteWorkMaster = async (req, res, next) => {
  try {
    const deleted = await workMasterService.deleteWorkMaster(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Work Master deleted successfully',
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkMasters,
  getWorkMasterById,
  createWorkMaster,
  updateWorkMaster,
  deleteWorkMaster,
};
