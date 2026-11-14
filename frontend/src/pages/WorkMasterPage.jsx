import React, { useState, useEffect, useMemo } from 'react';
import WorkMasterForm from '../components/WorkMasterForm';
import { workMasterApi, taxDetailApi } from '../services/api';
import {
  Edit2,
  Trash2,
  Calendar,
  RefreshCw,
  AlertCircle,
  Database,
  Tag,
  Info,
  X,
  Repeat,
  FileText,
  Layers,
  Briefcase,
  ChevronRight,
  Search,
  CheckCircle2,
  FolderTree,
} from 'lucide-react';

const WorkMasterPage = () => {
  const [workMasters, setWorkMasters] = useState([]);
  const [allTaxMasters, setAllTaxMasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Modal state for viewing full Tax Master details
  const [modalTaxDetail, setModalTaxDetail] = useState(null);

  const fetchWorkMasters = async () => {
    try {
      setLoading(true);
      setError('');

      let workData = [];
      let workFailed = false;
      try {
        const workRes = await workMasterApi.getAll();
        if (workRes && workRes.data) {
          workData = workRes.data;
        }
      } catch (err) {
        console.warn('Error fetching work masters:', err);
        workFailed = true;
      }

      let taxData = [];
      try {
        const taxRes = await taxDetailApi.getAll();
        if (taxRes && taxRes.data) {
          taxData = taxRes.data;
        }
      } catch (err) {
        console.warn('Error fetching tax masters:', err);
      }

      setWorkMasters(workData);
      setAllTaxMasters(taxData);

      if (workFailed) {
        setError('Unable to load work masters. Please ensure backend server is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkMasters();
  }, []);

  const handleRecordSaved = (savedRecord, action) => {
    if (action === 'create') {
      setWorkMasters((prev) => [savedRecord, ...prev]);
    } else if (action === 'update') {
      setWorkMasters((prev) =>
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
    if (!window.confirm('Are you sure you want to delete this Work Master?')) {
      return;
    }

    try {
      setDeleteId(id);
      await workMasterApi.delete(id);
      setWorkMasters((prev) => prev.filter((item) => item.id !== id));
      if (editingRecord && editingRecord.id === id) {
        setEditingRecord(null);
      }
    } catch (err) {
      console.error('Error deleting work master:', err);
      alert('Failed to delete Work Master. Please try again.');
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

  // Find matching Tax Master for a work item
  const findMatchingTax = (work) => {
    if (work.taxDetailId) {
      const byId = allTaxMasters.find((t) => t.id === work.taxDetailId);
      if (byId) return byId;
    }
    return allTaxMasters.find(
      (t) => t.description.toLowerCase() === (work.typeOfWork || '').toLowerCase()
    );
  };

  // Filtered work masters based on search filter
  const filteredWorkMasters = useMemo(() => {
    if (!searchFilter.trim()) return workMasters;
    const q = searchFilter.toLowerCase().trim();
    return workMasters.filter(
      (w) =>
        w.workName.toLowerCase().includes(q) ||
        (w.taxGroup && w.taxGroup.toLowerCase().includes(q)) ||
        (w.typeOfWork && w.typeOfWork.toLowerCase().includes(q))
    );
  }, [workMasters, searchFilter]);

  return (
    <div className="flex-1 p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <span>Compliance Masters</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-blue-600 font-semibold">Work Master</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Work Master</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
              Task Workflows
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Map work items to statutory Tax Groups and compliance tasks from your Tax Master.
          </p>
        </div>

        {/* Sync Data Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchWorkMasters}
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
              Work Allocations
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900">{workMasters.length}</span>
              <span className="text-xs font-semibold text-blue-600">Active Work Items</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Inter-Master Links
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900">Tax Group & Master</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Workflow Status
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-600">Connected</span>
              <span className="text-[10px] text-slate-400 font-medium">Full Specifications Synced</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Work Master Form Card */}
      <WorkMasterForm
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
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Saved Work Items</h2>
              <p className="text-[11px] text-slate-500 font-normal">
                {filteredWorkMasters.length} of {workMasters.length} total work items configured
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
              placeholder="Filter work items or tax..."
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
        {loading && workMasters.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
            <span>Loading Work Masters...</span>
          </div>
        ) : filteredWorkMasters.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Database className="w-8 h-8 text-slate-300 stroke-[1.5]" />
            <p className="font-semibold text-slate-600 text-sm">No work masters found</p>
            <p className="text-slate-400">
              {searchFilter ? 'Try clearing your search filter.' : 'Fill the form above to add your first work item.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-700">
              <thead className="bg-[#f8fafc] text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Work Name</th>
                  <th scope="col" className="px-6 py-3.5">Tax Group</th>
                  <th scope="col" className="px-6 py-3.5">Type of Work / Linked Tax</th>
                  <th scope="col" className="px-6 py-3.5">Created Date</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWorkMasters.map((work) => {
                  const matchedTax = findMatchingTax(work);

                  return (
                    <tr key={work.id} className="hover:bg-blue-50/25 transition-colors group">
                      {/* Work Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/60 font-bold text-xs">
                            <Briefcase className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block text-xs sm:text-sm leading-tight">
                              {work.workName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              Client Workflow
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Tax Group Badge */}
                      <td className="px-6 py-4">
                        {work.taxGroup ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                            <Layers className="w-3.5 h-3.5 text-indigo-500" />
                            {work.taxGroup}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">—</span>
                        )}
                      </td>

                      {/* Type of Work Button */}
                      <td className="px-6 py-4">
                        {matchedTax ? (
                          <button
                            type="button"
                            onClick={() => setModalTaxDetail({ ...matchedTax, parentWork: work })}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 hover:bg-blue-100 hover:border-blue-300 transition-colors cursor-pointer group/btn"
                            title="Click to view full Tax Master specifications"
                          >
                            <Tag className="w-3 h-3 text-blue-500" />
                            <span>{work.typeOfWork}</span>
                            <Info className="w-3 h-3 text-blue-400 group-hover/btn:text-blue-600 ml-0.5" />
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            <Tag className="w-3 h-3 text-slate-400" />
                            {work.typeOfWork}
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4 text-slate-600">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(work.createdAt)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEdit(work)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-blue-200"
                            title="Edit Work Master"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(work.id)}
                            disabled={deleteId === work.id}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50 border border-transparent hover:border-rose-200"
                            title="Delete Work Master"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/40 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Showing {filteredWorkMasters.length} work allocation item(s)</span>
          <span className="font-medium text-slate-400">CA ProFlow Master Management</span>
        </div>
      </div>

      {/* MODAL: Full Tax Master Details Popup with all attributes */}
      {modalTaxDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
          onClick={() => setModalTaxDetail(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 transition-all animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Tax Master Specifications
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Complete compliance and schedule details
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalTaxDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: ALL attributes in dedicated labeled boxes */}
            <div className="mt-5 space-y-3 text-xs">
              {/* Tax Group (when linked to a work item) */}
              {modalTaxDetail.parentWork?.taxGroup && (
                <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl flex items-start gap-2.5">
                  <Layers className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-indigo-600 block text-[10px] font-bold uppercase tracking-wider">
                      Tax Group
                    </span>
                    <span className="text-indigo-950 font-bold text-sm">
                      {modalTaxDetail.parentWork.taxGroup}
                    </span>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="p-3 bg-slate-50 rounded-xl flex items-start gap-2.5 border border-slate-200/60">
                <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                    Description
                  </span>
                  <span className="text-slate-900 font-bold text-sm">
                    {modalTaxDetail.description}
                  </span>
                </div>
              </div>

              {/* Frequency */}
              <div className="p-3 bg-slate-50 rounded-xl flex items-start gap-2.5 border border-slate-200/60">
                <Repeat className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                    Frequency
                  </span>
                  <span className="text-blue-700 font-bold text-sm">
                    {modalTaxDetail.frequency || 'Monthly'}
                  </span>
                </div>
              </div>

              {/* Date (From - To) */}
              <div className="p-3 bg-slate-50 rounded-xl flex items-start gap-2.5 border border-slate-200/60">
                <Calendar className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                    Date Range (From - To)
                  </span>
                  <span className="text-slate-800 font-bold text-sm">
                    {formatDate(modalTaxDetail.dateFrom)} – {formatDate(modalTaxDetail.dateTo)}
                  </span>
                </div>
              </div>

              {/* Submission Date */}
              <div className="p-3 bg-emerald-50/60 border border-emerald-200/70 rounded-xl flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-emerald-700 block text-[10px] font-bold uppercase tracking-wider">
                    Submission Due Date
                  </span>
                  <span className="text-emerald-900 font-bold text-sm">
                    {formatDate(modalTaxDetail.submissionDate)}
                  </span>
                </div>
              </div>

              {/* Reconciliation Date */}
              <div className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-xl flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-amber-700 block text-[10px] font-bold uppercase tracking-wider">
                    Reconciliation Target Date
                  </span>
                  <span className="text-amber-900 font-bold text-sm">
                    {formatDate(modalTaxDetail.reconciliationDate)}
                  </span>
                </div>
              </div>

              {/* Extend Date */}
              <div className="p-3 bg-rose-50/60 border border-rose-200/70 rounded-xl flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-rose-700 block text-[10px] font-bold uppercase tracking-wider">
                    Extended Filing Deadline
                  </span>
                  <span className="text-rose-900 font-bold text-sm">
                    {formatDate(modalTaxDetail.extendDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setModalTaxDetail(null)}
                className="px-5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkMasterPage;