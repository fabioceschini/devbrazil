@echo off
echo ===================================
echo   Atualizando arquivos no GitHub...
echo ===================================

:: Solicita a mensagem do commit
set /p msg="Digite a mensagem do commit (ou pressione Enter para 'Atualizacao automatica'): "
if "%msg%"=="" set msg=Atualizacao automatica

:: Executa os comandos do Git
git add .
git commit -m "%msg%"
echo.
echo Enviando para o GitHub...
git push -u origin main

echo.
echo ===================================
echo   Publicacao concluida com sucesso!
echo ===================================
pause