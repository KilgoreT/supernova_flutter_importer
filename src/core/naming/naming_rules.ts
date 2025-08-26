import { CasingStyle, NamingTarget } from "src/core/entity/naming";


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
            CasingStyle.PascalCase,
        ],
        sanitize: true,
    },
    [NamingTarget.File]: {
        target: NamingTarget.File,
        casings: [CasingStyle.SnakeCase],
        sanitize: true,
    },
};