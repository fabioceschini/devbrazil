@echo off
echo ===================================
echo   Atualizando arquivos no GitHub...
echo ===================================

:: 1. Baixa alteracoes remotas se existirem
git pull origin main --rebase

:: 2. Adiciona todas as pastas e arquivos
git add .

:: 3. Solicita a mensagem do commit
set /p msg="Digite a mensagem do commit (ou pressione Enter para 'Atualizacao automatica'): "
if "%msg%"=="" set msg=Atualizacao automatica

:: 4. Cria o commit e envia
git commit -m "%msg%"
echo.
echo Enviando para o GitHub...
git push origin main

echo.
echo ===================================
echo   Processo finalizado!
echo ===================================
pause