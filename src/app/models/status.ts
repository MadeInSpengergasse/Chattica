export interface Status<T> {
  status: string;
  error_message: string;
  data: T;
}
