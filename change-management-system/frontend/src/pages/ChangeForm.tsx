import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useChangesStore } from '../store/changesStore';
import toast from 'react-hot-toast';
import { Save, ArrowLeft } from 'lucide-react';

const changeRequestSchema = z.object({
  changeTitle: z.string().min(5, 'Title must be at least 5 characters'),
  changeType: z.enum(['Emergency', 'Major', 'Minor', 'Standard']),
  businessJustification: z.string().min(20, 'Justification must be at least 20 characters'),
  systemsAffected: z.string(),
  riskLevel: z.enum(['Critical', 'High', 'Medium', 'Low']),
  impactedUsers: z.number().min(0),
  departments: z.string(),
  financialImpact: z.number().min(0),
  complianceImpact: z.boolean(),
  proposedDate: z.string(),
  rollbackPlan: z.string().min(20, 'Rollback plan must be at least 20 characters'),
  testingPlan: z.string().min(20, 'Testing plan must be at least 20 characters'),
  successCriteria: z.string(),
});

type FormData = z.infer<typeof changeRequestSchema>;

export default function ChangeForm() {
  const navigate = useNavigate();
  const { createChange, isLoading } = useChangesStore();
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(changeRequestSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const formattedData = {
        ...data,
        systemsAffected: data.systemsAffected.split(',').map((s) => s.trim()),
        departments: data.departments.split(',').map((d) => d.trim()),
        successCriteria: data.successCriteria.split(',').map((c) => c.trim()),
        proposedDate: new Date(data.proposedDate),
        dependencies: [],
        relatedChanges: [],
      };

      await createChange(formattedData);
      toast.success('Change request created successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to create change request');
    }
  };

  return (
    <div>
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div className="card max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">New Change Request</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium mb-2">Change Title *</label>
              <input
                {...register('changeTitle')}
                className="input-field"
                placeholder="Brief description of the change"
              />
              {errors.changeTitle && (
                <p className="text-red-500 text-sm mt-1">{errors.changeTitle.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Change Type *</label>
                <select {...register('changeType')} className="input-field">
                  <option value="">Select type</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Major">Major</option>
                  <option value="Minor">Minor</option>
                  <option value="Standard">Standard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Risk Level *</label>
                <select {...register('riskLevel')} className="input-field">
                  <option value="">Select risk level</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Business Justification *</label>
              <textarea
                {...register('businessJustification')}
                rows={4}
                className="input-field"
                placeholder="Explain why this change is needed"
              />
              {errors.businessJustification && (
                <p className="text-red-500 text-sm mt-1">{errors.businessJustification.message}</p>
              )}
            </div>
          </div>

          {/* Impact Assessment */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Impact Assessment</h2>

            <div>
              <label className="block text-sm font-medium mb-2">
                Systems Affected (comma-separated) *
              </label>
              <input
                {...register('systemsAffected')}
                className="input-field"
                placeholder="e.g., ERP, CRM, Database"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Number of Impacted Users *</label>
                <input
                  {...register('impactedUsers', { valueAsNumber: true })}
                  type="number"
                  className="input-field"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Financial Impact ($) *</label>
                <input
                  {...register('financialImpact', { valueAsNumber: true })}
                  type="number"
                  className="input-field"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Departments (comma-separated) *
              </label>
              <input
                {...register('departments')}
                className="input-field"
                placeholder="e.g., IT, Finance, Operations"
              />
            </div>

            <div className="flex items-center">
              <input
                {...register('complianceImpact')}
                type="checkbox"
                className="w-4 h-4 text-primary-600 rounded"
              />
              <label className="ml-2 text-sm font-medium">Has Compliance Impact</label>
            </div>
          </div>

          {/* Implementation Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Implementation Details</h2>

            <div>
              <label className="block text-sm font-medium mb-2">Proposed Implementation Date *</label>
              <input {...register('proposedDate')} type="date" className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Rollback Plan *</label>
              <textarea
                {...register('rollbackPlan')}
                rows={4}
                className="input-field"
                placeholder="Describe how to rollback this change if needed"
              />
              {errors.rollbackPlan && (
                <p className="text-red-500 text-sm mt-1">{errors.rollbackPlan.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Testing Plan *</label>
              <textarea
                {...register('testingPlan')}
                rows={4}
                className="input-field"
                placeholder="Describe how this change will be tested"
              />
              {errors.testingPlan && (
                <p className="text-red-500 text-sm mt-1">{errors.testingPlan.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Success Criteria (comma-separated) *
              </label>
              <textarea
                {...register('successCriteria')}
                rows={3}
                className="input-field"
                placeholder="e.g., System uptime 99%, Zero data loss, User acceptance"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={20} />
              {isLoading ? 'Submitting...' : 'Submit Change Request'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
