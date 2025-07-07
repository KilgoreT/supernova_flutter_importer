import { CasingStyle, NamingTarget } from "../types/naming_types";


export interface NamingRuleSet {
    target: NamingTarget;
    casings: CasingStyle[];
    sanitize: boolean;
}

export const defaultNamingRules: Record<NamingTarget, NamingRuleSet> = {
    [NamingTarget.Class]: {
        target: NamingTarget.Class,
        casings: [CasingStyle.PascalCase],
        sanitize: true,
    },
    [NamingTarget.Field]: {
        target: NamingTarget.Field,
        casings: [
            CasingStyle.CamelCase,
            CasingStyle.CapitalizeFirstCase,
        ],
        sanitize: true,
    },
    [NamingTarget.File]: {
        target: NamingTarget.File,
        casings: [CasingStyle.SnakeCase],
        sanitize: true,
    },
};