from services.llm import generate_answer


context = """
The candidate knows C, Java, Python, and JavaScript.
The candidate has experience with React.js, Next.js,
FastAPI, Node.js, and Express.js.
"""

question = "What programming languages does the candidate know?"

answer = generate_answer(question, context)

print("\n===== ANSWER =====\n")
print(answer)