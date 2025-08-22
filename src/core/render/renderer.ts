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


export function renderTemplate(templateName: string, context: Record<string, unknown>): string {
    // Встроенные шаблоны прямо в код
    const templates = {
        'dart_class': `{{#each classes}}
class {{className}} {
    {{className}}._();

{{#fields}}
{{> dart_color_field}}
{{/fields}}

{{#childReferences}}
    static final {{fieldName}} = {{className}}._();
{{/childReferences}}
}
{{#unless @last}}

{{/unless}}
{{/each}}`,
        'dart_color_field': `    {{#isStatic}}static {{/isStatic}}final {{name}} = const Color(0x{{colorValue}});
`
    };

    // Регистрируем частичные шаблоны
    const partials = ['dart_color_field'];
    partials.forEach(partialName => {
        if (templates[partialName]) {
            Handlebars.registerPartial(partialName, templates[partialName]);
        }
    });

    const templateContent = templates[templateName] || `// Template ${templateName} not found`;
    const template = Handlebars.compile(templateContent);
    return template(context);
}