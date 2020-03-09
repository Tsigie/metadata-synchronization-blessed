import { dataTest } from "../utils";
import SyncRuleDetailPageObject from "./common/SyncRuleDetailPageObject";
import * as orgUnitStep from "../page-utils/orgUnitStep";
import * as periodStep from "../page-utils/periodStep";
import * as eventStep from "../page-utils/eventStep";
import * as programStep from "../page-utils/programStep";

class EventSyncRuleDetailPageObject extends SyncRuleDetailPageObject {
    constructor(cy) {
        super(cy);
    }

    open(uid, stubApiResponseName) {
        if (uid) {
            super.open(`/#/sync-rules/events/edit/${uid}`);

            if (stubApiResponseName) {
                this.cy.wait(`@${stubApiResponseName}`);
            }
        } else {
            super.open("/#/sync-rules/events/new");
        }

        return this;
    }

    assertSelectedEvent(event) {
        eventStep.assertSelectedEvent(event);
        return this;
    }

    assertSelectedOrgUnit(assert) {
        orgUnitStep.assertSelectedOrgUnit(assert);
        return this;
    }

    assertSelectedProgramsCountMessage(assert) {
        programStep.assertSelectedProgramsCountMessage(assert);
        return this;
    }

    selectOrgUnit(orgUnit) {
        orgUnitStep.selectOrgUnit(".ou-root", orgUnit);
        return this;
    }

    expandOrgUnit(orgUnit) {
        orgUnitStep.expandOrgUnit(".ou-root", orgUnit);
        return this;
    }

    selectEvent(event) {
        eventStep.selectEvent(dataTest(`Paper`), event);
        return this;
    }

    selectAllPeriods() {
        periodStep.selectAllPeriods();
        return this;
    }

    checkOnlySelectedItems() {
        programStep.checkOnlySelectedItems();
        return this;
    }
}

export default EventSyncRuleDetailPageObject;
