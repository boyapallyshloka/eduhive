from transformers import pipeline
print("Loading AI Models... this may take a minute.")

summarizer_pipeline = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6", framework="pt")

def generate_summary(text):
    if not text:
        return "No text available to summarize."
    
    input_text = text[:3000] 
    
    try:
        summary = summarizer_pipeline(input_text, max_length=150, min_length=50, do_sample=False)
        return summary[0]['summary_text']
    except Exception as e:
        return f"Error generating summary: {str(e)}"

def generate_quiz(text):
    words = list(set(text.split()))
    keywords = [w for w in words if len(w) > 7][:4] 
    
    questions = []
    for i, word in enumerate(keywords):
        questions.append({
            "id": i+1,
            "question": f"What is the significance of '{word}' in the context of this document?",
            "options": ["Crucial Concept", "Irrelevant Detail", "Author's Name", "Date"],
            "answer": "Crucial Concept"
        })
    
    if not questions:
         questions.append({
            "id": 1,
            "question": "What is the main topic?",
            "options": ["Engineering", "Biology", "History", "Math"],
            "answer": "Engineering"
        })
    return questions

def ask_chatbot(text, question):
    sentences = text.split('.')
    relevant_sentences = [s for s in sentences if any(word in s.lower() for word in question.lower().split())]
    
    if relevant_sentences:
        return f"Based on the document: {relevant_sentences[0]}..."
    else:
        return "I couldn't find a specific answer in the document, but this document seems to be about " + text[:50] + "..."