const fs = require('fs');
const path = require('path');
const prisma = require('../lib/prisma');

const DATA_DIR = path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'workMasters.json');

const loadStore = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading workMasters fallback data:', e);
  }
  return [];
};

const saveStore = (data) => {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving workMasters fallback data:', e);
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
    console.warn('   -> Seamlessly running WorkMasterService with file-backed persistence.\n');
    hasLoggedDbFallback = true;
  }
};

class WorkMasterService {
  async getAllWorkMasters() {
    try {
      const records = await prisma.workMaster.findMany({
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

  async getWorkMasterById(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      const error = new Error('Invalid Work Master ID format');
      error.statusCode = 400;
      throw error;
    }

    try {
      const record = await prisma.workMaster.findUnique({
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

  async createWorkMaster(data) {
    const { workName, taxGroup, taxGroupId, typeOfWork, taxDetailId } = data;

    try {
      const created = await prisma.workMaster.create({
        data: {
          workName: workName.trim(),
          taxGroup: taxGroup ? taxGroup.trim() : null,
          taxGroupId: taxGroupId ? parseInt(taxGroupId, 10) : null,
          typeOfWork: typeOfWork.trim(),
          taxDetailId: taxDetailId ? parseInt(taxDetailId, 10) : null,
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
          workName: workName.trim(),
          taxGroup: taxGroup ? taxGroup.trim() : null,
          taxGroupId: taxGroupId ? parseInt(taxGroupId, 10) : null,
          typeOfWork: typeOfWork.trim(),
          taxDetailId: taxDetailId ? parseInt(taxDetailId, 10) : null,
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

  async updateWorkMaster(id, data) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      const error = new Error('Invalid Work Master ID format');
      error.statusCode = 400;
      throw error;
    }

    const { workName, taxGroup, taxGroupId, typeOfWork, taxDetailId } = data;
    const updateData = {};
    if (workName !== undefined) updateData.workName = workName.trim();
    if (taxGroup !== undefined) updateData.taxGroup = taxGroup ? taxGroup.trim() : null;
    if (taxGroupId !== undefined) {
      updateData.taxGroupId = taxGroupId ? parseInt(taxGroupId, 10) : null;
    }
    if (typeOfWork !== undefined) updateData.typeOfWork = typeOfWork.trim();
    if (taxDetailId !== undefined) {
      updateData.taxDetailId = taxDetailId ? parseInt(taxDetailId, 10) : null;
    }

    try {
      const updated = await prisma.workMaster.update({
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
          const notFoundError = new Error(`Work Master with ID ${numericId} not found`);
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
        const notFoundError = new Error(`Work Master with ID ${numericId} not found`);
        notFoundError.statusCode = 404;
        throw notFoundError;
      }
      throw error;
    }
  }

  async deleteWorkMaster(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      const error = new Error('Invalid Work Master ID format');
      error.statusCode = 400;
      throw error;
    }

    try {
      const deleted = await prisma.workMaster.delete({
        where: { id: numericId },
      });
      return deleted;
    } catch (error) {
      if (isDbConnectionError(error)) {
        notifyFallback(error);
        fallbackStore = loadStore();
        const index = fallbackStore.findIndex((item) => item.id === numericId);
        if (index === -1) {
          const notFoundError = new Error(`Work Master with ID ${numericId} not found`);
          notFoundError.statusCode = 404;
          throw notFoundError;
        }
        const [deleted] = fallbackStore.splice(index, 1);
        saveStore(fallbackStore);
        return deleted;
      }
      if (error.code === 'P2025') {
        const notFoundError = new Error(`Work Master with ID ${numericId} not found`);
        notFoundError.statusCode = 404;
        throw notFoundError;
      }
      throw error;
    }
  }
}

module.exports = new WorkMasterService();
