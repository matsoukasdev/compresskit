interface MigrateOpts {
    network: string;
    output: string;
}
export declare function migrate(programId: string, opts: MigrateOpts): Promise<void>;
export {};
