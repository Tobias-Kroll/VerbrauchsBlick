export interface BillingPeriod {
  id: string;
  startDate: string;
  endDate: string;
  grossBasePrice: number;
  grossConsumptionPrice: number;
  isActive: boolean;
}

