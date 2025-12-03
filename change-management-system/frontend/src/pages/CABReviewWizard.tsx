import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChangesStore } from '../store/changesStore';
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  PoundSterling,
  Users,
  TrendingUp,
  Zap,
  Smile,
  Target,
  AlertTriangle,
  Clock,
  Server,
  GitBranch,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BenefitFactor {
  rawValue: number | string;
  rawTimeline: number;
  explanation: string;
}

interface CABAssessment {
  // Benefit factors
  revenueImprovement?: BenefitFactor;
  costSavings?: BenefitFactor;
  customerImpact?: BenefitFactor;
  processImprovement?: BenefitFactor;
  internalQoL?: BenefitFactor;

  // Effort factors (all 8)
  hoursEstimated?: number;           // From original request
  costEstimated?: number;            // From original request
  resourceRequirement?: number;      // 1-10 people
  complexity?: number;               // 1-10 scale
  systemsAffected?: number;          // Count of systems
  testingRequired?: number;          // 1-10 scale
  documentationRequired?: number;    // 1-10 scale
  urgency?: number;                  // 1-10 scale

  // Impact factors
  impactedUsers?: number;
  systemsAffectedList?: string[];
  dependencies?: string[];

  // Risk factors
  technicalRisk?: number; // 1-5
  businessRisk?: number; // 1-5
  rollbackCapability?: number; // 1-5
  testingCoverage?: number; // 1-5

  // Strategic factors
  strategicAlignment?: number; // 1-10

  // CAB comments
  cabComments?: string;
}

