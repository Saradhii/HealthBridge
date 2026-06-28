import { Context } from 'hono';

export type PaginationParams = {
  page: number;
  limit: number;
  offset: number;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  totalPages: number;
};

// Parse standard `page` / `limit` query params and derive the SQL offset.
export const getPaginationParams = (c: Context): PaginationParams => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '10');
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

// Given a list over-fetched with `limit + 1` rows and the total count, trim the
// extra row and build the pagination metadata block used by list endpoints.
export const buildPagination = <T>(
  rows: T[],
  total: number,
  { page, limit }: PaginationParams
): { data: T[]; pagination: PaginationMeta } => {
  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      hasMore,
      totalPages: Math.ceil(total / limit),
    },
  };
};
