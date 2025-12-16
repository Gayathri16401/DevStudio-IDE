import { Button } from "@/components/ui/button";
import { Play, Save } from "lucide-react";

const PackageJsonViewer = () => {
  const code = `{
  "name": "sample-web-app",
  "private": true,
  "version": "1.2.4",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "webpack --mode production",
    "test": "jest --coverage"
  },
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.4.0",
    "lodash": "^4.17.21",
    "moment": "^2.29.4",
    "dotenv": "^16.0.3",
    "cors": "^2.8.5",
    "body-parser": "^1.20.2",
    "mongoose": "^7.3.1",
    "jsonwebtoken": "^9.0.1",
    "bcrypt": "^5.1.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "webpack": "^5.88.1",
    "webpack-cli": "^5.1.4",
    "jest": "^29.6.1",
    "@types/node": "^20.4.2",
    "eslint": "^8.45.0",
    "prettier": "^3.0.0"
  }
}`;

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <div className="flex items-center justify-between p-2 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 hover:bg-slate-700">
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 hover:bg-slate-700">
            <Play className="w-4 h-4 mr-1" />
            Run
          </Button>
        </div>
        <div className="text-xs text-slate-500">
          package.json • Modified
        </div>
      </div>
      
      <div className="flex-1 flex">
        {/* Line numbers */}
        <div className="bg-slate-800 text-slate-500 text-sm font-mono p-4 pr-2 select-none border-r border-slate-700">
          {code.split('\n').map((_, index) => (
            <div key={index} className="leading-6">
              {index + 1}
            </div>
          ))}
        </div>
        
        {/* Code content */}
        <div className="flex-1 overflow-auto">
          <pre className="text-sm font-mono p-4 leading-6 text-slate-100 whitespace-pre">
            {code}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default PackageJsonViewer;

// Made with Bob
