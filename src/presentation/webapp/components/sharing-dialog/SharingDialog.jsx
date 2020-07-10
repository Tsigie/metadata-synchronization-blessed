import DialogContent from "@material-ui/core/DialogContent";
import { ConfirmationDialog } from "d2-ui-components";
import React from "react";
import i18n from "../../../../locales";
import Sharing from "./Sharing";

const SharingDialog = ({
    isOpen,
    isDataShareable,
    sharedObject,
    onCancel,
    onSharingChanged,
    onSearchRequest,
}) => {
    return (
        <React.Fragment>
            <ConfirmationDialog
                isOpen={isOpen}
                title={i18n.t("Sharing settings")}
                onCancel={onCancel}
                cancelText={i18n.t("Close")}
                maxWidth={"lg"}
                fullWidth={true}
                disableEnforceFocus
            >
                <DialogContent>
                    {sharedObject && (
                        <Sharing
                            sharedObject={sharedObject}
                            dataShareable={isDataShareable}
                            onChange={onSharingChanged}
                            onSearch={onSearchRequest}
                        />
                    )}
                </DialogContent>
            </ConfirmationDialog>
        </React.Fragment>
    );
};

export default SharingDialog;
