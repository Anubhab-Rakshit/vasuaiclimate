# 🌍 VasuAi - Climate Education Platform

An AI-powered climate education platform that gamifies environmental learning and action through personalized tutoring, real-time data visualization, and community engagement.

![VasuAi Platform](https://img.shields.io/badge/Platform-Climate%20Education-green)
![Next.js](https://img.shields.io/badge/Next.js-14+-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)

## ✨ Features

### 🤖 AI-Powered Learning
- **GAIA AI Tutor**: Personalized climate education powered by Google Gemini AI
- **Adaptive Learning**: AI adjusts content based on user progress and interests
- **Real-time Chat**: Interactive conversations about climate science and solutions

### 📊 Environmental Dashboard
- **Real-time Data**: Live air quality, weather, and environmental metrics
- **Carbon Footprint Tracking**: Personal impact calculator with visualizations
- **Progress Analytics**: Historical data and trend analysis with interactive charts
- **Goal Setting**: Personalized environmental targets and achievement tracking

### 🎮 Gamified Missions
- **Mission Categories**: Energy, Transport, Waste, Water, and Food challenges
- **Difficulty Levels**: Easy, Medium, and Hard missions with appropriate rewards
- **Photo Verification**: Upload proof of completed environmental actions
- **Streak System**: Daily and weekly streaks with bonus rewards
- **Leaderboards**: Community rankings and global challenges

### 👤 User Profiles & Progress
- **Level System**: Experience points and level progression
- **Achievement Badges**: Unlock certifications for environmental milestones
- **Personal Statistics**: Comprehensive impact tracking and analytics
- **Avatar Customization**: Personalized profile with image uploads

### 🌐 Community Features
- **Success Stories**: Share environmental achievements with the community
- **Local Groups**: Discover environmental organizations in your area
- **Event Calendar**: Upcoming eco-friendly events and activities
- **Mentorship**: Connect with experienced environmental advocates
- **Global Challenges**: Participate in worldwide climate action initiatives

### 📚 Learning Hub
- **Structured Courses**: Comprehensive climate education modules
- **Quick Bites**: Short, digestible learning content
- **Progress Tracking**: Course completion and knowledge assessment
- **Certificates**: Earn credentials for completed learning paths

## 🛠️ Tech Stack

### Frontend
- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with custom eco-futurism theme
- **Framer Motion** - Smooth animations and transitions
- **Recharts** - Interactive data visualization
- **Radix UI** - Accessible component primitives

### Backend & Database
- **Supabase** - Authentication, database, and real-time subscriptions
- **PostgreSQL** - Relational database with Row Level Security
- **Vercel Blob** - Image and file storage

### AI & APIs
- **Google Gemini AI** - Climate-focused AI tutoring
- **OpenWeatherMap API** - Real-time environmental data
- **Custom Carbon Calculator** - Personalized footprint calculations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account
- Google Gemini AI API key
- OpenWeatherMap API key

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/vasuai-climate-platform.git
   cd vasuai-climate-platform
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   \`\`\`env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # AI Integration
   GEMINI_API_KEY=your_google_gemini_api_key

   # Environmental Data
   OPENWEATHER_API_KEY=your_openweather_api_key

   # File Storage
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

   # Development
   NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
   \`\`\`

4. **Set up the database**
   Run the SQL scripts in `/scripts` folder to create the database schema:
   \`\`\`sql
   -- Run these in your Supabase SQL editor
   -- 1. Create tables (profiles, missions, user_missions, achievements, etc.)
   -- 2. Set up Row Level Security policies
   -- 3. Populate initial mission data
   \`\`\`

5. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

\`\`\`
vasuai-climate-platform/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles and design tokens
│   ├── layout.tsx         # Root layout with theme provider
│   └── page.tsx           # Main application dashboard
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui component library
│   └── theme-provider.tsx # Dark/light theme management
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── public/               # Static assets and images
├── scripts/              # Database setup and migration scripts
└── README.md            # Project documentation
\`\`\`

## 🎨 Design System

### Color Palette
- **Deep Ocean Blue** (#003f5c) - Primary brand color
- **Forest Green** (#4caf50) - Secondary/success color
- **Sunrise Orange** (#ff7043) - Accent/warning color
- **Sky Blue** (#87ceeb) - Info color
- **Soft White** (#ffffff) - Background
- **Light Mist** (#f8f9fa) - Secondary background

### Typography
- **Headings**: Geist Sans (clean, modern)
- **Body Text**: Geist Sans (readable, accessible)
- **Code**: Geist Mono (technical content)

### Design Principles
- **Eco-futurism Aesthetic**: Nature-inspired with modern technology
- **Glassmorphism Effects**: Translucent elements with backdrop blur
- **Smooth Animations**: Framer Motion for engaging interactions
- **Mobile-first**: Responsive design for all devices

## 🔐 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Authentication**: Secure user management with Supabase Auth
- **Data Validation**: Type-safe forms with Zod schemas
- **Environment Variables**: Secure API key management
- **HTTPS Only**: Secure data transmission

## 📊 Database Schema

### Core Tables
- **profiles** - User information and statistics
- **missions** - Available climate action challenges
- **user_missions** - User progress on missions
- **achievements** - Earned badges and certifications
- **environmental_data** - Personal impact tracking
- **community_posts** - User-generated content

## 🤝 Contributing

We welcome contributions to make VasuAi even better! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use the existing component patterns
- Maintain the eco-futurism design aesthetic
- Add tests for new features
- Update documentation as needed

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

## 🌟 Roadmap

### Phase 1 (Current)
- ✅ AI-powered climate tutor
- ✅ Gamified mission system
- ✅ Real-time environmental data
- ✅ User profiles and progress tracking
- ✅ Community features

### Phase 2 (Upcoming)
- 🔄 Mobile app (React Native)
- 🔄 Offline mode support
- 🔄 Advanced AI recommendations
- 🔄 Corporate sustainability tracking
- 🔄 Integration with IoT devices

### Phase 3 (Future)
- 📋 AR/VR learning experiences
- 📋 Blockchain-based carbon credits
- 📋 Global policy impact tracking
- 📋 AI-generated personalized action plans

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Climate Scientists** - For providing the scientific foundation
- **Environmental Organizations** - For mission inspiration and validation
- **Open Source Community** - For the amazing tools and libraries
- **Beta Testers** - For feedback and suggestions

## 📞 Support

- **Documentation**: [Project Wiki](https://github.com/yourusername/vasuai-climate-platform/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/vasuai-climate-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/vasuai-climate-platform/discussions)
- **Email**: support@vasuai.com

---

**Made with 💚 for our planet's future**

*VasuAi - Empowering climate action through AI-driven education and community engagement*
