import React, { useState, useEffect } from 'react';
import {
  Settings,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  PoundSterling,
  Clock,
  Info,
  Check,
} from 'lucide-react';
import {
  getAllBenefitConfigs,
  createBenefitConfig,
  updateBenefitConfig,
  deleteBenefitConfig,
} from '../services/benefitConfigApi';
import type {
  BenefitScoringConfig as BenefitScoringConfigType,
  CreateBenefitConfigData,
} from '../services/benefitConfigApi';
import toast from 'react-hot-toast';

export const BenefitScoringConfig: React.FC = () => {
  const [configs, setConfigs] = useState<BenefitScoringConfigType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    benefitType: '',
    displayName: '',
    valueFor100Points: 100000,
    valueUnit: 'GBP',
    timeDecayPerMonth: 5,
    description: '',
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const data = await getAllBenefitConfigs();
      setConfigs(data);
    } catch (error: any) {
      console.error('Failed to load benefit configs:', error);
      toast.error('Failed to load benefit configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      // Validation
      if (!formData.benefitType || !formData.displayName) {
        toast.error('Benefit type and display name are required');
        return;
      }

      const createData: CreateBenefitConfigData = {
        benefitType: formData.benefitType,
        displayName: formData.displayName,
        valueFor100Points: formData.valueFor100Points,
        valueUnit: formData.valueUnit,
        timeDecayPerMonth: formData.timeDecayPerMonth,
        description: formData.description || undefined,
      };

      await createBenefitConfig(createData);
      toast.success('Benefit config created successfully');
      setShowCreateForm(false);
      resetForm();
      loadConfigs();
    } catch (error: any) {
      console.error('Failed to create benefit config:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to create benefit config');
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      const config = configs.find((c) => c.id === id);
      if (!config) return;

      await updateBenefitConfig(id, {
        displayName: config.displayName,
        valueFor100Points: config.valueFor100Points,
        valueUnit: config.valueUnit,
        timeDecayPerMonth: config.timeDecayPerMonth,
        description: config.description || undefined,
      });

      toast.success('Benefit config updated successfully');
      setEditingId(null);
      loadConfigs();
    } catch (error: any) {
      console.error('Failed to update benefit config:', error);
      toast.error('Failed to update benefit config');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this benefit configuration?')) {
      return;
    }

    try {
      await deleteBenefitConfig(id);
      toast.success('Benefit config deleted successfully');
      loadConfigs();
    } catch (error: any) {
      console.error('Failed to delete benefit config:', error);
      toast.error('Failed to delete benefit config');
    }
  };

  const handleEdit = (id: number) => {
    setEditingId(id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    loadConfigs(); // Reload to reset any changes
  };

  const updateConfigField = (id: number, field: string, value: any) => {
    setConfigs(
      configs.map((config) =>
        config.id === id ? { ...config, [field]: value } : config
      )
    );
  };

  const resetForm = () => {
    setFormData({
      benefitType: '',
      displayName: '',
      valueFor100Points: 100000,
      valueUnit: 'GBP',
      timeDecayPerMonth: 5,
      description: '',
    });
  };

  const getUnitDisplay = (unit: string) => {
    switch (unit) {
      case 'GBP':
        return '£';
      case 'hours':
        return 'hours';
      case 'customers':
        return 'customers';
      default:
        return unit;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading configurations...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Settings className="w-8 h-8" />
            Benefit Scoring Configuration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure how benefit values are scored for priority calculation
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Benefit Type
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-900 dark:text-blue-100">
            <p className="font-semibold mb-1">How Scoring Works:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Value Score</strong>: (Raw Value / Value for 100 Points) × 100
              </li>
              <li>
                <strong>Time Score</strong>: 100 - (Timeline in Months × Time Decay)
              </li>
              <li>
                <strong>Combined Score</strong>: Value Score + Time Score
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border-2 border-blue-500">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Create New Benefit Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Benefit Type (Code) *
              </label>
              <input
                type="text"
                value={formData.benefitType}
                onChange={(e) => setFormData({ ...formData, benefitType: e.target.value })}
                placeholder="e.g., revenueImprovement"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Name *
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="e.g., Revenue Improvement"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Value for 100 Points
              </label>
              <input
                type="number"
                value={formData.valueFor100Points}
                onChange={(e) =>
                  setFormData({ ...formData, valueFor100Points: parseFloat(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Value Unit
              </label>
              <select
                value={formData.valueUnit}
                onChange={(e) => setFormData({ ...formData, valueUnit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="GBP">GBP (£)</option>
                <option value="hours">Hours</option>
                <option value="customers">Customers</option>
                <option value="users">Users</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time Decay (points per month)
              </label>
              <input
                type="number"
                value={formData.timeDecayPerMonth}
                onChange={(e) =>
                  setFormData({ ...formData, timeDecayPerMonth: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Create
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                resetForm();
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Configurations List */}
      <div className="space-y-4">
        {configs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No benefit configurations found. Click "Add Benefit Type" to create one.
            </p>
          </div>
        ) : (
          configs.map((config) => (
            <div
              key={config.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition"
            >
              {editingId === config.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Benefit Type: <span className="font-mono">{config.benefitType}</span>
                      </div>
                      <input
                        type="text"
                        value={config.displayName}
                        onChange={(e) => updateConfigField(config.id, 'displayName', e.target.value)}
                        className="text-xl font-semibold mb-2 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Value for 100 Points
                      </label>
                      <input
                        type="number"
                        value={config.valueFor100Points}
                        onChange={(e) =>
                          updateConfigField(config.id, 'valueFor100Points', parseFloat(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Unit
                      </label>
                      <select
                        value={config.valueUnit}
                        onChange={(e) => updateConfigField(config.id, 'valueUnit', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="GBP">GBP (£)</option>
                        <option value="hours">Hours</option>
                        <option value="customers">Customers</option>
                        <option value="users">Users</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Time Decay (pts/month)
                      </label>
                      <input
                        type="number"
                        value={config.timeDecayPerMonth}
                        onChange={(e) =>
                          updateConfigField(config.id, 'timeDecayPerMonth', parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={config.description || ''}
                      onChange={(e) => updateConfigField(config.id, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleUpdate(config.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {config.benefitType}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {config.displayName}
                      </h3>
                      {config.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {config.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(config.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(config.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                        <PoundSterling className="w-4 h-4" />
                        <span className="text-sm font-medium">Value for 100 Points</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {config.valueFor100Points.toLocaleString()} {getUnitDisplay(config.valueUnit)}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Time Decay</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        -{config.timeDecayPerMonth} pts/month
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Example:</div>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {getUnitDisplay(config.valueUnit) === '£' ? '£' : ''}
                        {(config.valueFor100Points / 10).toLocaleString()}
                        {getUnitDisplay(config.valueUnit) !== '£'
                          ? ` ${getUnitDisplay(config.valueUnit)}`
                          : ''}{' '}
                        in 2 months
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        = {(10 + (100 - 2 * config.timeDecayPerMonth)).toFixed(0)} points
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BenefitScoringConfig;
