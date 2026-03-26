import type {
  BaseRecord,
  CreateParams,
  CreateResponse,
  DataProvider,
  DeleteOneParams,
  DeleteOneResponse,
  GetListParams,
  GetListResponse,
  GetManyParams,
  GetManyResponse,
  GetOneParams,
  GetOneResponse,
  UpdateParams,
  UpdateResponse,
} from "@refinedev/core";

import { getResourceConfig, type ResourceKey, type ResourceRow } from "./admin-data";

function cloneRows(rows: ResourceRow[]): ResourceRow[] {
  return rows.map((row) => ({ ...row }));
}

function toBaseRecord(row: ResourceRow): BaseRecord {
  return { ...row };
}

function paginate(rows: ResourceRow[], currentPage: number, pageSize: number) {
  const start = (currentPage - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

function stringifyCell(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object" && "label" in value) {
    return String((value as { label: string }).label);
  }

  return "";
}

function applyBasicFilters(rows: ResourceRow[], filters: GetListParams["filters"]): ResourceRow[] {
  if (!filters?.length) {
    return rows;
  }

  return rows.filter((row) =>
    filters.every((filter) => {
      if ("field" in filter && "value" in filter) {
        const value = stringifyCell(row[filter.field]);
        const needle = stringifyCell(filter.value);

        if (filter.operator === "contains" || filter.operator === "containss") {
          return value.toLowerCase().includes(needle.toLowerCase());
        }

        if (filter.operator === "eq" || filter.operator === "eqs") {
          return value === needle;
        }
      }

      return true;
    }),
  );
}

function sortRows(rows: ResourceRow[], sorters: GetListParams["sorters"]): ResourceRow[] {
  const sorter = sorters?.[0];
  if (!sorter) {
    return rows;
  }

  const direction = sorter.order === "desc" ? -1 : 1;
  return [...rows].sort((left, right) => {
    const leftValue = stringifyCell(left[sorter.field]);
    const rightValue = stringifyCell(right[sorter.field]);
    return leftValue.localeCompare(rightValue, "sk") * direction;
  });
}

function emptyDataProvider(method: string): never {
  throw new Error(`Demo data provider does not support ${method} in this admin baseline.`);
}

function buildRecord(resource: string, id: string, variables: Record<string, unknown>): BaseRecord {
  return { id, resource, ...variables };
}

function resourceRows(resource: string): ResourceRow[] {
  const config = getResourceConfig(resource as ResourceKey);
  return cloneRows(config.rows);
}

export const demoDataProvider: DataProvider = {
  async getList<TData extends BaseRecord = BaseRecord>(params: GetListParams): Promise<GetListResponse<TData>> {
    const rows = sortRows(applyBasicFilters(resourceRows(params.resource), params.filters), params.sorters);
    const currentPage = params.pagination?.currentPage ?? 1;
    const pageSize = params.pagination?.pageSize ?? rows.length;
    const pagedRows = paginate(rows, currentPage, pageSize);

    return {
      data: pagedRows.map((row) => toBaseRecord(row) as TData),
      total: rows.length,
    };
  },

  async getMany<TData extends BaseRecord = BaseRecord>(params: GetManyParams): Promise<GetManyResponse<TData>> {
    const rows = resourceRows(params.resource).filter((row) => params.ids.map(String).includes(String(row.id)));
    return { data: rows.map((row) => toBaseRecord(row) as TData) };
  },

  async getOne<TData extends BaseRecord = BaseRecord>(params: GetOneParams): Promise<GetOneResponse<TData>> {
    const row = resourceRows(params.resource).find((item) => String(item.id) === String(params.id));

    if (!row) {
      throw new Error(`Record ${String(params.id)} was not found in ${params.resource}.`);
    }

    return { data: toBaseRecord(row) as TData };
  },

  async create<
    TData extends BaseRecord = BaseRecord,
    TVariables = Record<string, never>,
  >(params: CreateParams<TVariables>): Promise<CreateResponse<TData>> {
    return {
      data: buildRecord(params.resource, globalThis.crypto.randomUUID(), params.variables as Record<string, unknown>) as TData,
    };
  },

  async update<
    TData extends BaseRecord = BaseRecord,
    TVariables = Record<string, never>,
  >(params: UpdateParams<TVariables>): Promise<UpdateResponse<TData>> {
    return {
      data: buildRecord(params.resource, String(params.id), params.variables as Record<string, unknown>) as TData,
    };
  },

  async deleteOne<
    TData extends BaseRecord = BaseRecord,
    TVariables = Record<string, never>,
  >(params: DeleteOneParams<TVariables>): Promise<DeleteOneResponse<TData>> {
    return {
      data: { id: params.id } as TData,
    };
  },

  getApiUrl() {
    return "local-demo://proworkio-admin";
  },

  async createMany() {
    return emptyDataProvider("createMany");
  },

  async updateMany() {
    return emptyDataProvider("updateMany");
  },

  async deleteMany() {
    return emptyDataProvider("deleteMany");
  },
};
