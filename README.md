# Supernova Dart Exporter

Экспортер дизайн-системы Supernova для генерации Dart/Flutter кода. Преобразует токены дизайн-системы (цвета, типографика, тени) в готовые к использованию Dart классы.

## Архитектура проекта

### 📁 Структура папок

```
src/
├── core/                    # Ядро системы
│   ├── build-tree.ts       # Построение дерева токенов
│   ├── filter-tree.ts      # Фильтрация по типам токенов
│   ├── prune-tree.ts       # Очистка дерева от пустых узлов
│   ├── generator.ts        # Базовая генерация кода
│   ├── entity/             # Основные типы данных
│   ├── naming/             # Генерация имен (классов, полей)
│   └── render/             # Система шаблонов
├── content/                # Генерация контента по типам
│   ├── color.ts           # Генерация цветов
│   ├── typography.ts      # Генерация типографики
│   ├── shadow.ts          # Генерация теней
│   └── entities/          # Извлечение данных из токенов
├── generators/            # Рендереры для разных языков
│   └── dart/             # Dart/Flutter рендереры
├── templates/             # Handlebars шаблоны
│   └── dart/             # Шаблоны для Dart
└── utils/                # Вспомогательные функции
```

### 🔄 Принцип работы

1. **Получение данных** → Supernova SDK предоставляет токены и группы токенов
2. **Построение дерева** → Токены организуются в иерархическую структуру
3. **Фильтрация** → Выбираются токены нужного типа (цвета, типографика, тени)
4. **Генерация кода** → Создается Dart код с использованием шаблонов или прямого рендеринга
5. **Сохранение файлов** → Результат сохраняется в указанные папки

## Основные компоненты

### 🌳 Дерево токенов (TokenTree)

Дерево представляет иерархическую структуру токенов дизайн-системы:

```
TokenTree
├── Root (TokenGroup)
│   ├── Colors (TokenGroup)
│   │   ├── Primary (TokenGroup)
│   │   │   ├── Red (ColorToken)
│   │   │   └── Blue (ColorToken)
│   │   └── Secondary (TokenGroup)
│   │       └── Gray (ColorToken)
│   └── Typography (TokenGroup)
│       └── Headings (TokenGroup)
│           └── H1 (TypographyToken)
```

**Функции для работы с деревом:**
- `buildTokenTree()` - создает дерево из токенов и групп
- `filterTreeByTokenType()` - фильтрует по типу токенов
- `pruneTokenTree()` - удаляет пустые узлы

### 🏗️ Генерация кода

#### Для цветов (с шаблонами)
```typescript
// 1. Собираем все вложенные классы
const allClasses = collectAllNestedClasses(startNode, keywords, customIdentifiers);

// 2. Генерируем код через шаблон
return renderTemplate('dart_class', { classes: allClasses });
```

#### Для типографики и теней (прямая генерация)
```typescript
// 1. Создаем рендерер
const renderer = new DartRenderer(registry);

// 2. Генерируем код напрямую
const body = generateFileContent(startNode, renderer, keywords, customIdentifiers);
```

### 🎨 Система шаблонов

Используется Handlebars для генерации Dart кода. Подробная документация: [TEMPLATES_README.md](./TEMPLATES_README.md)

**Основные шаблоны:**
- `dart_class.hbs` - универсальный шаблон для всех типов токенов
- `dart_color_field.hbs` - шаблон для полей цветов

### 🏷️ Именование

Система автоматически генерирует имена для:
- **Классов** (PascalCase): `PrimaryColors`, `TypographyStyles`
- **Полей** (camelCase): `primaryRed`, `headingLarge`
- **Файлов** (snake_case): `primary_colors.dart`

Учитываются:
- Зарезервированные слова Dart
- Кастомные идентификаторы
- Конфликты имен

## Запуск и использование

### 🚀 Точка входа

Основная функция `Pulsar.export()` в `src/index.ts`:

