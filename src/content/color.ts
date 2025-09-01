import {
    TokenTree,
    filterTreeByTokenType,
    DefinedTokenType,
    NamingTarget,
    generateIdentifier,
    // generateFileContent,

} from "src/content/index";
import { exportConfiguration } from "..";
import * as Handlebars from 'handlebars';
import { TreeNode } from "src/core/entity/tree";
import { extractColorValue } from "src/content/entities/color_value";
import { combineImports, COLOR_IMPORTS } from "src/utils/imports";

/**
 * Определяет статус полей согласно правилам:
 * 1. Режим с AppColors: AppColors класс имеет статические поля, все остальные - нестатические
 * 2. Режим без AppColors: корневые классы статические, вложенные - нестатические
 * 3. Правило наследования: если родитель нестатический, то и дети нестатические
 */
function determineFieldsStaticStatus(isUnifiedMode: boolean, isRootClass: boolean): boolean {
    if (isUnifiedMode) {
        // В режиме AppColors только сам AppColors класс имеет статические поля
        // Все классы, на которые он ссылается, имеют нестатические поля
        return false;
    } else {
        // В режиме без AppColors корневые классы статические, вложенные - нестатические
        return isRootClass;
    }
}

// Рекурсивная функция для сбора всех вложенных классов в правильном порядке
function collectAllNestedClasses(
    node: TreeNode,
    keywords: Set<string>,
    customIdentifiers: string[],
    parentClassName: string = '',
    allClasses: Array<{
        className: string;
        fields: Array<{
            name: string;
            type: string;
            params: Array<{ key: string; value: string }>;
            isStatic: boolean;
            colorValue?: string;
        }>;
        childReferences: Array<{
            fieldName: string;
            className: string;
            isStatic: boolean;
        }>;
        isRootClass: boolean;
    }> = [],
    isRootClass: boolean = true,
    useColorSuffix: boolean = false,
    colorSuffix: string = '',
    isUnifiedMode: boolean = false,
): Array<{
    className: string;
    fields: Array<{
        name: string;
        type: string;
        params: Array<{ key: string; value: string }>;
        isStatic: boolean;
        colorValue?: string;
    }>;
    childReferences: Array<{
        fieldName: string;
        className: string;
    }>;
    isRootClass: boolean;
}> {
    const className = generateIdentifier(
        node.tokenGroup.name,
        NamingTarget.Class,
        keywords,
        customIdentifiers,
        parentClassName,
    );

    // Генерируем поля для текущего класса
    const fields: Array<{
        name: string;
        type: string;
        params: Array<{ key: string; value: string }>;
        isStatic: boolean;
        colorValue?: string;
    }> = [];

    for (const token of node.tokens ?? []) {
        const fieldName = generateIdentifier(
            token.name,
            NamingTarget.Field,
            keywords,
            customIdentifiers,
            null, // prefix
            useColorSuffix ? colorSuffix : null, // suffix
        );

        const colorValue = extractColorValue(token);
        
        if (colorValue) {
            fields.push({
                name: fieldName,
                type: 'Color',
                params: [],
                isStatic: determineFieldsStaticStatus(isUnifiedMode, isRootClass),
                colorValue,
            });
        }
    }

    // Генерируем ссылки на дочерние классы
    const childReferences: Array<{
        fieldName: string;
        className: string;
        isStatic: boolean;
    }> = [];

    for (const [, child] of node.children) {
        const fieldName = generateIdentifier(
            child.tokenGroup.name,
            NamingTarget.Field,
            keywords,
            customIdentifiers,
        );
        const childClassName = generateIdentifier(
            fieldName,
            NamingTarget.Class,
            keywords,
            customIdentifiers,
            className,
        );
        childReferences.push({
            fieldName,
            className: childClassName,
            isStatic: determineFieldsStaticStatus(isUnifiedMode, isRootClass),
        });
    }

    // Сначала добавляем текущий класс
    allClasses.push({
        className,
        fields,
        childReferences,
        isRootClass,
    });

    // Затем рекурсивно обрабатываем дочерние классы (они НЕ корневые)
    for (const [, child] of node.children) {
        collectAllNestedClasses(child, keywords, customIdentifiers, className, allClasses, false, useColorSuffix, colorSuffix, isUnifiedMode);
    }

    return allClasses;
}









