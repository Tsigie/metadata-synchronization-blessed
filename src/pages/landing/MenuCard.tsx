import i18n from "@dhis2/d2-i18n";
import { makeStyles, Tooltip } from "@material-ui/core";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/Add";
import ViewListIcon from "@material-ui/icons/ViewList";
import _ from "lodash";
import React from "react";

export interface MenuCardProps {
    name: string;
    description?: string;
    addAction?: () => void;
    listAction?: () => void;
    dataTest?: string;
}

const useStyles = makeStyles({
    card: {
        padding: "0",
        margin: ".5rem",
        float: "left",
        width: "230px",
    },
    content: {
        height: "85px",
        padding: ".5rem 1rem",
        fontSize: "14px",
    },
    actions: {
        marginLeft: "auto",
    },
    header: {
        padding: "1rem",
        height: "auto",
        borderBottom: "1px solid #ddd",
        cursor: "pointer",
    },
    headerText: {
        fontSize: "15px",
        fontWeight: 500,
    },
});

const MenuCard: React.FC<MenuCardProps> = ({
    name,
    description,
    addAction,
    listAction,
    dataTest,
}) => {
    const classes = useStyles();

    return (
        <Card data-test={dataTest} className={classes.card}>
            <CardHeader
                onClick={listAction ?? _.noop}
                classes={{ root: classes.header, title: classes.headerText }}
                title={name}
            />

            <CardContent className={classes.content}>{description}</CardContent>

            <CardActions disableSpacing>
                <div className={classes.actions}>
                    {addAction && (
                        <Tooltip title={i18n.t("Add")} placement="top">
                            <IconButton key="add" onClick={addAction}>
                                <AddIcon />
                            </IconButton>
                        </Tooltip>
                    )}

                    {listAction && (
                        <Tooltip title={i18n.t("List")} placement="top">
                            <IconButton key="list" onClick={listAction}>
                                <ViewListIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </div>
            </CardActions>
        </Card>
    );
};

export default MenuCard;
