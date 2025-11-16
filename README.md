# DevStudio IDE - Secure Encrypted Communication

A professional IDE-styled interface for secure, encrypted real-time communication. Disguised as a development environment for privacy.

## 🚀 Features

- **🔒 End-to-End Encryption**: AES encryption for all messages
- **💬 Real-time Chat**: Instant messaging with Supabase real-time subscriptions
- **🎭 Stealth Mode**: Disguised as a professional IDE (DevStudio)
- **🔐 Encryption Tools**: Built-in encryption/decryption interface
- **👤 User Authentication**: Secure login system
- **📱 Responsive Design**: Works on desktop and mobile
- **🎨 Professional UI**: Clean, modern interface resembling VS Code

## 🛠️ Technologies Used

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Framework**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (Authentication + Real-time Database)
- **Encryption**: CryptoJS (AES-256)
- **Icons**: Lucide React
- **Routing**: React Router DOM

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Gayathri16401/devstudio-ide.git
   cd devstudio-ide
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:8080`

## 🗄️ Database Setup

Run the SQL migrations in your Supabase project:

1. Go to Supabase Dashboard → SQL Editor
2. Run the migrations from `supabase/migrations/` folder
3. Enable Row Level Security (RLS) policies

## 👤 Author

**Gayathri Saravanan**
- GitHub: [@Gayathri16401](https://github.com/Gayathri16401)
