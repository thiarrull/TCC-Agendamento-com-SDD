Python
from sqlalchemy import Column, Integer, String, Date
from database import Base

class UsuarioDB(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    telefone = Column(String(20), nullable=True)
    data_nascimento = Column(Date, nullable=True)