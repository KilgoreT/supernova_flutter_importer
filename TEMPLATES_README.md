# Система шаблонов для генерации Dart кода

## Обзор

Система использует Handlebars шаблоны для генерации Dart кода из токенов дизайн-системы. Основной шаблон `dart_class.hbs` является универсальным и может генерировать классы для любых типов токенов (цвета, типографика, тени и т.д.).

### Активные шаблоны

1. **`dart_class.hbs`** - универсальный шаблон для генерации файлов с рекурсивно вложенными классами (используется для всех типов токенов)

### Частичные шаблоны (Partials)

1. **`dart_color_field.hbs`** - шаблон для полей цветов (активно используется)
2. **Будущие partials** - для других типов токенов (typography, shadow, spacing и т.д.)

### Система импортов

Импорты для каждого типа токенов управляются через константы в `src/utils/imports.ts`:

- **COLOR_IMPORTS** - только `flutter/material.dart` (без `sizes.dart`)
- **TYPOGRAPHY_IMPORTS** - `flutter/material.dart` + `sizes.dart` (для h24, h16 и т.д.)
- **SHADOW_IMPORTS** - `flutter/material.dart` + `sizes.dart` (для размеров)
- **SPACING_IMPORTS** - для будущих токенов отступов
- **RADIUS_IMPORTS** - для будущих токенов радиусов

## Структура данных

### Для полей (fields)
```typescript
{
    name: string;           // Имя поля
    type: string;           // Тип поля (Color, TextStyle, BoxShadow, etc.)
    params: Array<{         // Параметры для конструктора
        key: string;
        value: string;
    }>;
    isStatic: boolean;      // Статическое ли поле
    colorValue?: string;    // HEX значение цвета (для Color полей)
    // Другие специфичные поля для разных типов токенов
}
```

### Для дочерних элементов (childReferences)
```typescript
{
    fieldName: string;      // Имя поля
    className: string;      // Имя класса
}
```

### Для классов (classes)
```typescript
{
    className: string;      // Имя класса
    fields: Array<Field>;   // Массив полей
    childReferences: Array<ChildReference>; // Массив ссылок на дочерние классы
}
```

## Примеры использования

### Генерация файла с рекурсивно вложенными классами (цвета)
```dart
import 'package:flutter/material.dart';

class Neutral {
    Neutral._();

    static final Lvl3000 = const Color(0xFF211D1F);
    static final Lvl2000 = const Color(0xFF312C2E);
    
    static final Opacity = NeutralOpacity._();
    static final Brand = NeutralBrand._();
}

class NeutralOpacity {
    NeutralOpacity._();

    static final Opacity10 = const Color(0x1A211D1F);
    static final Opacity20 = const Color(0x33211D1F);
    
    static final Hover = NeutralOpacityHover._();
}

class NeutralOpacityHover {
    NeutralOpacityHover._();

    static final HoverLight = const Color(0x1AFFFFFF);
    static final HoverDark = const Color(0x1A000000);
}

class NeutralBrand {
    NeutralBrand._();

    static final Primary = const Color(0xFF007BFF);
    
    static final Secondary = NeutralBrandSecondary._();
}

class NeutralBrandSecondary {
    NeutralBrandSecondary._();

    static final Light = const Color(0xFF6C757D);
    static final Dark = const Color(0xFF343A40);
}
```

### Генерация типографики (через шаблоны - будущее)
```dart
import 'package:flutter/material.dart';
import 'package:ui_kit_litnet_audio/utils/sizes.dart';

class TypographyStyles {
    TypographyStyles._();

    static final heading = TextStyle(
        fontFamily: 'Roboto',
        package: 'ui_kit_litnet_audio',
        fontWeight: FontWeight.w700,
        fontSize: h24,
        height: 1.2,
        leadingDistribution: TextLeadingDistribution.even,
    );
    
    static final body = TextStyle(
        fontFamily: 'Roboto',
        package: 'ui_kit_litnet_audio',
        fontWeight: FontWeight.w400,
        fontSize: h16,
        height: 1.5,
        leadingDistribution: TextLeadingDistribution.even,
    );
}
```

