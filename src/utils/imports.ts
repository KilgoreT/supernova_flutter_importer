/**
 * Константы импортов для разных типов токенов
 * Здесь можно легко добавлять/удалять импорты для каждого типа
 */

// Базовые импорты, которые нужны всем типам токенов
const BASE_IMPORTS = [
    "import 'package:flutter/material.dart';"
];

// Импорты для цветов
export const COLOR_IMPORTS = [
    ...BASE_IMPORTS
    // Для цветов не нужен sizes.dart, так как используются только Color
];

// Импорты для типографики
export const TYPOGRAPHY_IMPORTS = [
    ...BASE_IMPORTS,
    "import 'package:ui_kit_litnet_audio/utils/sizes.dart';" // Нужен для h24, h16 и т.д.
];

// Импорты для теней
export const SHADOW_IMPORTS = [
    ...BASE_IMPORTS,
    "import 'package:ui_kit_litnet_audio/utils/sizes.dart';" // Может понадобиться для размеров
];

// Импорты для отступов (spacing) - для будущего использования
export const SPACING_IMPORTS = [
    ...BASE_IMPORTS,
    "import 'package:ui_kit_litnet_audio/utils/sizes.dart';" // Нужен для размеров отступов
];

// Импорты для радиусов (border radius) - для будущего использования
export const RADIUS_IMPORTS = [
    ...BASE_IMPORTS,
    "import 'package:ui_kit_litnet_audio/utils/sizes.dart';" // Нужен для размеров радиусов
];

/**
 * Функция для объединения импортов в строку
 */
export function combineImports(imports: string[]): string {
    return imports.join('\n');
}

/**
 * Получить импорты для конкретного типа токена
 */
export function getImportsForTokenType(tokenType: string): string {
    switch (tokenType.toLowerCase()) {
        case 'color':
            return combineImports(COLOR_IMPORTS);
        case 'typography':
            return combineImports(TYPOGRAPHY_IMPORTS);
        case 'shadow':
            return combineImports(SHADOW_IMPORTS);
        case 'spacing':
            return combineImports(SPACING_IMPORTS);
        case 'radius':
            return combineImports(RADIUS_IMPORTS);
        default:
            return combineImports(BASE_IMPORTS);
    }
}
