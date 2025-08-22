#!/bin/bash

# Скрипт для запуска Supernova экспортера с правильными переменными окружения

# Загружаем nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Используем Node.js v20
nvm use 20

# Проверяем, что node и npm доступны
echo "=== Проверка окружения ==="
echo "Node.js версия: $(node --version)"
echo "npm версия: $(npm --version)"
echo "Текущая директория: $(pwd)"
echo ""

# Функция для запуска команд
run_command() {
    echo "=== Запуск: $1 ==="
    eval "$1"
    echo ""
}

# Доступные команды
case "$1" in
    "test")
        run_command "npm test"
        ;;
    "build")
        run_command "npm run build"
        ;;
    "dev")
        run_command "npm run dev"
        ;;
    "lint")
        run_command "npm run lint"
        ;;
    "install")
        run_command "npm install"
        ;;
    "clean")
        echo "=== Очистка ==="
        rm -rf dist/
        rm -rf node_modules/
        echo "Очистка завершена"
        ;;
    "setup")
        echo "=== Настройка проекта ==="
        run_command "npm install"
        run_command "npm run build"
        echo "Настройка завершена"
        ;;
    *)
        echo "Использование: $0 {test|build|dev|lint|install|clean|setup}"
        echo ""
        echo "Команды:"
        echo "  test    - запустить тесты"
        echo "  build   - собрать проект"
        echo "  dev     - запустить в режиме разработки"
        echo "  lint    - проверить код"
        echo "  install - установить зависимости"
        echo "  clean   - очистить проект"
        echo "  setup   - полная настройка проекта"
        ;;
esac
