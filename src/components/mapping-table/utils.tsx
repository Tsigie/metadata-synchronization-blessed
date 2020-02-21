import { D2Api } from "d2-api";
import _ from "lodash";
import { CategoryOptionModel, D2Model, OptionModel } from "../../models/d2Model";
import { MetadataMapping, MetadataMappingDictionary } from "../../models/instance";
import { MetadataType } from "../../utils/d2";
import { cleanOrgUnitPath } from "../../utils/synchronization";

interface CombinedMetadata {
    id: string;
    name: string;
    categoryCombo?: {
        categories: {
            categoryOptions: {
                id: string;
                name: string;
                shortName: string;
                code: string;
            }[];
        }[];
    };
    optionSet?: {
        options: {
            id: string;
            name: string;
            shortName: string;
            code: string;
        }[];
    };
}

const getCombinedMetadata = async (api: D2Api, model: typeof D2Model, id: string) => {
    const { objects } = ((await model
        .getApiModel(api)
        .get({
            fields: {
                id: true,
                name: true,
                categoryCombo: {
                    categories: {
                        categoryOptions: { id: true, name: true, shortName: true, code: true },
                    },
                },
                optionSet: { options: { id: true, name: true, shortName: true, code: true } },
            },
            filter: {
                id: {
                    eq: cleanOrgUnitPath(id),
                },
            },
            defaults: "EXCLUDE",
        })
        .getData()) as unknown) as { objects: CombinedMetadata[] };

    return objects;
};

export const autoMap = async (
    instanceApi: D2Api,
    model: typeof D2Model,
    selectedItem: Partial<MetadataType>,
    defaultValue?: string,
    filter?: string[]
): Promise<MetadataMapping[]> => {
    const { objects } = await model
        .getApiModel(instanceApi)
        .get({
            fields: { id: true, code: true, name: true },
            filter: {
                name: { token: selectedItem.name },
                shortName: { token: selectedItem.shortName },
                id: { eq: selectedItem.id },
                code: { eq: selectedItem.code },
            },
            rootJunction: "OR",
        })
        .getData();

    const candidateWithSameId = _.find(objects, ["id", selectedItem.id]);
    const candidateWithSameCode = _.find(objects, ["code", selectedItem.code]);
    const candidates = _.flatten([candidateWithSameId ?? candidateWithSameCode ?? objects]).filter(
        ({ id }) => filter?.includes(id) ?? true
    );

    if (candidates.length === 0 && defaultValue) {
        return [{ mappedId: defaultValue }];
    } else {
        return candidates.map(({ id, name }) => ({ mappedId: id, name }));
    }
};

const autoMapCollection = async (
    instanceApi: D2Api,
    collection: Partial<MetadataType>[],
    model: typeof D2Model,
    filter: string[]
) => {
    if (collection.length === 0) return { conflicts: false };

    const mapping: {
        [id: string]: MetadataMapping;
    } = {};

    for (const item of collection) {
        const candidate = (await autoMap(instanceApi, model, item, "DISABLED", filter))[0] ?? {};
        if (item.id)
            mapping[item.id] = {
                ...candidate,
                conflicts: candidate.mappedId === "DISABLED",
            };
    }

    return mapping;
};

const getCategoryOptions = (object: CombinedMetadata) => {
    return _.flatten(
        object.categoryCombo?.categories.map(({ categoryOptions }) => categoryOptions)
    );
};

const getOptions = (object: CombinedMetadata) => {
    return object.optionSet?.options ?? [];
};

export const buildMapping = async (
    api: D2Api,
    instanceApi: D2Api,
    model: typeof D2Model,
    originalId: string,
    mappedId = ""
): Promise<MetadataMapping | undefined> => {
    if (mappedId === "DISABLED") return { mappedId: "DISABLED", conflicts: false, mapping: {} };

    const originMetadata = await getCombinedMetadata(api, model, originalId);
    const destinationMetadata = await getCombinedMetadata(instanceApi, model, mappedId);
    if (originMetadata.length !== 1 || destinationMetadata.length !== 1) return undefined;

    const [mappedElement] = await autoMap(instanceApi, model, { id: mappedId }, mappedId);

    const categoryOptions = await autoMapCollection(
        instanceApi,
        getCategoryOptions(originMetadata[0]),
        CategoryOptionModel,
        getCategoryOptions(destinationMetadata[0]).map(({ id }) => id)
    );

    const options = await autoMapCollection(
        instanceApi,
        getOptions(originMetadata[0]),
        OptionModel,
        getOptions(destinationMetadata[0]).map(({ id }) => id)
    );

    const mapping = _.omitBy(
        {
            categoryOptions,
            options,
        },
        _.isUndefined
    ) as MetadataMappingDictionary;

    return {
        mappedId,
        name: mappedElement.name,
        conflicts: false,
        mapping,
    };
};

export const getValidIds = async (api: D2Api, model: typeof D2Model, id: string) => {
    const combinedMetadata = await getCombinedMetadata(api, model, id);

    const validCategoryOptions = getCategoryOptions(combinedMetadata[0]);
    const validOptions = getOptions(combinedMetadata[0]);

    return _.union(validCategoryOptions, validOptions).map(({ id }) => id);
};
