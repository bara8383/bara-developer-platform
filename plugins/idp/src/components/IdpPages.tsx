import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useParams } from 'react-router-dom';
import {
  Content,
  Header,
  InfoCard,
  Page,
  Table,
} from '@backstage/core-components';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@material-ui/core';
import CloudQueueIcon from '@material-ui/icons/CloudQueue';
import { idpApi } from '../api/localIdpApi';
import {
  IdpEnvironment,
  IdpOperationLog,
  IdpProject,
  IdpTemplate,
  IdpTemplateExecution,
} from '../types';

const useIdpData = () => {
  const [projects, setProjects] = useState<IdpProject[]>([]);
  const [environments, setEnvironments] = useState<IdpEnvironment[]>([]);
  const [templates, setTemplates] = useState<IdpTemplate[]>([]);
  const [operationLogs, setOperationLogs] = useState<IdpOperationLog[]>([]);
  const [executions, setExecutions] = useState<IdpTemplateExecution[]>([]);

  const refresh = async () => {
    const [
      nextProjects,
      nextEnvironments,
      nextTemplates,
      nextLogs,
      nextExecutions,
    ] = await Promise.all([
      idpApi.listProjects(),
      idpApi.listEnvironments(),
      idpApi.listTemplates(),
      idpApi.listOperationLogs(),
      idpApi.listTemplateExecutions(),
    ]);
    setProjects(nextProjects);
    setEnvironments(nextEnvironments);
    setTemplates(nextTemplates);
    setOperationLogs(nextLogs);
    setExecutions(nextExecutions);
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    projects,
    environments,
    templates,
    operationLogs,
    executions,
    refresh,
  };
};

type IdpDataProps = ReturnType<typeof useIdpData>;

type StatusChipProps = { status?: string };
export const StatusChip = ({ status = 'unknown' }: StatusChipProps) => {
  let color: 'primary' | 'secondary' | 'default' = 'default';
  if (
    ['active', 'running', 'available', 'normal', 'succeeded'].includes(status)
  ) {
    color = 'primary';
  } else if (['error', 'failed', 'critical', 'deprecated'].includes(status)) {
    color = 'secondary';
  }
  return <Chip size="small" color={color} label={status} />;
};

export const RepositoryLink = ({ url }: { url: string }) => (
  <a href={url}>{url.replace('https://github.com/', '')}</a>
);
export const CatalogAssetLinks = ({ refs }: { refs: string[] }) =>
  refs.length ? (
    <>
      {refs.map(ref => (
        <Chip
          key={ref}
          size="small"
          label={ref}
          style={{ marginRight: 4, marginBottom: 4 }}
        />
      ))}
    </>
  ) : (
    <Typography color="textSecondary">
      No related Catalog assets. Project and Environment are IDP DB business
      data; Catalog refs are optional asset links.
    </Typography>
  );
export const EmptyState = ({ title }: { title: string }) => (
  <InfoCard title={title}>
    <Typography color="textSecondary">
      Mock data is not available yet.
    </Typography>
  </InfoCard>
);
export const SectionCard = ({
  title,
  children,
}: PropsWithChildren<{ title: string }>) => (
  <InfoCard title={title}>{children}</InfoCard>
);
export const SummaryCard = ({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: number | string;
  subtitle: string;
}) => (
  <Card>
    <CardContent>
      <Typography color="textSecondary">{title}</Typography>
      <Typography variant="h4">{value}</Typography>
      <Typography variant="body2">{subtitle}</Typography>
    </CardContent>
  </Card>
);
export const OperationLogList = ({
  operationLogs,
  projectId,
  environmentId,
}: {
  operationLogs: IdpOperationLog[];
  projectId?: string;
  environmentId?: string;
}) => (
  <Table
    title="Recent Operation Logs"
    options={{ paging: false, search: false }}
    data={operationLogs
      .filter(
        l =>
          (!projectId || l.projectId === projectId) &&
          (!environmentId || l.environmentId === environmentId),
      )
      .slice(0, 6)}
    columns={[
      { title: 'Type', field: 'type' },
      { title: 'Message', field: 'message' },
      { title: 'Actor', field: 'actor' },
      { title: 'Created', field: 'createdAt' },
    ]}
  />
);