export default function CABReviewWizard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { changes, fetchChanges } = useChangesStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [change, setChange] = useState<any>(null);
  const [originalData, setOriginalData] = useState<any>(null);
  const [originalBenefitValues, setOriginalBenefitValues] = useState<Record<string, BenefitFactor>>({});
  const [cabAssessment, setCabAssessment] = useState<CABAssessment>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchChanges();
  }, [fetchChanges]);

  useEffect(() => {
    const foundChange = changes.find(c => c.id === id || c.requestNumber === id);
    if (foundChange) {
      setChange(foundChange);
      setOriginalData(foundChange.wizardData || {});

      // Pre-populate CAB assessment with original data
      initializeCabAssessment(foundChange.wizardData || {});
    }
  }, [changes, id]);

  const initializeCabAssessment = (wizardData: any) => {
    const assessment: CABAssessment = {};
    const originalValues: Record<string, BenefitFactor> = {};

    // Revenue Improvement
    if (wizardData.changeReasons?.revenueImprovement && wizardData.revenueDetails) {
      const revValue = {
        rawValue: wizardData.revenueDetails.expectedRevenue || '',
        rawTimeline: parseInt(wizardData.revenueDetails.revenueTimeline || '12'),
        explanation: wizardData.revenueDetails.revenueDescription || '',
      };
      assessment.revenueImprovement = { ...revValue };
      originalValues.revenueImprovement = { ...revValue };
    }

    // Cost Savings
    if (wizardData.changeReasons?.costReduction && wizardData.costReductionDetails) {
      const costValue = {
        rawValue: wizardData.costReductionDetails.expectedSavings || '',
        rawTimeline: parseInt(wizardData.costReductionDetails.savingsTimeline || '12'),
        explanation: wizardData.costReductionDetails.savingsDescription || '',
      };
      assessment.costSavings = { ...costValue };
      originalValues.costSavings = { ...costValue };
    }

    // Customer Impact
    if (wizardData.changeReasons?.customerImpact && wizardData.customerImpactDetails) {
      const custValue = {
        rawValue: wizardData.customerImpactDetails.customersAffected || '',
        rawTimeline: parseInt(wizardData.customerImpactDetails.impactTimeline || '12'),
        explanation: wizardData.customerImpactDetails.impactDescription || '',
      };
      assessment.customerImpact = { ...custValue };
      originalValues.customerImpact = { ...custValue };
    }

    // Process Improvement
    if (wizardData.changeReasons?.processImprovement && wizardData.processImprovementDetails) {
      const procValue = {
        rawValue: wizardData.processImprovementDetails.expectedEfficiency || '',
        rawTimeline: parseInt(wizardData.processImprovementDetails.improvementTimeline || '12'),
        explanation: wizardData.processImprovementDetails.processDescription || '',
      };
      assessment.processImprovement = { ...procValue };
      originalValues.processImprovement = { ...procValue };
    }

    // Internal QoL
    if (wizardData.changeReasons?.internalQoL && wizardData.internalQoLDetails) {
      const qolValue = {
        rawValue: wizardData.internalQoLDetails.usersAffected || '',
        rawTimeline: parseInt(wizardData.internalQoLDetails.qolTimeline || '12'),
        explanation: wizardData.internalQoLDetails.expectedImprovements || '',
      };
      assessment.internalQoL = { ...qolValue };
      originalValues.internalQoL = { ...qolValue };
    }

    // Impact
    assessment.impactedUsers = parseInt(wizardData.impactedUsers || '0');
    assessment.systemsAffectedList = wizardData.systemsAffected || [];
    assessment.dependencies = wizardData.dependencies || [];

    // Effort - all 8 factors
    assessment.hoursEstimated = parseInt(wizardData.estimatedEffortHours || '0');
    assessment.costEstimated = parseFloat(wizardData.estimatedCost?.toString().replace(/[£,]/g, '') || '0');
    assessment.resourceRequirement = parseInt(wizardData.resourceRequirement || wizardData.teamSize || '1');
    assessment.complexity = parseInt(wizardData.complexity || '5');
    assessment.systemsAffected = Array.isArray(wizardData.systemsAffected) ? wizardData.systemsAffected.length : 0;
    assessment.testingRequired = parseInt(wizardData.testingRequired || '5');
    assessment.documentationRequired = parseInt(wizardData.documentationRequired || '5');
    assessment.urgency = parseInt(wizardData.urgency || '5');

    // Risk - default to medium values
    assessment.technicalRisk = 3;
    assessment.businessRisk = 3;
    assessment.rollbackCapability = 3;
    assessment.testingCoverage = 3;

    // Strategic
    assessment.strategicAlignment = 5;

    setCabAssessment(assessment);
    setOriginalBenefitValues(originalValues);
  };

  const steps = [
    // Benefit factors
    ...(originalData?.changeReasons?.revenueImprovement ? [{
      title: 'Revenue Improvement',
      icon: PoundSterling,
      field: 'revenueImprovement'
    }] : []),
    ...(originalData?.changeReasons?.costReduction ? [{
      title: 'Cost Savings',
      icon: TrendingUp,
      field: 'costSavings'
    }] : []),
    ...(originalData?.changeReasons?.customerImpact ? [{
      title: 'Customer Impact',
      icon: Users,
      field: 'customerImpact'
    }] : []),
    ...(originalData?.changeReasons?.processImprovement ? [{
      title: 'Process Improvement',
      icon: Zap,
      field: 'processImprovement'
    }] : []),
    ...(originalData?.changeReasons?.internalQoL ? [{
      title: 'Internal Quality of Life',
      icon: Smile,
      field: 'internalQoL'
    }] : []),
    // Always include these - Benefits first, then Effort
    { title: 'Effort Assessment', icon: Clock, field: 'effort' },
    { title: 'Risk Assessment', icon: AlertTriangle, field: 'risk' },
    { title: 'Final Review', icon: CheckCircle, field: 'review' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5000/api/changes/${id}/cab-approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          decision: 'approve',
          cabAssessment,
          comments: cabAssessment.cabComments || '',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve change request');
      }

      toast.success('Change request approved with assessment!');
      navigate('/cab-review');
    } catch (error) {
      console.error('Error approving change:', error);
      toast.error('Failed to approve change request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5000/api/changes/${id}/cab-approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          decision: 'reject',
          cabAssessment,
          comments: cabAssessment.cabComments || 'Rejected after CAB review',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject change request');
      }

      toast.success('Change request rejected');
      navigate('/cab-review');
    } catch (error) {
      console.error('Error rejecting change:', error);
      toast.error('Failed to reject change request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBenefitStep = (field: string) => {
    const factor = cabAssessment[field as keyof CABAssessment] as BenefitFactor | undefined;
    const originalFactor = originalBenefitValues[field];

    const getFieldConfig = () => {
      switch (field) {
        case 'revenueImprovement':
          return { label: 'Revenue Improvement', unit: '£', valueLabel: 'Annual Revenue Improvement' };
        case 'costSavings':
          return { label: 'Cost Savings', unit: '£', valueLabel: 'Annual Savings' };
        case 'customerImpact':
          return { label: 'Customers Affected', unit: '', valueLabel: 'Number of Customers' };
        case 'processImprovement':
          return { label: 'Hours Saved', unit: 'hours', valueLabel: 'Hours Saved Per Month' };
        case 'internalQoL':
          return { label: 'Employees Affected', unit: '', valueLabel: 'Number of Employees' };
        default:
          return { label: '', unit: '', valueLabel: '' };
      }
    };

    const config = getFieldConfig();

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Original Requester Input (Read-Only)
          </h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Value:</span> {config.unit}{originalFactor?.rawValue || 'N/A'}</p>
            <p><span className="font-medium">Timeline:</span> {originalFactor?.rawTimeline || 'N/A'} months</p>
            <p><span className="font-medium">Explanation:</span> {originalFactor?.explanation || 'N/A'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            CAB Assessment - Do you agree with these values?
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {config.valueLabel}
            </label>
            <input
              type="text"
              value={factor?.rawValue || ''}
              onChange={(e) => setCabAssessment({
                ...cabAssessment,
                [field]: { ...factor, rawValue: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timeline to Realize Benefit (months)
            </label>
            <input
              type="number"
              value={factor?.rawTimeline || 12}
              onChange={(e) => setCabAssessment({
                ...cabAssessment,
                [field]: { ...factor, rawTimeline: parseInt(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              CAB Notes / Revised Explanation
            </label>
            <textarea
              value={factor?.explanation || ''}
              onChange={(e) => setCabAssessment({
                ...cabAssessment,
                [field]: { ...factor, explanation: e.target.value }
              })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderEffortStep = () => {
    const InfoTooltip = ({ text }: { text: string }) => (
      <div className="group relative inline-block ml-2">
        <AlertTriangle className="w-4 h-4 text-blue-500 cursor-help inline" />
        <div className="hidden group-hover:block absolute z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg -top-2 left-6 shadow-lg">
          {text}
        </div>
      </div>
    );

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Effort Assessment
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Review and assess all effort-related factors for this change. Hover over the info icons for explanations.
          </p>
        </div>

        {/* Cost Estimated */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            1. Cost Estimated (£)
            <InfoTooltip text="Total estimated financial cost for implementing this change. This includes resource costs, infrastructure, licensing, etc. Review and adjust if needed." />
          </label>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 mb-3">
            <p className="text-xs text-blue-800 dark:text-blue-200 mb-1 font-medium">Original Requester Estimate (Read-Only)</p>
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              £{originalData?.estimatedCost ? parseFloat(originalData.estimatedCost.toString().replace(/[£,]/g, '')).toLocaleString() : '0'}
            </p>
          </div>

          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            CAB Assessment - Do you agree with this estimate?
          </label>
          <input
            type="number"
            value={cabAssessment.costEstimated || 0}
            onChange={(e) => setCabAssessment({
              ...cabAssessment,
              costEstimated: parseFloat(e.target.value) || 0
            })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enter cost without £ symbol (e.g., 5000)</p>
        </div>

        {/* Hours Estimated */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            2. Hours Estimated
            <InfoTooltip text="Total estimated hours required to implement this change. Review the original estimate and adjust if needed based on CAB assessment." />
          </label>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 mb-3">
            <p className="text-xs text-blue-800 dark:text-blue-200 mb-1 font-medium">Original Requester Estimate (Read-Only)</p>
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">{originalData?.estimatedEffortHours || 0} hours</p>
          </div>

          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            CAB Assessment - Do you agree with this estimate?
          </label>
          <input
            type="number"
            value={cabAssessment.hoursEstimated || 0}
            onChange={(e) => setCabAssessment({
              ...cabAssessment,
              hoursEstimated: parseFloat(e.target.value) || 0
            })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Resource Requirement (1-10) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            3. Resource Requirement: <span className="font-bold text-indigo-600">{cabAssessment.resourceRequirement || 1}/10</span>
            <InfoTooltip text="How many people/resources are required to implement this change? Scale of 1-10 where 1 = 1 person, 10 = 10+ people. Consider both full-time and part-time resources." />
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={cabAssessment.resourceRequirement || 1}
            onChange={(e) => setCabAssessment({
              ...cabAssessment,
              resourceRequirement: parseInt(e.target.value)
            })}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer dark:bg-blue-700"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>1 person</span>
            <span>5-6 people</span>
            <span>10+ people</span>
          </div>
        </div>

        {/* Urgency (1-10) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            4. Urgency: <span className="font-bold text-indigo-600">{cabAssessment.urgency || 5}/10</span>
            <InfoTooltip text="Time sensitivity of this change. Consider: deadlines, business impact of delays, regulatory requirements, competitive pressure, and customer commitments. 1 = Can wait, 10 = Urgent/Critical." />
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={cabAssessment.urgency || 5}
            onChange={(e) => setCabAssessment({
              ...cabAssessment,
              urgency: parseInt(e.target.value)
            })}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer dark:bg-blue-700"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>1 - Low</span>
            <span>5 - Moderate</span>
            <span>10 - Critical</span>
          </div>
        </div>

        {/* Strategic Alignment (1-10) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            5. Strategic Alignment: <span className="font-bold text-indigo-600">{cabAssessment.strategicAlignment || 5}/10</span>
            <InfoTooltip text="How well does this change align with organizational strategy and goals? Consider: strategic priorities, long-term vision, competitive advantage, and business objectives. 1 = Low alignment, 10 = Critical strategic priority." />
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={cabAssessment.strategicAlignment || 5}
            onChange={(e) => setCabAssessment({
              ...cabAssessment,
              strategicAlignment: parseInt(e.target.value)
            })}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer dark:bg-blue-700"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>1 - Low</span>
            <span>5 - Moderate</span>
            <span>10 - Critical</span>
          </div>
        </div>
      </div>
    );
  };

  const renderImpactStep = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Impact & Dependencies
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Number of Users Impacted
          </label>
          <input
            type="number"
            value={cabAssessment.impactedUsers || 0}
            onChange={(e) => setCabAssessment({
              ...cabAssessment,
              impactedUsers: parseInt(e.target.value)
            })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Systems Affected (comma-separated)
          </label>
          <input
            type="text"
            value={cabAssessment.systemsAffectedList?.join(', ') || ''}
            onChange={(e) => {
              const systemsList = e.target.value.split(',').map(s => s.trim()).filter(s => s);
              setCabAssessment({
                ...cabAssessment,
                systemsAffectedList: systemsList,
                systemsAffected: systemsList.length // Update count for effort calculation
              });
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="e.g., CRM, Database, API Gateway"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Count: {cabAssessment.systemsAffected || 0} systems
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Dependencies (comma-separated)
          </label>
          <input
            type="text"
            value={cabAssessment.dependencies?.join(', ') || ''}
            onChange={(e) => setCabAssessment({
              ...cabAssessment,
              dependencies: e.target.value.split(',').map(s => s.trim()).filter(s => s)
            })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="e.g., Network upgrade, Third-party API"
          />
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6 hidden">
          <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">Effort Assessment (Moved to dedicated step)</h4>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estimated Hours
            </label>
            <input
              type="number"
              min="0"
              value={originalData?.estimatedEffortHours || 0}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              From original change request (read-only)
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estimated Cost (£)
            </label>
            <input
              type="text"
              value={originalData?.estimatedCost || 0}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              From original change request (read-only)
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Team Size (Number of People)
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={cabAssessment.teamSize || 1}
              onChange={(e) => setCabAssessment({
                ...cabAssessment,
                teamSize: parseInt(e.target.value) || 1
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              How many people will work on this change?
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Testing Required: <span className="font-bold">{cabAssessment.testingRequired}/5</span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={cabAssessment.testingRequired || 3}
              onChange={(e) => setCabAssessment({
                ...cabAssessment,
                testingRequired: parseInt(e.target.value)
              })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1 - Minimal</span>
              <span>3 - Moderate</span>
              <span>5 - Extensive</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Documentation Required: <span className="font-bold">{cabAssessment.documentationRequired}/5</span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={cabAssessment.documentationRequired || 3}
              onChange={(e) => setCabAssessment({
                ...cabAssessment,
                documentationRequired: parseInt(e.target.value)
              })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1 - Minimal</span>
              <span>3 - Moderate</span>
              <span>5 - Extensive</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRiskStep = () => {
    const InfoTooltip = ({ text }: { text: string }) => (
      <div className="group relative inline-block ml-2">
        <AlertTriangle className="w-4 h-4 text-blue-500 cursor-help inline" />
        <div className="hidden group-hover:block absolute z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg -top-2 left-6 shadow-lg">
          {text}
        </div>
      </div>
    );

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Risk Assessment
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Assess the risks and technical requirements for this change. Hover over the info icons for explanations.
          </p>
        </div>

        {/* Business Risk (1-10) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            1. Business Risk: <span className="font-bold text-indigo-600">{cabAssessment.businessRisk || 5}/10</span>
            <InfoTooltip text="Assess the business risk if this change fails or causes issues. Consider: revenue impact, customer satisfaction, regulatory compliance, reputation. 1 = Minimal business impact, 10 = Critical business impact." />
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={cabAssessment.businessRisk || 5}
            onChange={(e) => setCabAssessment({
              ...cabAssessment,
              businessRisk: parseInt(e.target.value)
            })}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer dark:bg-blue-700"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>1 - Minimal Impact</span>
            <span>5 - Moderate Impact</span>
            <span>10 - Critical Impact</span>
          </div>
        </div>

        {/* Complexity (1-10) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            2. Complexity: <span className="font-bold text-indigo-600">{cabAssessment.complexity || 5}/10</span>
            <InfoTooltip text="Technical complexity of the change. Consider: code complexity, architectural changes, integration points, data migrations, and technical challenges. 1 = Simple change, 10 = Highly complex change." />
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={cabAssessment.complexity || 5}
            onChange={(e) => setCabAssessment({
              ...cabAssessment,
              complexity: parseInt(e.target.value)
            })}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer dark:bg-blue-700"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>1 - Simple</span>
            <span>5 - Moderate</span>
            <span>10 - Highly Complex</span>
          </div>
        </div>

        {/* Testing Required (1-10) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            3. Testing Required: <span className="font-bold text-indigo-600">{cabAssessment.testingRequired || 5}/10</span>
            <InfoTooltip text="Level of testing needed for this change. Consider: unit tests, integration tests, UAT, performance testing, security testing, and regression testing. 1 = Minimal testing, 10 = Extensive testing required." />
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={cabAssessment.testingRequired || 5}
            onChange={(e) => setCabAssessment({
              ...cabAssessment,
              testingRequired: parseInt(e.target.value)
            })}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer dark:bg-blue-700"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>1 - Minimal</span>
            <span>5 - Moderate</span>
            <span>10 - Extensive</span>
          </div>
        </div>

        {/* Rollback Capability (1-10) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            4. Rollback Capability: <span className="font-bold text-indigo-600">{cabAssessment.rollbackCapability || 5}/10</span>
            <InfoTooltip text="How easily can this change be rolled back if issues occur? Consider: database migrations, data changes, external dependencies, downtime required. 1 = Very difficult/impossible to rollback, 10 = Can rollback instantly with no impact." />
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={cabAssessment.rollbackCapability || 5}
            onChange={(e) => setCabAssessment({
              ...cabAssessment,
              rollbackCapability: parseInt(e.target.value)
            })}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer dark:bg-blue-700"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>1 - Very Difficult</span>
            <span>5 - Moderate</span>
            <span>10 - Very Easy</span>
          </div>
        </div>

        {/* Documentation Required (1-10) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            5. Documentation Required: <span className="font-bold text-indigo-600">{cabAssessment.documentationRequired || 5}/10</span>
            <InfoTooltip text="Level of documentation needed. Consider: technical docs, user guides, API documentation, runbooks, training materials, and knowledge transfer. 1 = Minimal docs, 10 = Extensive documentation." />
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={cabAssessment.documentationRequired || 5}
            onChange={(e) => setCabAssessment({
              ...cabAssessment,
              documentationRequired: parseInt(e.target.value)
            })}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer dark:bg-blue-700"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>1 - Minimal</span>
            <span>5 - Moderate</span>
            <span>10 - Extensive</span>
          </div>
        </div>
      </div>
    );
  };

  const renderStrategicStep = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Strategic & Impact Assessment
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Assess strategic alignment and overall impact scope.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Strategic Alignment: <span className="font-bold">{cabAssessment.strategicAlignment}/10</span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={cabAssessment.strategicAlignment || 5}
            onChange={(e) => setCabAssessment({ ...cabAssessment, strategicAlignment: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Number of Users Impacted
          </label>
          <input
            type="number"
            value={cabAssessment.impactedUsers || 0}
            onChange={(e) => setCabAssessment({
              ...cabAssessment,
              impactedUsers: parseInt(e.target.value)
            })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="e.g., 100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Dependencies (comma-separated)
          </label>
          <input
            type="text"
            value={cabAssessment.dependencies?.join(', ') || ''}
            onChange={(e) => setCabAssessment({
              ...cabAssessment,
              dependencies: e.target.value.split(',').map(s => s.trim()).filter(s => s)
            })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="e.g., Network upgrade, Third-party API"
          />
        </div>
      </div>
    );
  };

  const renderReviewStep = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Final Review
        </h3>

        {/* Benefits Section */}
        {(cabAssessment.revenueImprovement || cabAssessment.costSavings || cabAssessment.customerImpact || cabAssessment.processImprovement || cabAssessment.internalQoL) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">Benefits Assessment</h4>

            {cabAssessment.revenueImprovement && (
              <div className="space-y-1">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Revenue Improvement:</span> £{cabAssessment.revenueImprovement.rawValue} annually realised in {cabAssessment.revenueImprovement.rawTimeline} {cabAssessment.revenueImprovement.rawTimeline === 1 ? 'month' : 'months'}
                </div>
                {originalBenefitValues.revenueImprovement && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                    Original: £{originalBenefitValues.revenueImprovement.rawValue} annually realised in {originalBenefitValues.revenueImprovement.rawTimeline} {originalBenefitValues.revenueImprovement.rawTimeline === 1 ? 'month' : 'months'}
                  </div>
                )}
              </div>
            )}

            {cabAssessment.costSavings && (
              <div className="space-y-1">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Cost Savings:</span> £{cabAssessment.costSavings.rawValue} annually realised in {cabAssessment.costSavings.rawTimeline} {cabAssessment.costSavings.rawTimeline === 1 ? 'month' : 'months'}
                </div>
                {originalBenefitValues.costSavings && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                    Original: £{originalBenefitValues.costSavings.rawValue} annually realised in {originalBenefitValues.costSavings.rawTimeline} {originalBenefitValues.costSavings.rawTimeline === 1 ? 'month' : 'months'}
                  </div>
                )}
              </div>
            )}

            {cabAssessment.customerImpact && (
              <div className="space-y-1">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Customer Impact:</span> {cabAssessment.customerImpact.rawValue} customers affected realised in {cabAssessment.customerImpact.rawTimeline} {cabAssessment.customerImpact.rawTimeline === 1 ? 'month' : 'months'}
                </div>
                {originalBenefitValues.customerImpact && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                    Original: {originalBenefitValues.customerImpact.rawValue} customers affected realised in {originalBenefitValues.customerImpact.rawTimeline} {originalBenefitValues.customerImpact.rawTimeline === 1 ? 'month' : 'months'}
                  </div>
                )}
              </div>
            )}

            {cabAssessment.processImprovement && (
              <div className="space-y-1">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Process Improvement:</span> {cabAssessment.processImprovement.rawValue} hours saved per month realised in {cabAssessment.processImprovement.rawTimeline} {cabAssessment.processImprovement.rawTimeline === 1 ? 'month' : 'months'}
                </div>
                {originalBenefitValues.processImprovement && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                    Original: {originalBenefitValues.processImprovement.rawValue} hours saved per month realised in {originalBenefitValues.processImprovement.rawTimeline} {originalBenefitValues.processImprovement.rawTimeline === 1 ? 'month' : 'months'}
                  </div>
                )}
              </div>
            )}

            {cabAssessment.internalQoL && (
              <div className="space-y-1">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Internal Quality of Life:</span> {cabAssessment.internalQoL.rawValue} users affected realised in {cabAssessment.internalQoL.rawTimeline} {cabAssessment.internalQoL.rawTimeline === 1 ? 'month' : 'months'}
                </div>
                {originalBenefitValues.internalQoL && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                    Original: {originalBenefitValues.internalQoL.rawValue} users affected realised in {originalBenefitValues.internalQoL.rawTimeline} {originalBenefitValues.internalQoL.rawTimeline === 1 ? 'month' : 'months'}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Effort Assessment Section */}
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg space-y-3">
          <h4 className="font-semibold text-purple-900 dark:text-purple-100">Effort Assessment</h4>

          <div className="space-y-1">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Cost Estimated:</span> £{cabAssessment.costEstimated?.toLocaleString() || 0}
            </div>
            {originalData?.estimatedCost && (
              <div className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                Original: £{parseFloat(originalData.estimatedCost.toString().replace(/[£,]/g, '')).toLocaleString()}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Hours Estimated:</span> {cabAssessment.hoursEstimated || 0} hours
            </div>
            {originalData?.estimatedEffortHours && (
              <div className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                Original: {originalData.estimatedEffortHours} hours
              </div>
            )}
          </div>

          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Resource Requirement:</span> {cabAssessment.resourceRequirement || 1}/10
          </div>

          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Urgency:</span> {cabAssessment.urgency || 5}/10
          </div>

          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Strategic Alignment:</span> {cabAssessment.strategicAlignment || 5}/10
          </div>
        </div>

        {/* Risk Assessment Section */}
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg space-y-3">
          <h4 className="font-semibold text-red-900 dark:text-red-100">Risk Assessment</h4>

          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Business Risk:</span> {cabAssessment.businessRisk || 5}/10
          </div>

          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Complexity:</span> {cabAssessment.complexity || 5}/10
          </div>

          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Testing Required:</span> {cabAssessment.testingRequired || 5}/10
          </div>

          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Rollback Capability:</span> {cabAssessment.rollbackCapability || 5}/10
          </div>

          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Documentation Required:</span> {cabAssessment.documentationRequired || 5}/10
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Final CAB Comments
          </label>
          <textarea
            value={cabAssessment.cabComments || ''}
            onChange={(e) => setCabAssessment({ ...cabAssessment, cabComments: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter final comments about this change request..."
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleApprove}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-5 h-5" />
            {isSubmitting ? 'Approving...' : 'Approve Change'}
          </button>

          <button
            onClick={handleReject}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XCircle className="w-5 h-5" />
            {isSubmitting ? 'Rejecting...' : 'Reject Change'}
          </button>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    if (!step) return null;

    switch (step.field) {
      case 'effort':
        return renderEffortStep();
      case 'risk':
        return renderRiskStep();
      case 'review':
        return renderReviewStep();
      default:
        return renderBenefitStep(step.field);
    }
  };

  if (!change) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading change request...</p>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];
  const Icon = currentStepData?.icon || CheckCircle;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cab-review')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to CAB Review
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                CAB Review Assessment
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {change.requestNumber} - {change.title}
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Step {currentStep + 1} of {steps.length}: {currentStepData?.title}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </button>

          {currentStep < steps.length - 1 && (
            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
