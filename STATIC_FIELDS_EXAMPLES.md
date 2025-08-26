# Примеры работы новой логики статических полей

## Сценарий 1: Режим с AppColors (createUnifiedColorFile: true)

### Конфигурация:
```json
{
  "createUnifiedColorFile": true,
  "unifiedColorClassName": "AppColors"
}
```

### Генерируемый код:

**app_colors.dart** (корневой класс):
```dart
class AppColors {
    AppColors._();

    static final basic = Basic._();      // ✅ СТАТИЧЕСКОЕ поле
    static final semantic = Semantic._(); // ✅ СТАТИЧЕСКОЕ поле
}
```

**basic.dart** (отдельный класс):
```dart
class Basic {
    Basic._();

    final red = const Color(0xFFFF0000);    // ✅ НЕстатическое поле
    final blue = const Color(0xFF0000FF);   // ✅ НЕстатическое поле
    final Text = BasicText._();             // ✅ НЕстатическое поле  
    final Skeleton = BasicSkeleton._();     // ✅ НЕстатическое поле
    final Bg = BasicBg._();                 // ✅ НЕстатическое поле
}

class BasicText {
    BasicText._();

    final primary = const Color(0xFF000000);   // ✅ НЕстатическое поле (наследует статус)
    final secondary = const Color(0xFF666666); // ✅ НЕстатическое поле (наследует статус)
}

class BasicSkeleton {
    BasicSkeleton._();

    final base = const Color(0xFFE0E0E0);      // ✅ НЕстатическое поле (наследует статус)
    final highlight = const Color(0xFFF5F5F5); // ✅ НЕстатическое поле (наследует статус)
}

class BasicBg {
    BasicBg._();

    final primary = const Color(0xFFFFFFFF);   // ✅ НЕстатическое поле (наследует статус)
    final secondary = const Color(0xFFF8F8F8); // ✅ НЕстатическое поле (наследует статус)
}
```

## Сценарий 2: Режим без AppColors (createUnifiedColorFile: false)

### Конфигурация:
```json
{
  "createUnifiedColorFile": false
}
```

### Генерируемый код:

**basic.dart** (корневой класс):
```dart
class Basic {
    Basic._();

    static final red = const Color(0xFFFF0000);    // ✅ СТАТИЧЕСКОЕ поле
    static final blue = const Color(0xFF0000FF);   // ✅ СТАТИЧЕСКОЕ поле
    static final nested = Nested._();              // ✅ СТАТИЧЕСКОЕ поле
}

class Nested {
    Nested._();

    final darkRed = const Color(0xFF800000);  // ✅ НЕстатическое поле (наследует статус)
}
```

## Правила реализованной логики

### 1. Режим с AppColors (`createUnifiedColorFile: true`)
- **AppColors класс**: все поля статические (`static final`)
- **Отдельные классы**: все поля нестатические (`final`)
- **Вложенные классы**: все поля нестатические (наследуют статус родителя)

### 2. Режим без AppColors (`createUnifiedColorFile: false`)
- **Корневые классы**: все поля статические (`static final`)
- **Вложенные классы**: все поля нестатические (`final`)

### 3. Правило наследования
**Ключевое правило**: Если родительский класс имеет нестатические поля, то все его дочерние классы также имеют нестатические поля.

## Использование в коде

```dart
// Режим с AppColors
AppColors.basic.red        // ✅ Доступ через статические поля AppColors
AppColors.semantic.primary // ✅ Доступ через статические поля AppColors

// Режим без AppColors  
Basic.red                  // ✅ Прямой доступ к статическим полям
Basic.nested.darkRed       // ✅ Комбинированный доступ
```

## Файлы с изменениями

1. **src/content/color.ts** - основная логика определения статических полей
2. **src/core/generator.ts** - правило наследования для вложенных классов

### Ключевая функция:
```typescript
function determineFieldsStaticStatus(isUnifiedMode: boolean, isRootClass: boolean): boolean {
    if (isUnifiedMode) {
        // В режиме AppColors только сам AppColors класс имеет статические поля
        return false;
    } else {
        // В режиме без AppColors корневые классы статические, вложенные - нестатические
        return isRootClass;
    }
}
```
