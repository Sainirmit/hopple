# Hopple - AI-Powered Project Management

Hopple is an advanced project management system that leverages AI agents to automate and enhance various aspects of project management.

## 🌟 Features

- **Task Management**: Automated creation, prioritization, and assignment of tasks
- **Meeting Summarization**: AI-driven summarization of meeting transcripts with action item extraction
- **Worker Assignment**: Intelligent matching of tasks with team members based on skills and availability
- **Multiple AI Integration**: Leveraging various LLMs to provide the best possible outputs

## 🏗️ Architecture

Hopple uses a multi-agent architecture:

- **Project Management Agent**: The core agent that coordinates all activities
- **Sub-agents**: Specialized agents for specific tasks (Task Creation, Prioritization, etc.)
- **Database Integration**: Agents can read, write, update, and delete information from a shared database

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Ollama for running Mistral 7B locally

### Installation

1. Clone the repository

```bash
git clone https://github.com/sainirmit/hopple.git
cd hopple
```

2. Install dependencies

```bash
pip install -r requirements.txt
```

3. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run the application

```bash
python -m hopple.main
```

## 🧪 Testing

Run tests with pytest:

```bash
pytest
```

## 📝 License

[MIT](LICENSE)

## 🛣️ Roadmap

- [ ] Core agent architecture
- [ ] Database integration
- [ ] Task management capabilities
- [ ] Meeting summarization
- [ ] Worker assignment logic
- [ ] Frontend development
- [ ] Integration with external systems