const projectName = (projects: IdpProject[], id: string) =>
  projects.find(p => p.id === id)?.name ?? id;
const templateName = (templates: IdpTemplate[], id: string) =>
  templates.find(t => t.id === id)?.name ?? id;

export const IdpDashboardPage = ({
  projects,
  environments,
  templates,
  operationLogs,
}: IdpDataProps) => (
  <>
    <Header
      title="Bara IDP Dashboard"
      subtitle="Projects, Environments, and Template metadata managed as IDP business concepts"
    />
    <Content>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <SummaryCard
            title="Projects"
            value={projects.length}
            subtitle="IDP DB business records, not Catalog entities"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard
            title="Environments"
            value={environments.length}
            subtitle="Dynamic operational state per project"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard
            title="Templates"
            value={templates.length}
            subtitle="Metadata layer referencing Scaffolder YAML"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <SectionCard title="Quick actions">
            <Button component={Link} to="/idp/projects" color="primary">
              Browse Projects
            </Button>
            <Button component={Link} to="/idp/templates" color="primary">
              Run Template
            </Button>
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <SectionCard title="Recently used Templates">
            {templates.slice(0, 4).map(t => (
              <Box key={t.id} mb={1}>
                <Link to={`/idp/templates/${t.id}`}>{t.name}</Link>{' '}
                <StatusChip status={t.status} />
              </Box>
            ))}
          </SectionCard>
        </Grid>
        <Grid item xs={12}>
          <OperationLogList operationLogs={operationLogs} />
        </Grid>
      </Grid>
    </Content>
  </>
);

export const ProjectListPage = ({ projects }: IdpDataProps) => (
  <>
    <Header
      title="Projects"
      subtitle="IDP business units stored in the future IDP DB"
    />
    <Content>
      <Table
        data={projects}
        columns={[
          {
            title: 'Project',
            render: p => <Link to={`/idp/projects/${p.id}`}>{p.name}</Link>,
          },
          { title: 'Description', field: 'description' },
          { title: 'Owner', field: 'owner' },
          { title: 'Repositories', render: p => p.repositories.length },
          { title: 'Environments', render: p => p.environmentIds.length },
          { title: 'Templates', render: p => p.templateIds.length },
          { title: 'Status', render: p => <StatusChip status={p.status} /> },
          { title: 'Updated', field: 'updatedAt' },
        ]}
      />
    </Content>
  </>
);

export const ProjectDetailPage = ({
  projects,
  environments,
  templates,
  operationLogs,
}: IdpDataProps) => {
  const { projectId } = useParams();
  const p = projects.find(x => x.id === projectId);
  if (!p) return <EmptyState title="Project not found" />;
  return (
    <>
      <Header
        title={p.name}
        subtitle="Project is IDP-owned business data; Catalog assets below are optional links"
      />
      <Content>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <SectionCard title="Project basic information">
              <Typography>{p.description}</Typography>
              <Typography>Owner: {p.owner}</Typography>
              <StatusChip status={p.status} />
            </SectionCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <SectionCard title="Related Catalog Assets">
              <CatalogAssetLinks refs={p.relatedCatalogEntityRefs} />
            </SectionCard>
          </Grid>
          <Grid item xs={12}>
            <Table
              title="Environments"
              data={environments.filter(e => p.environmentIds.includes(e.id))}
              columns={[
                {
                  title: 'Name',
                  render: e => (
                    <Link to={`/idp/environments/${e.id}`}>{e.name}</Link>
                  ),
                },
                { title: 'Type', field: 'type' },
                {
                  title: 'Deploy',
                  render: e => <StatusChip status={e.deploymentStatus} />,
                },
                {
                  title: 'Alerts',
                  render: e => <StatusChip status={e.alertStatus} />,
                },
              ]}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <SectionCard title="Available Templates">
              {p.templateIds.map(id => (
                <Box key={id}>
                  <Link to={`/idp/templates/${id}`}>
                    {templateName(templates, id)}
                  </Link>
                </Box>
              ))}
            </SectionCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <SectionCard title="Repositories">
              {p.repositories.map(r => (
                <Box key={r}>
                  <RepositoryLink url={r} />
                </Box>
              ))}
            </SectionCard>
          </Grid>
          <Grid item xs={12}>
            <OperationLogList operationLogs={operationLogs} projectId={p.id} />
          </Grid>
        </Grid>
      </Content>
    </>
  );
};

