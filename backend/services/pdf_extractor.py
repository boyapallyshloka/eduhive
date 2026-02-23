import io
import PyPDF2

def extract_text_from_bytes(file_bytes):
    try:
        # Convert bytes to a stream so PyPDF2 can read it
        pdf_stream = io.BytesIO(file_bytes)
        reader = PyPDF2.PdfReader(pdf_stream)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        return ""