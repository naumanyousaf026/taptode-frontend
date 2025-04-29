# Taptode Frontend 🌐

A modern React-based frontend application for the Taptode WhatsApp marketing and referral platform. This repository contains the user interface for both admin and regular user roles.



## ✨ Features

- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **Dual Interface**: Separate interfaces for admin and regular users
- **WhatsApp Integration**: Connect and manage WhatsApp marketing campaigns
- **User Management**: Registration, authentication, and profile management
- **Dashboard Analytics**: Visualize marketing performance and referral stats
- **Package Management**: Browse and purchase marketing packages
- **Team Management**: Track and manage your referral network

## 🛠️ Tech Stack

- **Framework**: React.js
- **Styling**: CSS/SCSS with responsive design principles
- **State Management**: React Context API
- **Routing**: React Router
- **Authentication**: JWT-based authentication
- **HTTP Client**: Axios for API communication

## 📂 Project Structure

```
taptode-frontend/
├── public/             # Static files
├── src/                # Source code
│   ├── Admin/          # Admin panel components
│   │   ├── Admin.jsx            # Admin main component
│   │   ├── AdminHeader.jsx      # Admin header component
│   │   ├── AdminLogin.jsx       # Admin login page
│   │   ├── Dashboard.jsx        # Admin dashboard
│   │   ├── EmailRequest.jsx     # Email request handling
│   │   ├── Layout.jsx           # Admin layout wrapper
│   │   ├── ProtectedRoute.jsx   # Admin route protection
│   │   ├── ResetPassword.jsx    # Password reset component
│   │   ├── Setting.jsx          # Admin settings page
│   │   ├── Sidebar.jsx          # Admin sidebar navigation
│   │   ├── SuccessMessage.jsx   # Success notification component
│   │   ├── TeamList.jsx         # Team management interface
│   │   ├── User.jsx             # User management component
│   │   ├── VerifyOTP.jsx        # OTP verification component
│   │   └── WhatsAppGroups.jsx   # WhatsApp group management
│   │
│   ├── component/      # Shared components
│   │   ├── activity/           # Activity-related components
│   │   ├── index/              # Index page components
│   │   ├── invite/             # Referral invite components
│   │   ├── me/                 # User profile components
│   │   ├── Packages/           # Package management
│   │   ├── state/              # State management
│   │   ├── ForgotPassword.jsx  # Password recovery component
│   │   ├── Header.jsx          # Main application header
│   │   ├── Header_1.jsx        # Alternative header design
│   │   ├── Login.jsx           # User login component
│   │   ├── Register.jsx        # User registration component
│   │   ├── ResetPassword.jsx   # Password reset for users
│   │   └── Test.jsx            # Test component
│   │
│   ├── context/        # React context providers
│   ├── images/         # Image assets
│   ├── utils/          # Utility functions
│   ├── App.css         # Main application styles
│   ├── App.jsx         # Root application component
│   └── index.css       # Global CSS styles
│
├── package.json        # Project dependencies
├── README.md           # This documentation
└── .gitignore          # Git ignore file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Taptode Backend API (running locally or deployed)

### Installation

```bash
# Clone the repository
git clone https://github.com/naumanyousaf026/taptode-frontend.git

# Navigate to project directory
cd taptode-frontend

# Install dependencies
npm install
# or
yarn install

# Create environment file
cp .env.example .env
# Edit .env to set your API endpoint

# Start the development server
npm start

```

### Environment Configuration

Create a `.env` file with the following variables:

```
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_WHATSAPP_API=http://localhost:3000
```

## 📱 Key Components

### Admin Panel

- **Dashboard**: Analytics overview of marketing performance
- **User Management**: View and manage platform users
- **WhatsApp Groups**: Create and manage WhatsApp marketing campaigns
- **Team List**: View and manage referral networks
- **Settings**: Configure platform settings

### User Interface

- **Login/Register**: User authentication workflows
- **Profile**: User profile management
- **Packages**: Browse and purchase marketing packages
- **Activity**: Track marketing activity and performance
- **Invite**: Create and manage referral links

## 🔒 Security Features

- Protected routes requiring authentication
- OTP-based verification
- JWT token management
- Session timeout handling

## 🧩 Integration with Backend

The frontend communicates with the Taptode Backend API for all data operations:

- Authentication and user management
- WhatsApp integration
- Package management and purchases
- Referral tracking and rewards
- Activity monitoring



## 📞 Contact

Nauman Yousaf - [GitHub](https://github.com/naumanyousaf026)

---

Made with ❤️ by the Taptode Team