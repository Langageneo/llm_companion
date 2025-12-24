from pathlib import Path
from config import client

def load_text(path):
    return Path(path).read_text(encoding="utf-8")

# Chargement du cadre
system_prompt = load_text("system_prompt.txt")
profile = load_text("memory/profile.txt")
projects = load_text("memory/projects.txt")
notes = load_text("memory/notes.txt")

messages = [
    {"role": "system", "content": system_prompt},
    {"role": "system", "content": profile},
    {"role": "system", "content": projects},
    {"role": "system", "content": notes},
]

print("LLM Compagnon prêt. Tape 'exit' pour quitter.\n")

while True:
    user_input = input("Toi > ")
    if user_input.lower() == "exit":
        print("Session terminée.")
        break

    messages.append({"role": "user", "content": user_input})

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=messages,
        temperature=0.4
    )

    reply = response.choices[0].message.content
    print("\nLLM >", reply, "\n")

    messages.append({"role": "assistant", "content": reply})
