import { Ref } from "../../common/entities/Ref";
import { Id } from "../../common/entities/Schemas";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationResult } from "../../synchronization/entities/SynchronizationResult";
import { TransformationRepository } from "../../transformations/repositories/TransformationRepository";
import { MetadataEntities, MetadataEntity, MetadataPackage } from "../entities/MetadataEntities";
import { MetadataImportParams } from "../types";
import { FilterRule } from "../entities/FilterRule";

export interface MetadataRepositoryConstructor {
    new (
        instance: Instance,
        transformationRepository: TransformationRepository
    ): MetadataRepository;
}

export interface MetadataRepository {
    getMetadataByIds<T>(ids: Id[], fields?: string): Promise<MetadataPackage<T>>;
    getByFilterRules(filterRules: FilterRule[]): Promise<Id[]>;

    listMetadata(params: ListMetadataParams): Promise<ListMetadataResponse>;
    listAllMetadata(params: ListMetadataParams): Promise<MetadataEntity[]>;

    save(
        metadata: MetadataPackage,
        additionalParams?: MetadataImportParams
    ): Promise<SynchronizationResult>;

    remove(
        metadata: MetadataPackage<Ref>,
        additionalParams?: MetadataImportParams
    ): Promise<SynchronizationResult>;
}

export interface ListMetadataParams {
    type: keyof MetadataEntities;
    fields?: object;
    group?: { type: string; value: string };
    level?: string;
    includeParents?: boolean;
    search?: { field: string; operator: string; value: string };
    order?: { field: string; order: "asc" | "desc" };
    page?: number;
    pageSize?: number;
    paging?: false;
    lastUpdated?: Date;
    parents?: string[];
    filterRows?: string[];
    showOnlySelected?: boolean;
    selectedIds?: string[];
}

export interface ListMetadataResponse {
    objects: MetadataEntity[];
    pager: {
        pageSize: number;
        total: number;
        page: number;
    };
}
