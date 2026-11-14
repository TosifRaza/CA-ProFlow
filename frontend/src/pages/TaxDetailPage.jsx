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
    return taxDetails.filter((t) =>
      t.description.toLowerCase().includes(searchFilter.toLowerCase().trim()) ||
      (t.frequency && t.frequency.toLowerCase().includes(searchFilter.toLowerCase().trim()))
    );
  }, [taxDetails, searchFilter]);

  return (
    <div className="flex-1 p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <span>Compliance Masters</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-blue-600 font-semibold">Tax Master</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tax Master</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
              Statutory Deadlines
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure filing periods, submission target dates, and extended deadlines for tax regimes.
          </p>
        </div>

        {/* Sync Data Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchTaxDetails}
            className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/90 shadow-2xs transition-all hover:border-slate-300 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
            <span>Sync Data</span>
          </button>
        </div>
      </div>

      {/* Hero Stats & KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Configured Tasks
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900">{taxDetails.length}</span>
              <span className="text-xs font-semibold text-blue-600">Compliance Tasks</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <CalendarClock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Active Frequencies
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900">Monthly / Quarterly</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Repeat className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Work Master Linkage
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-600">Active</span>
              <span className="text-[10px] text-slate-400 font-medium">Ready as Types of Work</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
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
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.05)] overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:px-6 sm:py-4.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <CalendarClock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Saved Tax Masters</h2>
              <p className="text-[11px] text-slate-500 font-normal">
                {filteredTaxDetails.length} of {taxDetails.length} compliance schedules configured
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter tax tasks..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-2xs"
            />
          </div>
        </div>

        {error && (
          <div className="m-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Table View */}
        {loading && taxDetails.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
            <span>Loading Tax Masters...</span>
          </div>
        ) : filteredTaxDetails.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Database className="w-8 h-8 text-slate-300 stroke-[1.5]" />
            <p className="font-semibold text-slate-600 text-sm">No tax masters found</p>
            <p className="text-slate-400">
              {searchFilter ? 'Try clearing your search filter.' : 'Fill the form above to add your first tax master.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-700">
              <thead className="bg-[#f8fafc] text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Task Description</th>
                  <th scope="col" className="px-5 py-3.5">Frequency</th>
                  <th scope="col" className="px-5 py-3.5">Date (From - To)</th>
                  <th scope="col" className="px-5 py-3.5">Submission Date</th>
                  <th scope="col" className="px-5 py-3.5">Reconciliation Date</th>
                  <th scope="col" className="px-5 py-3.5">Extend Date</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTaxDetails.map((tax) => (
                  <tr key={tax.id} className="hover:bg-blue-50/25 transition-colors group">
                    <td className="px-5 py-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/60">
                          <CalendarClock className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate max-w-[220px]" title={tax.description}>
                          {tax.description}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {tax.frequency || 'Monthly'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(tax.dateFrom)} – {formatDate(tax.dateTo)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                        {formatDate(tax.submissionDate)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/70">
                        {formatDate(tax.reconciliationDate)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/70">
                        {formatDate(tax.extendDate)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(tax)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-blue-200"
                          title="Edit Tax Master"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(tax.id)}
                          disabled={deleteId === tax.id}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50 border border-transparent hover:border-rose-200"
                          title="Delete Tax Master"
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
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/40 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Showing {filteredTaxDetails.length} statutory compliance schedule(s)</span>
          <span className="font-medium text-slate-400">CA ProFlow Master Management</span>
        </div>
      </div>
    </div>
  );
};

export default TaxDetailPage;