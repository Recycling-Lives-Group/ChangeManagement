import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useChangesStore } from '../store/changesStore';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, ArrowRight, Check, FileText, TrendingUp, AlertTriangle, Eye } from 'lucide-react';

const changeRequestSchema = z.object({
  changeTitle: z.string().min(5, 'Title must be at least 5 characters'),
  briefDescription: z.string().min(10, 'Description must be at least 10 characters'),
  changeReasons: z.object({
    revenueImprovement: z.boolean(),
    costReduction: z.boolean(),
    customerImpact: z.boolean(),
    processImprovement: z.boolean(),
    internalQoL: z.boolean(),
    riskReduction: z.boolean(),
  }).refine(data => Object.values(data).some(v => v === true), {
    message: 'Please select at least one reason for this change',
  }),
  proposedDate: z.string(),
  // Conditional fields for Step 2
  revenueDetails: z.object({
    expectedRevenue: z.string().optional(),
    revenueTimeline: z.string().optional(),
    revenueDescription: z.string().optional(),
  }).optional(),
  costReductionDetails: z.object({
    expectedSavings: z.string().optional(),
    costareas: z.string().optional(),
    savingsDescription: z.string().optional(),
  }).optional(),
  customerImpactDetails: z.object({
    customersAffected: z.string().optional(),
    impactDescription: z.string().optional(),
    expectedSatisfaction: z.string().optional(),
  }).optional(),
  processImprovementDetails: z.object({
    currentIssues: z.string().optional(),
    expectedEfficiency: z.string().optional(),
    processDescription: z.string().optional(),
  }).optional(),
  internalQoLDetails: z.object({
    usersAffected: z.string().optional(),
    currentPainPoints: z.string().optional(),
    expectedImprovements: z.string().optional(),
  }).optional(),
  riskReductionDetails: z.object({
    currentRisks: z.string().optional(),
    riskMitigation: z.string().optional(),
    complianceImprovement: z.string().optional(),
  }).optional(),
  systemsAffected: z.string(),
  impactedUsers: z.number().min(0),
  departments: z.string(),
  estimatedEffortHours: z.number().min(0),
  estimatedCost: z.number().min(0),
});

type FormData = z.infer<typeof changeRequestSchema>;

const steps = [
  { number: 1, title: 'Basic Information', icon: FileText },
  { number: 2, title: 'Business Benefit', icon: TrendingUp },
  { number: 3, title: 'Impact Assessment', icon: AlertTriangle },
  { number: 4, title: 'Review & Submit', icon: Eye },
];

