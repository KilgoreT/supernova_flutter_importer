# Примеры выходных файлов

## Цвета (colors.dart)

### Обычная генерация (отдельные файлы)

**azul.dart**:
```dart
import 'package:flutter/material.dart';

class Azul {
    Azul._();

    static final primary = const Color(0xFF007BFF);
    static final secondary = const Color(0xFF6C757D);
    
    static final variants = AzulVariants._();
}

class AzulVariants {
    AzulVariants._();

    static final light = const Color(0xFF4DA3FF);
    static final dark = const Color(0xFF0056B3);
}
```

**neutral.dart**:
```dart
import 'package:flutter/material.dart';

class Neutral {
    Neutral._();

    static final Lvl3000 = const Color(0xFF211D1F);
    static final Lvl2000 = const Color(0xFF312C2E);
    
    static final Opacity = NeutralOpacity._();
}

class NeutralOpacity {
    NeutralOpacity._();

    static final Opacity10 = const Color(0x1A211D1F);
    static final Opacity20 = const Color(0x33211D1F);
}
```

### Единый файл с иерархией (createUnifiedColorFile = true)

**app_colors.dart** (корневой файл только с ссылками):
```dart
import 'package:flutter/material.dart';

class AppColors {
    AppColors._();

    static final azul = Azul._();
    static final neutral = Neutral._();
    static final brand = Brand._();
}
```

**azul.dart** (отдельный файл):
```dart
import 'package:flutter/material.dart';

class Azul {
    Azul._();

    static final primary = const Color(0xFF007BFF);
    static final secondary = const Color(0xFF6C757D);
    
    static final variants = AzulVariants._();
}

class AzulVariants {
    AzulVariants._();

    static final light = const Color(0xFF4DA3FF);
    static final dark = const Color(0xFF0056B3);
}
```

**neutral.dart** (отдельный файл):
```dart
import 'package:flutter/material.dart';

class Neutral {
    Neutral._();

    static final Lvl3000 = const Color(0xFF211D1F);
    static final Lvl2000 = const Color(0xFF312C2E);
    
    static final Opacity = NeutralOpacity._();
}

class NeutralOpacity {
    NeutralOpacity._();

    static final Opacity10 = const Color(0x1A211D1F);
    static final Opacity20 = const Color(0x33211D1F);
}
```

**Использование**:
```dart
// С единым файлом
final primaryColor = AppColors.azul.primary;
final neutralColor = AppColors.neutral.Lvl3000;

// Без единого файла
final primaryColor = Azul.primary;
final neutralColor = Neutral.Lvl3000;
```

**Важно**: Для цветов используется только `flutter/material.dart`, без `sizes.dart`, так как цвета не используют размеры.

## Типографика (typography.dart)

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

**Важно**: Для типографики нужен `sizes.dart`, так как используются размеры `h24`, `h16` и т.д.

## Тени (shadows.dart)

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
    
    static const buttonShadow = [
        BoxShadow(
            color: Color.fromRGBO(0, 0, 0, 0.2),
            offset: Offset(0, 1),
            blurRadius: 2,
            spreadRadius: 0,
        ),
    ];
}
```

**Важно**: Для теней также нужен `sizes.dart`, так как могут использоваться размеры для blurRadius, spreadRadius и т.д.

## Система импортов

Импорты для каждого типа токенов управляются через константы в `src/utils/imports.ts`:

- **Цвета**: только `flutter/material.dart`
- **Типографика**: `flutter/material.dart` + `sizes.dart`
- **Тени**: `flutter/material.dart` + `sizes.dart`
- **Отступы** (будущее): `flutter/material.dart` + `sizes.dart`
- **Радиусы** (будущее): `flutter/material.dart` + `sizes.dart`

Это позволяет легко добавлять и удалять импорты для каждого типа токенов в одном месте.

## Конфигурация единого файла цветов

В `config.json` можно настроить:

```json
{
  "createUnifiedColorFile": true,
  "unifiedColorClassName": "MyApp&Colors123"
}
```

Это создаст:
- `my_app_and_colors123.dart` - корневой файл с валидированным именем и ссылками на все цветовые группы
- `azul.dart`, `neutral.dart`, `brand.dart` - отдельные файлы как обычно

**Примечание:** Название класса `MyApp&Colors123` будет автоматически отформатировано в `MyAppAndColors123` (валидное имя класса Dart), а имя файла станет `my_app_and_colors123.dart` (snake_case для файлов).
