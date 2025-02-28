import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin, message } from 'antd';
import { UserOutlined, TeamOutlined, ClockCircleOutlined, RocketOutlined } from '@ant-design/icons';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPlayers: 0,
    activePlayers: 0,
    averagePlaytime: 0,
    totalSessions: 0
  });
  const [playerData, setPlayerData] = useState([]);
  const [eventData, setEventData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);

  useEffect(() => {
    console.log('Dashboard component mounted, fetching data...');
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    setLoading(true);
    
    // Hardcoded data for demonstration
    const statsData = {
      totalPlayers: 24567,
      activePlayers: 1283,
      averagePlaytime: 47,
      totalSessions: 53291
    };
    
    const playerTrends = [
      { name: 'Jan', players: 4000 },
      { name: 'Feb', players: 4500 },
      { name: 'Mar', players: 5100 },
      { name: 'Apr', players: 4800 },
      { name: 'May', players: 5300 },
      { name: 'Jun', players: 6200 },
      { name: 'Jul', players: 7100 }
    ];
    
    const eventsData = [
      { name: 'Game Start', count: 8200 },
      { name: 'Level Complete', count: 5400 },
      { name: 'Item Collected', count: 12300 },
      { name: 'Enemy Defeated', count: 9800 },
      { name: 'Game Over', count: 7600 }
    ];
    
    const devicesData = [
      { name: 'PC', value: 50 },
      { name: 'Mobile', value: 50 },
    ];
    
    // Set the data
    setStats(statsData);
    setPlayerData(playerTrends);
    setEventData(eventsData);
    setDeviceData(devicesData);
    
    console.log('Dashboard data loaded successfully:', {
      statsData,
      playerTrends,
      eventsData,
      devicesData
    });
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Game Overview Dashboard</h1>
      
      <Row gutter={16}>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic 
              title="Total Players" 
              value={stats.totalPlayers} 
              prefix={<UserOutlined />} 
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic 
              title="Active Players" 
              value={stats.activePlayers} 
              prefix={<TeamOutlined />} 
              valueStyle={{ color: '#0050b3' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic 
              title="Avg. Playtime (min)" 
              value={stats.averagePlaytime} 
              prefix={<ClockCircleOutlined />} 
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic 
              title="Total Sessions" 
              value={stats.totalSessions} 
              prefix={<RocketOutlined />} 
              valueStyle={{ color: '#fa541c' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Monthly Player Count" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={playerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="players" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Top Game Events" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={eventData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d">
                  {eventData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Card title="Players by Device" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;