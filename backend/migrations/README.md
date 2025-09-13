# Migrações do Banco de Dados

Este diretório contém as migrações do banco de dados usando Alembic.

## Configuração Inicial

Para configurar o Alembic pela primeira vez:

```bash
cd backend
alembic init migrations
```

## Comandos Úteis

### Criar nova migração
```bash
alembic revision --autogenerate -m "Descrição da migração"
```

### Aplicar migrações
```bash
alembic upgrade head
```

### Reverter migração
```bash
alembic downgrade -1
```

### Ver histórico
```bash
alembic history
```

### Ver status atual
```bash
alembic current
```

## Configuração do alembic.ini

Certifique-se de que o arquivo `alembic.ini` está configurado corretamente:

```ini
[alembic]
script_location = migrations
sqlalchemy.url = postgresql://username:password@localhost:5432/medicalink
```

## Para o MVP

Como este é um MVP, você pode usar o método simples:

```python
# No arquivo db.py
def create_tables():
    Base.metadata.create_all(bind=engine)
```

Isso criará todas as tabelas automaticamente sem necessidade de migrações complexas.
