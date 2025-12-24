from config import openai

# Exemple simple : demander quelque chose à l'API
response = openai.Completion.create(
    model="text-davinci-003",
    prompt="Écris une courte histoire de licorne.",
    max_tokens=100
)

print(response.choices[0].text.strip())    print("\nLLM >", reply, "\n")

    messages.append({"role": "assistant", "content": reply})
