import type { IAdvancePayment } from './AdvancePayment';
import type { IBillingPeriod } from './BillingPeriod';
import type { IMeterReading } from './MeterReading';


export interface IAppData {
    advancePayment: IAdvancePayment[];
    billingPeriod: IBillingPeriod[];
    meterReading: IMeterReading[];
};