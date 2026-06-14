import { PropsWithChildren } from 'react';
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
  Typography,
} from '@material-ui/core';
import CloudQueueIcon from '@material-ui/icons/CloudQueue';
import {
  environments,
  operationLogs,
  projects,
  templates,
} from '../data/mockData';

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
  projectId,
  environmentId,
}: {
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

const projectName = (id: string) => projects.find(p => p.id === id)?.name ?? id;
const templateName = (id: string) =>
  templates.find(t => t.id === id)?.name ?? id;

export const IdpDashboardPage = () => (
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
          <OperationLogList />
        </Grid>
      </Grid>
    </Content>
  </>
);

export const ProjectListPage = () => (
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

export const ProjectDetailPage = () => {
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
                  <Link to={`/idp/templates/${id}`}>{templateName(id)}</Link>
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
            <OperationLogList projectId={p.id} />
          </Grid>
        </Grid>
      </Content>
    </>
  );
};

export const EnvironmentListPage = () => (
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
          { title: 'Project', render: e => projectName(e.projectId) },
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

export const EnvironmentDetailPage = () => {
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
                {projectName(e.projectId)}
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
            <OperationLogList projectId={e.projectId} environmentId={e.id} />
          </Grid>
        </Grid>
      </Content>
    </>
  );
};

export const TemplateListPage = () => (
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

export const TemplateDetailPage = () => {
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

export const TemplateRunPage = () => {
  const { templateId } = useParams();
  const t = templates.find(x => x.id === templateId);
  if (!t) return <EmptyState title="Template not found" />;
  const steps = [
    'Template confirmation',
    'Select or create Project',
    'Select or create Environment',
    'Template parameters',
    'Confirmation',
    'Mock execution result',
  ];
  return (
    <>
      <Header
        title={`Run ${t.name}`}
        subtitle="Mock flow only; no backend, GitHub, AWS, Catalog, or Scaffolder calls are made"
      />
      <Content>
        <Grid container spacing={3}>
          {steps.map((s, i) => (
            <Grid item xs={12} md={6} key={s}>
              <SectionCard title={`${i + 1}. ${s}`}>
                <Typography>
                  {i === 5
                    ? 'Future execution will run Scaffolder actions, create GitHub repositories, generate catalog-info.yaml, register Catalog Entities, provision AWS resources, create application skeletons, and save execution / deployment / operation logs to the IDP DB.'
                    : 'Mock input section for future backend-driven execution.'}
                </Typography>
              </SectionCard>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<CloudQueueIcon />}
            >
              Show mock success result
            </Button>
          </Grid>
        </Grid>
      </Content>
    </>
  );
};

export const IdpRoot = () => (
  <Page themeId="tool">
    <Routes>
      <Route index element={<IdpDashboardPage />} />
      <Route path="projects" element={<ProjectListPage />} />
      <Route path="projects/:projectId" element={<ProjectDetailPage />} />
      <Route path="environments" element={<EnvironmentListPage />} />
      <Route
        path="environments/:environmentId"
        element={<EnvironmentDetailPage />}
      />
      <Route path="templates" element={<TemplateListPage />} />
      <Route path="templates/:templateId" element={<TemplateDetailPage />} />
      <Route path="templates/:templateId/run" element={<TemplateRunPage />} />
    </Routes>
  </Page>
);
