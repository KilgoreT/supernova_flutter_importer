export type CoreTokenType = DefinedTokenType | UnknownTokenType;

export class UnknownTokenType {
    readonly type = DefinedTokenType.Unknown;
    constructor(public raw: string) { }

    toString() {
        return `${this.type}:${this.raw}`;
    }
}

export enum DefinedTokenType {
    Color = "Color",
    Typography = "Typography",
    Shadow = "Shadow",
    Border = "Border",
    Gradient = "Gradient",
    Blur = "Blur",
    BorderRadius = "BorderRadius",
    BorderWidth = "BorderWidth",
    Duration = "Duration",
    FontSize = "FontSize",
    Dimension = "Dimension",
    LetterSpacing = "LetterSpacing",
    LineHeight = "LineHeight",
    Opacity = "Opacity",
    ParagraphSpacing = "ParagraphSpacing",
    Size = "Size",
    Space = "Space",
    ZIndex = "ZIndex",
    TextDecoration = "TextDecoration",
    TextCase = "TextCase",
    Visibility = "Visibility",
    FontFamily = "FontFamily",
    FontWeight = "FontWeight",
    String = "String",
    ProductCopy = "ProductCopy",
    Unknown = "Unknown"
}

/**
 * Maps a raw SDK TokenType to a CoreTokenType.
 * If the rawType is not recognized, returns an `UnknownTokenType:<rawType>`.
 *
 * @param rawType - The token type from the SDK
 * @returns CoreTokenType if recognized, otherwise `UnknownTokenType:<rawType>`
 */
export function mapRawTypeToCoreTokenType(rawType: string): CoreTokenType {
    const match = Object.values(DefinedTokenType).find(
        (core) => core === rawType
    );

    if (match) {
        return match;
    }

    return new UnknownTokenType(rawType);
}
