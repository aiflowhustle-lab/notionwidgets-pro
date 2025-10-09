# NotionWidgets Pro

Transform your Notion images into beautiful, embeddable widgets that automatically sync with your database.

## Features

- 🔗 **Multi-Source Support**: Connect images from Notion attachments, external links, and Canva designs
- 🎯 **Smart Filtering**: Filter by platform (Instagram, TikTok, Others) and status
- 🔄 **Auto-Sync**: Widgets automatically update when you add new content to your Notion database
- 📱 **Responsive Design**: Beautiful grid layouts that work on all devices
- 🎨 **Customizable**: Choose grid columns, aspect ratios, and default filters
- 🔒 **Secure**: Encrypted Notion tokens and Firebase authentication

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Firebase Admin SDK
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Google OAuth)
- **External APIs**: Notion API
- **Styling**: Tailwind CSS, Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+ 
- Firebase project
- Notion integration

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd notionwidgets-pro
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Configure your `.env.local` file with your Firebase and Notion credentials.

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Firebase Web Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="your_private_key"

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Google Authentication
3. Create a Firestore database
4. Generate a service account key for the Admin SDK
5. Update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /widgets/{widgetId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## Notion Setup

1. Create a Notion integration at [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Create a database with the following properties:
   - **Name** (Title)
   - **Publish Date** (Date)
   - **Attachment** (Files & media)
   - **Link** (URL)
   - **Canva Link** (URL)
   - **Image Source** (Select: Link, Image Attachment, Canva)
   - **Platform** (Select: Instagram, Tiktok, Others)
   - **Status** (Status: Not started, In progress, Done)
3. Share the database with your integration
4. Get the database ID from the URL

## Usage

1. **Sign in** with your Google account
2. **Create a widget** by providing:
   - Widget name
   - Notion integration token
   - Database ID
   - Optional settings (grid columns, filters, etc.)
3. **Get your widget URL** and embed code
4. **Share or embed** your widget anywhere

## Project Structure

```
notionwidgets-pro/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── (public)/          # Public widget pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
├── lib/                   # Utility functions
├── types/                 # TypeScript types
└── public/               # Static assets
```

## API Endpoints

- `POST /api/widgets/create` - Create a new widget
- `GET /api/widgets/list` - Get user's widgets
- `DELETE /api/widgets/[id]` - Delete a widget
- `GET /api/widgets/[slug]/data` - Get widget data (public)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, email support@notionwidgetspro.com or create an issue on GitHub.
