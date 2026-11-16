const fs = require('fs');
const path = require('path');
const prisma = require('../lib/prisma');

const DATA_DIR = path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'taxDetails.json');

const loadStore = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading taxDetails fallback data:', e);
  }
  return [];
};

const saveStore = (data) => {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving taxDetails fallback data:', e);
  }
};

let fallbackStore = loadStore();
let hasLoggedDbFallback = false;

const isDbConnectionError = (error) => {
  return (
    error &&
    (error.code === 'P1001' ||
      error.code === 'P1002' ||
      error.code === 'P1003' ||
      error.code === 'P1017' ||
      error.code === 'P2021' ||
      error.message?.includes('connect ECONNREFUSED') ||
      error.message?.includes('Can\'t reach database server'))
  );
};

const notifyFallback = (error) => {
  if (!hasLoggedDbFallback) {
    console.warn('\n⚠️ [Database Notice] PostgreSQL is not currently reachable at DATABASE_URL.');
    console.warn('   Details:', error.message?.split('\n')[0] || error.code || error);
    console.warn('   -> Seamlessly running TaxDetailService with file-backed persistence.\n');
    hasLoggedDbFallback = true;
  }
};

class TaxDetailService {
  async getAllTaxDetails() {
    try {
      const records = await prisma.taxDetail.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return records;
    } catch (error) {
      if (isDbConnectionError(error)) {
        notifyFallback(error);
        fallbackStore = loadStore();
        return [...fallbackStore].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      throw error;
    }
  }

  async getTaxDetailById(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      const error = new Error('Invalid Tax Detail ID format');
      error.statusCode = 400;
      throw error;
    }

    try {
      const record = await prisma.taxDetail.findUnique({
        where: { id: numericId },
      });
      return record;
    } catch (error) {
      if (isDbConnectionError(error)) {
        notifyFallback(error);
        fallbackStore = loadStore();
        const found = fallbackStore.find((item) => item.id === numericId);
        return found || null;
      }
      throw error;
    }
  }

  async createTaxDetail(data) {
    const {
      taxGroup,
      taxGroupId,
      description,
      frequency,
      dateFrom,
      dateTo,
      timeFrom,
      timeTo,
      submissionDate,
      reconciliationDate,
      extendDate,
    } = data;

    const parsedDateFrom = dateFrom ? new Date(dateFrom) : null;
    const parsedDateTo = dateTo ? new Date(dateTo) : null;
    const parsedSubmissionDate = new Date(submissionDate);
    const parsedReconciliationDate = new Date(reconciliationDate);
    const parsedExtendDate = new Date(extendDate);

    try {
      const created = await prisma.taxDetail.create({
        data: {
          taxGroup: taxGroup ? taxGroup.trim() : null,
          taxGroupId: taxGroupId ? parseInt(taxGroupId, 10) : null,
          description: description.trim(),
          frequency: frequency ? frequency.trim() : null,
          dateFrom: parsedDateFrom,
          dateTo: parsedDateTo,
          timeFrom: (timeFrom || '').trim(),
          timeTo: (timeTo || '').trim(),
          submissionDate: parsedSubmissionDate,
          reconciliationDate: parsedReconciliationDate,
          extendDate: parsedExtendDate,
        },
      });
      return created;
    } catch (error) {
      if (isDbConnectionError(error)) {
        notifyFallback(error);
        fallbackStore = loadStore();
        const maxId = fallbackStore.reduce((max, item) => Math.max(max, item.id || 0), 0);
        const now = new Date();
        const record = {
          id: maxId + 1,
          taxGroup: taxGroup ? taxGroup.trim() : null,
          taxGroupId: taxGroupId ? parseInt(taxGroupId, 10) : null,
          description: description.trim(),
          frequency: frequency ? frequency.trim() : null,
          dateFrom: parsedDateFrom,
          dateTo: parsedDateTo,
          timeFrom: (timeFrom || '').trim(),
          timeTo: (timeTo || '').trim(),
          submissionDate: parsedSubmissionDate,
          reconciliationDate: parsedReconciliationDate,
          extendDate: parsedExtendDate,
          createdAt: now,
          updatedAt: now,
        };
        fallbackStore.unshift(record);
        saveStore(fallbackStore);
        return record;
      }
      throw error;
    }
  }

  async updateTaxDetail(id, data) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      const error = new Error('Invalid Tax Detail ID format');
      error.statusCode = 400;
      throw error;
    }

    const {
      taxGroup,
      taxGroupId,
      description,
      frequency,
      dateFrom,
      dateTo,
      timeFrom,
      timeTo,
      submissionDate,
      reconciliationDate,
      extendDate,
    } = data;

    const updateData = {};
    if (taxGroup !== undefined) updateData.taxGroup = taxGroup ? taxGroup.trim() : null;
    if (taxGroupId !== undefined) {
      updateData.taxGroupId = taxGroupId ? parseInt(taxGroupId, 10) : null;
    }
    if (description !== undefined) updateData.description = description.trim();
    if (frequency !== undefined) updateData.frequency = frequency ? frequency.trim() : null;
    if (dateFrom !== undefined) updateData.dateFrom = dateFrom ? new Date(dateFrom) : null;
    if (dateTo !== undefined) updateData.dateTo = dateTo ? new Date(dateTo) : null;
    if (timeFrom !== undefined) updateData.timeFrom = timeFrom.trim();
    if (timeTo !== undefined) updateData.timeTo = timeTo.trim();
    if (submissionDate !== undefined) updateData.submissionDate = new Date(submissionDate);
    if (reconciliationDate !== undefined) updateData.reconciliationDate = new Date(reconciliationDate);
    if (extendDate !== undefined) updateData.extendDate = new Date(extendDate);

    try {
      const updated = await prisma.taxDetail.update({
        where: { id: numericId },
        data: updateData,
      });
      return updated;
    } catch (error) {
      if (isDbConnectionError(error)) {
        notifyFallback(error);
        fallbackStore = loadStore();
        const index = fallbackStore.findIndex((item) => item.id === numericId);
        if (index === -1) {
          const notFoundError = new Error(`Tax Detail with ID ${numericId} not found`);
          notFoundError.statusCode = 404;
          throw notFoundError;
        }
        fallbackStore[index] = {
          ...fallbackStore[index],
          ...updateData,
          updatedAt: new Date(),
        };
        saveStore(fallbackStore);
        return fallbackStore[index];
      }
      if (error.code === 'P2025') {
        const notFoundError = new Error(`Tax Detail with ID ${numericId} not found`);
        notFoundError.statusCode = 404;
        throw notFoundError;
      }
      throw error;
    }
  }

  async deleteTaxDetail(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      const error = new Error('Invalid Tax Detail ID format');
      error.statusCode = 400;
      throw error;
    }

    try {
      const deleted = await prisma.taxDetail.delete({
        where: { id: numericId },
      });
      return deleted;
    } catch (error) {
      if (isDbConnectionError(error)) {
        notifyFallback(error);
        fallbackStore = loadStore();
        const index = fallbackStore.findIndex((item) => item.id === numericId);
        if (index === -1) {
          const notFoundError = new Error(`Tax Detail with ID ${numericId} not found`);
          notFoundError.statusCode = 404;
          throw notFoundError;
        }
        const [deleted] = fallbackStore.splice(index, 1);
        saveStore(fallbackStore);
        return deleted;
      }
      if (error.code === 'P2025') {
        const notFoundError = new Error(`Tax Detail with ID ${numericId} not found`);
        notFoundError.statusCode = 404;
        throw notFoundError;
      }
      throw error;
    }
  }
}

module.exports = new TaxDetailService();
