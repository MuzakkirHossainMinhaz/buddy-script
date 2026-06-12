import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model CounterDelta
 *
 */
export type CounterDeltaModel = runtime.Types.Result.DefaultSelection<Prisma.$CounterDeltaPayload>;
export type AggregateCounterDelta = {
    _count: CounterDeltaCountAggregateOutputType | null;
    _avg: CounterDeltaAvgAggregateOutputType | null;
    _sum: CounterDeltaSumAggregateOutputType | null;
    _min: CounterDeltaMinAggregateOutputType | null;
    _max: CounterDeltaMaxAggregateOutputType | null;
};
export type CounterDeltaAvgAggregateOutputType = {
    id: number | null;
    targetId: number | null;
    delta: number | null;
};
export type CounterDeltaSumAggregateOutputType = {
    id: bigint | null;
    targetId: bigint | null;
    delta: number | null;
};
export type CounterDeltaMinAggregateOutputType = {
    id: bigint | null;
    targetType: string | null;
    targetId: bigint | null;
    fieldName: string | null;
    delta: number | null;
    appliedAt: Date | null;
    createdAt: Date | null;
};
export type CounterDeltaMaxAggregateOutputType = {
    id: bigint | null;
    targetType: string | null;
    targetId: bigint | null;
    fieldName: string | null;
    delta: number | null;
    appliedAt: Date | null;
    createdAt: Date | null;
};
export type CounterDeltaCountAggregateOutputType = {
    id: number;
    targetType: number;
    targetId: number;
    fieldName: number;
    delta: number;
    appliedAt: number;
    createdAt: number;
    _all: number;
};
export type CounterDeltaAvgAggregateInputType = {
    id?: true;
    targetId?: true;
    delta?: true;
};
export type CounterDeltaSumAggregateInputType = {
    id?: true;
    targetId?: true;
    delta?: true;
};
export type CounterDeltaMinAggregateInputType = {
    id?: true;
    targetType?: true;
    targetId?: true;
    fieldName?: true;
    delta?: true;
    appliedAt?: true;
    createdAt?: true;
};
export type CounterDeltaMaxAggregateInputType = {
    id?: true;
    targetType?: true;
    targetId?: true;
    fieldName?: true;
    delta?: true;
    appliedAt?: true;
    createdAt?: true;
};
export type CounterDeltaCountAggregateInputType = {
    id?: true;
    targetType?: true;
    targetId?: true;
    fieldName?: true;
    delta?: true;
    appliedAt?: true;
    createdAt?: true;
    _all?: true;
};
export type CounterDeltaAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which CounterDelta to aggregate.
     */
    where?: Prisma.CounterDeltaWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CounterDeltas to fetch.
     */
    orderBy?: Prisma.CounterDeltaOrderByWithRelationInput | Prisma.CounterDeltaOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.CounterDeltaWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CounterDeltas from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CounterDeltas.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned CounterDeltas
    **/
    _count?: true | CounterDeltaCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: CounterDeltaAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: CounterDeltaSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: CounterDeltaMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: CounterDeltaMaxAggregateInputType;
};
export type GetCounterDeltaAggregateType<T extends CounterDeltaAggregateArgs> = {
    [P in keyof T & keyof AggregateCounterDelta]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateCounterDelta[P]> : Prisma.GetScalarType<T[P], AggregateCounterDelta[P]>;
};
export type CounterDeltaGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CounterDeltaWhereInput;
    orderBy?: Prisma.CounterDeltaOrderByWithAggregationInput | Prisma.CounterDeltaOrderByWithAggregationInput[];
    by: Prisma.CounterDeltaScalarFieldEnum[] | Prisma.CounterDeltaScalarFieldEnum;
    having?: Prisma.CounterDeltaScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: CounterDeltaCountAggregateInputType | true;
    _avg?: CounterDeltaAvgAggregateInputType;
    _sum?: CounterDeltaSumAggregateInputType;
    _min?: CounterDeltaMinAggregateInputType;
    _max?: CounterDeltaMaxAggregateInputType;
};
export type CounterDeltaGroupByOutputType = {
    id: bigint;
    targetType: string;
    targetId: bigint;
    fieldName: string;
    delta: number;
    appliedAt: Date | null;
    createdAt: Date;
    _count: CounterDeltaCountAggregateOutputType | null;
    _avg: CounterDeltaAvgAggregateOutputType | null;
    _sum: CounterDeltaSumAggregateOutputType | null;
    _min: CounterDeltaMinAggregateOutputType | null;
    _max: CounterDeltaMaxAggregateOutputType | null;
};
export type GetCounterDeltaGroupByPayload<T extends CounterDeltaGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<CounterDeltaGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof CounterDeltaGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], CounterDeltaGroupByOutputType[P]> : Prisma.GetScalarType<T[P], CounterDeltaGroupByOutputType[P]>;
}>>;
export type CounterDeltaWhereInput = {
    AND?: Prisma.CounterDeltaWhereInput | Prisma.CounterDeltaWhereInput[];
    OR?: Prisma.CounterDeltaWhereInput[];
    NOT?: Prisma.CounterDeltaWhereInput | Prisma.CounterDeltaWhereInput[];
    id?: Prisma.BigIntFilter<"CounterDelta"> | bigint | number;
    targetType?: Prisma.StringFilter<"CounterDelta"> | string;
    targetId?: Prisma.BigIntFilter<"CounterDelta"> | bigint | number;
    fieldName?: Prisma.StringFilter<"CounterDelta"> | string;
    delta?: Prisma.IntFilter<"CounterDelta"> | number;
    appliedAt?: Prisma.DateTimeNullableFilter<"CounterDelta"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"CounterDelta"> | Date | string;
};
export type CounterDeltaOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    targetType?: Prisma.SortOrder;
    targetId?: Prisma.SortOrder;
    fieldName?: Prisma.SortOrder;
    delta?: Prisma.SortOrder;
    appliedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type CounterDeltaWhereUniqueInput = Prisma.AtLeast<{
    id?: bigint | number;
    AND?: Prisma.CounterDeltaWhereInput | Prisma.CounterDeltaWhereInput[];
    OR?: Prisma.CounterDeltaWhereInput[];
    NOT?: Prisma.CounterDeltaWhereInput | Prisma.CounterDeltaWhereInput[];
    targetType?: Prisma.StringFilter<"CounterDelta"> | string;
    targetId?: Prisma.BigIntFilter<"CounterDelta"> | bigint | number;
    fieldName?: Prisma.StringFilter<"CounterDelta"> | string;
    delta?: Prisma.IntFilter<"CounterDelta"> | number;
    appliedAt?: Prisma.DateTimeNullableFilter<"CounterDelta"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"CounterDelta"> | Date | string;
}, "id">;
export type CounterDeltaOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    targetType?: Prisma.SortOrder;
    targetId?: Prisma.SortOrder;
    fieldName?: Prisma.SortOrder;
    delta?: Prisma.SortOrder;
    appliedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.CounterDeltaCountOrderByAggregateInput;
    _avg?: Prisma.CounterDeltaAvgOrderByAggregateInput;
    _max?: Prisma.CounterDeltaMaxOrderByAggregateInput;
    _min?: Prisma.CounterDeltaMinOrderByAggregateInput;
    _sum?: Prisma.CounterDeltaSumOrderByAggregateInput;
};
export type CounterDeltaScalarWhereWithAggregatesInput = {
    AND?: Prisma.CounterDeltaScalarWhereWithAggregatesInput | Prisma.CounterDeltaScalarWhereWithAggregatesInput[];
    OR?: Prisma.CounterDeltaScalarWhereWithAggregatesInput[];
    NOT?: Prisma.CounterDeltaScalarWhereWithAggregatesInput | Prisma.CounterDeltaScalarWhereWithAggregatesInput[];
    id?: Prisma.BigIntWithAggregatesFilter<"CounterDelta"> | bigint | number;
    targetType?: Prisma.StringWithAggregatesFilter<"CounterDelta"> | string;
    targetId?: Prisma.BigIntWithAggregatesFilter<"CounterDelta"> | bigint | number;
    fieldName?: Prisma.StringWithAggregatesFilter<"CounterDelta"> | string;
    delta?: Prisma.IntWithAggregatesFilter<"CounterDelta"> | number;
    appliedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"CounterDelta"> | Date | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"CounterDelta"> | Date | string;
};
export type CounterDeltaCreateInput = {
    id?: bigint | number;
    targetType: string;
    targetId: bigint | number;
    fieldName: string;
    delta: number;
    appliedAt?: Date | string | null;
    createdAt?: Date | string;
};
export type CounterDeltaUncheckedCreateInput = {
    id?: bigint | number;
    targetType: string;
    targetId: bigint | number;
    fieldName: string;
    delta: number;
    appliedAt?: Date | string | null;
    createdAt?: Date | string;
};
export type CounterDeltaUpdateInput = {
    id?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    targetType?: Prisma.StringFieldUpdateOperationsInput | string;
    targetId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    fieldName?: Prisma.StringFieldUpdateOperationsInput | string;
    delta?: Prisma.IntFieldUpdateOperationsInput | number;
    appliedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CounterDeltaUncheckedUpdateInput = {
    id?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    targetType?: Prisma.StringFieldUpdateOperationsInput | string;
    targetId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    fieldName?: Prisma.StringFieldUpdateOperationsInput | string;
    delta?: Prisma.IntFieldUpdateOperationsInput | number;
    appliedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CounterDeltaCreateManyInput = {
    id?: bigint | number;
    targetType: string;
    targetId: bigint | number;
    fieldName: string;
    delta: number;
    appliedAt?: Date | string | null;
    createdAt?: Date | string;
};
export type CounterDeltaUpdateManyMutationInput = {
    id?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    targetType?: Prisma.StringFieldUpdateOperationsInput | string;
    targetId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    fieldName?: Prisma.StringFieldUpdateOperationsInput | string;
    delta?: Prisma.IntFieldUpdateOperationsInput | number;
    appliedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CounterDeltaUncheckedUpdateManyInput = {
    id?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    targetType?: Prisma.StringFieldUpdateOperationsInput | string;
    targetId?: Prisma.BigIntFieldUpdateOperationsInput | bigint | number;
    fieldName?: Prisma.StringFieldUpdateOperationsInput | string;
    delta?: Prisma.IntFieldUpdateOperationsInput | number;
    appliedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CounterDeltaCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    targetType?: Prisma.SortOrder;
    targetId?: Prisma.SortOrder;
    fieldName?: Prisma.SortOrder;
    delta?: Prisma.SortOrder;
    appliedAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type CounterDeltaAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    targetId?: Prisma.SortOrder;
    delta?: Prisma.SortOrder;
};
export type CounterDeltaMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    targetType?: Prisma.SortOrder;
    targetId?: Prisma.SortOrder;
    fieldName?: Prisma.SortOrder;
    delta?: Prisma.SortOrder;
    appliedAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type CounterDeltaMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    targetType?: Prisma.SortOrder;
    targetId?: Prisma.SortOrder;
    fieldName?: Prisma.SortOrder;
    delta?: Prisma.SortOrder;
    appliedAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type CounterDeltaSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    targetId?: Prisma.SortOrder;
    delta?: Prisma.SortOrder;
};
export type CounterDeltaSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    targetType?: boolean;
    targetId?: boolean;
    fieldName?: boolean;
    delta?: boolean;
    appliedAt?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["counterDelta"]>;
export type CounterDeltaSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    targetType?: boolean;
    targetId?: boolean;
    fieldName?: boolean;
    delta?: boolean;
    appliedAt?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["counterDelta"]>;
export type CounterDeltaSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    targetType?: boolean;
    targetId?: boolean;
    fieldName?: boolean;
    delta?: boolean;
    appliedAt?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["counterDelta"]>;
export type CounterDeltaSelectScalar = {
    id?: boolean;
    targetType?: boolean;
    targetId?: boolean;
    fieldName?: boolean;
    delta?: boolean;
    appliedAt?: boolean;
    createdAt?: boolean;
};
export type CounterDeltaOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "targetType" | "targetId" | "fieldName" | "delta" | "appliedAt" | "createdAt", ExtArgs["result"]["counterDelta"]>;
export type $CounterDeltaPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "CounterDelta";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: bigint;
        targetType: string;
        targetId: bigint;
        fieldName: string;
        delta: number;
        appliedAt: Date | null;
        createdAt: Date;
    }, ExtArgs["result"]["counterDelta"]>;
    composites: {};
};
export type CounterDeltaGetPayload<S extends boolean | null | undefined | CounterDeltaDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$CounterDeltaPayload, S>;
export type CounterDeltaCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<CounterDeltaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: CounterDeltaCountAggregateInputType | true;
};
export interface CounterDeltaDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['CounterDelta'];
        meta: {
            name: 'CounterDelta';
        };
    };
    /**
     * Find zero or one CounterDelta that matches the filter.
     * @param {CounterDeltaFindUniqueArgs} args - Arguments to find a CounterDelta
     * @example
     * // Get one CounterDelta
     * const counterDelta = await prisma.counterDelta.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CounterDeltaFindUniqueArgs>(args: Prisma.SelectSubset<T, CounterDeltaFindUniqueArgs<ExtArgs>>): Prisma.Prisma__CounterDeltaClient<runtime.Types.Result.GetResult<Prisma.$CounterDeltaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one CounterDelta that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CounterDeltaFindUniqueOrThrowArgs} args - Arguments to find a CounterDelta
     * @example
     * // Get one CounterDelta
     * const counterDelta = await prisma.counterDelta.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CounterDeltaFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, CounterDeltaFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__CounterDeltaClient<runtime.Types.Result.GetResult<Prisma.$CounterDeltaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first CounterDelta that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CounterDeltaFindFirstArgs} args - Arguments to find a CounterDelta
     * @example
     * // Get one CounterDelta
     * const counterDelta = await prisma.counterDelta.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CounterDeltaFindFirstArgs>(args?: Prisma.SelectSubset<T, CounterDeltaFindFirstArgs<ExtArgs>>): Prisma.Prisma__CounterDeltaClient<runtime.Types.Result.GetResult<Prisma.$CounterDeltaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first CounterDelta that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CounterDeltaFindFirstOrThrowArgs} args - Arguments to find a CounterDelta
     * @example
     * // Get one CounterDelta
     * const counterDelta = await prisma.counterDelta.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CounterDeltaFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, CounterDeltaFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__CounterDeltaClient<runtime.Types.Result.GetResult<Prisma.$CounterDeltaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more CounterDeltas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CounterDeltaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CounterDeltas
     * const counterDeltas = await prisma.counterDelta.findMany()
     *
     * // Get first 10 CounterDeltas
     * const counterDeltas = await prisma.counterDelta.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const counterDeltaWithIdOnly = await prisma.counterDelta.findMany({ select: { id: true } })
     *
     */
    findMany<T extends CounterDeltaFindManyArgs>(args?: Prisma.SelectSubset<T, CounterDeltaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CounterDeltaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a CounterDelta.
     * @param {CounterDeltaCreateArgs} args - Arguments to create a CounterDelta.
     * @example
     * // Create one CounterDelta
     * const CounterDelta = await prisma.counterDelta.create({
     *   data: {
     *     // ... data to create a CounterDelta
     *   }
     * })
     *
     */
    create<T extends CounterDeltaCreateArgs>(args: Prisma.SelectSubset<T, CounterDeltaCreateArgs<ExtArgs>>): Prisma.Prisma__CounterDeltaClient<runtime.Types.Result.GetResult<Prisma.$CounterDeltaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many CounterDeltas.
     * @param {CounterDeltaCreateManyArgs} args - Arguments to create many CounterDeltas.
     * @example
     * // Create many CounterDeltas
     * const counterDelta = await prisma.counterDelta.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends CounterDeltaCreateManyArgs>(args?: Prisma.SelectSubset<T, CounterDeltaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many CounterDeltas and returns the data saved in the database.
     * @param {CounterDeltaCreateManyAndReturnArgs} args - Arguments to create many CounterDeltas.
     * @example
     * // Create many CounterDeltas
     * const counterDelta = await prisma.counterDelta.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many CounterDeltas and only return the `id`
     * const counterDeltaWithIdOnly = await prisma.counterDelta.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends CounterDeltaCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, CounterDeltaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CounterDeltaPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a CounterDelta.
     * @param {CounterDeltaDeleteArgs} args - Arguments to delete one CounterDelta.
     * @example
     * // Delete one CounterDelta
     * const CounterDelta = await prisma.counterDelta.delete({
     *   where: {
     *     // ... filter to delete one CounterDelta
     *   }
     * })
     *
     */
    delete<T extends CounterDeltaDeleteArgs>(args: Prisma.SelectSubset<T, CounterDeltaDeleteArgs<ExtArgs>>): Prisma.Prisma__CounterDeltaClient<runtime.Types.Result.GetResult<Prisma.$CounterDeltaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one CounterDelta.
     * @param {CounterDeltaUpdateArgs} args - Arguments to update one CounterDelta.
     * @example
     * // Update one CounterDelta
     * const counterDelta = await prisma.counterDelta.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends CounterDeltaUpdateArgs>(args: Prisma.SelectSubset<T, CounterDeltaUpdateArgs<ExtArgs>>): Prisma.Prisma__CounterDeltaClient<runtime.Types.Result.GetResult<Prisma.$CounterDeltaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more CounterDeltas.
     * @param {CounterDeltaDeleteManyArgs} args - Arguments to filter CounterDeltas to delete.
     * @example
     * // Delete a few CounterDeltas
     * const { count } = await prisma.counterDelta.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends CounterDeltaDeleteManyArgs>(args?: Prisma.SelectSubset<T, CounterDeltaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more CounterDeltas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CounterDeltaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CounterDeltas
     * const counterDelta = await prisma.counterDelta.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends CounterDeltaUpdateManyArgs>(args: Prisma.SelectSubset<T, CounterDeltaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more CounterDeltas and returns the data updated in the database.
     * @param {CounterDeltaUpdateManyAndReturnArgs} args - Arguments to update many CounterDeltas.
     * @example
     * // Update many CounterDeltas
     * const counterDelta = await prisma.counterDelta.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more CounterDeltas and only return the `id`
     * const counterDeltaWithIdOnly = await prisma.counterDelta.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends CounterDeltaUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, CounterDeltaUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CounterDeltaPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one CounterDelta.
     * @param {CounterDeltaUpsertArgs} args - Arguments to update or create a CounterDelta.
     * @example
     * // Update or create a CounterDelta
     * const counterDelta = await prisma.counterDelta.upsert({
     *   create: {
     *     // ... data to create a CounterDelta
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CounterDelta we want to update
     *   }
     * })
     */
    upsert<T extends CounterDeltaUpsertArgs>(args: Prisma.SelectSubset<T, CounterDeltaUpsertArgs<ExtArgs>>): Prisma.Prisma__CounterDeltaClient<runtime.Types.Result.GetResult<Prisma.$CounterDeltaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of CounterDeltas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CounterDeltaCountArgs} args - Arguments to filter CounterDeltas to count.
     * @example
     * // Count the number of CounterDeltas
     * const count = await prisma.counterDelta.count({
     *   where: {
     *     // ... the filter for the CounterDeltas we want to count
     *   }
     * })
    **/
    count<T extends CounterDeltaCountArgs>(args?: Prisma.Subset<T, CounterDeltaCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], CounterDeltaCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a CounterDelta.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CounterDeltaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CounterDeltaAggregateArgs>(args: Prisma.Subset<T, CounterDeltaAggregateArgs>): Prisma.PrismaPromise<GetCounterDeltaAggregateType<T>>;
    /**
     * Group by CounterDelta.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CounterDeltaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<T extends CounterDeltaGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: CounterDeltaGroupByArgs['orderBy'];
    } : {
        orderBy?: CounterDeltaGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, CounterDeltaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCounterDeltaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the CounterDelta model
     */
    readonly fields: CounterDeltaFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for CounterDelta.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__CounterDeltaClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
/**
 * Fields of the CounterDelta model
 */
export interface CounterDeltaFieldRefs {
    readonly id: Prisma.FieldRef<"CounterDelta", 'BigInt'>;
    readonly targetType: Prisma.FieldRef<"CounterDelta", 'String'>;
    readonly targetId: Prisma.FieldRef<"CounterDelta", 'BigInt'>;
    readonly fieldName: Prisma.FieldRef<"CounterDelta", 'String'>;
    readonly delta: Prisma.FieldRef<"CounterDelta", 'Int'>;
    readonly appliedAt: Prisma.FieldRef<"CounterDelta", 'DateTime'>;
    readonly createdAt: Prisma.FieldRef<"CounterDelta", 'DateTime'>;
}
/**
 * CounterDelta findUnique
 */
export type CounterDeltaFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CounterDelta
     */
    select?: Prisma.CounterDeltaSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CounterDelta
     */
    omit?: Prisma.CounterDeltaOmit<ExtArgs> | null;
    /**
     * Filter, which CounterDelta to fetch.
     */
    where: Prisma.CounterDeltaWhereUniqueInput;
};
/**
 * CounterDelta findUniqueOrThrow
 */
export type CounterDeltaFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CounterDelta
     */
    select?: Prisma.CounterDeltaSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CounterDelta
     */
    omit?: Prisma.CounterDeltaOmit<ExtArgs> | null;
    /**
     * Filter, which CounterDelta to fetch.
     */
    where: Prisma.CounterDeltaWhereUniqueInput;
};
/**
 * CounterDelta findFirst
 */
export type CounterDeltaFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CounterDelta
     */
    select?: Prisma.CounterDeltaSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CounterDelta
     */
    omit?: Prisma.CounterDeltaOmit<ExtArgs> | null;
    /**
     * Filter, which CounterDelta to fetch.
     */
    where?: Prisma.CounterDeltaWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CounterDeltas to fetch.
     */
    orderBy?: Prisma.CounterDeltaOrderByWithRelationInput | Prisma.CounterDeltaOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for CounterDeltas.
     */
    cursor?: Prisma.CounterDeltaWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CounterDeltas from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CounterDeltas.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of CounterDeltas.
     */
    distinct?: Prisma.CounterDeltaScalarFieldEnum | Prisma.CounterDeltaScalarFieldEnum[];
};
/**
 * CounterDelta findFirstOrThrow
 */
