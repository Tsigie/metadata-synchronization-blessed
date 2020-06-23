import i18n from "@dhis2/d2-i18n";
import _ from "lodash";
import React, { useCallback, useMemo } from "react";
import { useHistory, useParams } from "react-router-dom";
import { ModulesListTable } from "../../../common/components/module-list-table/ModuleListTable";
import { PackagesListTable } from "../../../common/components/package-list-table/PackageListTable";
import Dropdown from "../../components/dropdown/Dropdown";
import PageHeader from "../../components/page-header/PageHeader";

export const ModuleListPage: React.FC = () => {
    const history = useHistory();
    const { list: tableOption = "modules" } = useParams<{ list: "modules" | "packages" }>();
    const title = buildTitle(tableOption);

    const backHome = () => {
        history.push("/");
    };

    const createModule = () => {
        history.push(`/modules/new`);
    };

    const setTableOption = useCallback(
        (option: string) => {
            history.push(`/${option}`);
        },
        [history]
    );

    const filters = useMemo(
        () => (
            <React.Fragment>
                <Dropdown
                    items={[{ id: "local", name: i18n.t("Local instance") }]}
                    value={"local"}
                    onValueChange={_.noop}
                    label={i18n.t("Instance")}
                    hideEmpty={true}
                />
                <Dropdown
                    items={[
                        { id: "modules", name: i18n.t("Modules") },
                        { id: "packages", name: i18n.t("Packages") },
                    ]}
                    value={tableOption}
                    onValueChange={setTableOption}
                    label={i18n.t("View")}
                    hideEmpty={true}
                />
            </React.Fragment>
        ),
        [tableOption, setTableOption]
    );

    return (
        <React.Fragment>
            <PageHeader title={title} onBackClick={backHome} />

            {tableOption === "modules" && (
                <ModulesListTable externalComponents={filters} onActionButtonClick={createModule} />
            )}

            {tableOption === "packages" && <PackagesListTable externalComponents={filters} />}
        </React.Fragment>
    );
};

function buildTitle(tableOption: string) {
    switch (tableOption) {
        case "modules":
            return i18n.t("Modules");
        case "packages":
            return i18n.t("Packages");
        default:
            return "";
    }
}

export default ModuleListPage;
