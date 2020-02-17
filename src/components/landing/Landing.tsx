import { makeStyles } from "@material-ui/core";
import React from "react";
import MenuCard, { MenuCardProps } from "./MenuCard";

const useStyles = makeStyles({
    container: {
        marginLeft: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 300,
        color: "rgba(0, 0, 0, 0.87)",
        padding: "15px 0px 15px",
        margin: 0,
    },
    clear: {
        clear: "both",
    },
});

export interface Card {
    title: string;
    key: string;
    isVisible?: boolean;
    children: MenuCardProps[];
}

export interface LandingProps {
    cards: Card[];
}

export const Landing: React.FC<LandingProps> = ({ cards }) => {
    const classes = useStyles();

    return (
        <div className={classes.container} key="landing">
            {cards.map(
                ({ key, title, isVisible = true, children }) =>
                    isVisible && (
                        <div key={key}>
                            <h1 className={classes.title}>{title}</h1>

                            {children.map(props => (
                                <MenuCard key={props.name} {...props} />
                            ))}

                            <div className={classes.clear} />
                        </div>
                    )
            )}
        </div>
    );
};
