import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Database, Calendar, TrendingUp, Target, DollarSign, Clock } from 'lucide-react';

interface ChangeRequestDebugData {
  // Basic Info
  id: number;
  request_number: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  requester_id: number;

  // Timestamps
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  actual_start: string | null;
  actual_end: string | null;

  // Wizard Data (JSON)
  wizard_data: any;

  // Scheduling Data (JSON)
  scheduling_data: any;

  // Metrics Data (JSON)
  metrics_data: any;

  // Prioritization Data (JSON)
  prioritization_data: any;

  // Custom Fields (JSON)
  custom_fields: any;

  // Risk Assessment
  risk_score: number | null;
  risk_level: string | null;
  risk_calculated_at: string | null;
  risk_calculated_by: number | null;

  // Effort Assessment
  effort_score: number | null;
  effort_factors: {
    impactScope: number;
    businessCritical: number;
    complexity: number;
    testingCoverage: number;
    rollbackCapability: number;
    historicalFailures: number;
    costToImplement: number;
    timeToImplement: number;
  } | null;
  effort_calculated_at: string | null;

  // Benefit Assessment
  benefit_score: number | null;
  benefit_factors: {
    revenueImprovement: any | null;
    costSavings: any | null;
    customerImpact: any | null;
    processImprovement: any | null;
    internalQoL: any | null;
    strategicAlignment: any | null;
  } | null;
  benefit_calculated_at: string | null;

  // Requester Info
  requester_email?: string;
  requester_username?: string;
  requester_first_name?: string;
  requester_last_name?: string;
  requester_department?: string;
}

