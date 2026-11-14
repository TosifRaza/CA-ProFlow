const fs = require('fs');
const path = require('path');
const prisma = require('../lib/prisma');

const DATA_DIR = path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'taxGroups.json');

const loadStore = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading taxGroups fallback data:', e);
  }
  return [];
};

const saveStore = (data) => {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving taxGroups fallback data:', e);
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
    console.warn('   -> Seamlessly running TaxGroupService with file-backed persistence.\n');
    hasLoggedDbFallback = true;
  }
};

class TaxGroupService {
  async getAllTaxGroups() {
    try {
      const records = await prisma.taxGroup.findMany({
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

  async getTaxGroupById(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      const error = new Error('Invalid Tax Group ID format');
      error.statusCode = 400;
      throw error;
    }

    try {
      const record = await prisma.taxGroup.findUnique({
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

  async createTaxGroup(data) {
    const { taxName, frequency, date } = data;
    const parsedDate = date ? new Date(date) : null;

    try {
      const created = await prisma.taxGroup.create({
        data: {
          taxName: taxName.trim(),
          frequency: frequency ? frequency.trim() : null,
          date: parsedDate,
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
          taxName: taxName.trim(),
          frequency: frequency ? frequency.trim() : null,
          date: parsedDate,
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

  async updateTaxGroup(id, data) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      const error = new Error('Invalid Tax Group ID format');
      error.statusCode = 400;
      throw error;
    }

    const { taxName, frequency, date } = data;
    const updateData = {};
    if (taxName !== undefined) updateData.taxName = taxName.trim();
    if (frequency !== undefined) updateData.frequency = frequency ? frequency.trim() : null;
    if (date !== undefined) updateData.date = date ? new Date(date) : null;

    try {
      const updated = await prisma.taxGroup.update({
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
          const notFoundError = new Error(`Tax Group with ID ${numericId} not found`);
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
        const notFoundError = new Error(`Tax Group with ID ${numericId} not found`);
        notFoundError.statusCode = 404;
        throw notFoundError;
      }
      throw error;
    }
  }

  async deleteTaxGroup(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      const error = new Error('Invalid Tax Group ID format');
      error.statusCode = 400;
      throw error;
    }

    try {
      const deleted = await prisma.taxGroup.delete({
        where: { id: numericId },
      });
      return deleted;
    } catch (error) {
      if (isDbConnectionError(error)) {
        notifyFallback(error);
        fallbackStore = loadStore();
        const index = fallbackStore.findIndex((item) => item.id === numericId);
        if (index === -1) {
          const notFoundError = new Error(`Tax Group with ID ${numericId} not found`);
          notFoundError.statusCode = 404;
          throw notFoundError;
        }
        const [deleted] = fallbackStore.splice(index, 1);
        saveStore(fallbackStore);
        return deleted;
      }
      if (error.code === 'P2025') {
        const notFoundError = new Error(`Tax Group with ID ${numericId} not found`);
        notFoundError.statusCode = 404;
        throw notFoundError;
      }
      throw error;
    }
  }
}

module.exports = new TaxGroupService();
