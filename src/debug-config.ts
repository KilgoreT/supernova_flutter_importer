// Отладочный файл для проверки работы Pulsar.exportConfig
// Этот файл нужно запускать в контексте Supernova

import { ExporterConfiguration } from "../config";
import { TestFormat } from "./index";

// Симулируем Pulsar.exportConfig для отладки
function debugExportConfig(): ExporterConfiguration {
    // Это симуляция того, что может возвращать Pulsar.exportConfig
    const mockConfig: ExporterConfiguration = {
        generateDisclaimer: false,
        basePath: "./kw", // Значение по умолчанию
        colorPath: "/colors", // Значение по умолчанию
        typographyPath: "/typography",
        shadowPath: "/shadows",
        createUnifiedColorFile: false, // Значение по умолчанию
        unifiedColorClassName: "colors", // Значение по умолчанию
        useColorSuffix: false, // Значение по умолчанию
        colorSuffix: "Color", // Значение по умолчанию
        testFormat: TestFormat.tetest,
        customIdentifiers: []
    };
    
    return mockConfig;
}

// Функция для отладки конфигурации
export function debugConfiguration() {
    console.log('=== Отладка конфигурации Supernova ===');
    
    try {
        // Пытаемся получить реальную конфигурацию
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - Pulsar доступен только в контексте Supernova
        if (typeof Pulsar !== 'undefined' && Pulsar.exportConfig) {
            const realConfig = Pulsar.exportConfig();
            console.log('✅ Pulsar.exportConfig() доступен');
            console.log('Реальная конфигурация:', realConfig);
        } else {
            console.log('❌ Pulsar.exportConfig() недоступен');
            console.log('Используем симуляцию...');
            const mockConfig = debugExportConfig();
            console.log('Симулированная конфигурация:', mockConfig);
        }
    } catch (error) {
        console.log('❌ Ошибка при получении конфигурации:', error);
        console.log('Используем симуляцию...');
        const mockConfig = debugExportConfig();
        console.log('Симулированная конфигурация:', mockConfig);
    }
    
    console.log('\n=== Ожидаемые значения из config.local.json ===');
    const expectedValues = {
        basePath: "./zhopa",
        colorPath: "/colorLocal",
        createUnifiedColorFile: true,
        unifiedColorClassName: "Zhopa"
    };
    
    console.log('Ожидаемые значения:', expectedValues);
    
    console.log('\n=== Рекомендации ===');
    console.log('1. Запустите экспорт через Supernova CLI или расширение');
    console.log('2. Проверьте консоль на наличие отладочной информации');
    console.log('3. Если значения не применились, попробуйте:');
    console.log('   - Переименовать config.local.json в config.local');
    console.log('   - Создать файл в корне проекта');
    console.log('   - Использовать переменные окружения');
}

// Экспортируем функцию для использования в основном коде