export default function ChangeRequestDebug() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ChangeRequestDebugData | null>(null);
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
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading debug data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error || 'No data found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Database className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>DEBUG MODE:</strong> This page shows raw database data and calculated scores for development purposes only.
                </p>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Change Request Debug View
          </h1>
          <p className="text-gray-600 mt-2">ID: {data.id} | Request Number: {data.request_number}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Risk Score"
            value={data.risk_score !== null && data.risk_score !== undefined ? data.risk_score.toFixed(2) : 'Not calculated'}
            sublabel={data.risk_level || ''}
            color="red"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label="Effort Score"
            value={data.effort_score !== null && data.effort_score !== undefined ? data.effort_score.toFixed(2) : 'Not calculated'}
            sublabel={data.effort_calculated_at ? `Calc: ${new Date(data.effort_calculated_at).toLocaleDateString()}` : ''}
            color="orange"
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6" />}
            label="Benefit Score"
            value={data.benefit_score !== null && data.benefit_score !== undefined ? data.benefit_score.toFixed(2) : 'Not calculated'}
            sublabel={data.benefit_calculated_at ? `Calc: ${new Date(data.benefit_calculated_at).toLocaleDateString()}` : ''}
            color="green"
          />
          <StatCard
            icon={<Target className="w-6 h-6" />}
            label="Priority"
            value={data.priority || 'N/A'}
            sublabel={data.status}
            color="blue"
          />
        </div>

        {/* Basic Information */}
        <Section title="Basic Information" icon={<Database className="w-5 h-5" />}>
          <DataGrid>
            <DataItem label="Title" value={data.title} />
            <DataItem label="Description" value={data.description || 'N/A'} />
            <DataItem label="Status" value={data.status} />
            <DataItem label="Priority" value={data.priority} />
            <DataItem label="Request Number" value={data.request_number} />
            <DataItem label="Requester ID" value={data.requester_id} />
          </DataGrid>
        </Section>

        {/* Requester Information */}
        {data.requester_email && (
          <Section title="Requester Information">
            <DataGrid>
              <DataItem label="Email" value={data.requester_email} />
              <DataItem label="Username" value={data.requester_username || 'N/A'} />
              <DataItem label="Name" value={`${data.requester_first_name || ''} ${data.requester_last_name || ''}`.trim() || 'N/A'} />
              <DataItem label="Department" value={data.requester_department || 'N/A'} />
            </DataGrid>
          </Section>
        )}

        {/* Timestamps */}
        <Section title="Timestamps" icon={<Calendar className="w-5 h-5" />}>
          <DataGrid>
            <DataItem label="Created" value={formatDate(data.created_at)} />
            <DataItem label="Updated" value={formatDate(data.updated_at)} />
            <DataItem label="Submitted" value={formatDate(data.submitted_at)} />
            <DataItem label="Scheduled Start" value={formatDate(data.scheduled_start)} />
            <DataItem label="Scheduled End" value={formatDate(data.scheduled_end)} />
            <DataItem label="Actual Start" value={formatDate(data.actual_start)} />
            <DataItem label="Actual End" value={formatDate(data.actual_end)} />
          </DataGrid>
        </Section>

        {/* Risk Assessment */}
        <Section title="Risk Assessment" color="red">
          <DataGrid>
            <DataItem label="Risk Score" value={data.risk_score !== null && data.risk_score !== undefined ? data.risk_score.toFixed(2) : 'Not calculated'} />
            <DataItem label="Risk Level" value={data.risk_level || 'Not set'} />
            <DataItem label="Calculated At" value={formatDate(data.risk_calculated_at)} />
            <DataItem label="Calculated By (User ID)" value={data.risk_calculated_by || 'N/A'} />
          </DataGrid>
        </Section>

        {/* Effort Assessment */}
        <Section title="Effort Assessment" color="orange">
          <DataGrid>
            <DataItem label="Effort Score" value={data.effort_score !== null && data.effort_score !== undefined ? data.effort_score.toFixed(2) : 'Not calculated'} />
            <DataItem label="Calculated At" value={formatDate(data.effort_calculated_at)} />
          </DataGrid>
          {data.effort_factors && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-700 mb-3">Effort Factors (1-5 scale):</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <FactorBadge label="Impact Scope" value={data.effort_factors.impactScope} />
                <FactorBadge label="Business Critical" value={data.effort_factors.businessCritical} />
                <FactorBadge label="Complexity" value={data.effort_factors.complexity} />
                <FactorBadge label="Testing Coverage" value={data.effort_factors.testingCoverage} inverse />
                <FactorBadge label="Rollback Capability" value={data.effort_factors.rollbackCapability} inverse />
                <FactorBadge label="Historical Failures" value={data.effort_factors.historicalFailures} />
                <FactorBadge label="Cost to Implement" value={data.effort_factors.costToImplement} />
                <FactorBadge label="Time to Implement" value={data.effort_factors.timeToImplement} />
              </div>
            </div>
          )}
        </Section>

        {/* Benefit Assessment */}
        <Section title="Benefit Assessment" color="green">
          <DataGrid>
            <DataItem label="Benefit Score" value={data.benefit_score !== null && data.benefit_score !== undefined ? data.benefit_score.toFixed(2) : 'Not calculated'} />
            <DataItem label="Calculated At" value={formatDate(data.benefit_calculated_at)} />
          </DataGrid>
          {data.benefit_factors && (
            <div className="mt-4 space-y-4">
              {data.benefit_factors.revenueImprovement && (
                <BenefitDetail title="Revenue Improvement" data={data.benefit_factors.revenueImprovement} unit="£" />
              )}
              {data.benefit_factors.costSavings && (
                <BenefitDetail title="Cost Savings" data={data.benefit_factors.costSavings} unit="£" />
              )}
              {data.benefit_factors.customerImpact && (
                <BenefitDetail title="Customer Impact" data={data.benefit_factors.customerImpact} unit="customers" />
              )}
              {data.benefit_factors.processImprovement && (
                <BenefitDetail title="Process Improvement" data={data.benefit_factors.processImprovement} unit="hours" />
              )}
              {data.benefit_factors.internalQoL && (
                <BenefitDetail title="Internal QoL" data={data.benefit_factors.internalQoL} unit="hours" />
              )}
              {data.benefit_factors.strategicAlignment && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h5 className="font-semibold text-purple-900 mb-2">Strategic Alignment</h5>
                  <p className="text-sm text-gray-700 mb-2">{data.benefit_factors.strategicAlignment.explanation || 'No explanation provided'}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-600">Score: <strong>{data.benefit_factors.strategicAlignment.score ?? 'N/A'}/10</strong></span>
                    <span className="text-gray-600">Weighted: <strong>{data.benefit_factors.strategicAlignment.weightedScore !== undefined ? data.benefit_factors.strategicAlignment.weightedScore.toFixed(2) : 'N/A'}</strong></span>
                  </div>
                </div>
              )}
            </div>
          )}
        </Section>

        {/* Wizard Data (Raw JSON) */}
        {data.wizard_data && (
          <Section title="Wizard Data (Raw JSON)" collapsible>
            <JsonViewer data={data.wizard_data} />
          </Section>
        )}

        {/* Scheduling Data (Raw JSON) */}
        {data.scheduling_data && (
          <Section title="Scheduling Data (Raw JSON)" collapsible>
            <JsonViewer data={data.scheduling_data} />
          </Section>
        )}

        {/* Metrics Data (Raw JSON) */}
        {data.metrics_data && (
          <Section title="Metrics Data (Raw JSON)" collapsible>
            <JsonViewer data={data.metrics_data} />
          </Section>
        )}

        {/* Prioritization Data (Raw JSON) */}
        {data.prioritization_data && (
          <Section title="Prioritization Data (Raw JSON)" collapsible>
            <JsonViewer data={data.prioritization_data} />
          </Section>
        )}

        {/* Custom Fields (Raw JSON) */}
        {data.custom_fields && (
          <Section title="Custom Fields (Raw JSON)" collapsible>
            <JsonViewer data={data.custom_fields} />
          </Section>
        )}
      </div>
    </div>
  );
}