export const EnvironmentListPage = ({
  projects,
  environments,
}: IdpDataProps) => (
  <>
    <Header
      title="Environments"
      subtitle="Runtime environments with dynamic operational state"
    />
    <Content>
      <Table
        data={environments}
        columns={[
          {
            title: 'Environment',
            render: e => <Link to={`/idp/environments/${e.id}`}>{e.name}</Link>,
          },
          { title: 'Project', render: e => projectName(projects, e.projectId) },
          { title: 'Type', field: 'type' },
          { title: 'AWS Account', field: 'awsAccountId' },
          { title: 'Region', field: 'region' },
          {
            title: 'Deploy',
            render: e => <StatusChip status={e.deploymentStatus} />,
          },
          {
            title: 'Infra',
            render: e => <StatusChip status={e.infraStatus} />,
          },
          { title: 'App', render: e => <StatusChip status={e.appStatus} /> },
          {
            title: 'Alert',
            render: e => <StatusChip status={e.alertStatus} />,
          },
          { title: 'Endpoint', field: 'endpointUrl' },
        ]}
      />
    </Content>
  </>
);

export const EnvironmentDetailPage = ({
  projects,
  environments,
  operationLogs,
}: IdpDataProps) => {
  const { environmentId } = useParams();
  const e = environments.find(x => x.id === environmentId);
  if (!e) return <EmptyState title="Environment not found" />;
  return (
    <>
      <Header
        title={e.name}
        subtitle="Environment is operational IDP DB state, not catalog-info.yaml"
      />
      <Content>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <SummaryCard
              title="Deployment"
              value={e.deploymentStatus}
              subtitle={e.lastDeployedAt ?? 'not deployed'}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <SummaryCard
              title="Infrastructure"
              value={e.infraStatus}
              subtitle={`${e.awsAccountId ?? 'TBD'} / ${e.region ?? 'TBD'}`}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <SummaryCard
              title="Application Alerts"
              value={e.alertStatus}
              subtitle={e.endpointUrl ?? 'endpoint pending'}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <SectionCard title="Project">
              <Link to={`/idp/projects/${e.projectId}`}>
                {projectName(projects, e.projectId)}
              </Link>
            </SectionCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <SectionCard title="Repository">
              {e.repository ? (
                <RepositoryLink url={e.repository} />
              ) : (
                'Repository pending'
              )}
            </SectionCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <SectionCard title="Optional related Catalog Assets">
              <CatalogAssetLinks refs={e.relatedCatalogEntityRefs} />
            </SectionCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <SectionCard title="Monitoring placeholder">
              <Typography>
                Future CloudWatch / Grafana / alert routing links will be
                attached here.
              </Typography>
            </SectionCard>
          </Grid>
          <Grid item xs={12}>
            <OperationLogList
              operationLogs={operationLogs}
              projectId={e.projectId}
              environmentId={e.id}
            />
          </Grid>
        </Grid>
      </Content>
    </>
  );
};

export const TemplateListPage = ({ templates }: IdpDataProps) => (
  <>
    <Header
      title="Templates"
      subtitle="IDP metadata layer for user-facing creation menus"
    />
    <Content>
      <Table
        data={[...templates].sort((a, b) => a.displayOrder - b.displayOrder)}
        columns={[
          {
            title: 'Template',
            render: t => <Link to={`/idp/templates/${t.id}`}>{t.name}</Link>,
          },
          { title: 'Kind', field: 'kind' },
          { title: 'Description', field: 'description' },
          { title: 'Cloud', field: 'targetCloud' },
          { title: 'Language', field: 'targetLanguage' },
          { title: 'Framework', field: 'targetFramework' },
          { title: 'Outputs', render: t => t.outputs.join(', ') },
          { title: 'Version', field: 'version' },
          { title: 'Status', render: t => <StatusChip status={t.status} /> },
          { title: 'Usage', field: 'usageCount' },
          { title: 'Updated', field: 'updatedAt' },
        ]}
      />
    </Content>
  </>
);

