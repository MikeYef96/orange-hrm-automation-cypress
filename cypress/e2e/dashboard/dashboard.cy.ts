import { DashboardPage } from '../../pages/DashboardPage';

const dashboardPage = new DashboardPage();

const SUB_UNIT_TITLE = 'Employee Distribution by Sub Unit';
const LOCATION_TITLE = 'Employee Distribution by Location';
const TIME_AT_WORK_TITLE = 'Time at Work';

interface DistributionCategory {
  id: number;
  name: string;
}

interface DistributionRecord {
  category: DistributionCategory;
  count: number;
}

interface DistributionChart {
  records: DistributionRecord[];
  otherEmployeeCount: number;
  unassignedEmployeeCount: number;
}

interface DashboardApiResponse {
  statusCode: number;
  body: unknown;
}

function assertChartGraphicHasDimensions(title: string): void {
  dashboardPage.getChartGraphic(title).should(($graphic) => {
    const graphic = $graphic.get(0);
    expect(graphic, `${title} chart graphic`).to.not.equal(undefined);

    if (graphic?.tagName.toLowerCase() === 'canvas') {
      expect(Number(graphic.getAttribute('width')), `${title} canvas width`).to.be.greaterThan(0);
      expect(Number(graphic.getAttribute('height')), `${title} canvas height`).to.be.greaterThan(0);
      return;
    }

    expect(graphic?.tagName.toLowerCase(), `${title} graphic type`).to.eq('svg');
    const { width, height } = graphic?.getBoundingClientRect() ?? { width: 0, height: 0 };
    expect(width, `${title} SVG width`).to.be.greaterThan(0);
    expect(height, `${title} SVG height`).to.be.greaterThan(0);
  });
}

function parseDistributionResponse(
  response: DashboardApiResponse | undefined,
  categoryKey: 'subunit' | 'location',
): DistributionChart {
  expect(response, `${categoryKey} chart API response`).to.not.equal(undefined);
  expect(response?.statusCode, `${categoryKey} chart API status`).to.eq(200);

  const body: unknown = response?.body;
  if (typeof body !== 'object' || body === null || !('data' in body) || !('meta' in body)) {
    throw new Error(`The ${categoryKey} chart API response is missing data or meta.`);
  }
  if (!Array.isArray(body.data) || body.data.length === 0) {
    throw new Error(`The ${categoryKey} chart API returned no distribution data.`);
  }
  if (typeof body.meta !== 'object' || body.meta === null) {
    throw new Error(`The ${categoryKey} chart API returned invalid metadata.`);
  }

  const records = body.data.map((item: unknown, index: number): DistributionRecord => {
    if (typeof item !== 'object' || item === null || !(categoryKey in item) || !('count' in item)) {
      throw new Error(`The ${categoryKey} chart record ${index} has an invalid shape.`);
    }

    const record = item as Record<string, unknown>;
    const category = record[categoryKey];
    if (typeof category !== 'object' || category === null || !('id' in category) || !('name' in category)) {
      throw new Error(`The ${categoryKey} chart category ${index} has an invalid shape.`);
    }

    const categoryData = category as Record<string, unknown>;
    const id = categoryData.id;
    const name = categoryData.name;
    const count = record.count;
    if (typeof id !== 'number' || !Number.isInteger(id) ||
        typeof name !== 'string' || name.trim().length === 0 ||
        typeof count !== 'number' || !Number.isInteger(count) || count < 0) {
      throw new Error(`The ${categoryKey} chart record ${index} contains invalid values.`);
    }

    return { category: { id, name: name.trim() }, count };
  });

  const meta = body.meta as Record<string, unknown>;
  const otherEmployeeCount = meta.otherEmployeeCount;
  const unassignedEmployeeCount = meta.unassignedEmployeeCount;
  if (typeof otherEmployeeCount !== 'number' || !Number.isInteger(otherEmployeeCount) ||
      otherEmployeeCount < 0 ||
      typeof unassignedEmployeeCount !== 'number' || !Number.isInteger(unassignedEmployeeCount) ||
      unassignedEmployeeCount < 0) {
    throw new Error(`The ${categoryKey} chart metadata contains invalid employee counts.`);
  }

  expect(records.some(({ count }) => count > 0), `${categoryKey} chart has employee data`).to.eq(true);
  expect(
    new Set(records.map(({ category }) => category.id)).size,
    `${categoryKey} category IDs are unique`,
  ).to.eq(records.length);
  expect(
    new Set(records.map(({ category }) => category.name)).size,
    `${categoryKey} category names are unique`,
  ).to.eq(records.length);

  return { records, otherEmployeeCount, unassignedEmployeeCount };
}

