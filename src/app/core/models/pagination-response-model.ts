export interface PaginationResponse<T> {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  data: T [];
}
