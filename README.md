<h1 align="center">🔍 PlagiGuard — Intelligent Plagiarism Detection System</h1>

<p align="center">
  An AI-powered multimodal plagiarism detection platform that analyzes documents for textual and visual similarities using NLP, semantic analysis, image processing, and machine learning techniques.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/React.js-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Flask-000000?style=flat-square&logo=flask&logoColor=white" />
  <img src="https://img.shields.io/badge/Scikit--learn-F7931E?style=flat-square&logo=scikit-learn&logoColor=white" />
  <img src="https://img.shields.io/badge/NLP-4B8BBE?style=flat-square&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/OpenCV-5C3EE8?style=flat-square&logo=opencv&logoColor=white" />
</p>

---

## 📸 Screenshots

<!-- Add 3-5 screenshots of your application here -->

<!-- Example:
![Dashboard](screenshots/dashboard.png)
![Document Analysis](screenshots/document-analysis.png)
![Similarity Results](screenshots/similarity-results.png)
![Plagiarism Heatmap](screenshots/heatmap.png)
-->

---

## ✨ Features

### 📝 Text Plagiarism Detection

- Compare submitted documents against reference documents
- Detect direct textual similarities
- Identify paraphrased and semantically similar content
- Generate an overall similarity/plagiarism score
- Highlight potentially copied sections

### 🧠 Semantic Similarity Analysis

The system goes beyond simple keyword matching by using NLP-based techniques to identify similarities in meaning.

Supported approaches include:

- TF-IDF
- Cosine Similarity
- Word embeddings
- BERT-based semantic comparison
- Text preprocessing and normalization

### 🖼️ Image Plagiarism Detection

- Detect similarities between images embedded in documents
- Compare visual features using image processing techniques
- Support feature-based image comparison
- Detect modified or visually similar images

Image analysis can utilize techniques such as:

- ORB
- SIFT
- Feature matching
- Image similarity comparison

### 📊 Interactive Analysis Dashboard

- Overall plagiarism percentage
- Text similarity score
- Image similarity score
- Similarity distribution
- Document comparison results
- Visual charts and analytics
- Similarity heatmaps

### 🤖 AI-Generated Content Analysis

The system can be extended to analyze text for patterns associated with AI-generated content, providing an additional layer of document integrity analysis.

### 📚 Citation & Content Integrity

- Identify potentially duplicated content
- Assist in reviewing document originality
- Provide similarity-based feedback to users
- Support better citation and attribution practices

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend | Python, Flask |
| Machine Learning | Scikit-learn |
| NLP | TF-IDF, Cosine Similarity, BERT |
| Image Processing | OpenCV |
| Deep Learning | PyTorch / TensorFlow |
| Visualization | Chart.js / Recharts |
| Data Processing | Pandas, NumPy |
| API | REST API |

---

## 🏗️ System Architecture

```text
                       ┌──────────────────────┐
                       │        User          │
                       └──────────┬───────────┘
                                  │
                                  ▼
                       ┌──────────────────────┐
                       │    React Frontend    │
                       │ Upload & Dashboard   │
                       └──────────┬───────────┘
                                  │
                              REST API
                                  │
                                  ▼
                       ┌──────────────────────┐
                       │    Flask Backend     │
                       └──────────┬───────────┘
                                  │
                 ┌────────────────┼────────────────┐
                 │                │                │
                 ▼                ▼                ▼
        ┌────────────────┐ ┌──────────────┐ ┌───────────────┐
        │ Text Analysis  │ │Image Analysis│ │ AI Detection  │
        │     Engine     │ │    Engine    │ │    Module     │
        └───────┬────────┘ └──────┬───────┘ └───────┬───────┘
                │                 │                 │
                ▼                 ▼                 ▼
        ┌─────────────────────────────────────────────────┐
        │              Similarity Analysis Engine         │
        └───────────────────────┬─────────────────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   Results & Analytics   │
                    │ Score / Heatmap / Chart  │
                    └─────────────────────────┘
