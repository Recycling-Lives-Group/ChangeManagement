import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Database, Calendar, TrendingUp, AlertTriangle, Eye, Users, Clock, CheckCircle2 } from 'lucide-react';

export default function ChangeRequestDebug() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDebugData();
  }, [id]);

  const fetchDebugData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/changes/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch change request');
      }

      const result = await response.json();
      console.log('DEBUG - Raw API Response:', result.data);
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading change request data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error: {error || 'No data found'}</p>
          </div>
        </div>
      </div>
    );
  }

  // API returns camelCase (formatted by backend)
  const wizardData = data.wizardData || {};
  const effortFactors = data.effortFactors || {};
  const benefitFactors = data.benefitFactors || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-amber-900 font-bold">Development Debug View</p>
                <p className="text-amber-700 text-sm mt-1">
                  Complete data inspection for Change Request #{data.request_number || data.id}
                </p>
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            {wizardData.changeTitle || data.title || 'Untitled Change Request'}
          </h1>
          <p className="text-gray-600 mt-2">
            Status: <span className="font-semibold capitalize">{data.status}</span> |
            Priority: <span className="font-semibold capitalize ml-2">{data.priority}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Stats Cards */}
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Risk Score"
            value={data.riskScore || 'Not calculated'}
            subtitle={data.riskLevel || ''}
            color="red"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            title="Effort Score"
            value={data.effortScore || 'Not calculated'}
            subtitle={data.effortCalculatedAt ? formatDate(data.effortCalculatedAt) : ''}
            color="orange"
          />
          <StatCard
            icon={<CheckCircle2 className="w-6 h-6" />}
            title="Benefit Score"
            value={data.benefitScore || 'Not calculated'}
            subtitle={data.benefitCalculatedAt ? formatDate(data.benefitCalculatedAt) : ''}
            color="green"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Section title="Basic Information" icon={<Database className="w-5 h-5" />}>
            <InfoGrid>
              <InfoItem label="Request Number" value={data.requestNumber} />
              <InfoItem label="Title" value={wizardData.changeTitle} />
              <InfoItem label="Description" value={wizardData.briefDescription} />
              <InfoItem label="Proposed Date" value={wizardData.proposedDate ? formatDate(wizardData.proposedDate) : 'N/A'} />
              <InfoItem label="Status" value={data.status} />
              <InfoItem label="Priority" value={data.priority} />
            </InfoGrid>
          </Section>

          {/* Requester Information */}
          <Section title="Requester Information" icon={<Users className="w-5 h-5" />}>
            <InfoGrid>
              <InfoItem label="Name" value={`${data.requester?.firstName || ''} ${data.requester?.lastName || ''}`.trim() || 'N/A'} />
              <InfoItem label="Email" value={data.requester?.email} />
              <InfoItem label="Department" value={data.requester?.department} />
              <InfoItem label="Username" value={data.requester?.name} />
            </InfoGrid>
          </Section>

          {/* Business Justification */}
          <Section title="Business Justification" icon={<TrendingUp className="w-5 h-5" />}>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700 mb-2">Selected Reasons:</h4>
              <div className="flex flex-wrap gap-2">
                {wizardData.changeReasons?.revenueImprovement && <Badge color="green">Revenue Improvement</Badge>}
                {wizardData.changeReasons?.costReduction && <Badge color="blue">Cost Reduction</Badge>}
                {wizardData.changeReasons?.customerImpact && <Badge color="purple">Customer Impact</Badge>}
                {wizardData.changeReasons?.processImprovement && <Badge color="orange">Process Improvement</Badge>}
                {wizardData.changeReasons?.internalQoL && <Badge color="teal">Internal QoL</Badge>}
                {wizardData.changeReasons?.riskReduction && <Badge color="red">Risk Reduction</Badge>}
              </div>

              {/* Revenue Details */}
              {wizardData.revenueDetails && (
                <DetailCard title="Revenue Improvement Details" color="green">
                  <InfoItem label="Expected Revenue" value={wizardData.revenueDetails.expectedRevenue ? `£${wizardData.revenueDetails.expectedRevenue}` : 'N/A'} />
                  <InfoItem label="Timeline" value={wizardData.revenueDetails.revenueTimeline} />
                  <InfoItem label="Description" value={wizardData.revenueDetails.revenueDescription} fullWidth />
                </DetailCard>
              )}

              {/* Cost Reduction Details */}
              {wizardData.costReductionDetails && (
                <DetailCard title="Cost Reduction Details" color="blue">
                  <InfoItem label="Expected Savings" value={wizardData.costReductionDetails.expectedSavings ? `£${wizardData.costReductionDetails.expectedSavings}` : 'N/A'} />
                  <InfoItem label="Cost Areas" value={wizardData.costReductionDetails.costareas} />
                  <InfoItem label="Description" value={wizardData.costReductionDetails.savingsDescription} fullWidth />
                </DetailCard>
              )}

              {/* Customer Impact Details */}
              {wizardData.customerImpactDetails && (
                <DetailCard title="Customer Impact Details" color="purple">
                  <InfoItem label="Customers Affected" value={wizardData.customerImpactDetails.customersAffected} />
                  <InfoItem label="Expected Satisfaction" value={wizardData.customerImpactDetails.expectedSatisfaction} />
                  <InfoItem label="Description" value={wizardData.customerImpactDetails.impactDescription} fullWidth />
                </DetailCard>
              )}

              {/* Process Improvement Details */}
              {wizardData.processImprovementDetails && (
                <DetailCard title="Process Improvement Details" color="orange">
                  <InfoItem label="Current Issues" value={wizardData.processImprovementDetails.currentIssues} />
                  <InfoItem label="Expected Efficiency" value={wizardData.processImprovementDetails.expectedEfficiency} />
                  <InfoItem label="Description" value={wizardData.processImprovementDetails.processDescription} fullWidth />
                </DetailCard>
              )}

              {/* Internal QoL Details */}
              {wizardData.internalQoLDetails && (
                <DetailCard title="Internal QoL Details" color="teal">
                  <InfoItem label="Users Affected" value={wizardData.internalQoLDetails.usersAffected} />
                  <InfoItem label="Current Pain Points" value={wizardData.internalQoLDetails.currentPainPoints} />
                  <InfoItem label="Expected Improvements" value={wizardData.internalQoLDetails.expectedImprovements} fullWidth />
                </DetailCard>
              )}

              {/* Risk Reduction Details */}
              {wizardData.riskReductionDetails && (
                <DetailCard title="Risk Reduction Details" color="red">
                  <InfoItem label="Current Risks" value={wizardData.riskReductionDetails.currentRisks} />
                  <InfoItem label="Risk Mitigation" value={wizardData.riskReductionDetails.riskMitigation} />
                  <InfoItem label="Compliance Improvement" value={wizardData.riskReductionDetails.complianceImprovement} fullWidth />
                </DetailCard>
              )}
            </div>
          </Section>

          {/* Impact Assessment */}
          <Section title="Impact Assessment" icon={<AlertTriangle className="w-5 h-5" />}>
            <InfoGrid>
              <InfoItem label="Systems Affected" value={Array.isArray(wizardData.systemsAffected) ? wizardData.systemsAffected.join(', ') : wizardData.systemsAffected} fullWidth />
              <InfoItem label="Impacted Users" value={wizardData.impactedUsers} />
              <InfoItem label="Departments" value={Array.isArray(wizardData.departments) ? wizardData.departments.join(', ') : wizardData.departments} fullWidth />
              <InfoItem label="Estimated Effort (hours)" value={wizardData.estimatedEffortHours} />
              <InfoItem label="Estimated Cost" value={wizardData.estimatedCost ? `£${wizardData.estimatedCost}` : 'N/A'} />
            </InfoGrid>
          </Section>

          {/* Effort Factors */}
          {data.effortFactors && Object.keys(effortFactors).length > 0 && (
            <Section title="Effort Factors (Calculated)" icon={<Clock className="w-5 h-5" />} fullWidth>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {effortFactors.impactScope && <FactorBadge label="Impact Scope" value={effortFactors.impactScope} />}
                {effortFactors.businessCritical && <FactorBadge label="Business Critical" value={effortFactors.businessCritical} />}
                {effortFactors.complexity && <FactorBadge label="Complexity" value={effortFactors.complexity} />}
                {effortFactors.testingCoverage && <FactorBadge label="Testing Coverage" value={effortFactors.testingCoverage} inverse />}
                {effortFactors.rollbackCapability && <FactorBadge label="Rollback Capability" value={effortFactors.rollbackCapability} inverse />}
                {effortFactors.historicalFailures && <FactorBadge label="Historical Failures" value={effortFactors.historicalFailures} />}
                {effortFactors.costToImplement && <FactorBadge label="Cost to Implement" value={effortFactors.costToImplement} />}
                {effortFactors.timeToImplement && <FactorBadge label="Time to Implement" value={effortFactors.timeToImplement} />}
              </div>
            </Section>
          )}

          {/* Benefit Factors */}
          {data.benefitFactors && Object.keys(benefitFactors).length > 0 && (
            <Section title="Benefit Factors (Calculated)" icon={<CheckCircle2 className="w-5 h-5" />} fullWidth>
              <div className="space-y-3">
                {benefitFactors.revenueImprovement && (
                  <BenefitCard title="Revenue Improvement" data={benefitFactors.revenueImprovement} />
                )}
                {benefitFactors.costSavings && (
                  <BenefitCard title="Cost Savings" data={benefitFactors.costSavings} />
                )}
                {benefitFactors.customerImpact && (
                  <BenefitCard title="Customer Impact" data={benefitFactors.customerImpact} />
                )}
                {benefitFactors.processImprovement && (
                  <BenefitCard title="Process Improvement" data={benefitFactors.processImprovement} />
                )}
                {benefitFactors.internalQoL && (
                  <BenefitCard title="Internal QoL" data={benefitFactors.internalQoL} />
                )}
                {benefitFactors.strategicAlignment && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <h5 className="font-semibold text-purple-900 mb-1">Strategic Alignment</h5>
                    <p className="text-sm text-gray-700 mb-2">{benefitFactors.strategicAlignment.explanation}</p>
                    <div className="flex gap-4 text-sm">
                      <span>Score: <strong>{benefitFactors.strategicAlignment.score}/10</strong></span>
                      <span>Weighted: <strong>{benefitFactors.strategicAlignment.weightedScore?.toFixed(2)}</strong></span>
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Timestamps */}
          <Section title="Timestamps" icon={<Calendar className="w-5 h-5" />} fullWidth>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoItem label="Created" value={formatDate(data.createdAt)} />
              <InfoItem label="Updated" value={formatDate(data.updatedAt)} />
              <InfoItem label="Submitted" value={formatDate(data.submittedAt)} />
              <InfoItem label="Scheduled Start" value={formatDate(data.scheduledStart)} />
              <InfoItem label="Scheduled End" value={formatDate(data.scheduledEnd)} />
              <InfoItem label="Actual Start" value={formatDate(data.actualStart)} />
              <InfoItem label="Actual End" value={formatDate(data.actualEnd)} />
            </div>
          </Section>
        </div>

        {/* Raw JSON Data (Collapsible) */}
        <div className="mt-6">
          <details className="bg-white rounded-lg shadow-md p-4">
            <summary className="cursor-pointer font-semibold text-gray-700 hover:text-blue-600">
              🔍 View Raw Database JSON
            </summary>
            <pre className="mt-4 bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}

// Helper Components

function StatCard({ icon, title, value, subtitle, color }: any) {
  const colors = {
    red: 'from-red-500 to-red-600 text-white',
    orange: 'from-orange-500 to-orange-600 text-white',
    green: 'from-green-500 to-green-600 text-white',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl shadow-lg p-6`}>
      <div className="flex items-center justify-between mb-3">
        {icon}
        <span className="text-sm font-medium opacity-90">{title}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
      {subtitle && <div className="text-sm mt-2 opacity-75">{subtitle}</div>}
    </div>
  );
}

function Section({ title, icon, children, fullWidth = false }: any) {
  return (
    <div className={`bg-white rounded-xl shadow-md p-6 ${fullWidth ? 'lg:col-span-2' : ''}`}>
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
        {icon}
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function InfoGrid({ children }: any) {
  return <div className="grid grid-cols-1 gap-4">{children}</div>;
}

function InfoItem({ label, value, fullWidth = false }: any) {
  return (
    <div className={fullWidth ? 'col-span-full' : ''}>
      <dt className="text-sm font-medium text-gray-500 mb-1">{label}</dt>
      <dd className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">{value || 'N/A'}</dd>
    </div>
  );
}

function Badge({ color, children }: any) {
  const colors = {
    green: 'bg-green-100 text-green-800 border-green-300',
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    purple: 'bg-purple-100 text-purple-800 border-purple-300',
    orange: 'bg-orange-100 text-orange-800 border-orange-300',
    teal: 'bg-teal-100 text-teal-800 border-teal-300',
    red: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[color]}`}>
      {children}
    </span>
  );
}

function DetailCard({ title, color, children }: any) {
  const colors = {
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200',
    teal: 'bg-teal-50 border-teal-200',
    red: 'bg-red-50 border-red-200',
  };

  return (
    <div className={`border rounded-lg p-3 mt-3 ${colors[color]}`}>
      <h5 className="font-semibold text-gray-900 mb-2">{title}</h5>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function FactorBadge({ label, value, inverse = false }: any) {
  const getColor = (val: number, inv: boolean) => {
    const adjustedVal = inv ? (6 - val) : val;
    if (adjustedVal >= 4) return 'bg-red-100 text-red-800 border-red-300';
    if (adjustedVal >= 3) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  return (
    <div className={`border rounded-lg p-3 text-center ${getColor(value, inverse)}`}>
      <div className="text-xs font-medium mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}/5</div>
      {inverse && <div className="text-xs mt-1 opacity-75">(inverse)</div>}
    </div>
  );
}

function BenefitCard({ title, data }: any) {
  if (!data) return null;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
      <h5 className="font-semibold text-green-900 mb-2">{title}</h5>
      <p className="text-sm text-gray-700 mb-2">{data.explanation || 'No explanation provided'}</p>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-white rounded p-2">
          <div className="text-gray-600">Raw Value</div>
          <div className="font-bold text-gray-900">{data.rawValue || 'N/A'}</div>
        </div>
        <div className="bg-white rounded p-2">
          <div className="text-gray-600">Timeline</div>
          <div className="font-bold text-gray-900">{data.rawTimeline || 'N/A'} mo</div>
        </div>
        <div className="bg-white rounded p-2">
          <div className="text-gray-600">Weighted Score</div>
          <div className="font-bold text-green-700">{data.weightedScore?.toFixed(2) || 'N/A'}</div>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid date';
  }
}
