import React, { useState, useEffect, useMemo } from 'react';
import TaxGroupForm from '../components/TaxGroupForm';
import { taxGroupApi } from '../services/api';
import {
  Edit2,
  Trash2,
  Calendar,
  RefreshCw,
  AlertCircle,
  Database,
  Search,
  FolderTree,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  Layers,
  Sparkles,
} from 'lucide-react';

const TaxGroupPage = () => {
  const [taxGroups, setTaxGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');

  const fetchTaxGroups = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await taxGroupApi.getAll();
      if (res && res.data) {
        setTaxGroups(res.data);
      }
    } catch (err) {
      console.error('Error fetching tax groups:', err);
      setError('Unable to load tax groups. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxGroups();
  }, []);

  const handleRecordSaved = (savedRecord, action) => {
    if (action === 'create') {
      setTaxGroups((prev) => [savedRecord, ...prev]);
    } else if (action === 'update') {
      setTaxGroups((prev) =>
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
    if (!window.confirm('Are you sure you want to delete this Tax Group?')) {
      return;
    }

    try {
      setDeleteId(id);
      await taxGroupApi.delete(id);
      setTaxGroups((prev) => prev.filter((item) => item.id !== id));
      if (editingRecord && editingRecord.id === id) {
        setEditingRecord(null);
      }
    } catch (err) {
      console.error('Error deleting tax group:', err);
      alert('Failed to delete Tax Group. Please try again.');
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

  // Filtered Tax Groups based on search input
  const filteredTaxGroups = useMemo(() => {
    if (!searchFilter.trim()) return taxGroups;
    return taxGroups.filter((tg) =>
      tg.taxName.toLowerCase().includes(searchFilter.toLowerCase().trim())
    );
  }, [taxGroups, searchFilter]);

  return (
    <div className="flex-1 p-5 md:p-7 max-w-[1300px] mx-auto space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Tax Group</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Master Registry
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure statutory tax classifications for compliance schedules and client work allocation.
          </p>
        </div>

        {/* Quick Sync / Refresh Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchTaxGroups}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition-all hover:border-slate-300 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
            <span>Sync Data</span>
          </button>
        </div>
      </div>

      {/* Hero Stats & KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Metric 1 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Registered Groups
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-bold text-slate-900">{taxGroups.length}</span>
              <span className="text-xs text-slate-500">Heads</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <FolderTree className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Classification Scope
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-bold text-slate-900">Direct & Indirect</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              System Linkage
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-bold text-emerald-600">Connected</span>
              <span className="text-xs text-slate-500">Ready</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Tax Group Form Card */}
      <TaxGroupForm
        onRecordSaved={handleRecordSaved}
        editingRecord={editingRecord}
        onCancelEdit={() => setEditingRecord(null)}
      />

      {/* Saved Records Section with Toolbar & Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Saved Tax Groups</h2>
            <p className="text-[11px] text-slate-500">
              {filteredTaxGroups.length} of {taxGroups.length} total tax classifications
            </p>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter tax groups..."
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
        {loading && taxGroups.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
            <span>Loading Tax Groups...</span>
          </div>
        ) : filteredTaxGroups.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-1.5">
            <Database className="w-7 h-7 text-slate-300 stroke-[1.5]" />
            <p className="font-semibold text-slate-600 text-sm">No tax groups found</p>
            <p className="text-slate-400 text-xs">
              {searchFilter ? 'Try clearing your search filter.' : 'Use the form above to add your first Tax Group.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-700">
              <thead className="bg-[#f8fafc] text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-5 py-3">Tax Group Name</th>
                  <th scope="col" className="px-5 py-3">Classification Scope</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3">Created Date</th>
                  <th scope="col" className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTaxGroups.map((group) => (
                  <tr key={group.id} className="hover:bg-slate-50/70 transition-colors group">
                    {/* Tax Group Name */}
                    <td className="px-5 py-3 font-semibold text-slate-900">
                      {group.taxName}
                    </td>

                    {/* Scope */}
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        Statutory Tax
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    </td>

                    {/* Created Date */}
                    <td className="px-5 py-3 text-xs text-slate-600 whitespace-nowrap">
                      {formatDate(group.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(group)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Tax Group"
                          aria-label="Edit Tax Group"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(group.id)}
                          disabled={deleteId === group.id}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete Tax Group"
                          aria-label="Delete Tax Group"
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
          <span>Showing {filteredTaxGroups.length} statutory tax head(s)</span>
          <span>CA ProFlow Compliance Registry</span>
        </div>
      </div>
    </div>
  );
};

export default TaxGroupPage;