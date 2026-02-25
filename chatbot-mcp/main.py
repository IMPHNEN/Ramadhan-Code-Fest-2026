from fastmcp import FastMCP
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv
import chromadb
from sentence_transformers import SentenceTransformer
from datetime import datetime
from sys_prompt import system_prompt

load_dotenv()

sql = create_engine(
    f"mysql+pymysql://{os.getenv('DB_USER')}:@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
)

mcp = FastMCP("sql-mcp")
db = chromadb.PersistentClient(path="./faq_db")
collection = db.get_or_create_collection(name="faq_docs")


@mcp.prompt()
def sys_prompt():
    return system_prompt()


@mcp.tool()
def create_ticket(
    user_id: int,
    title: str,
    description: str,
    category: str,
    priority: str,
) -> str:
    """
    Create a new support ticket in the database.
    category must be one of: internet, signal, billing.
    priority must be one of: low, medium, high.
    status_ticket is automatically set to 'open'.
    """
    valid_categories = {"internet", "signal", "billing"}
    valid_priorities = {"low", "medium", "high"}

    if category not in valid_categories:
        return f"Invalid category '{category}'. Must be one of: {', '.join(valid_categories)}"
    if priority not in valid_priorities:
        return f"Invalid priority '{priority}'. Must be one of: {', '.join(valid_priorities)}"

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    query = text("""
        INSERT INTO tickets (user_id, title, description, category, status, priority, created_at, updated_at)
        VALUES (:user_id, :title, :description, :category, 'open', :priority, :now, :now)
    """)

    try:
        with sql.connect() as conn:
            result = conn.execute(
                query,
                {
                    "user_id": user_id,
                    "title": title,
                    "description": description,
                    "category": category,
                    "priority": priority,
                    "now": now,
                },
            )
            conn.commit()
            return f"Ticket created successfully! Ticket ID: {result.lastrowid}, Status: open, Priority: {priority}"
    except Exception as e:
        return f"Failed to create ticket: {str(e)}"


@mcp.tool()
def find_or_create_user(name: str, email: str, phone_number: str, address: str) -> str:
    """
    Find user by email or phone number. If not found, create a new user.
    """
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    query = text("""
        SELECT id, name, email, phone_number, address FROM users WHERE email = :email OR phone_number = :phone_number
    """)

    try:
        with sql.connect() as conn:
            result = conn.execute(query, {"email": email, "phone_number": phone_number})
            user = result.fetchall()
            if user:
                return f"User found with ID {user[0]['id']}"
            else:
                add_user = text("""
                INSERT INTO users (name, email, phone_number, address, created_at, updated_at)
                VALUES (:name, :email, :phone_number, :address, :now, :now)
                """)
                result = conn.execute(
                    add_user,
                    {
                        "name": name,
                        "email": email,
                        "phone_number": phone_number,
                        "address": address,
                        "now": now,
                    },
                )
                conn.commit()
                return f"User created successfully! User ID: {result.lastrowid}"
    except Exception as e:
        return f"Failed to find or create user: {str(e)}"


@mcp.tool()
def execute_query(query: str) -> str:
    """
    Execute a raw SQL query (SELECT, INSERT, UPDATE only). DELETE is forbidden.
    Use this only for complex or admin-level queries.
    """
    query_upper = query.strip().upper()

    if query_upper.startswith("DELETE"):
        return "Delete is not allowed"

    try:
        with sql.connect() as conn:
            result = conn.execute(text(query))

            if query_upper.startswith("SELECT"):
                rows = result.fetchall()
                if rows:
                    return str(rows)
                else:
                    return "No results"
            else:
                conn.commit()
                return f"Query executed successfully. Rows affected: {result.rowcount}"

    except Exception as e:
        return str(e)


@mcp.tool()
def save_faq_docs() -> str:
    """
    Query from database to get faq docs and save to local vector database
    """
    data = []

    try:
        with sql.connect() as conn:
            result = conn.execute(text("SELECT question, answer FROM faq_docs"))
            rows = result.fetchall()
    except Exception as e:
        return f"Failed to fetch FAQ data: {str(e)}"

    if not rows:
        return "No FAQ data found in the database."

    for row in rows:
        data.append({"question": row[0], "answer": row[1]})

    vector = SentenceTransformer("all-MiniLM-L6-v2")
    questions = [doc["question"] for doc in data]
    embed_data = vector.encode(questions)

    collection.upsert(
        documents=questions,
        metadatas=[{"answer": doc["answer"]} for doc in data],
        ids=[str(i) for i in range(len(data))],
        embeddings=embed_data.tolist(),
    )

    return f"FAQ docs saved to vector database. Total documents: {len(data)}"


if __name__ == "__main__":
    mcp.run(transport="streamable-http", port=5000)