export const TemplateDetailPage = ({ templates }: IdpDataProps) => {
  const { templateId } = useParams();
  const t = templates.find(x => x.id === templateId);
  if (!t) return <EmptyState title="Template not found" />;
  return (
    <>
      <Header
        title={t.name}
        subtitle="Metadata is displayed here; Scaffolder YAML is referenced separately"
      />
      <Content>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <SectionCard title="Template metadata">
              <Typography>{t.description}</Typography>
              <Typography>Kind: {t.kind}</Typography>
              <Typography>Version: {t.version}</Typography>
              <Typography>Usage: {t.usageCount}</Typography>
              <StatusChip status={t.status} />
            </SectionCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <SectionCard title="Scaffolder boundary">
              <Typography>
                scaffolderTemplateRef: {t.scaffolderTemplateRef}
              </Typography>
              <Typography>repositoryUrl: {t.repositoryUrl}</Typography>
              <Typography>
                This page does not execute Scaffolder yet.
              </Typography>
            </SectionCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <SectionCard title="Input parameters">
              {t.parameters.map(p => (
                <Box key={p.name}>
                  <b>{p.label}</b> ({p.type}){' '}
                  {p.required ? 'required' : 'optional'} - {p.description}
                </Box>
              ))}
            </SectionCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <SectionCard title="Outputs">
              {t.outputs.map(o => (
                <Chip key={o} label={o} style={{ margin: 4 }} />
              ))}
            </SectionCard>
          </Grid>
          <Grid item xs={12}>
            <Button
              component={Link}
              to={`/idp/templates/${t.id}/run`}
              color="primary"
              variant="contained"
            >
              Run mock flow
            </Button>
          </Grid>
        </Grid>
      </Content>
    </>
  );
};

