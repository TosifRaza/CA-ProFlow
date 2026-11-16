import React, { useState, useEffect } from 'react';
import {
  Layers,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tag,
  Sparkles,
  Info,
  FolderPlus,
} from 'lucide-react';
import { taxGroupApi } from '../services/api';

const QUICK_PRESETS = [
  'Goods & Services Tax (GST)',
  'Direct Taxes & Income Tax',
  'Tax Deducted at Source (TDS)',
  'Customs & Excise Duty',
  'Professional Tax (PT)',
];

const TaxGroupForm = ({ onRecordSaved, editingRecord, onCancelEdit }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [formData, setFormData] = useState({
    taxName: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // If editingRecord changes, populate the form
  useEffect(() => {
    if (editingRecord) {
      setIsExpanded(true);
      setFormData({
        taxName: editingRecord.taxName || '',
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

  const handlePresetClick = (preset) => {
    setFormData((prev) => ({ ...prev, taxName: preset }));
    if (errors.taxName) {
      setErrors((prev) => ({ ...prev, taxName: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.taxName.trim()) {
      newErrors.taxName = 'Tax Name is required';
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
        // Update existing record (PUT)
        const res = await taxGroupApi.update(editingRecord.id, formData);
        setFeedback({
          type: 'success',
          message: res.message || 'Tax Group updated successfully!',
        });
        if (onRecordSaved) onRecordSaved(res.data, 'update');
      } else {
        // Create new record (POST)
        const res = await taxGroupApi.create(formData);
        setFeedback({
          type: 'success',
          message: res.message || 'Tax Group created successfully!',
        });
        setFormData({ taxName: '' });
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
        'Failed to save Tax Group. Please check backend connection.';
      setFeedback({
        type: 'error',
        message: serverMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ taxName: '' });
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
            <FolderPlus className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                {editingRecord ? 'Edit Tax Group' : 'Add New Tax Group'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-normal">
              Define top-level tax categories used across compliance filing and work workflows.
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

      {/* Card Body */}
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
            {/* Field: Tax Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="taxName"
                  className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5"
                >
                  <span>Tax Group Name</span>
                  <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  Required for statutory classification
                </span>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Tag className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  id="taxName"
                  type="text"
                  value={formData.taxName}
                  onChange={(e) => handleInputChange('taxName', e.target.value)}
                  placeholder="e.g. Goods & Services Tax (GST)"
                  className={`w-full h-10 pl-10 pr-3.5 text-sm rounded-lg border bg-white text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 ${
                    errors.taxName
                      ? 'border-rose-400 focus:ring-rose-100 focus:border-rose-500'
                      : 'border-slate-300 focus:ring-blue-100 focus:border-[#0066f5]'
                  }`}
                />
              </div>
              {errors.taxName && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.taxName}</p>
              )}
            </div>

            {/* Quick Presets / Suggestions */}
            <div>
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Quick Suggestions (Click to fill)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    className="text-xs px-2.5 py-1 rounded-md bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 font-medium transition-all duration-150 cursor-pointer shadow-2xs"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>
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
              <span>{editingRecord ? 'Update Tax Group' : 'Save Tax Group'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TaxGroupForm;