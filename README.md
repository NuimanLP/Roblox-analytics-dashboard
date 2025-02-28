# Roblox Analytics Dashboard

A web-based analytics dashboard for tracking and visualizing data from a Roblox game.

## Features

- **Dashboard:** Overview of key metrics and statistics
- **Events:** Detailed event tracking and analysis
- **Players:** Player activity and retention metrics
- **Configuration:** Settings for data collection and dashboard preferences

## Tech Stack

- **Frontend:** React.js with Ant Design UI components
- **Charting:** Recharts for data visualization
- **API Integration:** Axios for data fetching

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone 
   cd roblox-analytics-dashboard
   ```

2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Development

### Project Structure

```
frontend/
├── public/
├── src/
│   ├── api/            # API services and data fetching
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   │   ├── Dashboard/  # Dashboard page
│   │   ├── Events/     # Events page
│   │   ├── Players/    # Players page
│   │   └── Config/     # Configuration page
│   ├── utils/          # Utility functions
│   ├── App.js          # Main application component
│   ├── index.js        # Entry point
│   └── ...
└── ...
```

### Building for Production

To create a production build:

```bash
npm run build
```

## Acknowledgements

- [React](https://reactjs.org/)
- [Ant Design](https://ant.design/)
- [Recharts](https://recharts.org/)