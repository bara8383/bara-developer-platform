import {
  environments as seedEnvironments,
  executions as seedExecutions,
  operationLogs as seedOperationLogs,
  projects as seedProjects,
  templates as seedTemplates,
} from '../data/mockData';
import { IdpOperationLog, IdpTemplateExecution } from '../types';
import { IdpApi, TemplateExecutionInput } from './idpApi';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const executions: IdpTemplateExecution[] = clone(seedExecutions);
const operationLogs: IdpOperationLog[] = clone(seedOperationLogs);

// Local in-memory adapter for browser verification only. Replace this class with
// an implementation that calls a Backstage backend plugin/API when IDP DB,
// Scaffolder, GitHub, and AWS integrations are added.
class LocalIdpApi implements IdpApi {
  async listProjects() {
    return clone(seedProjects);
  }

  async getProject(projectId: string) {
    return clone(seedProjects.find(project => project.id === projectId));
  }

  async listEnvironments() {
    return clone(seedEnvironments);
  }

  async getEnvironment(environmentId: string) {
    return clone(
      seedEnvironments.find(environment => environment.id === environmentId),
    );
  }

  async listTemplates() {
    return clone(seedTemplates);
  }

  async getTemplate(templateId: string) {
    return clone(seedTemplates.find(template => template.id === templateId));
  }

  async listOperationLogs(
    filters: Parameters<IdpApi['listOperationLogs']>[0] = {},
  ) {
    return clone(
      operationLogs.filter(
        log =>
          (!filters.projectId || log.projectId === filters.projectId) &&
          (!filters.environmentId ||
            log.environmentId === filters.environmentId) &&
          (!filters.templateId || log.templateId === filters.templateId) &&
          (!filters.executionId || log.executionId === filters.executionId),
      ),
    );
  }

  async listTemplateExecutions(
    filters: Parameters<IdpApi['listTemplateExecutions']>[0] = {},
  ) {
    return clone(
      executions.filter(
        execution =>
          (!filters.projectId || execution.projectId === filters.projectId) &&
          (!filters.environmentId ||
            execution.environmentId === filters.environmentId) &&
          (!filters.templateId || execution.templateId === filters.templateId),
      ),
    );
  }

  async executeTemplate(input: TemplateExecutionInput) {
    const now = new Date().toISOString();
    const serviceName = String(input.parameters.serviceName ?? 'service');
    const execution: IdpTemplateExecution = {
      id: `exec-${Date.now()}`,
      templateId: input.templateId,
      projectId: input.projectId,
      environmentId: input.environmentId,
      status: serviceName.toLowerCase().includes('fail')
        ? 'failed'
        : 'succeeded',
      parameters: clone(input.parameters),
      requestedBy: input.requestedBy,
      createdAt: now,
      updatedAt: now,
    };
    executions.unshift(execution);
    operationLogs.unshift({
      id: `log-${Date.now()}`,
      projectId: input.projectId,
      environmentId: input.environmentId,
      templateId: input.templateId,
      executionId: execution.id,
      type:
        execution.status === 'failed' ? 'error_occurred' : 'template_executed',
      message: `${input.templateId} execution ${execution.status} for ${serviceName}`,
      actor: input.requestedBy,
      createdAt: now,
    });
    return clone(execution);
  }
}

export const idpApi: IdpApi = new LocalIdpApi();
