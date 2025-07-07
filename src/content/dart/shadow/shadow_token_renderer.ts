import { IToken } from "src/core/types/core-types";
import { generateIdentifier } from "src/core/naming/identifier_gen";
import { NamingTarget } from "src/core/types/naming_types";
import { ShadowToken } from "@supernovaio/sdk-exporters";
import { print } from "src/utils/print";


export function renderShadowToken(token: IToken, isStatic: boolean = false, level: number): string {

    const indent = (lvl: number) => '  '.repeat(lvl);
    const tokenName = (token.raw as ShadowToken)?.name;
    const shadowValue = (token.raw as ShadowToken)?.value;

    if (!shadowValue) return '';
    let out = '';

    const fieldName = generateIdentifier(token.name, NamingTarget.Field);

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