export function generateColors(
    tree: TokenTree,
    keywords: Set<string>,
    customIdentifiers: string[],
): Array<{
        name: string;
        path: string;
        content: string;
}> {
    // Проверяем, нужно ли создать единый файл
    if (exportConfiguration.createUnifiedColorFile) {
        return generateUnifiedHierarchy(tree, keywords, customIdentifiers);
    } else {
        return generateBaseHierarchy(tree, keywords, customIdentifiers);
    }
}

export function generateUnifiedHierarchy(
    tree: TokenTree,
    keywords: Set<string>,
    customIdentifiers: string[],
): Array<{
    name: string;
    path: string;
    content: string;
}> {
    const colorPath = exportConfiguration.colorPath;
    const masterClassNameRaw = exportConfiguration.unifiedColorClassName;
    const useColorSuffix = exportConfiguration.useColorSuffix;
    const colorSuffix = exportConfiguration.colorSuffix;

    // Валидируем и форматируем название Master Class
    const masterClassName = generateIdentifier(
        masterClassNameRaw,
        NamingTarget.Class,
        keywords,
        customIdentifiers,
    );

    // Генерируем имя файла из названия Master Class
    const masterFileName = generateIdentifier(
        masterClassNameRaw,
        NamingTarget.File,
        keywords,
        customIdentifiers,
    );

    const result: Array<{ name: string; path: string; content: string }> = [];

    // 1. Генерируем Root Groups
    const rootGroupFiles = generateUnifiedRootGroups(
        tree,
        keywords,
        customIdentifiers,
        colorPath,
        useColorSuffix,
        colorSuffix,
        masterClassName,
    );
    result.push(...rootGroupFiles);

    // 2. Генерируем Master Class
    const masterClassFile = generateMasterClass(
        tree,
        keywords,
        customIdentifiers,
        colorPath,
        masterClassName,
        masterFileName,
    );
    result.push(masterClassFile);

    return result;
}

export function generateBaseHierarchy(
    tree: TokenTree,
    keywords: Set<string>,
    customIdentifiers: string[],
): Array<{
    name: string;
    path: string;
    content: string;
}> {
    // Логика для создания отдельных файлов где корни - корневые группы
    const colorPath = exportConfiguration.colorPath;
    const useColorSuffix = exportConfiguration.useColorSuffix;
    const colorSuffix = exportConfiguration.colorSuffix;

    const result: Array<{ name: string; path: string; content: string }> = [];

    const colorTree = filterTreeByTokenType(tree, DefinedTokenType.Color);

    for (const root of colorTree.roots) {
        for (const [, startNode] of root.children) {
            // Корневые группы без префикса
            const allClasses = collectAllNestedClasses(
                startNode,
                keywords,
                customIdentifiers,
                '', // без префикса
                [], // allClasses
                true, // isRootClass = true (статические поля)
                useColorSuffix,
                colorSuffix,
                false, // isUnifiedMode = false
            );
            
            // Регистрируем частичный шаблон для полей цвета
            Handlebars.registerPartial('dart_color_field', `    {{#isStatic}}static {{/isStatic}}final {{name}} = const Color(0x{{colorValue}});`);
            
            const template = Handlebars.compile(templateBaseClass());
            const body = template({
                classes: allClasses,
            });
            
            // Файл и класс называются по названию группы
            const fileName = generateIdentifier(
                startNode.tokenGroup.name,
                NamingTarget.File,
                keywords,
                customIdentifiers,
            );
            
            result.push({
                name: fileName,
                path: colorPath,
                content: `${combineImports(COLOR_IMPORTS)}\n\n${body.trim()}`,
            });
        }
    }
    
    return result;
}

