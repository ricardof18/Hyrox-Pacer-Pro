#!/bin/sh
# Navegar para a raiz da aplicação no Docker
cd /app

# Tentar rodar migrações (se o ficheiro existir)
python3 migrate_db.py || echo "Migrate script não encontrado"

# Tornar o Ricardo Admin (Garante que este script existe em app/set_admin.py)
python3 app/set_admin.py || echo "Erro ao definir admin"

# Iniciar o Uvicorn apontando para o módulo correto
# Como estamos em /app e o main está em app/main.py:
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT
