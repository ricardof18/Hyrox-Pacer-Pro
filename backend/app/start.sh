#!/bin/sh
echo "--- A iniciar ambiente Railway ---"
# O Docker coloca tudo em /app, vamos garantir que estamos lá
cd /app

# Correr migrações (usando o caminho absoluto do Docker)
python3 migrate_db.py || echo "Aviso: migrate_db.py não encontrado na raiz"

# Correr script de admin
python3 app/set_admin.py || echo "Aviso: set_admin.py não encontrado em app/"

# Iniciar o servidor
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT
