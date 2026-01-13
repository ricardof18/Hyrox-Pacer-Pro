# Hyrox Pacer Pro 🏁

App de planeamento de estratégia para atletas Hyrox, com foco em gestão de tempos e parciais (splits).

## 🚀 Tecnologias
- **Backend:** FastAPI (Python), SQLAlchemy (MySQL), Pydantic.
- **Frontend:** React (Vite), Tailwind CSS, Framer Motion, Chart.js.
- **Infraestrutura:** Docker & Docker Compose.

---

## 🛠️ Deploy em Produção (Docker)

Siga estes passos para colocar a aplicação a correr em ambiente de produção.

### 1. Requisitos
- Docker instalado.
- Docker Compose instalado.

### 2. Configuração de Variáveis de Ambiente
Crie um ficheiro `.env` na raiz do projeto (ou configure no servidor):

```env
# Backend
DATABASE_URL=mysql+pymysql://hyroxuser:hyroxpass@db:3306/hyrox_pacer_db
SECRET_KEY=sua-chave-secreta-muito-forte-aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# MySQL
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=hyrox_pacer_db
MYSQL_USER=hyroxuser
MYSQL_PASSWORD=hyroxpass
```

### 3. Deploy com Docker Compose
Para iniciar todos os serviços (Backend, Frontend e Base de Dados) em modo background:

```bash
docker-compose up -d --build
```

Os serviços ficarão disponíveis em:
- **Frontend:** `http://localhost:5173` (ou a porta configurada)
- **Backend API:** `http://localhost:8000`
- **Documentação API:** `http://localhost:8000/docs`

### 4. Inicialização da Base de Dados
Na primeira execução, as tabelas serão criadas automaticamente. Se precisar de forçar a migração manual:

```bash
docker exec -it hyrox_backend python app/init_db.py
```

### 5. Manutenção & Logs
Para verificar se tudo está a correr bem:

```bash
# Ver logs em tempo real
docker-compose logs -f

# Parar os serviços
docker-compose down
```

---

## 👨‍💻 Desenvolvimento Local

Se quiser correr sem Docker para desenvolvimento rápido:

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate em Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔒 Segurança em Produção
- [ ] Alterar todas as passwords no `.env`.
- [ ] Usar um Reverse Proxy (ex: Nginx) com SSL (HTTPS).
- [ ] Limitar o acesso à porta do MySQL (3306) apenas aos containers internos.

---
*Hyrox Pacer Pro - Optimize your race.*
