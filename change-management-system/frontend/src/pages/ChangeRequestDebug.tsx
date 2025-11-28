import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Database, Calendar, Code2, ChevronDown, ChevronRight } from 'lucide-react';

export default function ChangeRequestDebug() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));

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

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-green-400 font-mono">Loading database record...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900 border border-red-600 rounded-lg p-4">
            <p className="text-red-200 font-mono">Error: {error || 'No data found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-green-400 p-6 font-mono">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-green-500 hover:text-green-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="font-mono">back_to_dashboard()</span>
          </Link>

          <div className="bg-yellow-900 border-l-4 border-yellow-500 p-4 mb-4">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="text-yellow-200 font-bold">⚠️ DEVELOPMENT DEBUG MODE</p>
                <p className="text-yellow-300 text-sm mt-1">
                  Raw database dump for change_requests table - ID: {data.id}
                </p>
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-green-500">
            {'>'} SELECT * FROM change_requests WHERE id = {data.id};
          </h1>
        </div>

        {/* Database Table View */}
        <div className="bg-gray-800 border border-green-600 rounded-lg overflow-hidden mb-6">
          <div className="bg-gray-700 px-4 py-2 border-b border-green-600">
            <span className="text-green-400">change_requests</span>
            <span className="text-gray-400 ml-4">| 1 row returned</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {/* Core Fields */}
                <TableSection
                  title="Core Fields"
                  sectionKey="basic"
                  expanded={expandedSections.has('basic')}
                  onToggle={() => toggleSection('basic')}
                >
                  <TableRow label="id" value={data.id} type="INT" />
                  <TableRow label="request_number" value={data.request_number} type="VARCHAR(50)" />
                  <TableRow label="title" value={data.title} type="VARCHAR(255)" />
                  <TableRow label="description" value={data.description} type="TEXT" />
                  <TableRow label="requester_id" value={data.requester_id} type="INT" />
                  <TableRow label="status" value={data.status} type="ENUM" />
                  <TableRow label="priority" value={data.priority} type="ENUM" />
                </TableSection>

                {/* Timestamps */}
                <TableSection
                  title="Timestamps"
                  sectionKey="timestamps"
                  expanded={expandedSections.has('timestamps')}
                  onToggle={() => toggleSection('timestamps')}
                >
                  <TableRow label="created_at" value={data.created_at} type="TIMESTAMP" />
                  <TableRow label="updated_at" value={data.updated_at} type="TIMESTAMP" />
                  <TableRow label="submitted_at" value={data.submitted_at} type="TIMESTAMP" />
                  <TableRow label="scheduled_start" value={data.scheduled_start} type="TIMESTAMP" />
                  <TableRow label="scheduled_end" value={data.scheduled_end} type="TIMESTAMP" />
                  <TableRow label="actual_start" value={data.actual_start} type="TIMESTAMP" />
                  <TableRow label="actual_end" value={data.actual_end} type="TIMESTAMP" />
                </TableSection>

                {/* Risk Assessment */}
                <TableSection
                  title="Risk Assessment"
                  sectionKey="risk"
                  expanded={expandedSections.has('risk')}
                  onToggle={() => toggleSection('risk')}
                >
                  <TableRow label="risk_score" value={data.risk_score} type="INT" />
                  <TableRow label="risk_level" value={data.risk_level} type="VARCHAR(20)" />
                  <TableRow label="risk_calculated_at" value={data.risk_calculated_at} type="TIMESTAMP" />
                  <TableRow label="risk_calculated_by" value={data.risk_calculated_by} type="INT" />
                </TableSection>

                {/* Effort Assessment */}
                <TableSection
                  title="Effort Assessment"
                  sectionKey="effort"
                  expanded={expandedSections.has('effort')}
                  onToggle={() => toggleSection('effort')}
                >
                  <TableRow label="effort_score" value={data.effort_score} type="INT" />
                  <TableRow label="effort_calculated_at" value={data.effort_calculated_at} type="TIMESTAMP" />
                  <TableRow label="effort_factors" value={data.effort_factors} type="JSON" isJson />
                </TableSection>

                {/* Benefit Assessment */}
                <TableSection
                  title="Benefit Assessment"
                  sectionKey="benefit"
                  expanded={expandedSections.has('benefit')}
                  onToggle={() => toggleSection('benefit')}
                >
                  <TableRow label="benefit_score" value={data.benefit_score} type="INT" />
                  <TableRow label="benefit_calculated_at" value={data.benefit_calculated_at} type="TIMESTAMP" />
                  <TableRow label="benefit_factors" value={data.benefit_factors} type="JSON" isJson />
                </TableSection>

                {/* JSON Data Columns */}
                <TableSection
                  title="JSON Data Columns"
                  sectionKey="json"
                  expanded={expandedSections.has('json')}
                  onToggle={() => toggleSection('json')}
                >
                  <TableRow label="wizard_data" value={data.wizard_data} type="JSON" isJson />
                  <TableRow label="scheduling_data" value={data.scheduling_data} type="JSON" isJson />
                  <TableRow label="metrics_data" value={data.metrics_data} type="JSON" isJson />
                  <TableRow label="prioritization_data" value={data.prioritization_data} type="JSON" isJson />
                  <TableRow label="custom_fields" value={data.custom_fields} type="JSON" isJson />
                </TableSection>

                {/* Requester Info (from JOIN) */}
                {data.requester_email && (
                  <TableSection
                    title="Requester Info (JOINed from users table)"
                    sectionKey="requester"
                    expanded={expandedSections.has('requester')}
                    onToggle={() => toggleSection('requester')}
                  >
                    <TableRow label="requester_email" value={data.requester_email} type="VARCHAR(255)" />
                    <TableRow label="requester_username" value={data.requester_username} type="VARCHAR(100)" />
                    <TableRow label="requester_first_name" value={data.requester_first_name} type="VARCHAR(100)" />
                    <TableRow label="requester_last_name" value={data.requester_last_name} type="VARCHAR(100)" />
                    <TableRow label="requester_department" value={data.requester_department} type="VARCHAR(100)" />
                  </TableSection>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SQL Query Info */}
        <div className="bg-gray-800 border border-blue-600 rounded-lg p-4 text-xs">
          <div className="flex items-center gap-2 mb-2">
            <Code2 className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 font-bold">Query Info</span>
          </div>
          <div className="text-gray-400 space-y-1">
            <div>Endpoint: <span className="text-green-400">GET /api/changes/{id}</span></div>
            <div>Database: <span className="text-green-400">change_management</span></div>
            <div>Table: <span className="text-green-400">change_requests</span></div>
            <div>Fetched at: <span className="text-green-400">{new Date().toLocaleString('en-GB')}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components

interface TableSectionProps {
  title: string;
  sectionKey: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function TableSection({ title, sectionKey, expanded, onToggle, children }: TableSectionProps) {
  return (
    <>
      <tr className="bg-gray-700 border-t-2 border-green-600">
        <td
          colSpan={3}
          className="px-4 py-2 cursor-pointer hover:bg-gray-600"
          onClick={onToggle}
        >
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-yellow-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-yellow-400" />
            )}
            <span className="text-yellow-400 font-bold">{title}</span>
          </div>
        </td>
      </tr>
      {expanded && children}
    </>
  );
}

interface TableRowProps {
  label: string;
  value: any;
  type: string;
  isJson?: boolean;
}

function TableRow({ label, value, type, isJson = false }: TableRowProps) {
  const [jsonExpanded, setJsonExpanded] = useState(false);

  const formatValue = (val: any): string => {
    if (val === null || val === undefined) {
      return 'NULL';
    }

    if (typeof val === 'object') {
      return JSON.stringify(val, null, 2);
    }

    return String(val);
  };

  const displayValue = formatValue(value);
  const isNull = value === null || value === undefined;
  const isLongText = displayValue.length > 100 || isJson;

  return (
    <tr className="border-t border-gray-700 hover:bg-gray-750">
      <td className="px-4 py-2 text-cyan-400 align-top whitespace-nowrap">{label}</td>
      <td className="px-4 py-2 text-purple-400 align-top text-xs">{type}</td>
      <td className="px-4 py-2 align-top">
        {isNull ? (
          <span className="text-gray-500 italic">NULL</span>
        ) : isLongText && isJson ? (
          <div>
            <button
              onClick={() => setJsonExpanded(!jsonExpanded)}
              className="text-blue-400 hover:text-blue-300 mb-2 flex items-center gap-1"
            >
              {jsonExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              {jsonExpanded ? 'Hide JSON' : 'Show JSON'}
            </button>
            {jsonExpanded && (
              <pre className="bg-gray-900 border border-gray-600 rounded p-3 overflow-x-auto text-xs text-green-300">
                {displayValue}
              </pre>
            )}
          </div>
        ) : (
          <div className="text-green-300 break-words max-w-3xl">
            {displayValue}
          </div>
        )}
      </td>
    </tr>
  );
}
