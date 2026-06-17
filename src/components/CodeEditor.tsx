
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Save } from "lucide-react";

const CodeEditor = () => {
  const [code] = useState(`// Express.js Web Server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Database configuration
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'production_db',
  user: 'admin',
  password: process.env.DB_PASSWORD
};

// Routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.query('SELECT * FROM users');
    res.json(users.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }
  
  // Authentication logic here
  const user = await authenticateUser(username, password);
  
  if (user) {
    const token = generateJWT(user);
    res.json({ token, user });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Server startup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});

module.exports = app;`);

  return (
    <div className="h-full flex flex-col dark:bg-slate-900 bg-gray-50">
      <div className="flex items-center justify-between p-2 border-b dark:border-slate-700 border-gray-300">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="dark:text-slate-400 text-gray-600 dark:hover:text-slate-200 hover:text-gray-900 dark:hover:bg-slate-700 hover:bg-gray-200">
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button variant="ghost" size="sm" className="dark:text-slate-400 text-gray-600 dark:hover:text-slate-200 hover:text-gray-900 dark:hover:bg-slate-700 hover:bg-gray-200">
            <Play className="w-4 h-4 mr-1" />
            Run
          </Button>
        </div>
        <div className="text-xs dark:text-slate-500 text-gray-500">
          main.tsx • Modified
        </div>
      </div>
      
      <div className="flex-1 flex">
        {/* Line numbers */}
        <div className="dark:bg-slate-800 bg-gray-100 dark:text-slate-500 text-gray-600 text-sm font-mono p-4 pr-2 select-none border-r dark:border-slate-700 border-gray-300">
          {code.split('\n').map((_, index) => (
            <div key={index} className="leading-6">
              {index + 1}
            </div>
          ))}
        </div>
        
        {/* Code content */}
        <div className="flex-1 overflow-auto">
          <pre className="text-sm font-mono p-4 leading-6">
            <code
              className="dark:text-slate-100 text-gray-900"
              dangerouslySetInnerHTML={{
                __html: code
                  .replace(/\/\/.*$/gm, '<span class="text-slate-500">$&</span>')
                  .replace(/('|").*?\1/g, '<span class="text-green-400">$&</span>')
                  .replace(/\b(const|let|var|function|async|await|if|else|try|catch|return|require|module|exports)\b/g, '<span class="text-blue-400">$&</span>')
                  .replace(/\b(express|app|cors|helmet|process|console|JSON)\b/g, '<span class="text-yellow-400">$&</span>')
                  .replace(/\b\d+\b/g, '<span class="text-orange-400">$&</span>')
              }}
            />
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
