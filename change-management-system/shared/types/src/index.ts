// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  department: string;
  phone: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'Requester' | 'Coordinator' | 'CAB_Member' | 'Dept_Head' | 'Implementer' | 'Admin';

export interface UserPermissions {
  createRequest: boolean;
  viewAllRequests: boolean;
  approve: ApprovalLevel[];
  modifyEngine: boolean;
  generateReports: boolean;
  manageUsers: boolean;
}

export type ApprovalLevel = 'L1' | 'L2' | 'L3' | 'L4';

// Change Request Types
export interface ChangeRequest {
  id: string;
  requestDate: Date;
  requester: {
    name: string;
    department: string;
    email: string;
    phone: string;
  };
  changeTitle: string;
  changeType: ChangeType;
  status: ChangeStatus;
  businessJustification: string;
  systemsAffected: string[];
  riskLevel: RiskLevel;
  impactedUsers: number;
  departments: string[];
  financialImpact: number;
  complianceImpact: boolean;
  proposedDate: Date;
  actualImplementationDate?: Date;
  rollbackPlan: string;
  testingPlan: string;
  successCriteria: string[];
  attachments: Attachment[];
  dependencies: string[];
  relatedChanges: string[];
  approvals: Approval[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export type ChangeType = 'Emergency' | 'Major' | 'Minor' | 'Standard';

export type ChangeStatus =
  | 'New'
  | 'In Review'
  | 'Approved'
  | 'In Progress'
  | 'Testing'
  | 'Scheduled'
  | 'Implementing'
  | 'Completed'
  | 'Failed'
  | 'Cancelled'
  | 'On Hold';

export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Attachment {
  id: string;
  filename: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: Date;
  fileSize: number;
  mimeType: string;
}

// Approval Workflow Types
export interface Approval {
  id: string;
  changeRequestId: string;
  approver: {
    id: string;
    name: string;
    email: string;
  };
  level: ApprovalLevel;
  status: 'Pending' | 'Approved' | 'Rejected';
  comments?: string;
  approvedAt?: Date;
  createdAt: Date;
}

export interface ApprovalCondition {
  field: string;
  operator: 'equals' | 'greaterThan' | 'lessThan' | 'contains';
  value: any;
}

export interface ApprovalWorkflow {
  changeType: ChangeType;
  steps: ApprovalStep[];
  notifications: NotificationRule[];
}

export interface ApprovalStep {
  level: number;
  approvers: string[];
  conditions: ApprovalCondition[];
  escalationTime: number;
  autoApprove: boolean;
}

// Notification Types
export interface NotificationRule {
  event: NotificationEvent;
  recipients: string[];
  channels: NotificationChannel[];
  template: string;
}

export type NotificationEvent =
  | 'change_submitted'
  | 'approval_required'
  | 'change_approved'
  | 'change_rejected'
  | 'implementation_started'
  | 'implementation_completed'
  | 'change_failed';

export type NotificationChannel = 'email' | 'in_app' | 'slack';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationEvent;
  title: string;
  message: string;
  read: boolean;
  changeRequestId?: string;
  createdAt: Date;
}

// Comment Types
export interface Comment {
  id: string;
  changeRequestId: string;
  author: {
    id: string;
    name: string;
  };
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// CAB Types
export interface CABMeeting {
  id: string;
  scheduledDate: Date;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  attendees: CABAttendee[];
  agenda: CABAgendaItem[];
  decisions: CABDecision[];
  minutes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CABAttendee {
  userId: string;
  name: string;
  role: string;
  attended: boolean;
}

export interface CABAgendaItem {
  id: string;
  changeRequestId: string;
  order: number;
  duration: number;
}

export interface CABDecision {
  id: string;
  changeRequestId: string;
  decision: 'Approved' | 'Rejected' | 'Deferred';
  votes: CABVote[];
  rationale: string;
  decidedAt: Date;
}

export interface CABVote {
  memberId: string;
  memberName: string;
  vote: 'Approve' | 'Reject' | 'Abstain';
  comments?: string;
}

// Prioritization Engine Types
export interface PrioritizationEngine {
  id: string;
  name: string;
  weights: PrioritizationWeights;
  constraints: PrioritizationConstraints;
  rules: PrioritizationRule[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrioritizationWeights {
  businessValue: number;
  riskScore: number;
  resourceAvailability: number;
  dependencies: number;
  customerImpact: number;
  complianceRequirement: number;
  costBenefit: number;
  strategicAlignment: number;
}

export interface PrioritizationConstraints {
  maxConcurrentChanges: number;
  blackoutPeriods: DateRange[];
  resourceCapacity: Map<string, number>;
  budgetLimit: number;
}

export interface DateRange {
  start: Date;
  end: Date;
  reason?: string;
}

export interface PrioritizationRule {
  id: string;
  condition: string;
  action: 'delay' | 'expedite' | 'reject' | 'escalate';
  priority: number;
}

export interface PrioritizedChange {
  changeRequestId: string;
  score: number;
  ranking: number;
  explanation: string;
  factors: {
    [key: string]: number;
  };
}

// Metrics Types
export interface KPIMetrics {
  changeSuccessRate: number;
  emergencyChangePercentage: number;
  onTimeDelivery: number;
  failedChanges: number;
  postImplementationIssues: number;
  cabAttendance: number;
  documentationCompliance: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface MetricTarget {
  metric: string;
  target: number;
  operator: 'greaterThan' | 'lessThan';
}

export interface ChangeMetric {
  id: string;
  changeRequestId: string;
  metric: string;
  value: number;
  timestamp: Date;
}

// Audit Trail Types
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: 'ChangeRequest' | 'User' | 'CABMeeting' | 'EngineConfig';
  entityId: string;
  changes: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  status?: ChangeStatus[];
  changeType?: ChangeType[];
  riskLevel?: RiskLevel[];
  dateFrom?: Date;
  dateTo?: Date;
  requester?: string;
  department?: string;
}

// Form Types
export interface ChangeRequestFormData {
  changeTitle: string;
  changeType: ChangeType;
  businessJustification: string;
  systemsAffected: string[];
  riskLevel?: RiskLevel;
  impactedUsers: number;
  departments: string[];
  financialImpact: number;
  complianceImpact: boolean;
  proposedDate: Date;
  rollbackPlan: string;
  testingPlan: string;
  successCriteria: string[];
  dependencies: string[];
  relatedChanges: string[];
}

// WebSocket Events
export interface WebSocketEvent {
  type: 'change_updated' | 'notification' | 'cab_update';
  payload: any;
}
