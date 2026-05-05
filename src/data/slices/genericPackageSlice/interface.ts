export interface GenericPackage {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  [key: string]: any; // Allow additional properties
}
export interface GenericPackageSearchParams {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
  [key: string]: any; // Allow additional query parameters
}
export interface GenericPackageResponse {
  packages: GenericPackage[];
  total: number;
  success: boolean;
}
export interface GenericPackageByIdResponse {
  package: GenericPackage | null;
  success: boolean;
}
export interface GenericPackageMutationResponse {
  package?: GenericPackage | null;
  success: boolean;
  message: string;
}
export interface GenericPackageErrorResponse {
  status: string;
  message: string;
  success: false;
}
