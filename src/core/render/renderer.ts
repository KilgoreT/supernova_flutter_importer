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

// Определение пути к шаблонам
const getTemplatesDir = (): string => {
    const path = getPath();
    const fs = getFs();
    
    console.log('🔍 Поиск директории шаблонов...');
    console.log('📂 Текущая рабочая директория:', process.cwd());
    
    // Простой и надежный поиск
    const possiblePaths = [
        // Локальная разработка
        path.join(process.cwd(), 'dist/templates/dart'),
        path.join(process.cwd(), 'src/templates/dart'),
        // Supernova контейнер
        '/var/task/dist/templates/dart',
        '/var/task/templates/dart',
        '/var/task/src/templates/dart',
    ];
    
    for (const templatePath of possiblePaths) {
        console.log(`  Проверяем: ${templatePath}`);
        if (fs.existsSync(templatePath)) {
            console.log(`  ✅ Найдена: ${templatePath}`);
            return templatePath;
        }
    }
    
    // Если не найдено, покажем что есть в текущей директории
    console.log('❌ Стандартные пути не найдены');
    console.log('📂 Содержимое текущей директории:');
    try {
        const items = fs.readdirSync(process.cwd());
        items.forEach(item => {
            const fullPath = path.join(process.cwd(), item);
            const stat = fs.statSync(fullPath);
            console.log(`  ${stat.isDirectory() ? '📁' : '📄'} ${item}`);
        });
    } catch (error) {
        console.log(`❌ Ошибка чтения директории: ${error.message}`);
    }
    
    throw new Error('Templates directory not found');
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
            console.log(`❌ Partial не найден: ${partialName}`);
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
        
        throw new Error(`Template not found: ${templatePath}`);
    }
    
    const template = Handlebars.compile(templateContent);
    return template(context);
}