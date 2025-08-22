# Система конфигурации

## Обзор

Система конфигурации Supernova экспортера использует два файла:

1. **`config.json`** - глобальные настройки с описанием параметров
2. **`config.local.json`** - локальные настройки, которые перезаписывают глобальные

## Приоритет настроек

Локальные настройки (`config.local.json`) имеют **высший приоритет** и перезаписывают глобальные настройки (`config.json`).

## Структура файлов

### config.json
Содержит описание всех доступных параметров с типами, значениями по умолчанию и условиями:

```json
[
    {
        "key": "createUnifiedColorFile",
        "type": "boolean",
        "default": false,
        "title": "Create Unified Color File",
        "description": "When enabled, all color tokens will be combined into a single file instead of creating separate files for each color group"
    },
    {
        "key": "unifiedColorClassName",
        "type": "string",
        "default": "colors",
        "title": "Unified Color File Name",
        "description": "Name of the unified color file (without .dart extension). Only used when 'Create Unified Color File' is enabled",
        "condition": {
            "key": "createUnifiedColorFile",
            "value": true
        }
    }
]
```

### config.local.json
Содержит только значения параметров для переопределения:

```json
{
    "generateDisclaimer": false,
    "basePath": "./kw",
    "colorPath": "/colorLocal",
    "typographyPath": "/typographyLocal",
    "shadowPath": "/shadowsLocal",
    "createUnifiedColorFile": true,
    "unifiedColorClassName": "ZhopaApp"
}
```

## Доступные параметры

### Базовые настройки
- **`generateDisclaimer`** (boolean) - добавлять ли комментарий о том, что файл сгенерирован автоматически
- **`basePath`** (string) - базовый путь для всех файлов (например, "./lib/design_system")
- **`customIdentifiers`** (array) - кастомные идентификаторы для избежания конфликтов имен

### Пути к файлам
- **`colorPath`** (string) - путь к папке с цветами (например, "/colors")
- **`typographyPath`** (string) - путь к папке с типографикой (например, "/typography")
- **`shadowPath`** (string) - путь к папке с тенями (например, "/shadows")

### Настройки единого файла цветов
- **`createUnifiedColorFile`** (boolean) - создавать ли единый файл с иерархией цветов
- **`unifiedColorClassName`** (string) - название корневого класса (например, "AppColors"). Будет автоматически валидировано и отформатировано согласно правилам Dart. Имя файла генерируется автоматически.

### Тестовые настройки
- **`testFormat`** (enum) - формат для тестов ("tetest", "huietest", "zhopatest")

## Как использовать

### 1. Глобальные настройки
Отредактируйте `config.json` для изменения описаний и значений по умолчанию.

### 2. Локальные настройки
Создайте или отредактируйте `config.local.json` для переопределения настроек:

```json
{
    "createUnifiedColorFile": true,
    "unifiedColorClassName": "MyAppColors",
    "basePath": "./lib/my_design_system"
}
```

### 3. Проверка настроек
При запуске экспорта в консоли будет выведена отладочная информация:

```
=== Отладка конфигурации ===
exportConfiguration: {
  basePath: "./kw",
  colorPath: "/colorLocal",
  typographyPath: "/typographyLocal",
  shadowPath: "/shadowsLocal",
  generateDisclaimer: false,
  createUnifiedColorFile: true,
  unifiedColorClassName: "ZhopaApp",
  customIdentifiers: []
}
```

## Примеры конфигураций

### Пример 1: Обычная генерация
```json
// config.local.json
{
    "createUnifiedColorFile": false,
    "basePath": "./lib/design_system",
    "colorPath": "/colors"
}
```

**Результат**: Отдельные файлы для каждой цветовой группы

### Пример 2: Единый файл с иерархией
```json
// config.local.json
{
    "createUnifiedColorFile": true,
    "unifiedColorClassName": "AppColors",
    "basePath": "./lib/design_system",
    "colorPath": "/colors"
}
```

**Результат**: 
- `AppColors.dart` - корневой файл с ссылками
- `azul.dart`, `neutral.dart` - отдельные файлы

### Пример 3: Кастомные пути
```json
// config.local.json
{
    "basePath": "./lib/ui",
    "colorPath": "/theme/colors",
    "typographyPath": "/theme/typography",
    "shadowPath": "/theme/shadows"
}
```

**Результат**: Файлы будут созданы в `./lib/ui/theme/`

## Отладка проблем

### Проблема: Локальные настройки не работают

1. **Проверьте синтаксис JSON**:
   ```bash
   # Проверьте, что файл валиден
   cat config.local.json | jq .
   ```

2. **Проверьте отладочную информацию** в консоли при экспорте

3. **Убедитесь, что файл находится в корне проекта**

4. **Проверьте права доступа к файлу**

### Проблема: Неизвестный параметр

1. **Проверьте, что параметр описан в `config.json`**
2. **Проверьте тип параметра** (boolean, string, array)
3. **Проверьте условия** (condition) для параметра

## Примечания

- `config.local.json` должен быть в корне проекта (там же, где `config.json`)
- Локальные настройки полностью перезаписывают глобальные
- Неизвестные параметры в `config.local.json` игнорируются
- Система конфигурации работает только в контексте Supernova (через CLI или расширение)
