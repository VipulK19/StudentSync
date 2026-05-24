# StudentSync

StudentSync is a modern, maintainable React + TypeScript Single Page Application (SPA) designed as an attendance monitoring system. 
It features a premium dark glassmorphism design and utilizes `localStorage` for business logic to provide authentication, geofencing, timetable management, attendance analytics, and real-time notifications.

## Features

- **Role-Based Dashboards**: Distinct dashboards for Student, Parent, and Admin roles.
- **Attendance Monitoring**: Keep track of student check-ins and check-outs with manual controls.
- **Geofencing Simulation**: Ensures students check in from allowed locations.
- **Analytics & Notifications**: Real-time insights and automated email notifications (via EmailJS).
- **Premium UI**: Modern dark theme with glassmorphism design and smooth animations.

## Technologies Used

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Backend/Storage Simulation**: LocalStorage & Firebase (optional/analytics)
- **Email Service**: EmailJS
- **Styling**: Vanilla CSS (Dark Glassmorphism Theme)

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/VipulK19/StudentSync.git
   cd StudentSync
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open the application in your browser at `http://localhost:5173`.

### Building for Production

To create a production build, run:
```bash
npm run build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
