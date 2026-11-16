import React, { useState, useEffect, useMemo } from 'react';
import TaxDetailForm from '../components/TaxDetailForm';
import { taxDetailApi } from '../services/api';
import {
  Edit2,
  Trash2,
  Calendar,
  RefreshCw,
  AlertCircle,
  Database,
  CalendarClock,
  ChevronRight,
  Search,
  Repeat,
  FileCheck,
  CheckCircle2,
  Clock,
  FolderTree,
  Layers,
} from 'lucide-react';

const TaxDetailPage = () => {
  const [taxDetails, setTaxDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');

  const fetchTaxDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await taxDetailApi.getAll();
      if (res && res.data) {
        setTaxDetails(res.data);
      }
    } catch (err) {
      console.error('Error fetching tax master records:', err);
      setError('Unable to load tax master records. Please ensure backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxDetails();
  }, []);

  const handleRecordSaved = (savedRecord, action) => {
    if (action === 'create') {
      setTaxDetails((prev) => [savedRecord, ...prev]);
    } else if (action === 'update') {
      setTaxDetails((prev) =>
        prev.map((item) => (item.id === savedRecord.id ? savedRecord : item))
      );
      setEditingRecord(null);
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Tax Master?')) {
      return;
    }

    try {
      setDeleteId(id);
      await taxDetailApi.delete(id);
      setTaxDetails((prev) => prev.filter((item) => item.id !== id));
      if (editingRecord && editingRecord.id === id) {
        setEditingRecord(null);
      }
    } catch (err) {
      console.error('Error deleting tax master:', err);
      alert('Failed to delete Tax Master. Please try again.');
    } finally {
      setDeleteId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filtered Tax Masters based on search input
  const filteredTaxDetails = useMemo(() => {
    if (!searchFilter.trim()) return taxDetails;
    const q = searchFilter.toLowerCase().trim();
    return taxDetails.filter((t) =>
      t.description.toLowerCase().includes(q) ||
      (t.taxGroup && t.taxGroup.toLowerCase().includes(q)) ||
      (t.frequency && t.frequency.toLowerCase().includes(q))
    );
  }, [taxDetails, searchFilter]);

  const distinctGroupsCount = useMemo(() => {
    return new Set(taxDetails.map((t) => t.taxGroup).filter(Boolean)).size;
  }, [taxDetails]);

  return (
    <div className="flex-1 p-5 md:p-7 max-w-[1300px] mx-auto space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Tax Master</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Compliance Rules
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure statutory filing periods, target dates, and extended deadlines under each Tax Group.
          </p>
        </div>

        {/* Sync Data Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchTaxDetails}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition-all hover:border-slate-300 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
            <span>Sync Data</span>
          </button>
        </div>
      </div>

      {/* Hero Stats & KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Configured Tasks
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-bold text-slate-900">{taxDetails.length}</span>
              <span className="text-xs text-slate-500">Tasks</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <CalendarClock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Covered Tax Groups
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-bold text-slate-900">{distinctGroupsCount}</span>
              <span className="text-xs text-slate-500">Groups</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <FolderTree className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Work Master Link
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-bold text-emerald-600">Active</span>
              <span className="text-xs text-slate-500">Ready</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Tax Master Form Card */}
      <TaxDetailForm
        onRecordSaved={handleRecordSaved}
        editingRecord={editingRecord}
        onCancelEdit={() => setEditingRecord(null)}
      />

      {/* Saved Records Section with Toolbar & Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Saved Tax Masters</h2>
            <p className="text-[11px] text-slate-500">
              {filteredTaxDetails.length} of {taxDetails.length} compliance schedules configured
            </p>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter by task or tax group..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-2xs"
            />
          </div>
        </div>

        {error && (
          <div className="m-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Table View */}
        {loading && taxDetails.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
            <span>Loading Tax Masters...</span>
          </div>
        ) : filteredTaxDetails.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-1.5">
            <Database className="w-7 h-7 text-slate-300 stroke-[1.5]" />
            <p className="font-semibold text-slate-600 text-sm">No tax masters found</p>
            <p className="text-slate-400 text-xs">
              {searchFilter ? 'Try clearing your search filter.' : 'Fill the form above to add your first tax master.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-700">
              <thead className="bg-[#f8fafc] text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-4 py-3">Tax Group</th>
                  <th scope="col" className="px-4 py-3">Task Description</th>
                  <th scope="col" className="px-4 py-3">Frequency</th>
                  <th scope="col" className="px-4 py-3">Period (From – To)</th>
                  <th scope="col" className="px-4 py-3">Submission Date</th>
                  <th scope="col" className="px-4 py-3">Reconciliation Date</th>
                  <th scope="col" className="px-4 py-3">Extend Date</th>
                  <th scope="col" className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTaxDetails.map((tax) => (
                  <tr key={tax.id} className="hover:bg-slate-50/70 transition-colors group">
                    {/* Tax Group Badge */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {tax.taxGroup ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          <FolderTree className="w-3 h-3 text-slate-500" />
                          <span>{tax.taxGroup}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">—</span>
                      )}
                    </td>

                    {/* Task Description */}
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <span className="truncate max-w-[240px] block" title={tax.description}>
                        {tax.description}
                      </span>
                    </td>

                    {/* Frequency */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
                        {tax.frequency || 'Monthly'}
                      </span>
                    </td>

                    {/* Date (From - To) */}
                    <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                      {formatDate(tax.dateFrom)} – {formatDate(tax.dateTo)}
                    </td>

                    {/* Submission Date */}
                    <td className="px-4 py-3 text-xs sm:text-sm font-medium text-slate-700 whitespace-nowrap">
                      {formatDate(tax.submissionDate)}
                    </td>

                    {/* Reconciliation Date */}
                    <td className="px-4 py-3 text-xs sm:text-sm font-medium text-slate-700 whitespace-nowrap">
                      {formatDate(tax.reconciliationDate)}
                    </td>

                    {/* Extend Date */}
                    <td className="px-4 py-3 text-xs sm:text-sm font-medium text-slate-700 whitespace-nowrap">
                      {formatDate(tax.extendDate)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(tax)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Tax Master Task"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(tax.id)}
                          disabled={deleteId === tax.id}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete Tax Master Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50/40 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Showing {filteredTaxDetails.length} statutory compliance schedule(s)</span>
          <span>CA ProFlow Compliance Master</span>
        </div>
      </div>
    </div>
  );
};

export default TaxDetailPage;