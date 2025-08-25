# Изменения для суффикса цветов

## Добавленные параметры

### 1. `useColorSuffix` (boolean)
- **Описание**: Переключатель для включения/выключения суффикса для цветов
- **По умолчанию**: `false`
- **Функция**: Когда включен, к именам полей цветов добавляется суффикс

### 2. `colorSuffix` (string)
- **Описание**: Значение суффикса для цветов
- **По умолчанию**: `"Clr"`
- **Условие**: Используется только когда `useColorSuffix` = `true`

## Измененные файлы

### 1. `config.json`
- Добавлены два новых параметра конфигурации
- Параметр `colorSuffix` имеет условие зависимости от `useColorSuffix`

### 2. `config.ts`
- Обновлен интерфейс `ExporterConfiguration`
- Добавлены типы для новых параметров

### 3. `src/generators/dart/tokens/color_renderer.ts`
- Обновлена функция `renderColorToken`
- Добавлены параметры `useColorSuffix` и `colorSuffix`
- Суффикс применяется к именам полей через `generateIdentifier`

### 4. `src/content/color.ts`
- Обновлена функция `collectAllNestedClasses`
- Обновлена функция `generateFileContentWithNestedClasses`
- Обновлены функции `generateUnifiedColors` и `generateColors`
- Все функции теперь используют параметры суффикса из конфигурации

### 5. `src/index.ts`
- Обновлена отладочная информация
- Добавлены новые параметры в логи конфигурации

## Пример использования

Когда `useColorSuffix` = `true` и `colorSuffix` = `"Clr"`:

**Было:**
```dart
static final primaryRed = const Color(0xFF0000FF);
```

**Стало:**
```dart
static final primaryRedClr = const Color(0xFF0000FF);
```

## Логика работы

1. Пользователь включает `useColorSuffix` в конфигурации
2. Указывает желаемый суффикс в `colorSuffix` (по умолчанию "Clr")
3. При генерации цветов, функция `generateIdentifier` получает суффикс как параметр
4. Суффикс добавляется к именам полей цветов
5. Суффикс применяется только к полям цветов, не к классам или файлам
