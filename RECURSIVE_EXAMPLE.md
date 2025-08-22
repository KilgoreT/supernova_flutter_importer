# Пример рекурсивной генерации вложенных классов

## Структура токенов (многоуровневая)

```
Neutral/
├── Lvl3000 (token)
├── Lvl2000 (token)
├── Opacity/
│   ├── Opacity10 (token)
│   ├── Opacity20 (token)
│   └── Hover/
│       ├── HoverLight (token)
│       └── HoverDark (token)
└── Brand/
    ├── Primary (token)
    └── Secondary/
        ├── Light (token)
        └── Dark (token)
```

## Результат генерации

```dart
import 'package:flutter/material.dart'; 
import 'package:ui_kit_litnet_audio/utils/sizes.dart'; 

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

## Преимущества рекурсивной системы

1. **Полная вложенность**: Поддержка любого количества уровней
2. **Автоматическое именование**: `NeutralOpacityHover`, `NeutralBrandSecondary`
3. **Иерархический доступ**: `Neutral.Opacity.Hover.HoverLight`
4. **Масштабируемость**: Легко добавлять новые уровни
5. **Единый файл**: Все связанные классы в одном месте

## Использование в коде

```dart
// Доступ к токенам разного уровня вложенности
Color mainColor = Neutral.Lvl3000;
Color opacityColor = Neutral.Opacity.Opacity10;
Color hoverColor = Neutral.Opacity.Hover.HoverLight;
Color brandColor = Neutral.Brand.Primary;
Color secondaryColor = Neutral.Brand.Secondary.Light;
```
