# Изменение правил именования полей

## Проблема
В кастомном корневом классе поля начинались с маленькой буквы, что не позволяло использовать структуру типа `AppColors.Neutral.[...]`.

**Пример до изменения:**
```dart
class AppColors {
    AppColors._();

    static final azul = Azul._();
    static final neutral = Neutral._();
    static final brand = Brand._();
}

// Использование: AppColors.neutral.[...] (с маленькой буквы)
```

## Решение
Изменены правила именования полей в файле `src/core/naming/naming_rules.ts`:

**До изменения:**
```typescript
[NamingTarget.Field]: {
    target: NamingTarget.Field,
    casings: [
        CasingStyle.CamelCase,
        CasingStyle.CapitalizeFirstCase,
    ],
    sanitize: true,
},
```

**После изменения:**
```typescript
[NamingTarget.Field]: {
    target: NamingTarget.Field,
    casings: [
        CasingStyle.PascalCase,
    ],
    sanitize: true,
},
```

## Результат
Теперь поля начинаются с большой буквы, как и классы:

**Пример после изменения:**
```dart
class AppColors {
    AppColors._();

    static final Azul = Azul._();
    static final Neutral = Neutral._();
    static final Brand = Brand._();
}

// Использование: AppColors.Neutral.[...] (с большой буквы)
```

## Затронутые файлы
- `src/core/naming/naming_rules.ts` - изменены правила именования
- Все места, где используется `generateIdentifier` с `NamingTarget.Field` автоматически получат новое поведение

## Совместимость
Это изменение обратно совместимо, так как:
1. Имена классов остаются без изменений (используют `PascalCase`)
2. Имена файлов остаются без изменений (используют `SnakeCase`)
3. Изменяется только стиль именования полей с `CamelCase` на `PascalCase`

## Требуется пересборка
После внесения изменений необходимо пересобрать проект:
```bash
npm run build
```

Это обновит файл `dist/build.js` с новыми правилами именования.
