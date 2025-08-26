# Логика статических полей

## Правильная логика

### Уровни вложенности
- **Уровень 0 (корневой)** → поля **статические**
- **Уровень 1+ (вложенные)** → поля **НЕ статические**

### Примеры

#### Корневой класс (уровень 0) - статические поля
```dart
class AppColors {
    AppColors._();

    static final Green = Green._();
    static final BAndW = BAndW._();
    static final ErrorToken = ErrorToken._();
    static final Purple = Purple._();
    static final Warning = Warning._();
    static final Secondary = Secondary._();
    static final Red = Red._();
    static final Primary = Primary._();
    static final Orange = Orange._();
    static final Success = Success._();
    static final Azure = Azure._();
    static final Neutral = Neutral._();
    static final Component = Component._();
    static final Basic = Basic._();
}
```

#### Отдельные файлы (уровень 0) - статические поля
```dart
class Green {
    Green._();

    static final primary = const Color(0xFF00FF00);
    static final secondary = const Color(0xFF00CC00);
}
```

#### Вложенные классы (уровень 1+) - не статические поля
```dart
class GreenVariants {
    GreenVariants._();

    final light = const Color(0xFF4DA3FF);
    final dark = const Color(0xFF0056B3);
}
```

## Реализация

### Изменения в `src/content/color.ts`
В функции `generateUnifiedColors` корневой класс (уровень 0) имеет статические поля:

```typescript
${rootClassFields.map(field => `    static final ${field.fieldName} = ${field.className}._();`).join('\n')}
```

### Логика в других файлах
- **`src/content/shadow.ts`** и **`src/content/typography.ts`** - используют `isStatic: true` (правильно для уровня 0)
- **`src/core/generator.ts`** - рекурсивные вызовы используют `isStatic: false` (правильно для уровня 1+)

## Результат
Теперь логика работает корректно:
- Уровень 0 (корневые классы) → статические поля
- Уровень 1+ (вложенные классы) → не статические поля