export const TemplateRunPage = ({
  projects,
  environments,
  templates,
  refresh,
}: IdpDataProps) => {
  const { templateId } = useParams();
  const t = templates.find(x => x.id === templateId);
  const [step, setStep] = useState<'input' | 'confirm' | 'result'>('input');
  const [projectId, setProjectId] = useState('');
  const [environmentId, setEnvironmentId] = useState('');
  const [requestedBy, setRequestedBy] = useState(
    'user:default/local-developer',
  );
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [execution, setExecution] = useState<IdpTemplateExecution>();

  const filteredEnvironments = useMemo(
    () =>
      projectId
        ? environments.filter(
            environment => environment.projectId === projectId,
          )
        : environments,
    [environments, projectId],
  );

  if (!t) return <EmptyState title="Template not found" />;

  const updateParameter = (name: string, value: string) => {
    setParameters(current => ({ ...current, [name]: value }));
  };

  const execute = async () => {
    const nextExecution = await idpApi.executeTemplate({
      templateId: t.id,
      projectId: projectId || undefined,
      environmentId: environmentId || undefined,
      parameters,
      requestedBy,
    });
    setExecution(nextExecution);
    await refresh();
    setStep('result');
  };

  return (
    <>
      <Header
        title={`Run ${t.name}`}
        subtitle="Local IDP API client creates an execution record. Scaffolder, GitHub, AWS, and Catalog side effects are intentionally not implemented yet."
      />
      <Content>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <SectionCard title="Execution state">
              <StatusChip status={step} />
              <Typography variant="body2">
                This is a replaceable frontend API boundary backed by an
                in-memory local adapter for now.
              </Typography>
            </SectionCard>
          </Grid>
          <Grid item xs={12} md={8}>
            <SectionCard title="Not implemented integrations">
              <Typography>
                TODO: backend plugin persistence, Scaffolder task creation,
                GitHub repository changes, AWS provisioning, and Catalog
                registration are not called by this local implementation.
              </Typography>
            </SectionCard>
          </Grid>

          {step === 'input' && (
            <Grid item xs={12}>
              <SectionCard title="1. Input">
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      fullWidth
                      required
                      label="Project"
                      value={projectId}
                      onChange={event => {
                        setProjectId(event.target.value);
                        setEnvironmentId('');
                      }}
                    >
                      {projects.map(project => (
                        <MenuItem key={project.id} value={project.id}>
                          {project.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      fullWidth
                      label="Environment"
                      value={environmentId}
                      onChange={event => setEnvironmentId(event.target.value)}
                    >
                      {filteredEnvironments.map(environment => (
                        <MenuItem key={environment.id} value={environment.id}>
                          {environment.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      required
                      label="Requested by"
                      value={requestedBy}
                      onChange={event => setRequestedBy(event.target.value)}
                    />
                  </Grid>
                  {t.parameters.map(parameter => (
                    <Grid item xs={12} md={6} key={parameter.name}>
                      <TextField
                        fullWidth
                        required={parameter.required}
                        label={parameter.label}
                        helperText={parameter.description}
                        value={
                          parameters[parameter.name] ??
                          String(parameter.defaultValue ?? '')
                        }
                        onChange={event =>
                          updateParameter(parameter.name, event.target.value)
                        }
                      />
                    </Grid>
                  ))}
                </Grid>
                <Box mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!projectId || !requestedBy}
                    onClick={() => setStep('confirm')}
                  >
                    Confirm inputs
                  </Button>
                </Box>
              </SectionCard>
            </Grid>
          )}

          {step === 'confirm' && (
            <Grid item xs={12}>
              <SectionCard title="2. Confirmation">
                <Typography>Template: {t.name}</Typography>
                <Typography>
                  Project: {projectName(projects, projectId)}
                </Typography>
                <Typography>
                  Environment: {environmentId || 'not selected'}
                </Typography>
                <Typography>Requested by: {requestedBy}</Typography>
                <pre>{JSON.stringify(parameters, null, 2)}</pre>
                <Button onClick={() => setStep('input')}>Back</Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CloudQueueIcon />}
                  onClick={execute}
                >
                  Create TemplateExecution
                </Button>
              </SectionCard>
            </Grid>
          )}

          {step === 'result' && execution && (
            <Grid item xs={12}>
              <SectionCard title="3. Execution result">
                <Typography>Execution ID: {execution.id}</Typography>
                <Typography>
                  Status: <StatusChip status={execution.status} />
                </Typography>
                <Typography>
                  Project: {projectName(projects, execution.projectId ?? '')}
                </Typography>
                <Typography>
                  Environment: {execution.environmentId ?? 'not selected'}
                </Typography>
                <Typography>Created: {execution.createdAt}</Typography>
                <Typography>
                  Result varies by input: serviceName containing "fail" returns
                  failed; all other values return succeeded.
                </Typography>
                <pre>{JSON.stringify(execution.parameters, null, 2)}</pre>
                <Button component={Link} to="/idp/templates" color="primary">
                  Back to templates
                </Button>
              </SectionCard>
            </Grid>
          )}
        </Grid>
      </Content>
    </>
  );
};

export const IdpRoot = () => {
  const data = useIdpData();
  return (
    <Page themeId="tool">
      <Routes>
        <Route index element={<IdpDashboardPage {...data} />} />
        <Route path="projects" element={<ProjectListPage {...data} />} />
        <Route
          path="projects/:projectId"
          element={<ProjectDetailPage {...data} />}
        />
        <Route
          path="environments"
          element={<EnvironmentListPage {...data} />}
        />
        <Route
          path="environments/:environmentId"
          element={<EnvironmentDetailPage {...data} />}
        />
        <Route path="templates" element={<TemplateListPage {...data} />} />
        <Route
          path="templates/:templateId"
          element={<TemplateDetailPage {...data} />}
        />
        <Route
          path="templates/:templateId/run"
          element={<TemplateRunPage {...data} />}
        />
      </Routes>
    </Page>
  );
};
