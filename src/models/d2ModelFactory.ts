import { D2Api, D2ModelSchemas } from "d2-api";
import {
    D2Model,
    DataElementGroupModel,
    DataElementGroupSetModel,
    DataElementModel,
    defaultModel,
    IndicatorGroupModel,
    IndicatorGroupSetModel,
    IndicatorModel,
    OrganisationUnitGroupModel,
    OrganisationUnitGroupSetModel,
    OrganisationUnitLevelModel,
    OrganisationUnitModel,
    ProgramIndicatorGroupModel,
    ProgramIndicatorModel,
    ProgramRuleModel,
    ProgramRuleVariableModel,
    ValidationRuleGroupModel,
    ValidationRuleModel,
} from "./d2Model";

const classes: { [modelName: string]: typeof D2Model } = {
    DataElementModel,
    DataElementGroupModel,
    DataElementGroupSetModel,
    IndicatorModel,
    IndicatorGroupModel,
    IndicatorGroupSetModel,
    OrganisationUnitModel,
    OrganisationUnitGroupModel,
    OrganisationUnitGroupSetModel,
    OrganisationUnitLevelModel,
    ValidationRuleModel,
    ValidationRuleGroupModel,
    ProgramIndicatorModel,
    ProgramIndicatorGroupModel,
    ProgramRuleModel,
    ProgramRuleVariableModel,
};

export const metadataModels = Object.values(classes);

/**
 * D2ModelProxy allows to create on-demand d2Model classes
 * If the class doesn't exist a new default class is created
 * d2ModelName: string (singular name property from d2.models)
 */
export function d2ModelFactory(api: D2Api, d2ModelName: keyof D2ModelSchemas): typeof D2Model {
    const { modelName = "default" } = api.models[d2ModelName];
    const className = modelName.charAt(0).toUpperCase() + modelName.slice(1) + "Model";
    console.debug(
        `d2ModelFactory for modelName ${d2ModelName} return ` +
            (!classes[className] ? `defaultModel` : className)
    );
    return classes[className] || defaultModel(modelName);
}