export default function ChangeForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { createChange, updateChange, fetchChange, currentChange, isLoading } = useChangesStore();
  const [currentStep, setCurrentStep] = useState(1);
  const isEditMode = !!id;

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(changeRequestSchema),
    mode: 'onChange',
  });

  // Load existing change request if editing
  useEffect(() => {
    if (isEditMode && id) {
      fetchChange(id);
    }
  }, [isEditMode, id, fetchChange]);

  // Populate form with existing data
  useEffect(() => {
    if (isEditMode && currentChange && currentChange.wizardData) {
      const wizardData = currentChange.wizardData;

      // Convert arrays back to comma-separated strings
      const formData = {
        ...wizardData,
        systemsAffected: Array.isArray(wizardData.systemsAffected)
          ? wizardData.systemsAffected.join(', ')
          : wizardData.systemsAffected || '',
        departments: Array.isArray(wizardData.departments)
          ? wizardData.departments.join(', ')
          : wizardData.departments || '',
        proposedDate: wizardData.proposedDate
          ? new Date(wizardData.proposedDate).toISOString().split('T')[0]
          : '',
      };

      reset(formData);
    }
  }, [isEditMode, currentChange, reset]);

  const formData = watch();

  const onSubmit = async (data: FormData) => {
    // Prevent form submission unless on final step (step 4)
    if (currentStep !== 4) {
      console.warn('Attempted form submission on step', currentStep, '- preventing');
      return;
    }

    try {
      const formattedData = {
        ...data,
        systemsAffected: data.systemsAffected.split(',').map((s) => s.trim()),
        departments: data.departments.split(',').map((d) => d.trim()),
        proposedDate: new Date(data.proposedDate),
        dependencies: [],
        relatedChanges: [],
      };

      if (isEditMode && id) {
        await updateChange(id, formattedData);
        toast.success('Change request updated successfully!');
        navigate(`/changes/${id}`);
      } else {
        await createChange(formattedData);
        toast.success('Change request created successfully!');
        navigate('/');
      }
    } catch (error) {
      toast.error(isEditMode ? 'Failed to update change request' : 'Failed to create change request');
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = ['changeTitle', 'briefDescription', 'changeReasons', 'proposedDate'];
    } else if (currentStep === 2) {
      // Step 2 fields are optional, no validation needed
      fieldsToValidate = [];
    } else if (currentStep === 3) {
      fieldsToValidate = ['systemsAffected', 'impactedUsers', 'departments', 'estimatedEffortHours', 'estimatedCost'];
    }

    const isValid = fieldsToValidate.length > 0 ? await trigger(fieldsToValidate) : true;
    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white mb-2">New Change Request</h1>
            <p className="text-blue-100">Complete all steps to submit your change request</p>
          </div>

          {/* Progress Stepper */}
          <div className="px-8 py-6 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;

                return (
                  <div key={step.number} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isCompleted
                            ? 'bg-green-500 text-white scale-110'
                            : isActive
                            ? 'bg-blue-600 text-white scale-110 shadow-lg'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                        }`}
                      >
                        {isCompleted ? <Check size={24} /> : <Icon size={24} />}
                      </div>
                      <div className="mt-2 text-center">
                        <p
                          className={`text-sm font-semibold ${
                            isActive
                              ? 'text-blue-600 dark:text-blue-400'
                              : isCompleted
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-400'
                          }`}
                        >
                          {step.title}
                        </p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-1 flex-1 mx-4 transition-all duration-300 ${
                          currentStep > step.number
                            ? 'bg-green-500'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-8">
            <div className="min-h-[500px]">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Basic Information
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Let's start with the essential details about your change request
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Change Title *
                    </label>
                    <input
                      {...register('changeTitle')}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g., Upgrade CRM System to Latest Version"
                    />
                    {errors.changeTitle && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertTriangle size={14} />
                        {errors.changeTitle.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Brief Description *
                    </label>
                    <textarea
                      {...register('briefDescription')}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Provide a brief overview of what this change involves..."
                    />
                    {errors.briefDescription && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertTriangle size={14} />
                        {errors.briefDescription.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Why are we doing this change? *
                    </label>
                    <div className="space-y-3 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-5 rounded-xl border border-blue-200 dark:border-gray-600">
                      <label className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all hover:shadow-md group">
                        <input
                          {...register('changeReasons.revenueImprovement')}
                          type="checkbox"
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            💰 Revenue Improvement
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Increase income or unlock new revenue streams
                          </p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 cursor-pointer transition-all hover:shadow-md group">
                        <input
                          {...register('changeReasons.costReduction')}
                          type="checkbox"
                          className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                            📉 Cost Reduction
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Reduce operational expenses or improve efficiency
                          </p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 cursor-pointer transition-all hover:shadow-md group">
                        <input
                          {...register('changeReasons.customerImpact')}
                          type="checkbox"
                          className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            👥 Customer Impact or Request
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Improve customer experience or satisfaction
                          </p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500 cursor-pointer transition-all hover:shadow-md group">
                        <input
                          {...register('changeReasons.processImprovement')}
                          type="checkbox"
                          className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                            ⚙️ Process Improvement
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Streamline internal processes or workflows
                          </p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 cursor-pointer transition-all hover:shadow-md group">
                        <input
                          {...register('changeReasons.internalQoL')}
                          type="checkbox"
                          className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            ✨ Internal Quality of Life
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Improve internal user experience and satisfaction
                          </p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-500 cursor-pointer transition-all hover:shadow-md group">
                        <input
                          {...register('changeReasons.riskReduction')}
                          type="checkbox"
                          className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                            🛡️ Risk Reduction
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Mitigate risks, improve security, or ensure compliance
                          </p>
                        </div>
                      </label>
                    </div>
                    {errors.changeReasons && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <AlertTriangle size={14} />
                        {errors.changeReasons.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Proposed Implementation Date *
                    </label>
                    <input
                      {...register('proposedDate')}
                      type="date"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    {errors.proposedDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.proposedDate.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Business Benefit Details */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Business Benefit Details
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Provide specific details for each reason you selected
                    </p>
                  </div>

                  {/* Revenue Improvement Section */}
                  {formData.changeReasons?.revenueImprovement && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border-2 border-blue-300 dark:border-blue-700">
                      <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
                        💰 Revenue Improvement Details
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Expected Revenue Increase (£)
                          </label>
                          <input
                            {...register('revenueDetails.expectedRevenue')}
                            type="text"
                            className="w-full px-4 py-3 rounded-lg border border-blue-300 dark:border-blue-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="e.g., £50,000 annually"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Timeline to Realize Revenue
                          </label>
                          <input
                            {...register('revenueDetails.revenueTimeline')}
                            type="text"
                            className="w-full px-4 py-3 rounded-lg border border-blue-300 dark:border-blue-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="e.g., 6 months, Q2 2025"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            How will this generate revenue?
                          </label>
                          <textarea
                            {...register('revenueDetails.revenueDescription')}
                            rows={4}
                            className="w-full px-4 py-3 rounded-lg border border-blue-300 dark:border-blue-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="Explain the revenue generation mechanism, new revenue streams, pricing changes, etc."
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cost Reduction Section */}
                  {formData.changeReasons?.costReduction && (
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border-2 border-green-300 dark:border-green-700">
                      <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-4 flex items-center gap-2">
                        📉 Cost Reduction Details
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Expected Cost Savings (£)
                          </label>
                          <input
                            {...register('costReductionDetails.expectedSavings')}
                            type="text"
                            className="w-full px-4 py-3 rounded-lg border border-green-300 dark:border-green-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-all"
                            placeholder="e.g., £30,000 annually"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Cost Areas Affected
                          </label>
                          <input
                            {...register('costReductionDetails.costareas')}
                            type="text"
                            className="w-full px-4 py-3 rounded-lg border border-green-300 dark:border-green-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-all"
                            placeholder="e.g., Software licenses, Manual labor, Infrastructure"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            How will this reduce costs?
                          </label>
                          <textarea
                            {...register('costReductionDetails.savingsDescription')}
                            rows={4}
                            className="w-full px-4 py-3 rounded-lg border border-green-300 dark:border-green-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-all"
                            placeholder="Explain the cost reduction mechanism, efficiency gains, eliminated expenses, etc."
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Customer Impact Section */}
                  {formData.changeReasons?.customerImpact && (
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border-2 border-purple-300 dark:border-purple-700">
                      <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-4 flex items-center gap-2">
                        👥 Customer Impact or Request Details
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Number of Customers Affected
                          </label>
                          <input
                            {...register('customerImpactDetails.customersAffected')}
                            type="text"
                            className="w-full px-4 py-3 rounded-lg border border-purple-300 dark:border-purple-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all"
                            placeholder="e.g., 500 customers, All enterprise clients"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Expected Satisfaction Impact
                          </label>
                          <input
                            {...register('customerImpactDetails.expectedSatisfaction')}
                            type="text"
                            className="w-full px-4 py-3 rounded-lg border border-purple-300 dark:border-purple-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all"
                            placeholder="e.g., NPS increase by 10 points, Reduce complaints by 30%"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            How will this impact customers?
                          </label>
                          <textarea
                            {...register('customerImpactDetails.impactDescription')}
                            rows={4}
                            className="w-full px-4 py-3 rounded-lg border border-purple-300 dark:border-purple-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all"
                            placeholder="Explain the customer experience improvements, pain points addressed, features requested, etc."
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Process Improvement Section */}
                  {formData.changeReasons?.processImprovement && (
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6 border-2 border-orange-300 dark:border-orange-700">
                      <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100 mb-4 flex items-center gap-2">
                        ⚙️ Process Improvement Details
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Current Process Issues
                          </label>
                          <textarea
                            {...register('processImprovementDetails.currentIssues')}
                            rows={3}
                            className="w-full px-4 py-3 rounded-lg border border-orange-300 dark:border-orange-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 transition-all"
                            placeholder="Describe current bottlenecks, inefficiencies, or manual steps"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Expected Efficiency Gains
                          </label>
                          <input
                            {...register('processImprovementDetails.expectedEfficiency')}
                            type="text"
                            className="w-full px-4 py-3 rounded-lg border border-orange-300 dark:border-orange-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 transition-all"
                            placeholder="e.g., 50% time reduction, 80% automation, Eliminate 5 manual steps"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            How will this improve the process?
                          </label>
                          <textarea
                            {...register('processImprovementDetails.processDescription')}
                            rows={4}
                            className="w-full px-4 py-3 rounded-lg border border-orange-300 dark:border-orange-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 transition-all"
                            placeholder="Explain the process improvements, automation, workflow changes, etc."
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Internal QoL Section */}
                  {formData.changeReasons?.internalQoL && (
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl p-6 border-2 border-indigo-300 dark:border-indigo-700">
                      <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-100 mb-4 flex items-center gap-2">
                        ✨ Internal Quality of Life Details
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Internal Users Affected
                          </label>
                          <input
                            {...register('internalQoLDetails.usersAffected')}
                            type="text"
                            className="w-full px-4 py-3 rounded-lg border border-indigo-300 dark:border-indigo-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="e.g., All developers, Sales team (20 people), Customer support"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Current Pain Points
                          </label>
                          <textarea
                            {...register('internalQoLDetails.currentPainPoints')}
                            rows={3}
                            className="w-full px-4 py-3 rounded-lg border border-indigo-300 dark:border-indigo-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="Describe current frustrations, manual work, inefficiencies affecting staff"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Expected Quality of Life Improvements
                          </label>
                          <textarea
                            {...register('internalQoLDetails.expectedImprovements')}
                            rows={4}
                            className="w-full px-4 py-3 rounded-lg border border-indigo-300 dark:border-indigo-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="Explain how this will improve daily work, reduce frustration, increase job satisfaction, etc."
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Risk Reduction Section */}
                  {formData.changeReasons?.riskReduction && (
                    <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-6 border-2 border-red-300 dark:border-red-700">
                      <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-4 flex items-center gap-2">
                        🛡️ Risk Reduction Details
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Current Risks or Vulnerabilities
                          </label>
                          <textarea
                            {...register('riskReductionDetails.currentRisks')}
                            rows={3}
                            className="w-full px-4 py-3 rounded-lg border border-red-300 dark:border-red-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 transition-all"
                            placeholder="Describe security vulnerabilities, compliance gaps, operational risks, etc."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Risk Mitigation Strategy
                          </label>
                          <textarea
                            {...register('riskReductionDetails.riskMitigation')}
                            rows={4}
                            className="w-full px-4 py-3 rounded-lg border border-red-300 dark:border-red-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 transition-all"
                            placeholder="Explain how this change will mitigate or eliminate the identified risks"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Compliance or Security Improvements
                          </label>
                          <input
                            {...register('riskReductionDetails.complianceImprovement')}
                            type="text"
                            className="w-full px-4 py-3 rounded-lg border border-red-300 dark:border-red-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 transition-all"
                            placeholder="e.g., Meets GDPR requirements, SOC 2 compliance, Reduces data breach risk by 80%"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show message if no sections visible */}
                  {!formData.changeReasons?.revenueImprovement &&
                   !formData.changeReasons?.costReduction &&
                   !formData.changeReasons?.customerImpact &&
                   !formData.changeReasons?.processImprovement &&
                   !formData.changeReasons?.internalQoL &&
                   !formData.changeReasons?.riskReduction && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <p className="text-lg">No reasons selected in Step 1</p>
                      <p className="text-sm mt-2">Please go back and select at least one reason for this change</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Impact Assessment */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Impact Assessment
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Detail the technical and organizational impact
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Systems Affected (comma-separated) *
                    </label>
                    <input
                      {...register('systemsAffected')}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="e.g., ERP, CRM, Database, API Gateway"
                    />
                    {errors.systemsAffected && (
                      <p className="text-red-500 text-sm mt-1">{errors.systemsAffected.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Number of Impacted Users *
                      </label>
                      <input
                        {...register('impactedUsers', { valueAsNumber: true })}
                        type="number"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="0"
                      />
                      {errors.impactedUsers && (
                        <p className="text-red-500 text-sm mt-1">{errors.impactedUsers.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Departments (comma-separated) *
                      </label>
                      <input
                        {...register('departments')}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="e.g., IT, Finance, Operations"
                      />
                      {errors.departments && (
                        <p className="text-red-500 text-sm mt-1">{errors.departments.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Estimated Effort (Hours) *
                      </label>
                      <input
                        {...register('estimatedEffortHours', { valueAsNumber: true })}
                        type="number"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="e.g., 40"
                      />
                      {errors.estimatedEffortHours && (
                        <p className="text-red-500 text-sm mt-1">{errors.estimatedEffortHours.message}</p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total hours needed to complete this change</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Estimated Cost (£) *
                      </label>
                      <input
                        {...register('estimatedCost', { valueAsNumber: true })}
                        type="number"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="e.g., 5000"
                      />
                      {errors.estimatedCost && (
                        <p className="text-red-500 text-sm mt-1">{errors.estimatedCost.message}</p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total estimated cost including resources, licenses, etc.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review & Submit */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-l-4 border-green-500 pl-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Review & Submit
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Review your change request before submitting
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                        <FileText size={20} />
                        Basic Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Title:</span> {formData.changeTitle || 'Not provided'}</p>
                        <p><span className="font-medium">Description:</span> {formData.briefDescription || 'Not provided'}</p>
                        <p><span className="font-medium">Reasons:</span> {
                          formData.changeReasons ? [
                            formData.changeReasons.revenueImprovement && '💰 Revenue Improvement',
                            formData.changeReasons.costReduction && '📉 Cost Reduction',
                            formData.changeReasons.customerImpact && '👥 Customer Impact or Request',
                            formData.changeReasons.processImprovement && '⚙️ Process Improvement',
                            formData.changeReasons.internalQoL && '✨ Internal Quality of Life',
                            formData.changeReasons.riskReduction && '🛡️ Risk Reduction'
                          ].filter(Boolean).join(', ') || 'None selected' : 'None selected'
                        }</p>
                        <p><span className="font-medium">Proposed Date:</span> {formData.proposedDate || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                        <TrendingUp size={20} />
                        Business Benefit Details
                      </h3>
                      <div className="space-y-3 text-sm">
                        {formData.changeReasons?.revenueImprovement && formData.revenueDetails && (
                          <div className="border-l-2 border-blue-400 pl-3">
                            <p className="font-semibold text-blue-900 dark:text-blue-300">💰 Revenue Improvement:</p>
                            {formData.revenueDetails.expectedRevenue && <p>Expected: {formData.revenueDetails.expectedRevenue}</p>}
                            {formData.revenueDetails.revenueTimeline && <p>Timeline: {formData.revenueDetails.revenueTimeline}</p>}
                            {formData.revenueDetails.revenueDescription && <p>Details: {formData.revenueDetails.revenueDescription}</p>}
                          </div>
                        )}
                        {formData.changeReasons?.costReduction && formData.costReductionDetails && (
                          <div className="border-l-2 border-green-400 pl-3">
                            <p className="font-semibold text-green-900 dark:text-green-300">📉 Cost Reduction:</p>
                            {formData.costReductionDetails.expectedSavings && <p>Savings: {formData.costReductionDetails.expectedSavings}</p>}
                            {formData.costReductionDetails.costareas && <p>Areas: {formData.costReductionDetails.costareas}</p>}
                            {formData.costReductionDetails.savingsDescription && <p>Details: {formData.costReductionDetails.savingsDescription}</p>}
                          </div>
                        )}
                        {formData.changeReasons?.customerImpact && formData.customerImpactDetails && (
                          <div className="border-l-2 border-purple-400 pl-3">
                            <p className="font-semibold text-purple-900 dark:text-purple-300">👥 Customer Impact:</p>
                            {formData.customerImpactDetails.customersAffected && <p>Affected: {formData.customerImpactDetails.customersAffected}</p>}
                            {formData.customerImpactDetails.expectedSatisfaction && <p>Impact: {formData.customerImpactDetails.expectedSatisfaction}</p>}
                            {formData.customerImpactDetails.impactDescription && <p>Details: {formData.customerImpactDetails.impactDescription}</p>}
                          </div>
                        )}
                        {formData.changeReasons?.processImprovement && formData.processImprovementDetails && (
                          <div className="border-l-2 border-orange-400 pl-3">
                            <p className="font-semibold text-orange-900 dark:text-orange-300">⚙️ Process Improvement:</p>
                            {formData.processImprovementDetails.currentIssues && <p>Issues: {formData.processImprovementDetails.currentIssues}</p>}
                            {formData.processImprovementDetails.expectedEfficiency && <p>Gains: {formData.processImprovementDetails.expectedEfficiency}</p>}
                            {formData.processImprovementDetails.processDescription && <p>Details: {formData.processImprovementDetails.processDescription}</p>}
                          </div>
                        )}
                        {formData.changeReasons?.internalQoL && formData.internalQoLDetails && (
                          <div className="border-l-2 border-indigo-400 pl-3">
                            <p className="font-semibold text-indigo-900 dark:text-indigo-300">✨ Internal Quality of Life:</p>
                            {formData.internalQoLDetails.usersAffected && <p>Affected: {formData.internalQoLDetails.usersAffected}</p>}
                            {formData.internalQoLDetails.currentPainPoints && <p>Pain Points: {formData.internalQoLDetails.currentPainPoints}</p>}
                            {formData.internalQoLDetails.expectedImprovements && <p>Improvements: {formData.internalQoLDetails.expectedImprovements}</p>}
                          </div>
                        )}
                        {formData.changeReasons?.riskReduction && formData.riskReductionDetails && (
                          <div className="border-l-2 border-red-400 pl-3">
                            <p className="font-semibold text-red-900 dark:text-red-300">🛡️ Risk Reduction:</p>
                            {formData.riskReductionDetails.currentRisks && <p>Current Risks: {formData.riskReductionDetails.currentRisks}</p>}
                            {formData.riskReductionDetails.riskMitigation && <p>Mitigation: {formData.riskReductionDetails.riskMitigation}</p>}
                            {formData.riskReductionDetails.complianceImprovement && <p>Compliance: {formData.riskReductionDetails.complianceImprovement}</p>}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
                      <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-3 flex items-center gap-2">
                        <AlertTriangle size={20} />
                        Impact Assessment
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Systems:</span> {formData.systemsAffected || 'Not provided'}</p>
                        <p><span className="font-medium">Impacted Users:</span> {formData.impactedUsers || 0}</p>
                        <p><span className="font-medium">Departments:</span> {formData.departments || 'Not provided'}</p>
                        <p><span className="font-medium">Estimated Effort:</span> {formData.estimatedEffortHours || 0} hours</p>
                        <p><span className="font-medium">Estimated Cost:</span> £{formData.estimatedCost || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ArrowLeft size={20} />
                Previous
              </button>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                Step {currentStep} of {steps.length}
              </div>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Next
                  <ArrowRight size={20} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
                >
                  <Check size={20} />
                  {isLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
