import { TypographyToken } from "@supernovaio/sdk-exporters";
import { IToken } from "src/content/index";


class TypographyStyle {
    constructor(
        public fontFamily?: string,
        public fontWeight?: string,
        public fontSize?: string,
        public letterSpacing?: string,
        public lineHeight?: string,
        public textDecoration?: string,
        public textCase?: string
    ) { }
}

export function extractTypographyStyle(token: IToken): TypographyStyle | null {
    const value = (token.raw as TypographyToken)?.value;

    if (!value) return null;

    const fontFamily = value?.fontFamily?.text;
    const fontWeight = value?.fontWeight?.text ? `w${value.fontWeight.text}` : undefined;
    const fontSize = value?.fontSize?.measure;
    const textDecoration = value?.textDecoration?.value;
    const textCase = value?.textCase?.value;
    const letterSpacing = value?.letterSpacing?.measure;
    const lineHeight = value?.lineHeight?.measure;

    const heightRatio = fontSize && lineHeight !== undefined ? lineHeight / fontSize : undefined;

    return new TypographyStyle(
        fontFamily,
        fontWeight,
        fontSize !== undefined ? `${fontSize}` : undefined,
        letterSpacing !== undefined ? `${letterSpacing}` : undefined,
        heightRatio !== undefined ? `${heightRatio}` : undefined,
        textDecoration,
        textCase
    );
}