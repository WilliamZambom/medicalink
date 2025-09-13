import openai
import os
from typing import Optional
import asyncio
import aiohttp
import json
from dotenv import load_dotenv

load_dotenv()

class OpenAIService:
    """
    Serviço para integração com OpenAI API
    """
    
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY não encontrada nas variáveis de ambiente")
        
        openai.api_key = self.api_key
        self.model = "gpt-3.5-turbo"
        self.max_tokens = 1000
        self.temperature = 0.7

    async def get_medical_response(self, user_message: str) -> str:
        """
        Obter resposta médica da OpenAI
        """
        try:
            # Prompt do sistema para o assistente médico
            system_prompt = """Você é um assistente médico virtual chamado Medicalink. 
            
IMPORTANTE: 
- Este é um sistema educacional e não substitui consulta médica profissional
- Sempre recomende consultar um médico para diagnósticos e tratamentos
- Forneça informações gerais e educativas sobre saúde
- Seja claro sobre limitações do sistema
- Use linguagem acessível e profissional
- Em casos de emergência, sempre oriente a procurar atendimento médico imediato

Responda de forma educativa e responsável."""

            # Preparar mensagens para a API
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ]

            # Fazer chamada assíncrona para OpenAI
            response = await self._make_async_request(messages)
            
            return response

        except Exception as e:
            error_message = f"Erro ao processar pergunta: {str(e)}"
            return f"Desculpe, ocorreu um erro ao processar sua pergunta. {error_message}"

    async def _make_async_request(self, messages: list) -> str:
        """
        Fazer requisição assíncrona para OpenAI
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        data = {
            "model": self.model,
            "messages": messages,
            "max_tokens": self.max_tokens,
            "temperature": self.temperature
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=data
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    return result["choices"][0]["message"]["content"]
                else:
                    error_text = await response.text()
                    raise Exception(f"Erro na API OpenAI: {response.status} - {error_text}")

    def validate_api_key(self) -> bool:
        """
        Validar se a API key está funcionando
        """
        try:
            # Teste simples com uma pergunta básica
            test_messages = [
                {"role": "system", "content": "Você é um assistente médico."},
                {"role": "user", "content": "Olá"}
            ]
            
            # Fazer teste síncrono para validação
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=test_messages,
                max_tokens=50
            )
            
            return True
        except Exception as e:
            print(f"Erro na validação da API key: {e}")
            return False

    async def get_health_tips(self) -> str:
        """
        Obter dicas gerais de saúde
        """
        tips_prompt = "Forneça 3 dicas gerais de saúde e bem-estar de forma concisa."
        return await self.get_medical_response(tips_prompt)

    async def get_symptom_analysis(self, symptoms: str) -> str:
        """
        Análise básica de sintomas (apenas educativa)
        """
        analysis_prompt = f"""
        O usuário relatou os seguintes sintomas: {symptoms}
        
        IMPORTANTE: 
        - Forneça apenas informações educativas gerais
        - NÃO faça diagnósticos
        - Sempre recomende consulta médica
        - Explique possíveis causas gerais
        - Oriente sobre quando procurar ajuda médica
        """
        return await self.get_medical_response(analysis_prompt)
