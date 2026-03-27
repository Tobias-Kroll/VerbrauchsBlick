export type AdvencePaymentStatus = 'open' | 'paid';

export interface IAdvancePayment {
    id: string;
    billingPeriodId: string;
    dueDate: string;
    grossAmount: number;
    status: AdvencePaymentStatus
}
