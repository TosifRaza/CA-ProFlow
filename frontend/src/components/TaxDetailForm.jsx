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
} from 'lucide-react';
import { taxDetailApi } from '../services/api';

const FREQUENCY_OPTIONS = ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'];

const TaxDetailForm = ({ onRecordSaved, editingRecord, onCancelEdit }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    if (editingRecord) {
      setIsExpanded(true);
      setFormData({
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
          message: res.message || 'Tax Master updated successfully!',
        });
        if (onRecordSaved) onRecordSaved(res.data, 'update');
      } else {
        const res = await taxDetailApi.create(formData);
        setFeedback({
          type: 'success',
          message: res.message || 'Tax Master created successfully!',
        });
        setFormData({
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
            <CalendarClock className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                {editingRecord ? 'Edit Tax Master' : 'Add Tax Master Task'}
              </h2>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/70">
                Compliance Schedule
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Specify statutory filing intervals, submission target dates, and extended deadlines.
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

          <div className="space-y-4">
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
                  id="submissionDate"
                  type="date"
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
                  id="reconciliationDate"
                  type="date"
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
                  id="extendDate"
                  type="date"
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
          </div>

          {/* Action Buttons */}
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

export default TaxDetailForm;
