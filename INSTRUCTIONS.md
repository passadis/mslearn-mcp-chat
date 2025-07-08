<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=azure,nextjs,ai,ts,nodejs,vscode" />
  </a>
</p>

<h1 align="center">AI Chatbot for Microsoft Learn</h1>


This project is a Next.js web application that acts as an intelligent chatbot for the Microsoft Learn platform. It uses the official Microsoft Learn MCP Server to retrieve documentation and the Azure OpenAI API to synthesize concise answers.

## How It Works

The application uses a two-step "Retrieve and Synthesize" pattern:

1.  **Retrieve:** The Next.js backend sends a request to the `https://learn.microsoft.com/api/mcp` endpoint to fetch context relevant to the user's query.
2.  **Synthesize:** The retrieved documentation (up to 10 content chunks) is then passed to the LLM API along with the original user question. Azure OpenAI generates a helpful, summarized answer based only on the provided context.

## Prerequisites

Before you begin, ensure you have the following installed:

* [**Node.js**](https://nodejs.org/en/): Version 18.17 or later.
* [**Visual Studio Code**](https://code.visualstudio.com/) (Recommended): Or any other code editor.

## Project Setup Instructions

### Step 1: Create a New Next.js Project

Open your terminal and run the following commands to create and navigate into a new Next.js project.

npx create-next-app@latest mcp-learn-chatbot

cd mcp-learn-chatbot

When prompted by the installer, use these settings:

* Would you like to use TypeScript? **No**
* Would you like to use ESLint? **Yes**
* Would you like to use Tailwind CSS? **Yes**
* Would you like to use the `src/` directory? **No**
* Would you like to use App Router? **No** (Important for this setup)
* Would you like to customize the default import alias? **No**

### Step 2: Set Up Environment Variables

For the application to connect to the LLM (Azure OpenAI, Gemini) API, you will need an API key.

1.  Create a new file in the root of your project directory named `.env.local`.
2.  Add your LLM API key to this file:
    ```
    AZURE_OPENAI_ENDPOINT=
    AZURE_OPENAI_KEY=
    AZURE_OPENAI_DEPLOYMENT_NAME=
    ``` OR
    GEMINI_API_KEY=
    

### You will find the file mcp-gemini.js in the API directory. 
**This is used explicitly if you want to use Google's Gemini Models. You need to rename the file to mcp.js or copy the entire code since Gemini uses different approach for the synthesis and the analysis.**
    

### Step 3: Create the API Route

1.  Navigate to the `pages/api/` directory.
2.  Create a new file named `mcp.js`.
3.  Copy and paste the complete code for the API route into this file. This code handles the communication with both the MCP Server and the Azure OpenAI API.
    *(We have also an alternative with Google Gemini API ).*

### Step 4: Create the Frontend Page

1.  Navigate to the `pages/` directory.
2.  Open the `index.js` file and delete all of its existing content.
3.  Copy and paste the complete code for the chat interface into this file.
    

### Step 5: Run the Development Server

Open your terminal in the project's root directory and run the following command:

npm run dev

The application will now be running. Open your web browser and navigate to **http://localhost:3000** to start chatting with your new AI assistant for Microsoft Learn!

## Contribution
Contributions are welcome! If you have suggestions or improvements, feel free to fork the repository, make your changes, and submit a pull request.

### To the Microsoft Docs Community Team & MCP Server Creators,

A huge **thank you** for creating and sharing the Microsoft Learn MCP Server! 🙏

Your work on this powerful tool has opened up incredible new possibilities for developers looking to build intelligent applications on top of the Microsoft Learn platform. The ability to programmatically access the wealth of knowledge in the official documentation is a game-changer.

We truly appreciate the effort, the clear documentation on GitHub, and your commitment to empowering the developer community. This project was a fantastic learning experience, and it wouldn't have been possible without your innovation.

Keep up the amazing work! 🚀

Best regards,

A very curious and excited developer! 😊
