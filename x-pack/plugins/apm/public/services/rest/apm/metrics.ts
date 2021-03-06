/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { MetricsChartAPIResponse } from 'x-pack/plugins/apm/server/lib/metrics/get_all_metrics_chart_data';
import { IUrlParams } from '../../../store/urlParams';
import { callApi } from '../callApi';
import { getEncodedEsQuery } from './apm';

export async function loadMetricsChartDataForService({
  serviceName,
  start,
  end,
  kuery
}: IUrlParams) {
  return callApi<MetricsChartAPIResponse>({
    pathname: `/api/apm/services/${serviceName}/metrics/charts`,
    query: {
      start,
      end,
      esFilterQuery: await getEncodedEsQuery(kuery)
    }
  });
}
