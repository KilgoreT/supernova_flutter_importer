# Логика статических полей

## Правильная логика

### Уровни вложенности
- **Уровень 0 (корневой)** → поля **статические**
- **Уровень 1+ (вложенные)** → поля **НЕ статические**

### Примеры

#### Если Create Unified Color File отключен:
```dart
class Neutral {
    Neutral._();

    static final Lvl3000 = const Color(0xFF211D1F);
    static final Lvl2000 = const Color(0xFF312C2E);
    // ... другие статические поля

    final Opacity = NeutralOpacity._(); // НЕ статическое поле
}

class NeutralOpacity {
    NeutralOpacity._();

    final Lvl25 = const Color(0x40FAF7F9);
    final Lvl3000 = NeutralOpacityLvl3000._(); // НЕ статическое поле
}

class NeutralOpacityLvl3000 {
    NeutralOpacityLvl3000._();

    final Lvl5 = const Color(0x0D211D1F);
    final Lvl10 = const Color(0x1A211D1F);
    final Lvl25 = const Color(0x40211D1F);
}
```

#### Если Create Unified Color File включен:
```dart
class AppColors {
    AppColors._();

    static final Green = Green._();
    static final Neutral = Neutral._();
    // ... другие статические поля
}

class Neutral {
    Neutral._();

    final Lvl3000 = const Color(0xFF211D1F);
    final Lvl2000 = const Color(0xFF312C2E);
    // ... другие НЕ статические поля

    final Opacity = NeutralOpacity._(); // НЕ статическое поле
}

class NeutralOpacity {
    NeutralOpacity._();

    final Lvl25 = const Color(0x40FAF7F9);
    final Lvl3000 = NeutralOpacityLvl3000._(); // НЕ статическое поле
}
```

## Реализация

### Изменения в `src/content/color.ts`
1. Добавлен параметр `isUnifiedMode` в `generateFileContentWithNestedClasses`
2. В unified mode первый класс НЕ является корневым (корневым будет AppColors)
3. Обновлен шаблон `dart_class.hbs` для поддержки условного `static`
4. Обновлена функция `collectAllNestedClasses` для передачи `isStatic` в `childReferences`

### Логика в других файлах
- **`src/content/shadow.ts`** и **`src/content/typography.ts`** - используют `isStatic: true` (правильно для уровня 0)
- **`src/core/generator.ts`** - рекурсивные вызовы используют `isStatic: false` (правильно для уровня 1+)

## Результат
Теперь логика работает корректно:
- Уровень 0 (корневые классы) → статические поля
- Уровень 1+ (вложенные классы) → не статические поля
- В unified mode AppColors - корневой, Neutral - вложенный
- В обычном режиме Neutral - корневой
