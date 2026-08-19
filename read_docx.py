import docx
import sys

doc = docx.Document("c:\\Users\\Praveenkumar S\\Documents\\pdd\\kingrat\\derma_sense_ai\\Git Live Automation Testing Setup.docx")
with open("docx_content.txt", "w", encoding="utf-8") as f:
    for para in doc.paragraphs:
        f.write(para.text + "\n")
