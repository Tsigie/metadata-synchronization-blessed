import { modelFactory } from "../dhis/factory";
import { DataElementGroupModel } from "../dhis/metadata";

describe("d2ModelFactory", () => {
    describe("d2ModelFactory should return specific model", () => {
        it("DataElementGroup", async () => {
            const apiStub = { models: { dataElementGroups: { modelName: "dataElementGroups" } } };
            const d2Model = modelFactory(apiStub, "dataElementGroups");
            expect(d2Model).toEqual(DataElementGroupModel);
        });
    });
});

export {};
