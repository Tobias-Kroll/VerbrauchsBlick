export interface IBillingPeriod {
  id: string;
  startDate: string;
  endDate: string;
  grossBasePrice: number;
  grossConsumptionPrice: number;
  isActive: boolean;
}

