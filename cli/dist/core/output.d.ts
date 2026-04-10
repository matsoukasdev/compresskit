/**
 * CLI output utilities — chalk tables, ora spinners, error formatting.
 */
export declare function spinner(text: string): import("ora").Ora;
export declare function heading(text: string): void;
export declare function info(label: string, value: string | number): void;
export declare function success(text: string): void;
export declare function warn(text: string): void;
export declare function divider(width?: number): void;
export declare function tableHeader(columns: string[], widths: number[]): void;
export declare function tableRow(values: string[], widths: number[], highlights?: number[]): void;
export declare function solValue(lamports: number): string;
export declare function savingsHighlight(pct: number): string;
export declare function handleError(err: unknown): never;
