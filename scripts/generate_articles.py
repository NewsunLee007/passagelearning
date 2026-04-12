import os
import json
import re
from docx import Document
from openai import OpenAI
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

API_KEY = os.getenv("OPENAI_API_KEY")
BASE_URL = os.getenv("OPENAI_BASE_URL")

client = OpenAI(api_key=API_KEY, base_url=BASE_URL)

DOCX_PATH = "../../七年级下册英语教材语篇汇总.docx"
OUTPUT_DIR = "../public/content"
INDEX_PATH = os.path.join(OUTPUT_DIR, "index.json")

def read_docx(path):
    doc = Document(path)
    paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
    return paragraphs

def split_articles(paragraphs):
    """
    将包含多篇文章的段落列表切分为单篇文章。
    假设每篇文章有明确的标题或结构，这里用简单的启发式规则切分：
    比如遇到类似 "Unit X" 或者长度较短且全部大写/特定格式的行，作为新文章的开始。
    """
    # 这里是一个简单的拆分逻辑，根据实际文档结构可能需要调整。
    # 假设文档是由多个小短文组成，每个短文第一行是标题。
    articles = []
    current_article = []
    
    for p in paragraphs:
        # 如果遇到像 "Unit 1" 这样的标识符，可以认为是新文章的开始
        if re.match(r'^Unit\s+\d+', p, re.IGNORECASE) or len(p) < 50 and current_article and len(current_article) > 5:
            # 这是一个简单的分割逻辑：如果遇到新的标题（短于50字符且之前已经收集了正文），开始新文章
            articles.append(current_article)
            current_article = [p]
        else:
            current_article.append(p)
            
    if current_article:
        articles.append(current_article)
        
    return articles

def generate_article_json(article_text, index):
    prompt = f"""
你是一个英语教学专家，请根据以下文章内容，生成一个互动阅读程序所需的 JSON 格式数据。
你的输出必须是合法的 JSON 对象，不能包含 Markdown 代码块标记（如 ```json），直接输出 JSON 内容即可。
参考 JSON 结构：
{{
  "meta": {{ "schemaVersion": "1.0", "source": "七年级下册英语教材", "notes": "自动生成" }},
  "article": {{
    "id": "u{{index}}-article",
    "title": "文章标题（从文本提取）",
    "unit": "所属单元或类别（从文本提取，默认 Unit X）",
    "genre": "narrative",
    "paragraphs": [
      {{ "id": "p1", "sentenceIds": ["s1", "s2"] }}
    ]
  }},
  "sentences": [
    {{ "id": "s1", "text": "英文句子1", "paragraphId": "p1", "keywords": ["关键词1", "关键词2"] }}
  ],
  "vocabItems": [
    {{ "id": "v1", "term": "短语/单词", "meaningZh": "中文意思", "exampleSentenceId": "s1", "distractorsZh": ["干扰项1", "干扰项2", "干扰项3"] }}
  ],
  "sentenceTasks": [
    {{
      "id": "st1", "sentenceId": "s1", "type": "chunk_reorder", "promptZh": "把句子语块按正确顺序拖拽排列",
      "chunks": [
        {{ "id": "c1", "text": "chunk1", "tag": "主语" }},
        {{ "id": "c2", "text": "chunk2", "tag": "谓语" }}
      ],
      "correctOrder": ["c1", "c2"],
      "focusPointsZh": ["考点1"]
    }}
  ],
  "readingQuestions": [
    {{
      "id": "rq1", "type": "single_choice", "stem": "英文问题",
      "options": ["A选项", "B选项", "C选项", "D选项"],
      "answer": "正确选项完整文本", "rationaleZh": "中文解析", "evidenceSentenceIds": ["s1"]
    }}
  ],
  "quoteCandidates": [
    {{ "sentenceId": "s1", "reasonZh": "优美理由" }}
  ]
}}

要求：
1. "id" 字段请以 "u{index}-" 开头，确保唯一。
2. 提取出文章的标题放入 article.title。
3. 把文章切分为一个个完整的英文句子，放入 sentences，并分配给正确的 paragraphs。
4. 提取 5-8 个核心词汇/短语，放入 vocabItems，生成 3 个易混淆的中文干扰项。
5. 设计 1-2 道句子拆解题 (sentenceTasks)，把长难句切分成有意义的语块 (chunks)。
6. 设计 3-5 道阅读理解单选题 (readingQuestions)。
7. 挑选 1-3 句优美的句子放入 quoteCandidates。
8. 确保所有的 sentenceId 在各个部分是一致且对应的。

待处理文章内容：
{article_text}
"""
    try:
        response = client.chat.completions.create(
            model="deepseek-chat", # 请根据实际使用的模型修改，如 gpt-4o
            messages=[
                {"role": "system", "content": "You are a helpful assistant that strictly outputs raw JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        json_str = response.choices[0].message.content
        # 尝试清理可能存在的 markdown 标记
        json_str = re.sub(r'^```json\s*', '', json_str)
        json_str = re.sub(r'\s*```$', '', json_str)
        return json.loads(json_str)
    except Exception as e:
        print(f"Error generating JSON for article {index}: {e}")
        return None

def main():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    print("Reading docx...")
    try:
        paragraphs = read_docx(DOCX_PATH)
    except Exception as e:
        print("Failed to read docx file. Make sure python-docx is installed and the file path is correct.")
        print(e)
        return

    articles_text = split_articles(paragraphs)
    print(f"Found {len(articles_text)} articles.")

    index_data = []

    for i, p_list in enumerate(articles_text):
        if not p_list: continue
        text = "\n".join(p_list)
        print(f"Processing article {i+1}/{len(articles_text)}...")
        
        article_data = generate_article_json(text, i+1)
        if article_data:
            # 获取 ID 和标题用于 index.json
            article_id = article_data.get("article", {}).get("id", f"article-{i+1}")
            title = article_data.get("article", {}).get("title", f"Untitled {i+1}")
            unit = article_data.get("article", {}).get("unit", "Reading")
            
            # 保存 JSON
            file_path = os.path.join(OUTPUT_DIR, f"{article_id}.json")
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(article_data, f, ensure_ascii=False, indent=2)
            print(f"Saved {file_path}")
            
            index_data.append({
                "id": article_id,
                "title": title,
                "unit": unit
            })
            
    # 如果列表为空，说明没有成功生成，把原来的 demo 加进去防止前端报错
    if not index_data:
        index_data.append({
            "id": "u3-delicious-memories",
            "title": "Delicious memories",
            "unit": "Unit 3 Food matters"
        })

    with open(INDEX_PATH, "w", encoding="utf-8") as f:
        json.dump(index_data, f, ensure_ascii=False, indent=2)
    print(f"Saved index file to {INDEX_PATH}")
    print("All done!")

if __name__ == "__main__":
    main()