export type CounterDeltaFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CounterDelta
     */
    select?: Prisma.CounterDeltaSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CounterDelta
     */
    omit?: Prisma.CounterDeltaOmit<ExtArgs> | null;
    /**
     * Filter, which CounterDelta to fetch.
     */
    where?: Prisma.CounterDeltaWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CounterDeltas to fetch.
     */
    orderBy?: Prisma.CounterDeltaOrderByWithRelationInput | Prisma.CounterDeltaOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for CounterDeltas.
     */
    cursor?: Prisma.CounterDeltaWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CounterDeltas from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CounterDeltas.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of CounterDeltas.
     */
    distinct?: Prisma.CounterDeltaScalarFieldEnum | Prisma.CounterDeltaScalarFieldEnum[];
};
/**
 * CounterDelta findMany
 */
export type CounterDeltaFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CounterDelta
     */
    select?: Prisma.CounterDeltaSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CounterDelta
     */
    omit?: Prisma.CounterDeltaOmit<ExtArgs> | null;
    /**
     * Filter, which CounterDeltas to fetch.
     */
    where?: Prisma.CounterDeltaWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CounterDeltas to fetch.
     */
    orderBy?: Prisma.CounterDeltaOrderByWithRelationInput | Prisma.CounterDeltaOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing CounterDeltas.
     */
    cursor?: Prisma.CounterDeltaWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CounterDeltas from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CounterDeltas.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of CounterDeltas.
     */
    distinct?: Prisma.CounterDeltaScalarFieldEnum | Prisma.CounterDeltaScalarFieldEnum[];
};
/**
 * CounterDelta create
 */
