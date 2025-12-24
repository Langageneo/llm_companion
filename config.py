import os
import openai

# Charge la clé depuis l'environnement
openai.api_key = os.getenv("OPENAI_API_KEY")
