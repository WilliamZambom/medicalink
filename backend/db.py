from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
import os
from dotenv import load_dotenv

load_dotenv()

# URL do banco de dados
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/medicalink")

# Para async, converter postgresql:// para postgresql+asyncpg://
if DATABASE_URL.startswith("postgresql://"):
    ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
else:
    ASYNC_DATABASE_URL = DATABASE_URL

# Engine síncrono
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Engine assíncrono
async_engine = create_async_engine(ASYNC_DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    bind=async_engine
)

Base = declarative_base()

def get_db():
    """
    Dependency para obter sessão do banco de dados
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_async_db():
    """
    Dependency assíncrona para obter sessão do banco de dados
    """
    async with AsyncSessionLocal() as session:
        yield session

def create_tables():
    """
    Criar todas as tabelas no banco de dados
    """
    Base.metadata.create_all(bind=engine)

async def create_tables_async():
    """
    Criar todas as tabelas no banco de dados (versão assíncrona)
    """
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

def test_connection():
    """
    Testar conexão com o banco de dados
    """
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        print("✅ Conexão com banco de dados estabelecida com sucesso!")
        return True
    except Exception as e:
        print(f"❌ Erro ao conectar com banco de dados: {e}")
        return False

if __name__ == "__main__":
    # Testar conexão quando executar diretamente
    test_connection()
