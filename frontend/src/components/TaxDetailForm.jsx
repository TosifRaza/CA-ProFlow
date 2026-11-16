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
      console.error('Error fetching tax groups for tax master dropdown:', err);
    } finally {
      setLoadingTaxGroups(false);
    }
  };

  useEffect(() => {
    fetchTaxGroups(true);
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
    if (!taxName) {
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
      if (feedback.message) {
        setFeedback({ type: '', message: '' });
      }
      return;
    }
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
        if (onRecordSaved) onRecordSaved(res.data, 'update');
      } else {
        const res = await taxDetailApi.create(formData);
        setFeedback({
          type: 'success',
          message: res.message || 'Tax Master details saved successfully!',
        });
        // Automatically reset to "Select a Tax" so that details form closes
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
            <CalendarClock className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                {editingRecord ? 'Edit Tax Master Task' : 'Add Tax Master Task'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-normal">
              Configure statutory filing periods, target dates, and extended deadlines under each Tax Group.
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
          {/* Feedback banner */}
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
            {/* 1. PRIMARY TAX SELECTOR (Select a Tax from saved Tax Groups) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="taxGroup"
                  className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
                >
                  <FolderTree className="w-3.5 h-3.5 text-blue-600" />
                  <span>Select Tax (Tax Group)</span>
                  <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {savedTaxGroups.length} Tax Group{savedTaxGroups.length === 1 ? '' : 's'} available
                </span>
              </div>

              <div className="relative">
                <select
                  id="taxGroup"
                  value={formData.taxGroup}
                  onFocus={() => fetchTaxGroups(false)}
                  onChange={(e) => handleTaxGroupChange(e.target.value)}
                  className={`w-full h-10 px-3.5 pr-10 text-sm rounded-lg border bg-white appearance-none transition-all focus:outline-none focus:ring-2 cursor-pointer ${
                    !formData.taxGroup ? 'text-slate-400 font-medium' : 'text-slate-900 font-semibold'
                  } ${
                    errors.taxGroup
                      ? 'border-rose-400 focus:ring-rose-100 focus:border-rose-500'
                      : 'border-slate-300 focus:ring-blue-100 focus:border-[#0066f5]'
                  }`}
                >
                  <option value="">Select a Tax</option>
                  {savedTaxGroups.map((tg) => (
                    <option key={tg.id} value={tg.taxName} className="text-slate-900 font-normal">
                      {tg.taxName}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              {errors.taxGroup && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.taxGroup}</p>
              )}
            </div>

            {/* 2. DYNAMIC FORM UNFOLDING */}
            {!formData.taxGroup ? (
              <div className="py-5 px-4 bg-slate-50/70 rounded-xl border border-dashed border-slate-200 text-center flex flex-col items-center justify-center gap-1.5 transition-all">
                <p className="text-xs sm:text-sm font-medium text-slate-600">
                  Select a <span className="font-semibold text-slate-800">Tax</span> above to enter or configure its statutory schedule details.
                </p>
                {savedTaxGroups.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1.5">
                    <span className="text-[11px] text-slate-400">Quick select:</span>
                    {savedTaxGroups.map((tg) => (
                      <button
                        key={tg.id}
                        type="button"
                        onClick={() => handleTaxGroupChange(tg.taxName)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 text-xs font-medium shadow-2xs transition-all cursor-pointer"
                      >
                        <span>{tg.taxName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* THE DETAILS FORM: 2-Row / 3-Column Responsive Grid */
              <div className="space-y-4 pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
                {/* Active Context Banner */}
                <div className="px-3.5 py-2 bg-blue-50/70 border border-blue-200/60 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    <span className="text-xs text-slate-600 font-medium">Configuring details for:</span>
                    <span className="text-xs font-bold text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-200 shadow-2xs">
                      {formData.taxGroup}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-700">
                    Active Tax Details
                  </span>
                </div>

                {/* Grid of 6 Fields */}
                <div className="grid grid-cols-12 gap-3.5">
                  {/* Field 1: Description (8 cols) */}
                  <div className="col-span-12 sm:col-span-8">
                    <label
                      htmlFor="description"
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Task Description <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="description"
                      type="text"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="e.g. GST Annual Return Filing (GSTR-9)"
                      className={`w-full h-10 px-3.5 text-sm rounded-lg border bg-white text-slate-800 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 ${
                        errors.description
                          ? 'border-rose-400 focus:ring-rose-100 focus:border-rose-500'
                          : 'border-slate-300 focus:ring-blue-100 focus:border-[#0066f5]'
                      }`}
                    />
                    {errors.description && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{errors.description}</p>
                    )}
                  </div>

                  {/* Field 2: Frequency (4 cols) */}
                  <div className="col-span-12 sm:col-span-4">
                    <label
                      htmlFor="frequency"
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Frequency <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="frequency"
                        value={formData.frequency}
                        onChange={(e) => handleInputChange('frequency', e.target.value)}
                        className={`w-full h-10 px-3.5 pr-10 text-sm rounded-lg border bg-white appearance-none transition-all focus:outline-none focus:ring-2 cursor-pointer ${
                          !formData.frequency ? 'text-slate-400' : 'text-slate-800 font-medium'
                        } ${
                          errors.frequency
                            ? 'border-rose-400 focus:ring-rose-100 focus:border-rose-500'
                            : 'border-slate-300 focus:ring-blue-100 focus:border-[#0066f5]'
                        }`}
                      >
                        <option value="" disabled>
                          Select Frequency
                        </option>
                        {FREQUENCY_OPTIONS.map((freq) => (
                          <option key={freq} value={freq} className="text-slate-800 font-normal">
                            {freq}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                    {errors.frequency && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{errors.frequency}</p>
                    )}
                  </div>

                  {/* Field 3: Date (From) (6 cols) */}
                  <div className="col-span-12 sm:col-span-6">
                    <label
                      htmlFor="dateFrom"
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Period From <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        ref={dateFromRef}
                        type="date"
                        id="dateFrom"
                        value={formData.dateFrom}
                        onChange={(e) => handleInputChange('dateFrom', e.target.value)}
                        className={`w-full h-10 pl-3.5 pr-10 text-sm rounded-lg border bg-white transition-all focus:outline-none focus:ring-2 cursor-pointer ${
                          !formData.dateFrom ? 'text-slate-400' : 'text-slate-800 font-medium'
                        } ${
                          errors.dateFrom
                            ? 'border-rose-400 focus:ring-rose-100 focus:border-rose-500'
                            : 'border-slate-300 focus:ring-blue-100 focus:border-[#0066f5]'
                        }`}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => dateFromRef.current?.showPicker?.() || dateFromRef.current?.focus()}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#0066f5] cursor-pointer"
                        aria-label="Select Period From Date"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                    </div>
                    {errors.dateFrom && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{errors.dateFrom}</p>
                    )}
                  </div>

                  {/* Field 4: Date (To) (6 cols) */}
                  <div className="col-span-12 sm:col-span-6">
                    <label
                      htmlFor="dateTo"
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Period To <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        ref={dateToRef}
                        type="date"
                        id="dateTo"
                        value={formData.dateTo}
                        onChange={(e) => handleInputChange('dateTo', e.target.value)}
                        className={`w-full h-10 pl-3.5 pr-10 text-sm rounded-lg border bg-white transition-all focus:outline-none focus:ring-2 cursor-pointer ${
                          !formData.dateTo ? 'text-slate-400' : 'text-slate-800 font-medium'
                        } ${
                          errors.dateTo
                            ? 'border-rose-400 focus:ring-rose-100 focus:border-rose-500'
                            : 'border-slate-300 focus:ring-blue-100 focus:border-[#0066f5]'
                        }`}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => dateToRef.current?.showPicker?.() || dateToRef.current?.focus()}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#0066f5] cursor-pointer"
                        aria-label="Select Period To Date"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                    </div>
                    {errors.dateTo && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{errors.dateTo}</p>
                    )}
                  </div>

                  {/* Field 5: Submission Date (4 cols) */}
                  <div className="col-span-12 sm:col-span-4">
                    <label
                      htmlFor="submissionDate"
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Submission Date <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        ref={submissionDateRef}
                        type="date"
                        id="submissionDate"
                        value={formData.submissionDate}
                        onChange={(e) => handleInputChange('submissionDate', e.target.value)}
                        className={`w-full h-10 pl-3.5 pr-10 text-sm rounded-lg border bg-white transition-all focus:outline-none focus:ring-2 cursor-pointer ${
                          !formData.submissionDate ? 'text-slate-400' : 'text-slate-800 font-medium'
                        } ${
                          errors.submissionDate
                            ? 'border-rose-400 focus:ring-rose-100 focus:border-rose-500'
                            : 'border-slate-300 focus:ring-blue-100 focus:border-[#0066f5]'
                        }`}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => submissionDateRef.current?.showPicker?.() || submissionDateRef.current?.focus()}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#0066f5] cursor-pointer"
                        aria-label="Select Submission Date"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                    </div>
                    {errors.submissionDate && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{errors.submissionDate}</p>
                    )}
                  </div>

                  {/* Field 6: Reconciliation Date (4 cols) */}
                  <div className="col-span-12 sm:col-span-4">
                    <label
                      htmlFor="reconciliationDate"
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Reconciliation Date <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        ref={reconciliationDateRef}
                        type="date"
                        id="reconciliationDate"
                        value={formData.reconciliationDate}
                        onChange={(e) => handleInputChange('reconciliationDate', e.target.value)}
                        className={`w-full h-10 pl-3.5 pr-10 text-sm rounded-lg border bg-white transition-all focus:outline-none focus:ring-2 cursor-pointer ${
                          !formData.reconciliationDate ? 'text-slate-400' : 'text-slate-800 font-medium'
                        } ${
                          errors.reconciliationDate
                            ? 'border-rose-400 focus:ring-rose-100 focus:border-rose-500'
                            : 'border-slate-300 focus:ring-blue-100 focus:border-[#0066f5]'
                        }`}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => reconciliationDateRef.current?.showPicker?.() || reconciliationDateRef.current?.focus()}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#0066f5] cursor-pointer"
                        aria-label="Select Reconciliation Date"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                    </div>
                    {errors.reconciliationDate && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{errors.reconciliationDate}</p>
                    )}
                  </div>

                  {/* Field 7: Extend Date (4 cols) */}
                  <div className="col-span-12 sm:col-span-4">
                    <label
                      htmlFor="extendDate"
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Extend Date <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        ref={extendDateRef}
                        type="date"
                        id="extendDate"
                        value={formData.extendDate}
                        onChange={(e) => handleInputChange('extendDate', e.target.value)}
                        className={`w-full h-10 pl-3.5 pr-10 text-sm rounded-lg border bg-white transition-all focus:outline-none focus:ring-2 cursor-pointer ${
                          !formData.extendDate ? 'text-slate-400' : 'text-slate-800 font-medium'
                        } ${
                          errors.extendDate
                            ? 'border-rose-400 focus:ring-rose-100 focus:border-rose-500'
                            : 'border-slate-300 focus:ring-blue-100 focus:border-[#0066f5]'
                        }`}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => extendDateRef.current?.showPicker?.() || extendDateRef.current?.focus()}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#0066f5] cursor-pointer"
                        aria-label="Select Extend Date"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                    </div>
                    {errors.extendDate && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{errors.extendDate}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
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
                    <span>{editingRecord ? 'Update Task' : 'Save Task'}</span>
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