function assertChartMatchesResponse(title: string, chart: DistributionChart): void {
  const expectedLabels = chart.records.map(({ category }) => category.name);
  if (chart.otherEmployeeCount > 0) {
    expectedLabels.push('Other');
  }
  if (chart.unassignedEmployeeCount > 0) {
    expectedLabels.push('Unassigned');
  }

  dashboardPage.getChartLabels(title).should(($labels) => {
    const actualLabels = [...$labels].map((label) => label.textContent?.trim() ?? '');
    expect(actualLabels, `${title} legend is not empty`).not.to.include('');
    expect(new Set(actualLabels).size, `${title} legend has no duplicate labels`).to.eq(actualLabels.length);
    expect([...actualLabels].sort(), `${title} legend matches API categories`).to.deep.eq(
      [...expectedLabels].sort(),
    );
  });
}

describe('Dashboard data validation', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    cy.intercept('GET', '**/api/v2/dashboard/employees/subunit').as('subUnitDistribution');
    cy.intercept('GET', '**/api/v2/dashboard/employees/locations').as('locationDistribution');
    dashboardPage.visit();
  });

  it('renders Sub Unit categories from the API and validates distribution counts', () => {
    dashboardPage.getWidget(SUB_UNIT_TITLE);
    dashboardPage.getWidgetTitle(SUB_UNIT_TITLE).should('be.visible');
    dashboardPage.getChartGraphic(SUB_UNIT_TITLE).should('have.length.at.least', 1);
    dashboardPage.getChartGraphic(SUB_UNIT_TITLE).first().should('be.visible');
    assertChartGraphicHasDimensions(SUB_UNIT_TITLE);

    cy.wait('@subUnitDistribution').then(({ response }) => {
      const chart = parseDistributionResponse(response, 'subunit');
      assertChartMatchesResponse(SUB_UNIT_TITLE, chart);
    });
    dashboardPage.getWidgetBody(SUB_UNIT_TITLE).should('not.contain.text', LOCATION_TITLE);
  });

  it('renders Location categories from the API and validates distribution counts', () => {
    dashboardPage.getWidget(LOCATION_TITLE);
    dashboardPage.getWidgetTitle(LOCATION_TITLE).should('be.visible');
    dashboardPage.getChartGraphic(LOCATION_TITLE).should('have.length.at.least', 1);
    dashboardPage.getChartGraphic(LOCATION_TITLE).first().should('be.visible');
    assertChartGraphicHasDimensions(LOCATION_TITLE);

    cy.wait('@locationDistribution').then(({ response }) => {
      const chart = parseDistributionResponse(response, 'location');
      assertChartMatchesResponse(LOCATION_TITLE, chart);
    });
    dashboardPage.getWidgetBody(LOCATION_TITLE).should('not.contain.text', SUB_UNIT_TITLE);
  });

  it('keeps Time at Work independent from the distribution charts', () => {
    dashboardPage.getWidget(TIME_AT_WORK_TITLE).should('be.visible');
    dashboardPage.getWidget(TIME_AT_WORK_TITLE).should('contain.text', 'This Week');
    dashboardPage.getWidget(TIME_AT_WORK_TITLE).should('not.contain.text', SUB_UNIT_TITLE);
    dashboardPage.getChartGraphic(TIME_AT_WORK_TITLE).should('have.length.at.least', 1);
  });
});
