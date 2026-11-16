import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  ChevronUp,
  ChevronDown,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CalendarClock,
  FolderTree,
  Tag,
  Sparkles,
  Info,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { taxDetailApi, taxGroupApi } from '../services/api';

const FREQUENCY_OPTIONS = ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'];

const TaxDetailForm = ({ onRecordSaved, editingRecord, onCancelEdit }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [savedTaxGroups, setSavedTaxGroups] = useState([]);
  const [loadingTaxGroups, setLoadingTaxGroups] = useState(false);

  const [formData, setFormData] = useState({
    taxGroup: '',
    taxGroupId: null,
    description: '',
    frequency: '',
    dateFrom: '',
    dateTo: '',
    submissionDate: '',
    reconciliationDate: '',
    extendDate: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const dateFromRef = useRef(null);
  const dateToRef = useRef(null);
  const submissionDateRef = useRef(null);
  const reconciliationDateRef = useRef(null);
  const extendDateRef = useRef(null);

  // Fetch all saved Tax Groups
  const fetchTaxGroups = async () => {
    try {
      setLoadingTaxGroups(true);
      const res = await taxGroupApi.getAll();
      if (res && res.data) {
        setSavedTaxGroups(res.data);
      }
    } catch (err) {
      console.error('Error fetching tax groups for tax master dropdown:', err);
    } finally {
      setLoadingTaxGroups(false);
    }
  };

  useEffect(() => {
    fetchTaxGroups();
  }, []);

  // When editingRecord changes, populate the form
  useEffect(() => {
    if (editingRecord) {
      setIsExpanded(true);
      setFormData({
        taxGroup: editingRecord.taxGroup || '',
        taxGroupId: editingRecord.taxGroupId || null,
        description: editingRecord.description || '',
        frequency: editingRecord.frequency || '',
        dateFrom: editingRecord.dateFrom
          ? editingRecord.dateFrom.split('T')[0]
          : editingRecord.timeFrom || '',
        dateTo: editingRecord.dateTo
          ? editingRecord.dateTo.split('T')[0]
          : editingRecord.timeTo || '',
        submissionDate: editingRecord.submissionDate ? editingRecord.submissionDate.split('T')[0] : '',
        reconciliationDate: editingRecord.reconciliationDate ? editingRecord.reconciliationDate.split('T')[0] : '',
        extendDate: editingRecord.extendDate ? editingRecord.extendDate.split('T')[0] : '',
      });
      setErrors({});
      setFeedback({ type: '', message: '' });
    }
  }, [editingRecord]);

  const handleTaxGroupChange = (taxName) => {
    const matched = savedTaxGroups.find((tg) => tg.taxName === taxName);
    setFormData((prev) => ({
      ...prev,
      taxGroup: taxName,
      taxGroupId: matched ? matched.id : null,
    }));
    if (errors.taxGroup) {
      setErrors((prev) => ({ ...prev, taxGroup: '' }));
    }
    if (feedback.message) {
      setFeedback({ type: '', message: '' });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (feedback.message) {
      setFeedback({ type: '', message: '' });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.taxGroup.trim()) {
      newErrors.taxGroup = 'Please select a Tax first';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.frequency) {
      newErrors.frequency = 'Please select a frequency';
    } else if (!FREQUENCY_OPTIONS.includes(formData.frequency)) {
      newErrors.frequency = 'Invalid frequency option selected';
    }

    if (!formData.dateFrom) {
      newErrors.dateFrom = 'From Date is required';
    } else if (isNaN(new Date(formData.dateFrom).getTime())) {
      newErrors.dateFrom = 'Invalid From Date';
    }

    if (!formData.dateTo) {
      newErrors.dateTo = 'To Date is required';
    } else if (isNaN(new Date(formData.dateTo).getTime())) {
      newErrors.dateTo = 'Invalid To Date';
    }

    if (!formData.submissionDate) {
      newErrors.submissionDate = 'Submission Date is required';
    } else if (isNaN(new Date(formData.submissionDate).getTime())) {
      newErrors.submissionDate = 'Invalid Submission Date';
    }

    if (!formData.reconciliationDate) {
      newErrors.reconciliationDate = 'Reconciliation Date is required';
    } else if (isNaN(new Date(formData.reconciliationDate).getTime())) {
      newErrors.reconciliationDate = 'Invalid Reconciliation Date';
    }

    if (!formData.extendDate) {
      newErrors.extendDate = 'Extend Date is required';
    } else if (isNaN(new Date(formData.extendDate).getTime())) {
      newErrors.extendDate = 'Invalid Extend Date';
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
        const res = await taxDetailApi.update(editingRecord.id, formData);
        setFeedback({
          type: 'success',
          message: res.message || 'Tax Master details updated successfully!',
        });
        if (onRecordSaved) onRecordSaved(res.data, 'update');
      } else {
        const res = await taxDetailApi.create(formData);
        setFeedback({
          type: 'success',
          message: res.message || 'Tax Master details saved successfully!',
        });
        // Keep taxGroup selected so user can quickly add another task under it if desired
        setFormData((prev) => ({
          ...prev,
          description: '',
          frequency: '',
          dateFrom: '',
          dateTo: '',
          submissionDate: '',
          reconciliationDate: '',
          extendDate: '',
        }));
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
        'Failed to save Tax Master. Please check backend connection.';
      setFeedback({
        type: 'error',
        message: serverMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      taxGroup: '',
      taxGroupId: null,
      description: '',
      frequency: '',
      dateFrom: '',
      dateTo: '',
      submissionDate: '',
      reconciliationDate: '',
      extendDate: '',
    });
    setErrors({});
    setFeedback({ type: '', message: '' });
    if (editingRecord && onCancelEdit) {
      onCancelEdit();
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06)] overflow-hidden transition-all duration-200">
      {/* Card Header with Expand/Collapse */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50/60 transition-colors cursor-pointer select-none border-b border-transparent"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0066f5] border border-blue-200/60 flex items-center justify-center shadow-2xs">
            <CalendarClock className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                {editingRecord ? 'Edit Tax Master Task' : 'Add Tax Master Task'}
              </h2>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/70">
                Compliance Schedule
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Select a Tax Group to configure its statutory filing intervals, submission target dates, and extended deadlines.
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
        <form onSubmit={handleSubmit} className="px-7 pb-7 pt-5 border-t border-slate-100">
          {/* Feedback banner */}
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

          <div className="space-y-5">
            {/* 1. PRIMARY TAX SELECTOR (Select a Tax from saved Tax Groups) */}
            <div className="p-4 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 rounded-2xl border border-blue-200/80 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <label
                  htmlFor="taxGroup"
                  className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2"
                >
                  <FolderTree className="w-4 h-4 text-blue-600" />
                  <span>Select Tax (Tax Group)</span>
                  <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500 font-medium">
                  Loads all saved taxes from Tax Group master
                </span>
              </div>

              <div className="relative">
                <select
                  id="taxGroup"
                  value={formData.taxGroup}
                  onFocus={fetchTaxGroups}
                  onChange={(e) => handleTaxGroupChange(e.target.value)}
                  className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-white appearance-none transition-all focus:outline-none focus:ring-2 cursor-pointer ${
                    !formData.taxGroup ? 'text-slate-400' : 'text-slate-900 font-bold'
                  } ${
                    errors.taxGroup
                      ? 'border-rose-400 focus:ring-rose-100 focus:border-rose-500'
                      : 'border-slate-300 focus:ring-blue-100 focus:border-[#0066f5]'
                  }`}
                >
                  <option value="" disabled>
                    {loadingTaxGroups
                      ? 'Loading Saved Tax Groups...'
                      : savedTaxGroups.length === 0
                      ? 'No Tax Groups found (Please add in Tax Group master first)'
                      : 'Select a Tax'}
                  </option>
                  {savedTaxGroups.map((tg) => (
                    <option key={tg.id} value={tg.taxName} className="text-slate-900 font-semibold py-1">
                      {tg.taxName}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              {errors.taxGroup && (
                <p className="mt-1.5 text-xs text-rose-600 font-semibold">{errors.taxGroup}</p>
              )}
            </div>

            {/* 2. DYNAMIC FORM UNFOLDING:
                If no Tax Group is selected yet, show an inviting prompt with quick selection chips.
                When a Tax Group is selected, smoothly unfold the complete 6-field details form! */}
            {!formData.taxGroup ? (
              <div className="py-8 px-6 bg-slate-50/60 rounded-2xl border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center gap-2.5 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center shadow-2xs">
                  <FolderTree className="w-6 h-6 stroke-[1.8]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Select a Tax above to configure its details
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    Choose any saved Tax from the dropdown above to open this details form for that tax, or click one of the available taxes below:
                  </p>
                </div>

                {/* Quick Selection Chips from saved Tax Groups */}
                {savedTaxGroups.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                    {savedTaxGroups.map((tg) => (
                      <button
                        key={tg.id}
                        type="button"
                        onClick={() => handleTaxGroupChange(tg.taxName)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-98"
                      >
                        <Tag className="w-3.5 h-3.5 text-blue-500" />
                        <span>{tg.taxName}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* THE DETAILS FORM: Opens directly under the selected Tax Group */
              <div className="space-y-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Active Context Banner */}
                <div className="px-4 py-2.5 bg-blue-50/80 border border-blue-200/70 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    <span className="text-xs text-slate-600 font-medium">
                      Configuring details for:
                    </span>
                    <span className="text-xs font-bold text-blue-900 bg-white px-2.5 py-0.5 rounded-lg border border-blue-200/80 shadow-2xs">
                      {formData.taxGroup}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-700">
                    Tax Details Form Active
                  </span>
                </div>

                {/* Field 1: Description */}
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <label
                    htmlFor="description"
                    className="w-44 text-sm font-bold text-slate-800 mb-1.5 sm:mb-0"
                  >
                    Description
                  </label>
                  <div className="flex-1">
                    <input
                      id="description"
                      type="text"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter Description"
                      className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-white text-slate-800 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 ${
                        errors.description
                          ? 'border-rose-400 focus:ring-rose-100 focus:border-rose-500'
                          : 'border-slate-200/90 focus:ring-blue-100 focus:border-[#0066f5]'
                      }`}
                    />
                    {errors.description && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{errors.description}</p>
                    )}
                  </div>
                </div>

                {/* Field 2: Frequency */}
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <label
                    htmlFor="frequency"
                    className="w-44 text-sm font-bold text-slate-800 mb-1.5 sm:mb-0"
                  >
                    Frequency
                  </label>
                  <div className="flex-1 relative">
                    <select
                      id="frequency"
                      value={formData.frequency}
                      onChange={(e) => handleInputChange('frequency', e.target.value)}
                      className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-white appearance-none transition-all focus:outline-none focus:ring-2 cursor-pointer ${
                        !formData.frequency ? 'text-slate-400' : 'text-slate-800 font-medium'
                      } ${
                        errors.frequency
                          ? 'border-rose-400 focus:ring-rose-100 focus:border-rose-500'
                          : 'border-slate-200/90 focus:ring-blue-100 focus:border-[#0066f5]'
                      }`}
                    >
                      <option value="" disabled>
                        Enter Frequency
                      </option>
                      {FREQUENCY_OPTIONS.map((freq) => (
                        <option key={freq} value={freq} className="text-slate-800 font-normal">
                          {freq}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                    {errors.frequency && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{errors.frequency}</p>
                    )}
                  </div>
                </div>

                {/* Field 3: Date (From - To) */}
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <label className="w-44 text-sm font-bold text-slate-800 mb-1.5 sm:mb-0">
                    Date (From - To)
                  </label>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* From Date */}
                    <div className="relative">
                      <input
                        ref={dateFromRef}
                        type="date"
                        id="dateFrom"
                        value={formData.dateFrom}
                        onChange={(e) => handleInputChange('dateFrom', e.target.value)}
                        className={`w-full pl-4 pr-11 py-2.5 text-sm rounded-xl border bg-white transition-all focus:outline-none focus:ring-2 cursor-pointer ${
                          !formData.dateFrom ? 'text-slate-400' : 'text-slate-800 font-medium'
                        } ${
                          errors.dateFrom
                            ? 'border-rose-400 focus:ring-rose-100 focus:border-rose-500'
                            : 'border-slate-200/90 focus:ring-blue-100 focus:border-[#0066f5]'
                        }`}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => dateFromRef.current?.showPicker?.() || dateFromRef.current?.focus()}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#0066f5] cursor-pointer"
                        aria-label="Select From Date"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                      {errors.dateFrom && (
                        <p className="mt-1 text-xs text-rose-600 font-medium">{errors.dateFrom}</p>
                      )}
                    </div>

                    {/* To Date */}
                    <div className="relative">
                      <input
                        ref={dateToRef}
                        type="date"
                        id="dateTo"
                        value={formData.dateTo}
                        onChange={(e) => handleInputChange('dateTo', e.target.value)}
                        className={`w-full pl-4 pr-11 py-2.5 text-sm rounded-xl border bg-white transition-all focus:outline-none focus:ring-2 cursor-pointer ${
                          !formData.dateTo ? 'text-slate-400' : 'text-slate-800 font-medium'
                        } ${
                          errors.dateTo
                            ? 'border-rose-400 focus:ring-rose-100 focus:border-rose-500'
                            : 'border-slate-200/90 focus:ring-blue-100 focus:border-[#0066f5]'
                        }`}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => dateToRef.current?.showPicker?.() || dateToRef.current?.focus()}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#0066f5] cursor-pointer"
                        aria-label="Select To Date"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                      {errors.dateTo && (
                        <p className="mt-1 text-xs text-rose-600 font-medium">{errors.dateTo}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Field 4: Submission Date */}
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <label
                    htmlFor="submissionDate"
                    className="w-44 text-sm font-bold text-slate-800 mb-1.5 sm:mb-0"
                  >
                    Submission Date
                  </label>
                  <div className="flex-1 relative">
                    <input
                      ref={submissionDateRef}
                      type="date"
                      id="submissionDate"
                      value={formData.submissionDate}
                      onChange={(e) => handleInputChange('submissionDate', e.target.value)}
                      className={`w-full pl-4 pr-11 py-2.5 text-sm rounded-xl border bg-white transition-all focus:outline-none focus:ring-2 cursor-pointer ${
                        !formData.submissionDate ? 'text-slate-400' : 'text-slate-800 font-medium'
                      } ${
                        errors.submissionDate
                          ? 'border-rose-400 focus:ring-rose-100 focus:border-rose-500'
                          : 'border-slate-200/90 focus:ring-blue-100 focus:border-[#0066f5]'
                      }`}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => submissionDateRef.current?.showPicker?.() || submissionDateRef.current?.focus()}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#0066f5] cursor-pointer"
                      aria-label="Select Submission Date"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                    {errors.submissionDate && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{errors.submissionDate}</p>
                    )}
                  </div>
                </div>

                {/* Field 5: Reconciliation Date */}
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <label
                    htmlFor="reconciliationDate"
                    className="w-44 text-sm font-bold text-slate-800 mb-1.5 sm:mb-0"
                  >
                    Reconciliation Date
                  </label>
                  <div className="flex-1 relative">
                    <input
                      ref={reconciliationDateRef}
                      type="date"
                      id="reconciliationDate"
                      value={formData.reconciliationDate}
                      onChange={(e) => handleInputChange('reconciliationDate', e.target.value)}
                      className={`w-full pl-4 pr-11 py-2.5 text-sm rounded-xl border bg-white transition-all focus:outline-none focus:ring-2 cursor-pointer ${
                        !formData.reconciliationDate ? 'text-slate-400' : 'text-slate-800 font-medium'
                      } ${
                        errors.reconciliationDate
                          ? 'border-rose-400 focus:ring-rose-100 focus:border-rose-500'
                          : 'border-slate-200/90 focus:ring-blue-100 focus:border-[#0066f5]'
                      }`}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => reconciliationDateRef.current?.showPicker?.() || reconciliationDateRef.current?.focus()}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#0066f5] cursor-pointer"
                      aria-label="Select Reconciliation Date"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                    {errors.reconciliationDate && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{errors.reconciliationDate}</p>
                    )}
                  </div>
                </div>

                {/* Field 6: Extend Date */}
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <label
                    htmlFor="extendDate"
                    className="w-44 text-sm font-bold text-slate-800 mb-1.5 sm:mb-0"
                  >
                    Extend Date
                  </label>
                  <div className="flex-1 relative">
                    <input
                      ref={extendDateRef}
                      type="date"
                      id="extendDate"
                      value={formData.extendDate}
                      onChange={(e) => handleInputChange('extendDate', e.target.value)}
                      className={`w-full pl-4 pr-11 py-2.5 text-sm rounded-xl border bg-white transition-all focus:outline-none focus:ring-2 cursor-pointer ${
                        !formData.extendDate ? 'text-slate-400' : 'text-slate-800 font-medium'
                      } ${
                        errors.extendDate
                          ? 'border-rose-400 focus:ring-rose-100 focus:border-rose-500'
                          : 'border-slate-200/90 focus:ring-blue-100 focus:border-[#0066f5]'
                      }`}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => extendDateRef.current?.showPicker?.() || extendDateRef.current?.focus()}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#0066f5] cursor-pointer"
                      aria-label="Select Extend Date"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                    {errors.extendDate && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{errors.extendDate}</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons: Save & Cancel */}
                <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-end gap-3">
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
              </div>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default TaxDetailForm;