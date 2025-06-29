# Smart Lost & Found App

A production-ready React Native app built with Expo that helps people report and find lost items using smart matching algorithms.

## 🚀 Features

- **Smart Matching System**: Automatically matches lost and found items based on category and location
- **Real-time Location**: Captures device location for accurate reporting
- **Points & Rewards**: Users earn points for successful matches
- **Secure Authentication**: Email/password authentication with Supabase
- **Cross-platform**: Works on Web, iOS, and Android

## 🛠 Technologies Used

- **Frontend**: React Native, Expo SDK 52, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Navigation**: Expo Router 4
- **Styling**: React Native StyleSheet
- **Icons**: Lucide React Native
- **Fonts**: Inter (Google Fonts)

## 📱 Live Demo

- **Web App**: [Deploy to see live demo]
- **GitHub Repository**: [Your GitHub URL here]

## 🔧 Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/smart-lost-found.git
cd smart-lost-found
npm install
```

### 2. Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update `.env` with your Supabase credentials:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key from Settings → API
3. Run the SQL migration from `supabase/migrations/20250629155559_fading_meadow.sql`
4. Disable email confirmation in Authentication → Settings

### 4. Run the App

```bash
# Start development server
npm run dev

# Build for web
npm run build:web
```

## 🗄️ Database Schema

The app uses the following main tables:

- **profiles**: User profiles with reward points
- **lost_items**: Items reported as lost
- **found_items**: Items reported as found  
- **item_matches**: Matched lost and found items

## 🔐 Security Features

- Row Level Security (RLS) enabled on all tables
- Secure authentication with Supabase Auth
- Location data privacy protection
- Input validation and sanitization

## 📊 Core Functionality

### Smart Matching Algorithm

When a found item is reported, the system:
1. Searches for lost items in the same category
2. Creates matches and awards 10 points to the finder
3. Notifies both users of the match

### Points System

- **10 points** for each successful match
- Points displayed in user profile
- Achievement system for milestones

## 🚀 Deployment

### Web Deployment (Netlify/Vercel)

1. Build the project: `npm run build:web`
2. Deploy the `dist` folder to your hosting provider
3. Set environment variables in your hosting dashboard

### Mobile Deployment

1. Create development build: `expo build`
2. Submit to app stores using Expo Application Services (EAS)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@smartlostandfound.com or create an issue in this repository.

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |

## 📱 Screenshots

[Add screenshots of your app here]

---

Built with ❤️ using Expo and Supabase