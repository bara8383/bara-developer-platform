export type ProjectStatus = 'active' | 'archived' | 'provisioning' | 'error';

export type IdpProject = {
  id: string;
  name: string;
  description: string;
  owner: string;
  repositories: string[];
  relatedCatalogEntityRefs: string[];
  environmentIds: string[];
  templateIds: string[];
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
};

export type EnvironmentType = 'dev' | 'stg' | 'prod' | 'sandbox' | 'customer';

export type DeploymentStatus =
  | 'running'
  | 'deploying'
  | 'failed'
  | 'stopped'
  | 'unknown';

export type AlertStatus = 'normal' | 'warning' | 'critical' | 'unknown';

export type IdpEnvironment = {
  id: string;
  projectId: string;
  name: string;
  type: EnvironmentType;
  awsAccountId?: string;
  region?: string;
  deploymentStatus: DeploymentStatus;
  appStatus: DeploymentStatus;
  infraStatus: DeploymentStatus;
  alertStatus: AlertStatus;
  endpointUrl?: string;
  lastDeployedAt?: string;
  repository?: string;
  relatedCatalogEntityRefs: string[];
  createdAt: string;
  updatedAt: string;
};

export type TemplateKind =
  | 'infrastructure'
  | 'application'
  | 'full-stack'
  | 'configuration';

export type TemplateStatus = 'available' | 'draft' | 'deprecated';

export type IdpTemplateParameter = {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  required: boolean;
  description?: string;
  options?: string[];
  defaultValue?: string | number | boolean;
};

export type IdpTemplate = {
  id: string;
  name: string;
  kind: TemplateKind;
  description: string;
  targetCloud?: string;
  targetLanguage?: string;
  targetFramework?: string;
  outputs: string[];
  version: string;
  usageCount: number;
  status: TemplateStatus;
  displayOrder: number;
  enabled: boolean;
  allowedRoles: string[];
  scaffolderTemplateRef?: string;
  repositoryUrl?: string;
  parameters: IdpTemplateParameter[];
  createdAt: string;
  updatedAt: string;
};

export type TemplateExecutionStatus =
  | 'draft'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'cancelled';

export type IdpTemplateExecution = {
  id: string;
  templateId: string;
  projectId?: string;
  environmentId?: string;
  status: TemplateExecutionStatus;
  parameters: Record<string, unknown>;
  requestedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type IdpDeployment = {
  id: string;
  projectId: string;
  environmentId: string;
  status: DeploymentStatus;
  version?: string;
  repository?: string;
  commitSha?: string;
  startedAt: string;
  finishedAt?: string;
  triggeredBy: string;
};

export type IdpOperationLog = {
  id: string;
  projectId?: string;
  environmentId?: string;
  templateId?: string;
  executionId?: string;
  type:
    | 'project_created'
    | 'environment_created'
    | 'template_executed'
    | 'deployment_started'
    | 'deployment_finished'
    | 'catalog_registered'
    | 'repository_created'
    | 'infra_provisioned'
    | 'error_occurred';
  message: string;
  actor: string;
  createdAt: string;
};
