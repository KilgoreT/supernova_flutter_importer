import { IToken } from "src/core/entity/core";

import * as Handlebars from 'handlebars';

export interface IRenderer {
    openClass(className: string, level: number): string;
    closeClass(level: number): string;
    renderFieldReference(fieldName: string, className: string, isStatic: boolean, level: number): string;
    renderToken(
        token: IToken,
        keywords: Set<string>,
        customIdentifiers: string[],
        isStatic: boolean,
        level: number,
    ): string;
}


const getDirname = (): string => {
    const req = eval('require');
    const { fileURLToPath } = req('url');
    const path = req('path');
    return path.dirname(fileURLToPath(import.meta.url));
};

const getFs = () => eval('require')('fs');
const getPath = () => eval('require')('path');

const __dirname = getDirname();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderTemplate(templateName: string, context: any): string {
    const path = getPath();
    const fs = getFs();

    const templatePath = path.join(__dirname, '../../templates/dart', `${templateName}.hbs`);
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(templateContent);
    return template(context);
}