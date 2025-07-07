import { IToken } from "src/core/types/core-types";

export interface IRenderer {
    openClass(className: string, level: number): string;
    closeClass(level: number): string;
    renderFieldReference(fieldName: string, className: string, isStatic: boolean, level: number): string;
    renderToken(token: IToken, isStatic: boolean, level: number): string;
}