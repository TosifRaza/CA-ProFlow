import React, { useState, useEffect } from 'react';
import {
  Layers,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Tag,
  Repeat,
  FileText,
  Briefcase,
} from 'lucide-react';
import { workMasterApi, taxDetailApi, taxGroupApi } from '../services/api';

const WorkMasterForm = ({ onRecordSaved, editingRecord, onCancelEdit }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [formData, setFormData] = useState({
    workName: '',
    taxGroup: '',
    taxGroupId: null,
    typeOfWork: '',
    taxDetailId: null,
  });

  const [savedTaxGroups, setSavedTaxGroups] = useState([]);
  const [loadingTaxGroups, setLoadingTaxGroups] = useState(false);
  const [savedTaxMasters, setSavedTaxMasters] = useState([]);
  const [selectedTaxDetail, setSelectedTaxDetail] = useState(null);
  const [loadingTaxDetail, setLoadingTaxDetail] = useState(false);
  const [loadingTaxMasters, setLoadingTaxMasters] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Fetch all saved Tax Groups
  const fetchTaxGroups = async (isInitial = false) => {
    try {
      if (isInitial || savedTaxGroups.length === 0) {
        setLoadingTaxGroups(true);
      }
      const res = await taxGroupApi.getAll();
      if (res && res.data) {
        setSavedTaxGroups(res.data);
      }
    } catch (err) {
      console.error('Error loading tax groups for work master dropdown:', err);
    } finally {
      setLoadingTaxGroups(false);
    }
  };

  // Fetch all saved Tax Masters to populate Type of Work options
  const fetchTaxMasters = async (isInitial = false) => {
    try {
      if (isInitial || savedTaxMasters.length === 0) {
        setLoadingTaxMasters(true);
      }
      const res = await taxDetailApi.getAll();
      if (res && res.data) {
        setSavedTaxMasters(res.data);
      }
    } catch (err) {
      console.error('Error loading tax masters for work master dropdown:', err);
    } finally {
      setLoadingTaxMasters(false);
    }
  };

  useEffect(() => {
    fetchTaxGroups(true);
    fetchTaxMasters(true);
  }, []);

  // When editingRecord changes, populate the form
  useEffect(() => {
    if (editingRecord) {
      setIsExpanded(true);
      setFormData({
        workName: editingRecord.workName || '',
        taxGroup: editingRecord.taxGroup || '',
        taxGroupId: editingRecord.taxGroupId || null,
        typeOfWork: editingRecord.typeOfWork || '',
        taxDetailId: editingRecord.taxDetailId || null,
      });
      setErrors({});
      setFeedback({ type: '', message: '' });

      if (editingRecord.taxDetailId) {
        fetchTaxDetailById(editingRecord.taxDetailId);
      } else if (editingRecord.typeOfWork && savedTaxMasters.length > 0) {
        const found = savedTaxMasters.find(
          (t) =>
            (t.taxGroup && t.taxGroup.toLowerCase() === editingRecord.typeOfWork.toLowerCase()) ||
            t.description.toLowerCase() === editingRecord.typeOfWork.toLowerCase()
        );
        if (found) {
          fetchTaxDetailById(found.id);
        }
      }
    }
  }, [editingRecord, savedTaxMasters]);

  const fetchTaxDetailById = async (id) => {
    try {
      setLoadingTaxDetail(true);
      const res = await taxDetailApi.getById(id);
      if (res && res.data) {
        setSelectedTaxDetail(res.data);
      }
    } catch (err) {
      console.error('Error fetching tax detail:', err);
      const local = savedTaxMasters.find((t) => t.id === Number(id));
      if (local) setSelectedTaxDetail(local);
    } finally {
      setLoadingTaxDetail(false);
    }
  };

  const handleWorkNameChange = (val) => {
    setFormData((prev) => ({ ...prev, workName: val }));
    if (errors.workName) {
      setErrors((prev) => ({ ...prev, workName: '' }));
    }
    if (feedback.message) {
      setFeedback({ type: '', message: '' });
    }
  };

  const handleTypeOfWorkChange = (e) => {
    const selectedVal = e.target.value;
    if (errors.typeOfWork) {
      setErrors((prev) => ({ ...prev, typeOfWork: '' }));
    }
    if (feedback.message) {
      setFeedback({ type: '', message: '' });
    }

    const matchingTax = savedTaxMasters.find(
      (t) => (t.taxGroup || '') === selectedVal || t.description === selectedVal || String(t.id) === selectedVal
    );
    if (matchingTax) {
      const taxName = matchingTax.taxGroup || matchingTax.description;
      setFormData((prev) => ({
        ...prev,
        typeOfWork: taxName,
        taxDetailId: matchingTax.id,
        taxGroup: matchingTax.taxGroup || '',
        taxGroupId: matchingTax.taxGroupId || null,
      }));
      // Fetch full details of that tax master
      fetchTaxDetailById(matchingTax.id);
    } else {
      setFormData((prev) => ({
        ...prev,
        typeOfWork: selectedVal,
        taxDetailId: null,
        taxGroup: '',
        taxGroupId: null,
      }));
      setSelectedTaxDetail(null);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.workName.trim()) {
      newErrors.workName = 'Work Name is required';
    }

    if (!formData.typeOfWork.trim()) {
      newErrors.typeOfWork = 'Please select a Tax Name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      if (editingRecord && editingRecord.id) {
        const res = await workMasterApi.update(editingRecord.id, formData);
        setFeedback({
          type: 'success',
          message: res.message || 'Work Master updated successfully!',
        });
        if (onRecordSaved) onRecordSaved(res.data, 'update');
      } else {
        const res = await workMasterApi.create(formData);
        setFeedback({
          type: 'success',
          message: res.message || 'Work Master created successfully!',
        });
        setFormData({ workName: '', taxGroup: '', taxGroupId: null, typeOfWork: '', taxDetailId: null });
        setSelectedTaxDetail(null);
        if (onRecordSaved) onRecordSaved(res.data, 'create');
      }

      setTimeout(() => {
        setFeedback((prev) => (prev.type === 'success' ? { type: '', message: '' } : prev));
      }, 4000);
    } catch (err) {
      console.error('API Error:', err);
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.errors?.join(', ') ||
        'Failed to save Work Master. Please check backend connection.';
      setFeedback({
        type: 'error',
        message: serverMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ workName: '', taxGroup: '', taxGroupId: null, typeOfWork: '', taxDetailId: null });
    setSelectedTaxDetail(null);
    setErrors({});
    setFeedback({ type: '', message: '' });
    if (editingRecord && onCancelEdit) {
      onCancelEdit();
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

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all duration-200">
      {/* Card Header with Expand/Collapse */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer select-none border-b border-transparent"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0066f5] border border-blue-200/60 flex items-center justify-center">
            <Briefcase className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                {editingRecord ? 'Edit Work Master' : 'Add Work Master Item'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-normal">
              Allocate work names and link statutory Tax Names with compliance schedules.
            </p>
          </div>
        </div>
        <div className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-blue-600 stroke-[2.2]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400 stroke-[2.2]" />
          )}
        </div>
      </button>

      {/* Form Content */}
      {isExpanded && (
        <form onSubmit={handleSubmit} className="px-5 pb-5 pt-3.5 border-t border-slate-100">
          {/* Notification Feedback Banner */}
          {feedback.message && (
            <div
              className={`mb-4 p-3 rounded-lg flex items-center gap-2.5 text-xs sm:text-sm font-medium ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                  : 'bg-rose-50 text-rose-800 border border-rose-200/80'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* 2 Main Inputs in Responsive Grid */}
            <div className="grid grid-cols-12 gap-3.5">
              {/* Field 1: Work Name */}
              <div className="col-span-12 sm:col-span-6">
                <label
                  htmlFor="workName"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Work Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="workName"
                  type="text"
                  value={formData.workName}
                  onChange={(e) => handleWorkNameChange(e.target.value)}
                  placeholder="e.g. Audit & Tax Filing"
                  className={`w-full h-10 px-3.5 text-sm rounded-lg border bg-white text-slate-800 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 ${
                    errors.workName
                      ? 'border-rose-400 focus:ring-rose-100 focus:border-rose-500'
                      : 'border-slate-300 focus:ring-blue-100 focus:border-[#0066f5]'
                  }`}
                />
                {errors.workName && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">{errors.workName}</p>
                )}
              </div>

              {/* Field 2: Tax Name (Linked Tax Master) */}
              <div className="col-span-12 sm:col-span-6">
                <label
                  htmlFor="typeOfWork"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Tax Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="typeOfWork"
                    value={formData.typeOfWork}
                    onFocus={() => fetchTaxMasters(false)}
                    onChange={handleTypeOfWorkChange}
                    className={`w-full h-10 px-3.5 pr-10 text-sm rounded-lg border bg-white appearance-none transition-all focus:outline-none focus:ring-2 cursor-pointer ${
                      !formData.typeOfWork ? 'text-slate-400 font-medium' : 'text-slate-900 font-semibold'
                    } ${
                      errors.typeOfWork
                        ? 'border-rose-400 focus:ring-rose-100 focus:border-rose-500'
                        : 'border-slate-300 focus:ring-blue-100 focus:border-[#0066f5]'
                    }`}
                  >
                    <option value="">Select Tax Name</option>
                    {savedTaxMasters.map((tax) => (
                      <option key={tax.id} value={tax.taxGroup || tax.description}>
                        {tax.taxGroup || tax.description}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
                {errors.typeOfWork && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">{errors.typeOfWork}</p>
                )}
              </div>
            </div>

            {/* FULL DETAILS CARD: Shows ALL Tax Master Fields with clear titles */}
            {loadingTaxDetail ? (
              <div className="p-3 bg-blue-50/50 border border-blue-200/60 rounded-lg flex items-center justify-center gap-2 text-xs text-blue-700">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Loading Tax Master specifications...</span>
              </div>
            ) : selectedTaxDetail ? (
              <div className="bg-slate-50/80 border border-blue-200/80 rounded-xl p-4 shadow-2xs transition-all duration-200 space-y-3">
                {/* Header: Tax Name & Frequency */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/70">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      Linked Schedule Details
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 shadow-2xs">
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      <span>{selectedTaxDetail.taxGroup || selectedTaxDetail.description}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Frequency:
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold bg-white text-blue-700 border border-blue-200 shadow-2xs">
                      <Repeat className="w-3 h-3 text-blue-600" />
                      <span>{selectedTaxDetail.frequency || 'Monthly'}</span>
                    </span>
                  </div>
                </div>

                {/* 1. Task Description */}
                <div className="bg-white p-3 rounded-lg border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Task Description
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 break-words leading-relaxed pl-5">
                    {selectedTaxDetail.description || '—'}
                  </p>
                </div>

                {/* 2. Grid of 4 Date Attributes */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                  {/* Period (From – To) */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                    <div className="flex items-center gap-1 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        Period (From – To)
                      </span>
                    </div>
                    <span className="text-slate-800 font-semibold text-xs block pl-4.5">
                      {formatDate(selectedTaxDetail.dateFrom)} – {formatDate(selectedTaxDetail.dateTo)}
                      {selectedTaxDetail.timeFrom && selectedTaxDetail.timeTo && (
                        <span className="text-slate-500 text-[11px] block mt-0.5">
                          ({selectedTaxDetail.timeFrom} – {selectedTaxDetail.timeTo})
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Submission Date */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                    <div className="flex items-center gap-1 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        Submission Date
                      </span>
                    </div>
                    <span className="text-slate-800 font-semibold text-xs block pl-4.5">
                      {formatDate(selectedTaxDetail.submissionDate)}
                    </span>
                  </div>

                  {/* Reconciliation Date */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                    <div className="flex items-center gap-1 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        Reconciliation Date
                      </span>
                    </div>
                    <span className="text-slate-800 font-semibold text-xs block pl-4.5">
                      {formatDate(selectedTaxDetail.reconciliationDate)}
                    </span>
                  </div>

                  {/* Extend Date */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                    <div className="flex items-center gap-1 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-rose-500" />
                      <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        Extend Date
                      </span>
                    </div>
                    <span className="text-slate-800 font-semibold text-xs block pl-4.5">
                      {formatDate(selectedTaxDetail.extendDate)}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Action Buttons: Save & Cancel */}
          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="h-9 px-4 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-9 px-5 text-xs font-semibold text-white bg-[#0066f5] hover:bg-[#0057d2] active:bg-[#004fc2] rounded-lg shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingRecord ? 'Update' : 'Save'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default WorkMasterForm;