export type CounterDeltaCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CounterDelta
     */
    select?: Prisma.CounterDeltaSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CounterDelta
     */
    omit?: Prisma.CounterDeltaOmit<ExtArgs> | null;
    /**
     * The data needed to create a CounterDelta.
     */
    data: Prisma.XOR<Prisma.CounterDeltaCreateInput, Prisma.CounterDeltaUncheckedCreateInput>;
};
/**
 * CounterDelta createMany
 */
export type CounterDeltaCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many CounterDeltas.
     */
    data: Prisma.CounterDeltaCreateManyInput | Prisma.CounterDeltaCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * CounterDelta createManyAndReturn
 */
export type CounterDeltaCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CounterDelta
     */
    select?: Prisma.CounterDeltaSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the CounterDelta
     */
    omit?: Prisma.CounterDeltaOmit<ExtArgs> | null;
    /**
     * The data used to create many CounterDeltas.
     */
    data: Prisma.CounterDeltaCreateManyInput | Prisma.CounterDeltaCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * CounterDelta update
 */
export type CounterDeltaUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CounterDelta
     */
    select?: Prisma.CounterDeltaSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CounterDelta
     */
    omit?: Prisma.CounterDeltaOmit<ExtArgs> | null;
    /**
     * The data needed to update a CounterDelta.
     */
    data: Prisma.XOR<Prisma.CounterDeltaUpdateInput, Prisma.CounterDeltaUncheckedUpdateInput>;
    /**
     * Choose, which CounterDelta to update.
     */
    where: Prisma.CounterDeltaWhereUniqueInput;
};
/**
 * CounterDelta updateMany
 */
