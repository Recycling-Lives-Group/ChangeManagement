import React, { useState } from 'react';
import {
  Play,
  Pause,
  Plus,
  Settings,
  Zap,
  GitBranch,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  MessageSquare,
  FileText,
  Database,
  Code,
  Send,
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  conditions: Condition[];
  actions: Action[];
  enabled: boolean;
  executionCount: number;
  lastRun?: Date;
  status: 'active' | 'paused' | 'error';
}

interface Condition {
  field: string;
  operator: string;
  value: string;
}

interface Action {
  type: string;
  config: Record<string, any>;
}

const sampleRules: AutomationRule[] = [
  {
    id: 'rule-1',
    name: 'Auto-approve Low Risk Changes',
    description: 'Automatically approve standard changes with low risk assessment',
    trigger: 'Change Request Created',
    conditions: [
      { field: 'Type', operator: 'equals', value: 'Standard' },
      { field: 'Risk Level', operator: 'equals', value: 'Low' },
    ],
    actions: [
      { type: 'approve', config: { level: 1, approver: 'system' } },
      { type: 'notify', config: { recipients: ['coordinator'], message: 'Auto-approved' } },
    ],
    enabled: true,
    executionCount: 145,
    lastRun: new Date(2025, 10, 25),
    status: 'active',
  },
  {
    id: 'rule-2',
    name: 'Escalate Emergency Changes',
    description: 'Immediately notify leadership for emergency change requests',
    trigger: 'Change Request Created',
    conditions: [
      { field: 'Type', operator: 'equals', value: 'Emergency' },
    ],
    actions: [
      { type: 'notify', config: { recipients: ['cab-members', 'management'], message: 'Emergency change submitted' } },
      { type: 'slack', config: { channel: '#change-management', message: 'URGENT: New emergency change' } },
      { type: 'assign', config: { priority: 'critical', assignee: 'ceo' } },
    ],
    enabled: true,
    executionCount: 23,
    lastRun: new Date(2025, 10, 24),
    status: 'active',
  },
  {
    id: 'rule-3',
    name: 'Schedule CAB Review',
    description: 'Add major changes to next CAB meeting agenda',
    trigger: 'Change Request Approved (L1)',
    conditions: [
      { field: 'Type', operator: 'equals', value: 'Major' },
      { field: 'Risk Level', operator: 'in', value: 'High,Critical' },
    ],
    actions: [
      { type: 'calendar', config: { meeting: 'next-cab', action: 'add-agenda' } },
      { type: 'notify', config: { recipients: ['cab-members'], message: 'Added to CAB agenda' } },
    ],
    enabled: true,
    executionCount: 67,
    lastRun: new Date(2025, 10, 23),
    status: 'active',
  },
  {
    id: 'rule-4',
    name: 'Auto-close Completed Changes',
    description: 'Automatically close changes that have been in completed status for 7 days',
    trigger: 'Scheduled',
    conditions: [
      { field: 'Status', operator: 'equals', value: 'Completed' },
      { field: 'Days in Status', operator: 'greater than', value: '7' },
    ],
    actions: [
      { type: 'update-status', config: { newStatus: 'Closed' } },
      { type: 'notify', config: { recipients: ['requester'], message: 'Change closed' } },
    ],
    enabled: true,
    executionCount: 89,
    lastRun: new Date(2025, 10, 25),
    status: 'active',
  },
  {
    id: 'rule-5',
    name: 'SLA Warning Notifications',
    description: 'Alert when changes are approaching SLA breach',
    trigger: 'Scheduled',
    conditions: [
      { field: 'Time to SLA Breach', operator: 'less than', value: '4 hours' },
      { field: 'Status', operator: 'not equals', value: 'Completed' },
    ],
    actions: [
      { type: 'notify', config: { recipients: ['assignee', 'coordinator'], message: 'SLA breach warning' } },
      { type: 'priority-boost', config: { increase: 1 } },
    ],
    enabled: false,
    executionCount: 34,
    lastRun: new Date(2025, 10, 20),
    status: 'paused',
  },
];

const triggerTypes = [
  { value: 'change-created', label: 'Change Request Created', icon: FileText },
  { value: 'change-updated', label: 'Change Request Updated', icon: FileText },
  { value: 'change-approved', label: 'Change Approved', icon: CheckCircle },
  { value: 'change-rejected', label: 'Change Rejected', icon: AlertCircle },
  { value: 'scheduled', label: 'Scheduled (Cron)', icon: Clock },
];