### Генерация теней (через шаблоны - будущее)
```dart
import 'package:flutter/material.dart';
import 'package:ui_kit_litnet_audio/utils/sizes.dart';

class ShadowStyles {
    ShadowStyles._();

    static const cardShadow = [
        BoxShadow(
            color: Color.fromRGBO(0, 0, 0, 0.1),
            offset: Offset(0, 2),
            blurRadius: 4,
            spreadRadius: 0,
        ),
    ];
}
```

## Функции генерации

### `generateFileContentWithNestedClasses()`
Функция для генерации файлов с рекурсивно вложенными классами в одном файле. Поддерживает любое количество уровней вложенности. Используется для генерации цветов.

### `generateTypography()`
Функция для генерации типографики. В текущей реализации использует прямую генерацию кода через `DartRenderer` без шаблонов. **Планируется переход на шаблоны.**

### `generateShadow()`
Функция для генерации теней. В текущей реализации использует прямую генерацию кода через `DartRenderer` без шаблонов. **Планируется переход на шаблоны.**

### `collectAllNestedClasses()`
Рекурсивная функция для сбора всех вложенных классов из структуры токенов. Используется внутри `generateFileContentWithNestedClasses()`.

## Добавление новых типов полей

1. Создайте новый частичный шаблон в `src/templates/dart/` (например, `dart_typography_field.hbs`)
2. Добавьте его в массив `partials` в `renderTemplate()`
3. Обновите логику в функции генерации для обработки нового типа
4. Добавьте условную логику в `dart_class.hbs` для выбора правильного partial
5. **Добавьте константу импортов** в `src/utils/imports.ts`

### Пример условной логики в шаблоне:
```handlebars
{{#fields}}
{{#if colorValue}}
{{> dart_color_field}}
{{else if typographyStyle}}
{{> dart_typography_field}}
{{else if shadowValue}}
{{> dart_shadow_field}}
{{else}}
{{> dart_generic_field}}
{{/if}}
{{/fields}}
```

### Добавление новых импортов:
```typescript
// В src/utils/imports.ts
export const NEW_TOKEN_TYPE_IMPORTS = [
    ...BASE_IMPORTS,
    "import 'package:ui_kit_litnet_audio/utils/sizes.dart';",
    "import 'package:ui_kit_litnet_audio/utils/custom_utils.dart';" // Новый импорт
];
```

## Конфигурация

Шаблоны используют контекст, который включает:
- `classes` - массив классов для `dart_class.hbs`
- `className` - имя генерируемого класса
- `fields` - массив полей
- `childReferences` - массив ссылок на дочерние классы

Все имена генерируются с учетом:
- Зарезервированных слов Dart
- Кастомных идентификаторов
- Правил именования (PascalCase для классов, camelCase для полей)

## Текущее состояние

После очистки проекта система шаблонов упрощена и содержит только необходимые компоненты:
- 1 универсальный шаблон: `dart_class.hbs` (переименован из `dart_recursive_nested_classes.hbs`)
- 1 частичный шаблон: `dart_color_field.hbs`
- Система управления импортами: `src/utils/imports.ts`
- Все неиспользуемые шаблоны и закомментированные функции удалены

## Планы развития

1. **Унификация подхода**: Перевод всех типов токенов на использование шаблонов
2. **Создание новых partials**: 
   - `dart_typography_field.hbs` для типографики
   - `dart_shadow_field.hbs` для теней
   - `dart_spacing_field.hbs` для отступов
   - и т.д.
3. **Улучшение условной логики**: Добавление более сложной логики выбора partials в `dart_class.hbs`
4. **Расширение системы импортов**: Добавление новых типов импортов по мере необходимости
