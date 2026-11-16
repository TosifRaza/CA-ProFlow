const fs = require('fs');
const path = require('path');
const prisma = require('../lib/prisma');
const dbStatus = require('../lib/dbStatus');

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
      error.message?.includes("Can't reach database server"))
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

const cascadeDeleteRelatedRecords = async (numericId, taxGroupName) => {
  // 1. Prisma DB cleanup if reachable
  if (dbStatus.shouldTryDb()) {
    try {
      await prisma.taxDetail.deleteMany({
        where: {
          OR: [{ taxGroupId: numericId }, { taxGroup: taxGroupName }],
        },
      });
      await prisma.workMaster.deleteMany({
        where: {
          OR: [{ taxGroupId: numericId }, { taxGroup: taxGroupName }],
        },
      });
    } catch (e) {
      // ignore
    }
  }

  // 2. File fallback cleanup
  try {
    const detailsFile = path.join(DATA_DIR, 'taxDetails.json');
    if (fs.existsSync(detailsFile)) {
      const details = JSON.parse(fs.readFileSync(detailsFile, 'utf8'));
      const remainingDetails = details.filter(
        (d) => d.taxGroupId !== numericId && d.taxGroup !== taxGroupName
      );
      fs.writeFileSync(detailsFile, JSON.stringify(remainingDetails, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('Error cascading delete in taxDetails.json:', err);
  }

  try {
    const workFile = path.join(DATA_DIR, 'workMasters.json');
    if (fs.existsSync(workFile)) {
      const works = JSON.parse(fs.readFileSync(workFile, 'utf8'));
      const remainingWorks = works.filter(
        (w) => w.taxGroupId !== numericId && w.taxGroup !== taxGroupName
      );
      fs.writeFileSync(workFile, JSON.stringify(remainingWorks, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('Error cascading delete in workMasters.json:', err);
  }
};

const cascadeUpdateRelatedRecords = async (numericId, oldTaxGroupName, newTaxGroupName) => {
  if (!oldTaxGroupName || oldTaxGroupName === newTaxGroupName) return;

  if (dbStatus.shouldTryDb()) {
    try {
      await prisma.taxDetail.updateMany({
        where: {
          OR: [{ taxGroupId: numericId }, { taxGroup: oldTaxGroupName }],
        },
        data: {
          taxGroup: newTaxGroupName,
          taxGroupId: numericId,
        },
      });
      await prisma.workMaster.updateMany({
        where: {
          OR: [{ taxGroupId: numericId }, { taxGroup: oldTaxGroupName }],
        },
        data: {
          taxGroup: newTaxGroupName,
          taxGroupId: numericId,
        },
      });
    } catch (e) {
      // ignore
    }
  }

  try {
    const detailsFile = path.join(DATA_DIR, 'taxDetails.json');
    if (fs.existsSync(detailsFile)) {
      const details = JSON.parse(fs.readFileSync(detailsFile, 'utf8'));
      const updatedDetails = details.map((d) => {
        if (d.taxGroupId === numericId || d.taxGroup === oldTaxGroupName) {
          return { ...d, taxGroup: newTaxGroupName, taxGroupId: numericId };
        }
        return d;
      });
      fs.writeFileSync(detailsFile, JSON.stringify(updatedDetails, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('Error cascading update in taxDetails.json:', err);
  }

  try {
    const workFile = path.join(DATA_DIR, 'workMasters.json');
    if (fs.existsSync(workFile)) {
      const works = JSON.parse(fs.readFileSync(workFile, 'utf8'));
      const updatedWorks = works.map((w) => {
        if (w.taxGroupId === numericId || w.taxGroup === oldTaxGroupName) {
          return { ...w, taxGroup: newTaxGroupName, taxGroupId: numericId };
        }
        return w;
      });
      fs.writeFileSync(workFile, JSON.stringify(updatedWorks, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('Error cascading update in workMasters.json:', err);
  }
};

class TaxGroupService {
  async getAllTaxGroups() {
    if (!dbStatus.shouldTryDb()) {
      fallbackStore = loadStore();
      return [...fallbackStore].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    try {
      const records = await prisma.taxGroup.findMany({
        orderBy: { createdAt: 'desc' },
      });
      dbStatus.markDbUp();
      return records;
    } catch (error) {
      if (isDbConnectionError(error)) {
        dbStatus.markDbDown();
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

    if (!dbStatus.shouldTryDb()) {
      fallbackStore = loadStore();
      const found = fallbackStore.find((item) => item.id === numericId);
      return found || null;
    }

    try {
      const record = await prisma.taxGroup.findUnique({
        where: { id: numericId },
      });
      dbStatus.markDbUp();
      return record;
    } catch (error) {
      if (isDbConnectionError(error)) {
        dbStatus.markDbDown();
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

    if (!dbStatus.shouldTryDb()) {
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

    try {
      const created = await prisma.taxGroup.create({
        data: {
          taxName: taxName.trim(),
          frequency: frequency ? frequency.trim() : null,
          date: parsedDate,
        },
      });
      dbStatus.markDbUp();
      return created;
    } catch (error) {
      if (isDbConnectionError(error)) {
        dbStatus.markDbDown();
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

    if (!dbStatus.shouldTryDb()) {
      fallbackStore = loadStore();
      const index = fallbackStore.findIndex((item) => item.id === numericId);
      if (index === -1) {
        const notFoundError = new Error(`Tax Group with ID ${numericId} not found`);
        notFoundError.statusCode = 404;
        throw notFoundError;
      }
      const oldTaxName = fallbackStore[index].taxName;
      fallbackStore[index] = {
        ...fallbackStore[index],
        ...updateData,
        updatedAt: new Date(),
      };
      saveStore(fallbackStore);
      if (updateData.taxName && oldTaxName && oldTaxName !== updateData.taxName) {
        await cascadeUpdateRelatedRecords(numericId, oldTaxName, updateData.taxName);
      }
      return fallbackStore[index];
    }

    try {
      const existing = await prisma.taxGroup.findUnique({ where: { id: numericId } });
      const oldTaxName = existing ? existing.taxName : null;
      const updated = await prisma.taxGroup.update({
        where: { id: numericId },
        data: updateData,
      });
      dbStatus.markDbUp();
      if (updateData.taxName && oldTaxName && oldTaxName !== updateData.taxName) {
        await cascadeUpdateRelatedRecords(numericId, oldTaxName, updateData.taxName);
      }
      return updated;
    } catch (error) {
      if (isDbConnectionError(error)) {
        dbStatus.markDbDown();
        notifyFallback(error);
        fallbackStore = loadStore();
        const index = fallbackStore.findIndex((item) => item.id === numericId);
        if (index === -1) {
          const notFoundError = new Error(`Tax Group with ID ${numericId} not found`);
          notFoundError.statusCode = 404;
          throw notFoundError;
        }
        const oldTaxName = fallbackStore[index].taxName;
        fallbackStore[index] = {
          ...fallbackStore[index],
          ...updateData,
          updatedAt: new Date(),
        };
        saveStore(fallbackStore);
        if (updateData.taxName && oldTaxName && oldTaxName !== updateData.taxName) {
          await cascadeUpdateRelatedRecords(numericId, oldTaxName, updateData.taxName);
        }
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

    let targetTaxName = null;

    if (!dbStatus.shouldTryDb()) {
      fallbackStore = loadStore();
      const index = fallbackStore.findIndex((item) => item.id === numericId);
      if (index === -1) {
        const notFoundError = new Error(`Tax Group with ID ${numericId} not found`);
        notFoundError.statusCode = 404;
        throw notFoundError;
      }
      targetTaxName = fallbackStore[index].taxName;
      const [deleted] = fallbackStore.splice(index, 1);
      saveStore(fallbackStore);
      await cascadeDeleteRelatedRecords(numericId, targetTaxName);
      return deleted;
    }

    try {
      const existing = await prisma.taxGroup.findUnique({ where: { id: numericId } });
      if (existing) targetTaxName = existing.taxName;
      const deleted = await prisma.taxGroup.delete({
        where: { id: numericId },
      });
      dbStatus.markDbUp();
      await cascadeDeleteRelatedRecords(numericId, targetTaxName);
      return deleted;
    } catch (error) {
      if (isDbConnectionError(error)) {
        dbStatus.markDbDown();
        notifyFallback(error);
        fallbackStore = loadStore();
        const index = fallbackStore.findIndex((item) => item.id === numericId);
        if (index === -1) {
          const notFoundError = new Error(`Tax Group with ID ${numericId} not found`);
          notFoundError.statusCode = 404;
          throw notFoundError;
        }
        targetTaxName = fallbackStore[index].taxName;
        const [deleted] = fallbackStore.splice(index, 1);
        saveStore(fallbackStore);
        await cascadeDeleteRelatedRecords(numericId, targetTaxName);
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