export type CounterDeltaUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update CounterDeltas.
     */
    data: Prisma.XOR<Prisma.CounterDeltaUpdateManyMutationInput, Prisma.CounterDeltaUncheckedUpdateManyInput>;
    /**
     * Filter which CounterDeltas to update
     */
    where?: Prisma.CounterDeltaWhereInput;
    /**
     * Limit how many CounterDeltas to update.
     */
    limit?: number;
};
/**
 * CounterDelta updateManyAndReturn
 */
export type CounterDeltaUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CounterDelta
     */
    select?: Prisma.CounterDeltaSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the CounterDelta
     */
    omit?: Prisma.CounterDeltaOmit<ExtArgs> | null;
    /**
     * The data used to update CounterDeltas.
     */
    data: Prisma.XOR<Prisma.CounterDeltaUpdateManyMutationInput, Prisma.CounterDeltaUncheckedUpdateManyInput>;
    /**
     * Filter which CounterDeltas to update
     */
    where?: Prisma.CounterDeltaWhereInput;
    /**
     * Limit how many CounterDeltas to update.
     */
    limit?: number;
};
/**
 * CounterDelta upsert
 */
export type CounterDeltaUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CounterDelta
     */
    select?: Prisma.CounterDeltaSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CounterDelta
     */
    omit?: Prisma.CounterDeltaOmit<ExtArgs> | null;
    /**
     * The filter to search for the CounterDelta to update in case it exists.
     */
    where: Prisma.CounterDeltaWhereUniqueInput;
    /**
     * In case the CounterDelta found by the `where` argument doesn't exist, create a new CounterDelta with this data.
     */
    create: Prisma.XOR<Prisma.CounterDeltaCreateInput, Prisma.CounterDeltaUncheckedCreateInput>;
    /**
     * In case the CounterDelta was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.CounterDeltaUpdateInput, Prisma.CounterDeltaUncheckedUpdateInput>;
};
/**
 * CounterDelta delete
 */
export type CounterDeltaDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CounterDelta
     */
    select?: Prisma.CounterDeltaSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CounterDelta
     */
    omit?: Prisma.CounterDeltaOmit<ExtArgs> | null;
    /**
     * Filter which CounterDelta to delete.
     */
    where: Prisma.CounterDeltaWhereUniqueInput;
};
/**
 * CounterDelta deleteMany
 */
export type CounterDeltaDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which CounterDeltas to delete
     */
    where?: Prisma.CounterDeltaWhereInput;
    /**
     * Limit how many CounterDeltas to delete.
     */
    limit?: number;
};
/**
 * CounterDelta without action
 */
export type CounterDeltaDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CounterDelta
     */
    select?: Prisma.CounterDeltaSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CounterDelta
     */
    omit?: Prisma.CounterDeltaOmit<ExtArgs> | null;
};
//# sourceMappingURL=CounterDelta.d.ts.map