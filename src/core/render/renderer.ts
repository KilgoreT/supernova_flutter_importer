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


const getFs = () => eval('require')('fs');
const getPath = () => eval('require')('path');

// Более надежный способ определения пути к шаблонам
const getTemplatesDir = (): string => {
    const path = getPath();
    const fs = getFs();
    
    // Попробуем несколько возможных путей
    const possiblePaths = [
        // Пути для Supernova контейнера
        '/var/task/dist/templates/dart',
        '/var/task/templates/dart',
        '/var/task/src/templates/dart',
        // Пути для локальной разработки
        path.join(process.cwd(), 'dist/templates/dart'),
        path.join(process.cwd(), 'src/templates/dart'),
        path.join(process.cwd(), 'templates/dart'),
        path.join(__dirname || '', '../../templates/dart'),
        path.join(__dirname || '', '../templates/dart'),
    ];
    
    console.log('🔍 Поиск директории шаблонов...');
    for (const templatePath of possiblePaths) {
        console.log(`  Проверяем: ${templatePath}`);
        if (fs.existsSync(templatePath)) {
            console.log(`  ✅ Найдена: ${templatePath}`);
            return templatePath;
        }
    }
    
    console.log('❌ Директория шаблонов не найдена!');
    console.log('📂 Текущая рабочая директория:', process.cwd());
    console.log('📂 __dirname:', __dirname);
    
    // Если ничего не найдено, вернем путь по умолчанию
    return '/var/task/dist/templates/dart';
};

// Встроенные шаблоны как fallback
const EMBEDDED_TEMPLATES = {
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
    'dart_color_field': `    static final {{name}} = const Color({{colorValue}});`
};

export function renderTemplate(templateName: string, context: Record<string, unknown>): string {
    const path = getPath();
    const fs = getFs();

    const templatesDir = getTemplatesDir();
    
    // Добавим отладочную информацию
    console.log(`🔍 Поиск шаблона: ${templateName}.hbs`);
    console.log(`📁 Директория шаблонов: ${templatesDir}`);
    
    // Регистрируем частичные шаблоны
    const partials = ['dart_color_field'];
    partials.forEach(partialName => {
        const partialPath = path.join(templatesDir, `${partialName}.hbs`);
        console.log(`🔍 Проверка partial: ${partialPath}`);
        if (fs.existsSync(partialPath)) {
            console.log(`✅ Partial найден: ${partialName}`);
            const partialContent = fs.readFileSync(partialPath, 'utf-8');
            Handlebars.registerPartial(partialName, partialContent);
        } else {
            console.log(`❌ Partial не найден: ${partialName}, используем встроенный`);
            // Используем встроенный partial
            if (EMBEDDED_TEMPLATES[partialName]) {
                Handlebars.registerPartial(partialName, EMBEDDED_TEMPLATES[partialName]);
            }
        }
    });

    const templatePath = path.join(templatesDir, `${templateName}.hbs`);
    console.log(`🔍 Поиск основного шаблона: ${templatePath}`);
    
    let templateContent: string;
    
    if (fs.existsSync(templatePath)) {
        console.log(`✅ Шаблон найден: ${templateName}`);
        templateContent = fs.readFileSync(templatePath, 'utf-8');
    } else {
        console.log(`❌ Шаблон не найден: ${templatePath}, используем встроенный`);
        console.log(`📂 Содержимое директории ${templatesDir}:`);
        try {
            const files = fs.readdirSync(templatesDir);
            files.forEach(file => console.log(`  - ${file}`));
        } catch (error) {
            console.log(`❌ Ошибка чтения директории: ${error}`);
        }
        
        // Используем встроенный шаблон
        if (EMBEDDED_TEMPLATES[templateName]) {
            templateContent = EMBEDDED_TEMPLATES[templateName];
            console.log(`✅ Используем встроенный шаблон: ${templateName}`);
        } else {
            throw new Error(`Template not found: ${templatePath} and no embedded template available`);
        }
    }
    
    const template = Handlebars.compile(templateContent);
    return template(context);
}