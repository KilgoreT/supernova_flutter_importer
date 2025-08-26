# Логика статических полей

## Проблема
Была неправильная логика для определения статических полей в корневом классе.

## Правильная логика

### Если есть корневой класс (например, AppColors)
Поля корневого класса должны быть **НЕ статическими**:

```dart
class AppColors {
    AppColors._();

    final Green = Green._();
    final BAndW = BAndW._();
    final ErrorToken = ErrorToken._();
    final Purple = Purple._();
    final Warning = Warning._();
    final Secondary = Secondary._();
    final Red = Red._();
    final Primary = Primary._();
    final Orange = Orange._();
    final Success = Success._();
    final Azure = Azure._();
    final Neutral = Neutral._();
    final Component = Component._();
    final Basic = Basic._();
}
```

### Если корневого класса нет (отдельные файлы)
Поля должны быть **статическими**:

```dart
class Green {
    Green._();

    static final primary = const Color(0xFF00FF00);
    static final secondary = const Color(0xFF00CC00);
}
```

## Реализация

### Изменения в `src/content/color.ts`
В функции `generateUnifiedColors` исправлена генерация корневого класса:

**До изменения:**
```typescript
${rootClassFields.map(field => `    static final ${field.fieldName} = ${field.className}._();`).join('\n')}
```

**После изменения:**
```typescript
${rootClassFields.map(field => `    final ${field.fieldName} = ${field.className}._();`).join('\n')}
```

### Логика в других файлах
- **`src/content/shadow.ts`** и **`src/content/typography.ts`** - используют `isStatic: true` (правильно, так как нет корневого класса)
- **`src/core/generator.ts`** - рекурсивные вызовы используют `isStatic: false` (правильно, так как вложенные классы не статические)

## Результат
Теперь логика работает корректно:
- Корневой класс (AppColors) → не статические поля
- Отдельные файлы (Green, Red, etc.) → статические поля
- Вложенные классы → не статические поля
