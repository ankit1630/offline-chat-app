from flask import Flask, jsonify, request
from flask_restful import Api
from zipfile import ZipFile

# import transformers
# from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig, pipeline

from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import LLMChainExtractor
from langchain.embeddings.sentence_transformer import SentenceTransformerEmbeddings
from langchain.text_splitter import CharacterTextSplitter, RecursiveCharacterTextSplitter, TextSplitter
from langchain_community.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Qdrant, Chroma
from langchain.chains import RetrievalQA
from langchain.document_loaders import UnstructuredFileLoader, TextLoader, JSONLoader, PyPDFLoader
from langchain.llms import LlamaCpp, GPT4All
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate 
from langchain.prompts import SystemMessagePromptTemplate, ChatPromptTemplate, HumanMessagePromptTemplate
from qdrant_client.http import models
from qdrant_client import QdrantClient
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.callbacks.manager import CallbackManager
from langchain_community.document_loaders.csv_loader import CSVLoader
from sentence_transformers import CrossEncoder
import json

import openai
# from langchain.llms import OpenAI
from langchain_openai import ChatOpenAI, OpenAI
import shutil
import tqdm, os

from flask_cors import CORS

config_file_path = 'params.json'

with open(config_file_path, 'r') as config_file:
    config_data = json.load(config_file)
    config = config_data.get('config', {})


hal_model = CrossEncoder('vectara/hallucination_evaluation_model')

# Initiate the memory

memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True,
        output_key='answer'
    )


def get_memory():
    return memory

def reset_memory_rag():
    global memory
    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True,
        output_key='answer'
    )
    return memory


# qdrant_client = QdrantClient(
#     url=config['url'], 
#     api_key=config['qdrant_api_key'],
# )

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:8081"}})
api = Api(app)

@app.route('/', methods=['GET'])
def home_route():
    return "fgfd"

@app.route('/api/file_upload', methods=['POST'])
def file_ingestion():
    
    print(request.files)
    print(request.headers)
    # Check if the POST request has the file part
    if 'file' not in request.files:
        return "No file part"

    uploaded_file = request.files['file']

    # Check if a file is selected
    if uploaded_file.filename == '':
        return "No selected file"
    
    print(uploaded_file.filename.lower())
    
    # Check if the file type is allowed
    if uploaded_file.filename.lower().endswith((".txt", ".pdf", ".docx", ".xlsx", ".pptx", ".csv", ".html", ".json")):
        
        embedding_function = HuggingFaceEmbeddings(model_name=config['embedding_model'], cache_folder=config['cache_folder'])
        db = Chroma(persist_directory=config['db_path'], embedding_function=embedding_function)
        a = db.get()
        unique_filenames = {os.path.basename(entry['source']) for entry in a['metadatas']}
        already_ingested_files = sorted(list(unique_filenames))
        
        # Check if the file is already ingested
        if uploaded_file.filename in already_ingested_files:
            return f"File '{uploaded_file.filename}' is already ingested."
        
        source_folder = config['source_docs']
        folder_path = os.path.join(source_folder)
        file_path = os.path.join(folder_path,  uploaded_file.filename)
        
        # Save the file in the source folder
        uploaded_file.save(file_path)
        
        if uploaded_file.filename.lower().endswith((".json")):
            loader = JSONLoader(file_path, jq_schema='.content')
            documents = loader.load()
            
        elif uploaded_file.filename.lower().endswith((".csv")):
            loader = CSVLoader(file_path)
            documents = loader.load()
            
        elif uploaded_file.filename.lower().endswith((".pdf")):
            loader = PyPDFLoader(file_path)
            documents = loader.load()
        
        else:
            loader = UnstructuredFileLoader(file_path)
            documents = loader.load()


        # Split documents into chunks
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        texts = text_splitter.split_documents(documents)

        # Select embeddings
        embedding_function = HuggingFaceEmbeddings(model_name=config['embedding_model'], cache_folder=config['cache_folder'])

        # Create a vectorstore from documents
        db = Chroma.from_documents(texts, embedding_function, persist_directory=config['db_path'])
        
        return "Ingesting Done"
        
    else:
        return "Error: Unsupported file type"
    
    

