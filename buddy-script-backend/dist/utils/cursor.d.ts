export type SortOrder = 'newest' | 'oldest';
export type KeysetCursor = {
    createdAt: Date;
    id: bigint;
};
type LegacyLookupTable = 'post' | 'comment' | 'reply';
export declare function encodeKeysetCursor(item?: {
    createdAt: Date;
    id: bigint;
} | null): string | null;
export declare function parseKeysetCursor(cursor: string | undefined, legacyTable: LegacyLookupTable): Promise<KeysetCursor | null>;
export declare function keysetWhere(sort: SortOrder, parsedCursor: KeysetCursor | null): {
    OR?: undefined;
} | {
    OR: ({
        createdAt: {
            gt: Date;
        };
        id?: undefined;
    } | {
        createdAt: Date;
        id: {
            gt: bigint;
        };
    })[];
} | {
    OR: ({
        createdAt: {
            lt: Date;
        };
        id?: undefined;
    } | {
        createdAt: Date;
        id: {
            lt: bigint;
        };
    })[];
};
export {};
//# sourceMappingURL=cursor.d.ts.map