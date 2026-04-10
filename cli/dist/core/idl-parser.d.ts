export interface ParsedAccount {
    name: string;
    size: number;
    fields: string[];
}
export declare function parseIdl(_idl: unknown): ParsedAccount[];