const actionTypes = [
  { value: 'approve', label: 'Auto-approve', icon: CheckCircle },
  { value: 'notify', label: 'Send Notification', icon: Mail },
  { value: 'slack', label: 'Send Slack Message', icon: MessageSquare },
  { value: 'assign', label: 'Assign to User', icon: Send },
  { value: 'update-status', label: 'Update Status', icon: FileText },
  { value: 'calendar', label: 'Calendar Action', icon: Clock },
  { value: 'webhook', label: 'Webhook/API Call', icon: Code },
  { value: 'database', label: 'Database Action', icon: Database },
];

export const ProcessAutomation: React.FC = () => {
  const [rules, setRules] = useState<AutomationRule[]>(sampleRules);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [showNewRuleModal, setShowNewRuleModal] = useState(false);

  const toggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId
          ? { ...rule, enabled: !rule.enabled, status: !rule.enabled ? 'active' : 'paused' }
          : rule
      )
    );
  };

  const getStatusBadge = (status: string) => {
    const config = {
      active: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle },
      paused: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', icon: Pause },
      error: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: AlertCircle },
    };

    const { color, icon: Icon } = config[status as keyof typeof config];

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${color}`}>
        <Icon className="w-3 h-3" />
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap className="w-8 h-8 text-yellow-500" />
            Process Automation
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Automate workflows and streamline change management processes
          </p>
        </div>
        <button
          onClick={() => setShowNewRuleModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Automation Rule
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <GitBranch className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Rules</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {rules.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Rules</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {rules.filter((r) => r.enabled).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Executions (30d)</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {rules.reduce((acc, r) => acc + r.executionCount, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Time Saved</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                42h
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rules List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Automation Rules
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  onClick={() => setSelectedRule(rule)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                    selectedRule?.id === rule.id ? 'bg-blue-50 dark:bg-blue-900' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {rule.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {rule.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {getStatusBadge(rule.status)}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRule(rule.id);
                        }}
                        className={`p-2 rounded-lg transition ${
                          rule.enabled
                            ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 hover:bg-green-200'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {rule.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-3">
                    <div className="flex items-center gap-1">
                      <GitBranch className="w-4 h-4" />
                      <span>{rule.trigger}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      <span>{rule.executionCount} executions</span>
                    </div>
                    {rule.lastRun && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Last: {rule.lastRun.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rule Details */}
        <div className="lg:col-span-1">
          {selectedRule ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Rule Details
                </h2>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Trigger
                  </h3>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {selectedRule.trigger}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Conditions ({selectedRule.conditions.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedRule.conditions.map((condition, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm"
                      >
                        <span className="font-medium text-gray-900 dark:text-white">
                          {condition.field}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 mx-2">
                          {condition.operator}
                        </span>
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                          {condition.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Actions ({selectedRule.actions.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedRule.actions.map((action, index) => (
                      <div
                        key={index}
                        className="p-3 bg-green-50 dark:bg-green-900 rounded-lg"
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {action.type.replace('-', ' ')}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {Object.entries(action.config)
                            .map(([key, val]) => `${key}: ${val}`)
                            .join(', ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Executions:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {selectedRule.executionCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Last Run:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {selectedRule.lastRun?.toLocaleString() || 'Never'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      {getStatusBadge(selectedRule.status)}
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
                    <Settings className="w-4 h-4" />
                    Edit Rule
                  </button>
                  <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" />
                    Test Run
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <GitBranch className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">
                Select a rule to view details
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Templates */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Start Templates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Auto-approve Low Risk', icon: CheckCircle, color: 'green' },
            { title: 'Emergency Escalation', icon: AlertCircle, color: 'red' },
            { title: 'SLA Monitoring', icon: Clock, color: 'orange' },
            { title: 'Notification Rules', icon: Mail, color: 'blue' },
          ].map((template, index) => {
            const Icon = template.icon;
            return (
              <button
                key={index}
                className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition text-left group"
              >
                <Icon
                  className={`w-8 h-8 mb-2 text-${template.color}-600 dark:text-${template.color}-400 group-hover:scale-110 transition`}
                />
                <p className="font-semibold text-gray-900 dark:text-white">
                  {template.title}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Click to create from template
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProcessAutomation;