@app.route('/api/folder_upload', methods=['POST'])
def ingest_folder():
    
    try:
        
        # Specify the destination folder path
        source_folder = config['source_docs']
        print("source_folder: ",source_folder)
        
        # Get the list of files and folders in the db directory
        content = os.listdir(config['db_path'])
        print(content)
        if not content:
            file_list = [filename for filename in os.listdir(source_folder) if filename.lower().endswith((".txt", ".pdf", ".docx", ".xlsx", ".pptx", ".csv", ".html", ".json"))]
        else:
            embedding_function = HuggingFaceEmbeddings(model_name=config['embedding_model'], cache_folder=config['cache_folder'])
            db = Chroma(persist_directory=config['db_path'], embedding_function=embedding_function)
            a = db.get()
            unique_filenames = {os.path.basename(entry['source']) for entry in a['metadatas']}
            already_ingested_files = sorted(list(unique_filenames))
            print(already_ingested_files)
            file_list = [filename for filename in os.listdir(source_folder) if filename.lower().endswith((".txt", ".pdf", ".docx", ".xlsx", ".pptx", ".csv", ".html", ".json")) and filename not in already_ingested_files ]
        
        print("to_be_ingested:", file_list)

        if len(file_list) > 0:
            for i, filename in tqdm.tqdm(enumerate(file_list)):
                try:
                    print(filename)
                    file_path = os.path.join(source_folder, filename)

                    if file_path.endswith((".json")):
                        loader = JSONLoader(file_path, jq_schema='.content')
                        documents = loader.load()

                    elif file_path.endswith((".csv")):
                        loader = CSVLoader(file_path)
                        documents = loader.load()

                    elif file_path.lower().endswith((".pdf")):
                        loader = PyPDFLoader(file_path)
                        documents = loader.load()

                    else:
                        loader = UnstructuredFileLoader(file_path)
                        documents = loader.load()

                     # Split documents into chunks
                    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
                    texts = text_splitter.split_documents(documents)

                    # Select embeddings
                    embedding_function = HuggingFaceEmbeddings(model_name=config['embedding_model'], cache_folder=config['cache_folder'])

                    # Create a vectorstore from documents
                    db = Chroma.from_documents(texts, embedding_function, persist_directory=config['db_path'])
                    
                except Exception as e:
                    print(filename, e)
                    continue

        return jsonify({"output":"Ingestion Complete"})
    
    except Exception as e:  # Catch any general exception
        return jsonify({"output": "Ingestion Incomplete", "error": str(e)})
    
    
    
@app.route('/api/get_answer', methods=['POST'])
def get_answer():
    inputs = request.json
    query = inputs['query']
    no_of_source = inputs['no_of_source']
    qa_prompt = inputs['user_prompt']
    doc_search_criteria = inputs["search_type"]
    reset_memory = inputs["reset_memory"]
    
    print(inputs)
    
    if not qa_prompt:
        # Use a generic QA prompt if user prompt is empty
        qa_prompt = """Answer the question based on the context below. If the
                       question cannot be answered using the information provided answer 'I don't know' """
        
    general_system_template = r"""
        ----
        {context}
        ----
        """
    general_system_template = qa_prompt + "\n" + general_system_template
    general_user_template = "Question:```{question}```"
    messages = [
                SystemMessagePromptTemplate.from_template(general_system_template),
                HumanMessagePromptTemplate.from_template(general_user_template)
    ]
    prompt = ChatPromptTemplate.from_messages(messages)

    # print(prompt)
    
    
    embedding_function = HuggingFaceEmbeddings(model_name=config['embedding_model'], cache_folder=config['cache_folder'])
    
    # qdrant_client = QdrantClient(url=url, api_key=api_key)
    db = Chroma(persist_directory=config['db_path'], embedding_function=embedding_function)
    retriever = db.as_retriever(search_type="similarity", search_kwargs={"k": no_of_source})
        
    llm = LlamaCpp(
        streaming = True,
        model_path=config['phi_model_path'],
        temperature=0.75,
        top_p=1,
        verbose=True,
        n_ctx=512,
        n_gpu_layers=-1,
        n_batch=1000,
        max_tokens = 100,
        callback_manager = CallbackManager([StreamingStdOutCallbackHandler()])
    )
    
    get_new_memory = None
    if reset_memory:
        get_new_memory = reset_memory_rag()
    get_new_memory = get_memory()
        
    # qa_chain = RetrievalQA.from_chain_type(llm=llm, chain_type='refine', retriever=retriever, return_source_documents=True)
    qa_chain = ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=retriever,
            memory=get_new_memory,
            return_source_documents=True,
            combine_docs_chain_kwargs={"prompt": prompt},
        )

    # Run QA
    # result = qa_chain({"query": query})
    result = qa_chain({"question": query})


    # hal_score = hal_model.predict([result['question'],result['answer']])


    new_result = {}
    new_result["question"] = result["question"]
    new_result["answer"] = result["answer"]

    result_list = []
    for document in result["source_documents"]:
        result_dict = {
            'page_content': document.page_content,
            'metadata': document.metadata
        }
        result_list.append(result_dict)

    # print(result_list)
    new_result["source_documents_list"] = result_list
    
    # if hal_score > 0.3:
    #     new_result["is_hallucination"] = False
    # else:
    #     new_result["is_hallucination"] = True
        
    print(result)
    
    # result = qa.run(query)
    return jsonify(new_result)


if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=False, port=5002)