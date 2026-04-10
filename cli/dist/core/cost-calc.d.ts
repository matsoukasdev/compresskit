export interface CostReport {
    regularCost: number;
    compressedCost: number;
    savingsPct: number;
}
export declare function calcCost(accountSize: number, count: number): CostReport;