```typescript
Pulsar.export(async (sdk: Supernova, context: PulsarContext) => {
  // 1. Получаем данные из Supernova
  const { tokenGroups, tokens } = await sdk.getTokens();
  
  // 2. Строим дерево токенов
  const tree = buildTokenTree(tokenGroups, tokens);
  
  // 3. Очищаем дерево
  const prunedTree = pruneTokenTree(tree);
  
  // 4. Генерируем файлы для каждого типа
  const colorFiles = generateColors(prunedTree, dartKeywords, customIdentifiers);
  const typographyFiles = generateTypography(prunedTree, dartKeywords, customIdentifiers);
  const shadowFiles = generateShadow(prunedTree, dartKeywords, customIdentifiers);
  
  // 5. Возвращаем результат
  return [...colorFiles, ...typographyFiles, ...shadowFiles];
});
```

### 📝 Результат генерации

**Цвета** - два режима:

**Обычная генерация** (отдельные файлы):
```dart
// azul.dart
class Azul {
  Azul._();
  static final primary = const Color(0xFF007BFF);
  static final secondary = const Color(0xFF6C757D);
}

// neutral.dart  
class Neutral {
  Neutral._();
  static final Lvl3000 = const Color(0xFF211D1F);
  static final Lvl2000 = const Color(0xFF312C2E);
}
```

**Единый файл с иерархией** (при включении `createUnifiedColorFile`):
```dart
// AppColors.dart (корневой файл)
class AppColors {
  AppColors._();
  static final azul = Azul._();
  static final neutral = Neutral._();
}

// azul.dart, neutral.dart - отдельные файлы как обычно
```

**Использование**:
```dart
// С единым файлом
final color = AppColors.azul.primary;

// Без единого файла  
final color = Azul.primary;
```

**Цвета** (объединенный файл при включении опции):
```dart
class PrimaryColors {
  PrimaryColors._();
  static final red = const Color(0xFFFF0000);
}

class NeutralColors {
  NeutralColors._();
  static final gray100 = const Color(0xFFF5F5F5);
}

class BrandColors {
  BrandColors._();
  static final primary = const Color(0xFF007BFF);
}
```

**Типографика** (`typography.dart`):
```dart
class TypographyStyles {
  TypographyStyles._();
  
  static final heading = TextStyle(
    fontFamily: 'Roboto',
    fontWeight: FontWeight.w700,
    fontSize: h24,
  );
}
```

## Конфигурация

Настройки в `config.json`:

```json
{
  "basePath": "./lib/design_system",
  "colorPath": "/colors",
  "typographyPath": "/typography", 
  "shadowPath": "/shadows",
  "generateDisclaimer": true,
  "customIdentifiers": ["custom", "identifiers"],
  "createUnifiedColorFile": false,
  "unifiedColorClassName": "AppColors"
}
```

### Параметры цветов:

- **`createUnifiedColorFile`** (boolean) - создавать единый файл с иерархией цветов
- **`unifiedColorClassName`** (string) - название корневого класса (например, "AppColors", будет валидировано и отформатировано)

При включении `createUnifiedColorFile` создается:
- Корневой файл (например, `AppColors.dart`) с ссылками на все цветовые группы
- Отдельные файлы (`azul.dart`, `neutral.dart` и т.д.) как обычно

### 🎛️ Новые опции для цветов

- **`createUnifiedColorFile`** (boolean) - объединить все цвета в один файл
- **`unifiedColorClassName`** (string) - имя объединенного класса (будет отформатировано по правилам Dart, имя файла генерируется автоматически)

## Разработка

### Добавление нового типа токенов

1. **Создать рендерер** в `src/generators/dart/tokens/`
2. **Добавить функцию генерации** в `src/content/`
3. **Создать partial шаблон** в `src/templates/dart/`
4. **Зарегистрировать в точке входа**

### Тестирование

```bash
npm test          # Запуск тестов
npm run build     # Сборка проекта
```

## Документация

- [TEMPLATES_README.md](./TEMPLATES_README.md) - Подробная документация по шаблонам
- [EXAMPLE_OUTPUT.md](./EXAMPLE_OUTPUT.md) - Примеры выходных файлов
- [RECURSIVE_EXAMPLE.md](./RECURSIVE_EXAMPLE.md) - Примеры рекурсивной генерации