function generateUnifiedRootGroups(
    tree: TokenTree,
    keywords: Set<string>,
    customIdentifiers: string[],
    colorPath: string,
    useColorSuffix: boolean,
    colorSuffix: string,
    masterClassName: string,
): Array<{ name: string; path: string; content: string }> {
    const colorTree = filterTreeByTokenType(tree, DefinedTokenType.Color);
    const result: Array<{ name: string; path: string; content: string }> = [];

    // Создаем отдельные файлы для каждой Root Group
    for (const root of colorTree.roots) {
        for (const [, startNode] of root.children) {
            // Рекурсивно собираем все классы
            // В unified mode корневые токен-группы имеют публичные конструкторы
            const isRootClass = true; // Корневые токен-группы должны иметь публичные конструкторы
            const allClasses = collectAllNestedClasses(startNode, keywords, customIdentifiers, masterClassName, [], isRootClass, useColorSuffix, colorSuffix, true);
            
            // Рендерим шаблон с полным списком классов
            // Регистрируем частичный шаблон для полей цвета
            Handlebars.registerPartial('dart_color_field', `    {{#isStatic}}static {{/isStatic}}final {{name}} = const Color(0x{{colorValue}});`);
            
            const template = Handlebars.compile(templateBaseClass());
            const body = template({
                classes: allClasses,
            });
            const fileName = generateIdentifier(
                startNode.tokenGroup.name,
                NamingTarget.File,
                keywords,
                customIdentifiers,
            );
            result.push({
                name: fileName,
                path: colorPath,
                content: `${combineImports(COLOR_IMPORTS)}\n\n${body.trim()}`,
            });
        }
    }

    return result;
}

function templateBaseClass(): string {
    return `{{#each classes}}
class {{className}} {
    {{#isRootClass}}{{className}}();{{else}}{{className}}._();{{/isRootClass}}

{{#fields}}
    {{#isStatic}}static {{/isStatic}}final {{name}} = const Color(0x{{colorValue}});
{{/fields}}

{{#childReferences}}
    {{#isStatic}}static {{/isStatic}}final {{fieldName}} = {{className}}._();
{{/childReferences}}
}
{{#unless @last}}

{{/unless}}
{{/each}}`;
}

function templateMasterClass(
    masterClassName: string,
    rootClassFields: Array<{
        fieldName: string;
        className: string;
    }>,
): string {
    return `class ${masterClassName} {
    ${masterClassName}._();

${rootClassFields.map(field => `    static final ${field.fieldName} = ${field.className}();`).join('\n')}
}`;
}

function generateMasterClass(
    tree: TokenTree,
    keywords: Set<string>,
    customIdentifiers: string[],
    colorPath: string,
    masterClassName: string,
    masterFileName: string,
): { name: string; path: string; content: string } {
    const colorTree = filterTreeByTokenType(tree, DefinedTokenType.Color);
    
    // Создаем ссылки на Root Groups для Master Class
    const rootClassFields: Array<{
        fieldName: string;
        className: string;
    }> = [];
    
    // Генерируем импорты для корневых групп
    const rootGroupImports: string[] = [];

    for (const root of colorTree.roots) {
        for (const [, startNode] of root.children) {
            const fieldName = generateIdentifier(
                startNode.tokenGroup.name,
                NamingTarget.Field,
                keywords,
                customIdentifiers,
            );
            const className = generateIdentifier(
                startNode.tokenGroup.name,
                NamingTarget.Class,
                keywords,
                customIdentifiers,
                masterClassName, // префикс Master Class (например, AppColors)
            );
            const fileName = generateIdentifier(
                startNode.tokenGroup.name,
                NamingTarget.File,
                keywords,
                customIdentifiers,
            );
            
            rootClassFields.push({
                fieldName,
                className,
            });
            
            // Добавляем импорт для корневой группы
            const basePath = exportConfiguration.basePath.replace('./', '');
            rootGroupImports.push(
                `import 'package:ui_kit_litnet_audio/${basePath}${colorPath}/${fileName}.dart';`
            );
        }
    }

    // Генерируем Master Class с валидированным именем
    // Поля Master Class - статические
    const masterClassContent = templateMasterClass(masterClassName, rootClassFields);
    
    // Объединяем базовые импорты с импортами корневых групп
    const allImports = [...COLOR_IMPORTS, ...rootGroupImports];

    return {
        name: masterFileName,
        path: colorPath,
        content: `${combineImports(allImports)}\n\n${masterClassContent}`,
    };
}