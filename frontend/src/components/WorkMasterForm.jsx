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
  const fetchTaxGroups = async () => {
    try {
      setLoadingTaxGroups(true);
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
  const fetchTaxMasters = async () => {
    try {
      setLoadingTaxMasters(true);
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
    fetchTaxGroups();
    fetchTaxMasters();
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
          (t) => t.description.toLowerCase() === editingRecord.typeOfWork.toLowerCase()
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

  const handleTaxGroupChange = (e) => {
    const selectedVal = e.target.value;
    if (errors.taxGroup) {
      setErrors((prev) => ({ ...prev, taxGroup: '' }));
    }
    if (feedback.message) {
      setFeedback({ type: '', message: '' });
    }

    const matchingGroup = savedTaxGroups.find((tg) => tg.taxName === selectedVal);
    setFormData((prev) => ({
      ...prev,
      taxGroup: selectedVal,
      taxGroupId: matchingGroup ? matchingGroup.id : null,
    }));
  };

  const handleTypeOfWorkChange = (e) => {
    const selectedVal = e.target.value;
    if (errors.typeOfWork) {
      setErrors((prev) => ({ ...prev, typeOfWork: '' }));
    }
    if (feedback.message) {
      setFeedback({ type: '', message: '' });
    }

    const matchingTax = savedTaxMasters.find((t) => t.description === selectedVal);
    if (matchingTax) {
      setFormData((prev) => ({
        ...prev,
        typeOfWork: matchingTax.description,
        taxDetailId: matchingTax.id,
        taxGroup: prev.taxGroup || matchingTax.taxGroup || '',
        taxGroupId: prev.taxGroupId || matchingTax.taxGroupId || null,
      }));
      // Fetch full details of that tax master
      fetchTaxDetailById(matchingTax.id);
    } else {
      setFormData((prev) => ({
        ...prev,
        typeOfWork: selectedVal,
        taxDetailId: null,
      }));
      setSelectedTaxDetail(null);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.workName.trim()) {
      newErrors.workName = 'Work Name is required';
    }

    if (!formData.taxGroup.trim()) {
      newErrors.taxGroup = 'Please select a Tax Group';
    }

    if (!formData.typeOfWork.trim()) {
      newErrors.typeOfWork = 'Please select a Tax Master for Type of Work';
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
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06)] overflow-hidden transition-all duration-200">
      {/* Card Header with Expand/Collapse */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50/60 transition-colors cursor-pointer select-none border-b border-transparent"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0066f5] border border-blue-200/60 flex items-center justify-center shadow-2xs">
            <Briefcase className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                {editingRecord ? 'Edit Work Master' : 'Add Work Master Item'}
              </h2>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/70">
                Work Workflow
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Allocate work names and link statutory Tax Groups with compliance schedules.
            </p>
          </div>
        </div>
        <div className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-blue-600 stroke-[2.2]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400 stroke-[2.2]" />
          )}
        </div>
      </button>

      {/* Form Content */}
      {isExpanded && (
        <form onSubmit={handleSubmit} className="px-7 pb-7 pt-4 border-t border-slate-100/80">
          {/* Notification Feedback Banner */}
          {feedback.message && (
            <div
              className={`mb-5 p-3.5 rounded-xl flex items-center gap-3 text-sm font-medium ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                  : 'bg-rose-50 text-rose-800 border border-rose-200/80'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Field 1: Work Name */}
            <div className="flex flex-col sm:flex-row sm:items-center">
              <label
                htmlFor="workName"
                className="w-36 text-sm font-bold text-slate-800 mb-1.5 sm:mb-0"
              >
                Work Name
              </label>
              <div className="flex-1">
                <input
                  id="workName"
                  type="text"
                  value={formData.workName}
                  onChange={(e) => handleWorkNameChange(e.target.value)}
                  placeholder="Enter Work Name"
                  className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-white text-slate-800 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 ${
                    errors.workName
                      ? 'border-rose-400 focus:ring-rose-100 focus:border-rose-500'
                      : 'border-slate-200/90 focus:ring-blue-100 focus:border-[#0066f5]'
                  }`}
                />
                {errors.workName && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">{errors.workName}</p>
                )}
              </div>
            </div>

            {/* Field 2: Tax Group (Shows all types of tax saved on Tax Group) */}
            <div className="flex flex-col sm:flex-row sm:items-center">
              <label
                htmlFor="taxGroup"
                className="w-36 text-sm font-bold text-slate-800 mb-1.5 sm:mb-0"
              >
                Tax Group
              </label>
              <div className="flex-1 relative">
                <select
                  id="taxGroup"
                  value={formData.taxGroup}
                  onFocus={fetchTaxGroups}
                  onChange={handleTaxGroupChange}
                  className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-white appearance-none transition-all focus:outline-none focus:ring-2 cursor-pointer ${
                    !formData.taxGroup ? 'text-slate-400' : 'text-slate-800 font-medium'
                  } ${
                    errors.taxGroup
                      ? 'border-rose-400 focus:ring-rose-100 focus:border-rose-500'
                      : 'border-slate-200/90 focus:ring-blue-100 focus:border-[#0066f5]'
                  }`}
                >
                  <option value="" disabled>
                    {loadingTaxGroups
                      ? 'Loading Saved Tax Groups...'
                      : savedTaxGroups.length === 0
                      ? 'No Tax Groups found (Please create in Tax Group first)'
                      : 'Select Tax Group'}
                  </option>

                  {/* ONLY Saved Tax Groups are shown */}
                  {savedTaxGroups.map((group) => (
                    <option key={group.id} value={group.taxName}>
                      {group.taxName}
                    </option>
                  ))}
                </select>

                <div className="pointer-events-none absolute top-3.5 right-0 flex items-center px-4 text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>

                {errors.taxGroup && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">{errors.taxGroup}</p>
                )}
              </div>
            </div>

            {/* Field 3: Type of Work (ONLY Saved Tax Masters) */}
            <div className="flex flex-col sm:flex-row sm:items-start">
              <label
                htmlFor="typeOfWork"
                className="w-36 text-sm font-bold text-slate-800 mb-1.5 sm:mb-0 sm:pt-2.5"
              >
                Type of Work
              </label>
              <div className="flex-1 relative">
                <select
                  id="typeOfWork"
                  value={formData.typeOfWork}
                  onFocus={fetchTaxMasters}
                  onChange={handleTypeOfWorkChange}
                  className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-white appearance-none transition-all focus:outline-none focus:ring-2 cursor-pointer ${
                    !formData.typeOfWork ? 'text-slate-400' : 'text-slate-800 font-medium'
                  } ${
                    errors.typeOfWork
                      ? 'border-rose-400 focus:ring-rose-100 focus:border-rose-500'
                      : 'border-slate-200/90 focus:ring-blue-100 focus:border-[#0066f5]'
                  }`}
                >
                  <option value="" disabled>
                    {loadingTaxMasters
                      ? 'Loading Saved Tax Masters...'
                      : savedTaxMasters.length === 0
                      ? 'No Tax Masters found (Please create in Tax Master first)'
                      : 'Select from Saved Tax Masters'}
                  </option>

                  {/* ONLY Saved Tax Masters are shown */}
                  {savedTaxMasters.map((tax) => (
                    <option key={tax.id} value={tax.description}>
                      {tax.description} {tax.taxGroup ? `(${tax.taxGroup})` : ''}
                    </option>
                  ))}
                </select>

                <div className="pointer-events-none absolute top-3.5 right-0 flex items-center px-4 text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>

                {errors.typeOfWork && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">{errors.typeOfWork}</p>
                )}
              </div>
            </div>

            {/* FULL DETAILS CARD: Shows ALL 6 Tax Master Fields with clear labels */}
            {loadingTaxDetail ? (
              <div className="sm:ml-36 p-4 bg-blue-50/50 border border-blue-200/60 rounded-xl flex items-center justify-center gap-2 text-xs text-blue-700">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Fetching full details of selected Tax Master...</span>
              </div>
            ) : selectedTaxDetail ? (
              <div className="sm:ml-36 bg-gradient-to-br from-blue-50/60 via-white to-slate-50 border border-blue-200/80 rounded-2xl p-5 shadow-xs transition-all duration-300">
                <div className="flex items-center justify-between pb-3.5 border-b border-blue-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        Tax Master Complete Details
                      </h4>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Live compliance task specifications
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {formData.taxGroup && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        {formData.taxGroup}
                      </span>
                    )}
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      {selectedTaxDetail.frequency || 'Monthly'}
                    </span>
                  </div>
                </div>

                {/* All 6 Attributes in Dedicated, Clearly Labeled Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-xs">
                  {/* 1. Description Box */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200/70 flex items-start gap-2.5 shadow-2xs">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                        Description
                      </span>
                      <span className="text-slate-900 font-bold text-xs truncate block">
                        {selectedTaxDetail.description}
                      </span>
                    </div>
                  </div>

                  {/* 2. Frequency Box */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200/70 flex items-start gap-2.5 shadow-2xs">
                    <Repeat className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                        Frequency
                      </span>
                      <span className="text-blue-700 font-bold text-xs">
                        {selectedTaxDetail.frequency || 'Monthly'}
                      </span>
                    </div>
                  </div>

                  {/* 3. Date (From - To) */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200/70 flex items-start gap-2.5 shadow-2xs">
                    <Calendar className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                        Date (From - To)
                      </span>
                      <span className="text-slate-800 font-bold text-xs">
                        {formatDate(selectedTaxDetail.dateFrom)} – {formatDate(selectedTaxDetail.dateTo)}
                      </span>
                    </div>
                  </div>

                  {/* 4. Submission Date */}
                  <div className="bg-white p-3 rounded-xl border border-emerald-200/60 flex items-start gap-2.5 shadow-2xs bg-emerald-50/20">
                    <Calendar className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-emerald-700 block text-[10px] font-bold uppercase tracking-wider">
                        Submission Date
                      </span>
                      <span className="text-emerald-800 font-bold text-xs">
                        {formatDate(selectedTaxDetail.submissionDate)}
                      </span>
                    </div>
                  </div>

                  {/* 5. Reconciliation Date */}
                  <div className="bg-white p-3 rounded-xl border border-amber-200/60 flex items-start gap-2.5 shadow-2xs bg-amber-50/20">
                    <Calendar className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-amber-700 block text-[10px] font-bold uppercase tracking-wider">
                        Reconciliation Date
                      </span>
                      <span className="text-amber-900 font-bold text-xs">
                        {formatDate(selectedTaxDetail.reconciliationDate)}
                      </span>
                    </div>
                  </div>

                  {/* 6. Extend Date */}
                  <div className="bg-white p-3 rounded-xl border border-rose-200/60 flex items-start gap-2.5 shadow-2xs bg-rose-50/20">
                    <Calendar className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-rose-700 block text-[10px] font-bold uppercase tracking-wider">
                        Extend Date
                      </span>
                      <span className="text-rose-900 font-bold text-xs">
                        {formatDate(selectedTaxDetail.extendDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Action Buttons: Save & Cancel */}
          <div className="mt-7 pt-5 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-[#0066f5] hover:bg-[#0057d2] active:bg-[#004fc2] rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{editingRecord ? 'Update' : 'Save'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default WorkMasterForm;
