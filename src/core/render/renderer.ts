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
    
    // Попробуем несколько возможных путей
    const possiblePaths = [
        path.join(process.cwd(), 'src/templates/dart'),
        path.join(__dirname || '', '../../templates/dart'),
        path.join(process.cwd(), 'dist/templates/dart'),
        path.join(process.cwd(), 'templates/dart')
    ];
    
    for (const templatePath of possiblePaths) {
        if (getFs().existsSync(templatePath)) {
            return templatePath;
        }
    }
    
    // Если ничего не найдено, вернем путь по умолчанию
    return path.join(process.cwd(), 'src/templates/dart');
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderTemplate(templateName: string, context: any): string {
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
            console.log(`❌ Partial не найден: ${partialName}`);
        }
    });

    const templatePath = path.join(templatesDir, `${templateName}.hbs`);
    console.log(`🔍 Поиск основного шаблона: ${templatePath}`);
    
    if (!fs.existsSync(templatePath)) {
        console.log(`❌ Шаблон не найден: ${templatePath}`);
        console.log(`📂 Содержимое директории ${templatesDir}:`);
        try {
            const files = fs.readdirSync(templatesDir);
            files.forEach(file => console.log(`  - ${file}`));
        } catch (error) {
            console.log(`❌ Ошибка чтения директории: ${error}`);
        }
        throw new Error(`Template not found: ${templatePath}`);
    }
    
    console.log(`✅ Шаблон найден: ${templateName}`);
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(templateContent);
    return template(context);
}