// Helper Components

function StatCard({ icon, label, value, sublabel, color }: any) {
  const colors = {
    red: 'bg-red-50 text-red-700 border-red-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <div className={`${colors[color]} border rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-2">
        {icon}
        <span className="text-xs font-medium uppercase">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {sublabel && <div className="text-xs mt-1 opacity-75">{sublabel}</div>}
    </div>
  );
}

function Section({ title, icon, children, color = 'gray', collapsible = false }: any) {
  const [isOpen, setIsOpen] = useState(!collapsible);

  const colors = {
    gray: 'border-gray-200',
    red: 'border-red-200',
    orange: 'border-orange-200',
    green: 'border-green-200',
  };

  return (
    <div className={`bg-white border ${colors[color]} rounded-lg p-6 mb-6`}>
      <div
        className={`flex items-center gap-2 mb-4 ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={() => collapsible && setIsOpen(!isOpen)}
      >
        {icon}
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {collapsible && (
          <span className="ml-auto text-gray-400">
            {isOpen ? '▼' : '▶'}
          </span>
        )}
      </div>
      {isOpen && children}
    </div>
  );
}

function DataGrid({ children }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {children}
    </div>
  );
}

function DataItem({ label, value }: any) {
  return (
    <div className="border-b border-gray-200 pb-2">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 break-words">{value || 'N/A'}</dd>
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
    <div className={`border rounded-lg p-3 ${getColor(value, inverse)}`}>
      <div className="text-xs font-medium mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}/5</div>
    </div>
  );
}

function BenefitDetail({ title, data, unit }: any) {
  if (!data) return null;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <h5 className="font-semibold text-green-900 mb-2">{title}</h5>
      <p className="text-sm text-gray-700 mb-3">{data.explanation || 'No explanation provided'}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        <div>
          <span className="text-gray-600">Raw Value:</span>
          <strong className="ml-2">{data.rawValue ?? 'N/A'} {unit}</strong>
        </div>
        <div>
          <span className="text-gray-600">Timeline:</span>
          <strong className="ml-2">{data.rawTimeline ?? 'N/A'} months</strong>
        </div>
        <div>
          <span className="text-gray-600">Value Score:</span>
          <strong className="ml-2">{data.valueScore !== undefined ? data.valueScore.toFixed(2) : 'N/A'}</strong>
        </div>
        <div>
          <span className="text-gray-600">Time Score:</span>
          <strong className="ml-2">{data.timeScore !== undefined ? data.timeScore.toFixed(2) : 'N/A'}</strong>
        </div>
        <div>
          <span className="text-gray-600">Combined:</span>
          <strong className="ml-2">{data.combinedScore !== undefined ? data.combinedScore.toFixed(2) : 'N/A'}</strong>
        </div>
        <div>
          <span className="text-gray-600">Weighted:</span>
          <strong className="ml-2 text-green-700">{data.weightedScore !== undefined ? data.weightedScore.toFixed(2) : 'N/A'}</strong>
        </div>
      </div>
    </div>
  );
}

function JsonViewer({ data }: any) {
  return (
    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono">
      {JSON.stringify(data, null, 2)}
    </pre>
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
