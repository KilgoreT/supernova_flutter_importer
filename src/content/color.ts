import {
    TokenTree,
    filterTreeByTokenType,
    DefinedTokenType,
    NamingTarget,
    generateIdentifier,
    TokenRendererRegistry,
    // generateFileContent,

} from "src/content/index";

// import { DartRenderer } from "src/generators/dart/renderer";
import { renderColorToken } from "src/generators/dart/tokens/color_renderer"
import { exportConfiguration } from "..";
import { renderTemplate } from "src/core/render/renderer";
import { TreeNode } from "src/core/entity/tree";
import { extractColorValue } from "src/content/entities/color_value";
import { combineImports, COLOR_IMPORTS } from "src/utils/imports";

/**
 * Пример использования новой системы шаблонов:
 * 
 * Входные данные:
 * - TreeNode с токенами цветов
 * - keywords: Set<string> (зарезервированные слова Dart)
 * - customIdentifiers: string[] (кастомные идентификаторы)
 * 
 * Результат:
 * ```dart
 * class PrimaryColors {
 *     PrimaryColors._();
 * 
 *     static final primaryRed = const Color(0xFF0000FF);
 *     static final primaryBlue = const Color(0xFFFF0000);
 *     
 *     static final secondary = SecondaryColors._();
 * }
 * ```
 */



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
    }> = [],
    isRootClass: boolean = true,
    useColorSuffix: boolean = false,
    colorSuffix: string = ''
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
                isStatic: isRootClass, // Статичные только для корневого класса
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
            isStatic: isRootClass, // Статичные только для корневого класса
        });
    }

    // Сначала добавляем текущий класс
    allClasses.push({
        className,
        fields,
        childReferences,
    });

    // Затем рекурсивно обрабатываем дочерние классы (они НЕ корневые)
    for (const [, child] of node.children) {
        collectAllNestedClasses(child, keywords, customIdentifiers, className, allClasses, false, useColorSuffix, colorSuffix);
    }

    return allClasses;
}

export function generateFileContentWithNestedClasses(
    startNode: TreeNode,
    keywords: Set<string>,
    customIdentifiers: string[],
    classPrefix: string = '',
    useColorSuffix: boolean = false,
    colorSuffix: string = '',
    isUnifiedMode: boolean = false,
): string {
    // Рекурсивно собираем все классы
    // В unified mode первый класс НЕ корневой (корневым будет AppColors)
    const isRootClass = !isUnifiedMode; // В unified mode НЕ корневой, иначе корневой
    const allClasses = collectAllNestedClasses(startNode, keywords, customIdentifiers, classPrefix, [], isRootClass, useColorSuffix, colorSuffix);
    
    // Рендерим шаблон с полным списком классов
    return renderTemplate('dart_class', {
        classes: allClasses,
    });
}

// Новая функция для генерации отдельного класса без вложенных
export function generateSingleClassContent(
    startNode: TreeNode,
    keywords: Set<string>,
    customIdentifiers: string[],
    classPrefix: string = '',
    useColorSuffix: boolean = false,
    colorSuffix: string = '',
    isRootClass: boolean = true,
): string {
    const className = generateIdentifier(
        startNode.tokenGroup.name,
        NamingTarget.Class,
        keywords,
        customIdentifiers,
        classPrefix,
    );

    // Генерируем поля для текущего класса
    const fields: Array<{
        name: string;
        type: string;
        params: Array<{ key: string; value: string }>;
        isStatic: boolean;
        colorValue?: string;
    }> = [];

    for (const token of startNode.tokens ?? []) {
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
                isStatic: isRootClass,
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

    for (const [, child] of startNode.children) {
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
            isStatic: isRootClass,
        });
    }

    // Собираем все вложенные классы, но каждый только со своими прямыми детьми
    const allClasses: Array<{
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
    }> = [];

    // Добавляем основной класс
    allClasses.push({
        className,
        fields,
        childReferences,
    });

    // В отдельных файлах НЕ добавляем дочерние классы - только ссылки!
    // Дочерние классы должны быть в своих собственных файлах

    // Рендерим шаблон с полным списком классов
    return renderTemplate('dart_class', {
        classes: allClasses,
    });
}

export function generateUnifiedColors(
    tree: TokenTree,
    keywords: Set<string>,
    customIdentifiers: string[],
): Array<{
    name: string;
    path: string;
    content: string;
}> {
    const colorPath = exportConfiguration.colorPath;
    const rootClassNameRaw = exportConfiguration.unifiedColorClassName;
    const useColorSuffix = exportConfiguration.useColorSuffix;
    const colorSuffix = exportConfiguration.colorSuffix;

    // Валидируем и форматируем название класса
    const rootClassName = generateIdentifier(
        rootClassNameRaw,
        NamingTarget.Class,
        keywords,
        customIdentifiers,
    );

    // Генерируем имя файла из названия класса
    const rootFileName = generateIdentifier(
        rootClassNameRaw,
        NamingTarget.File,
        keywords,
        customIdentifiers,
    );

    const colorTree = filterTreeByTokenType(tree, DefinedTokenType.Color);
    const result: Array<{ name: string; path: string; content: string }> = [];

    // СНАЧАЛА создаем отдельные файлы для каждого цветового класса (каждый в своем файле)
    for (const root of colorTree.roots) {
        for (const [, startNode] of root.children) {
            const body = generateSingleClassContent(
                startNode,
                keywords,
                customIdentifiers,
                '', // classPrefix
                useColorSuffix,
                colorSuffix,
                true, // isRootClass = true - первый класс корневой (static поля)
            );
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

    // ЗАТЕМ создаем корневой файл AppColors с ссылками на отдельные классы
    const rootClassFields: Array<{
        fieldName: string;
        className: string;
    }> = [];

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
            );
            rootClassFields.push({
                fieldName,
                className,
            });
        }
    }

    // Генерируем корневой класс с валидированным именем
    // Поля корневого класса (уровень 0) - статические
    const rootClassContent = `class ${rootClassName} {
    ${rootClassName}._();

${rootClassFields.map(field => `    static final ${field.fieldName} = ${field.className}._();`).join('\n')}
}`;

    // Добавляем корневой файл ТОЛЬКО с классом AppColors (без других классов)
    result.push({
        name: rootFileName,
        path: colorPath,
        content: `${combineImports(COLOR_IMPORTS)}\n\n${rootClassContent}`,
    });

    return result;
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
        return generateUnifiedColors(tree, keywords, customIdentifiers);
    }

    // Оригинальная логика для создания отдельных файлов
    const colorPath = exportConfiguration.colorPath;
    const useColorSuffix = exportConfiguration.useColorSuffix;
    const colorSuffix = exportConfiguration.colorSuffix;

    const result: Array<{ name: string; path: string; content: string }> = [];

    const colorTree = filterTreeByTokenType(tree, DefinedTokenType.Color);

    const registry = new TokenRendererRegistry();
    registry.register(DefinedTokenType.Color, renderColorToken);
    // const renderer = new DartRenderer(
    //     registry,
    // );

    for (const root of colorTree.roots) {
        for (const [, startNode] of root.children) {
            const body = generateSingleClassContent(
                startNode,
                keywords,
                customIdentifiers,
                '', // classPrefix
                useColorSuffix,
                colorSuffix,
                true, // isRootClass - в обычном режиме первый класс корневой
            );
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