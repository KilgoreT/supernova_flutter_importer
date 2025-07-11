import {
    IToken,
    generateIdentifier,
    NamingTarget,

} from "src/content";

import { ShadowToken } from "@supernovaio/sdk-exporters";

export function renderShadowToken(
    token: IToken,
    keywords: Set<string>,
    customIdentifiers: string[],
    level: number,
    isStatic: boolean = false,
): string {

    const indent = (lvl: number) => '  '.repeat(lvl);
    const shadowValue = (token.raw as ShadowToken)?.value;

    if (!shadowValue) return '';
    let out = '';

    const fieldName = generateIdentifier(
        token.name,
        NamingTarget.Field,
        keywords,
        customIdentifiers,
    );

    const shadowArray: string[][] = [];

    for (const shadowItem of shadowValue) {

        const shadowParts: string[] = [];

        const colorR = shadowItem.color.color.r;
        const colorG = shadowItem.color.color.g;
        const colorB = shadowItem.color.color.b;
        const opacity = shadowItem.opacity?.measure ?? 0.0;
        shadowParts.push(`color: Color.fromRGBO(${colorR}, ${colorG}, ${colorB}, ${opacity})`);

        const offsetX = shadowItem.x
        const offsetY = shadowItem.y;
        shadowParts.push(`offset: Offset(${offsetX}, ${offsetY})`);

        const blurRadius = shadowItem.radius
        shadowParts.push(`blurRadius: ${blurRadius}`);

        const spreadRadius = shadowItem.spread;
        shadowParts.push(`spreadRadius: ${spreadRadius}`);

        shadowArray.push(shadowParts);
    }

    if (isStatic) {
        out += `${indent(level + 1)}static const ${fieldName} = [\n`
    } else {
        out += `${indent(level + 1)}final ${fieldName} = [\n`
    }
    for (const shadowParams of shadowArray) {
        const shadowBody = shadowParams.join(',\n' + indent(level + 3));
        out += `${indent(level + 2)}BoxShadow(\n${indent(level + 3)}${shadowBody.toString()}\n${indent(level + 2)}),\n`;
    }

    out += `${indent(level + 1)}];\n`

    return out;
}