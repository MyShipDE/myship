export interface ErrorReport {
  id: number;
  name?: string;
  message?: string;
  stack?: string;
  createdAt: Date;
  modalVisible: boolean;
}
