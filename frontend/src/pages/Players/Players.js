import React, { useState, useEffect } from 'react';
import { Table, Card, Input, Button, Tag, Spin, Typography, Tabs, Row, Col, Statistic, Badge, Space, Avatar, Divider } from 'antd';
import { 
  UserOutlined, 
  SearchOutlined, 
  ClockCircleOutlined, 
  TrophyOutlined, 
  TeamOutlined,
  ReloadOutlined,
  MobileOutlined,
  DesktopOutlined,
  QuestionOutlined,
  CalendarOutlined,
  BarChartOutlined,
  DashboardOutlined,
  RiseOutlined,
  ArrowUpOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell} from 'recharts';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const { Title, Text } = Typography;

const Players = () => {
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [sessionData, setSessionData] = useState([]);
  const [sessionDistributionData, setSessionDistributionData] = useState([]);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPlayers: 0,
    activePlayers: 0,
    avgPlayTime: 0,
    avgLevel: 0,
    totalSessions: 0,
    sessionsPerPlayer: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch real data from Firestore
      const querySnapshot = await getDocs(collection(db, "players"));
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      console.log('Fetched Documents:', docs);
      setPlayers(docs);
      
      // Calculate statistics
      const activePlayers = docs.filter(player => player.active).length;
      const totalSessions = docs.reduce((sum, player) => sum + (player.totalSessions || 0), 0);
      const totalPlayTime = docs.reduce((sum, player) => sum + (player.playTime || 0), 0);
      const totalLevels = docs.reduce((sum, player) => sum + (player.level || 0), 0);
      
      const avgPlayTime = docs.length > 0 ? Math.round(totalPlayTime / docs.length) : 0;
      const avgLevel = docs.length > 0 ? (totalLevels / docs.length).toFixed(1) : 0;
      const sessionsPerPlayer = docs.length > 0 ? Math.round(totalSessions / docs.length) : 0;
      
      setStats({
        totalPlayers: docs.length,
        activePlayers,
        avgPlayTime,
        avgLevel,
        totalSessions,
        sessionsPerPlayer
      });

      // Skip retention calculation as it's no longer needed

      // Prepare player session data for charts
      // Count players by session ranges
      const sessionCounts = {
        "0-1": 0,
        "2-5": 0,
        "6-10": 0,
        "11-20": 0,
        "21-50": 0,
        "51+": 0
      };
      
      docs.forEach(player => {
        const sessions = player.totalSessions || 0;
        if (sessions <= 1) sessionCounts["0-1"]++;
        else if (sessions <= 5) sessionCounts["2-5"]++;
        else if (sessions <= 10) sessionCounts["6-10"]++;
        else if (sessions <= 20) sessionCounts["11-20"]++;
        else if (sessions <= 50) sessionCounts["21-50"]++;
        else sessionCounts["51+"]++;
      });
      
      const sessionDistribution = Object.entries(sessionCounts).map(([range, count]) => ({
        range,
        count,
        percentage: docs.length > 0 ? Math.round((count / docs.length) * 100) : 0
      }));
      
      // Set session distribution data
      setSessionDistributionData(sessionDistribution);
      
      // Calculate session data for the last 3 days (since game launch)
      // Get the dates for the last 3 days
      const last3Days = Array.from({ length: 3 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (2 - i)); // Count back from 2 days ago to today
        return date;
      });
      
      // Format the dates for display
      const formattedDates = last3Days.map(date => {
        // Format as "MM/DD" (e.g., "02/25")
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
      });

      // Get day of week names for tooltip and visual reference
      const dayOfWeekNames = last3Days.map(date => {
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
      });
      
      // Create session data for the last 3 days based on actual data
      // Create a map for sessions by date
      const sessionsByDate = {};
      
      // Initialize the last 3 days with zero sessions
      last3Days.forEach((date, index) => {
        const dateStr = formattedDates[index];
        sessionsByDate[dateStr] = 0;
      });
      
      // Count sessions by date using player's lastSeen timestamp
      docs.forEach(player => {
        if (!player.lastSeen || !player.lastSeen.seconds) return;
        
        const lastSeenDate = new Date(player.lastSeen.seconds * 1000);
        const lastSeenDateStr = `${(lastSeenDate.getMonth() + 1).toString().padStart(2, '0')}/${lastSeenDate.getDate().toString().padStart(2, '0')}`;
        
        // If the date is within our 3-day window, count the sessions
        if (sessionsByDate.hasOwnProperty(lastSeenDateStr)) {
          // Add the player's sessions to the count for that day
          sessionsByDate[lastSeenDateStr] += (player.totalSessions || 0);
        }
      });
      
      // Create the final data array for the chart
      const sessionData = last3Days.map((date, index) => {
        const dateStr = formattedDates[index];
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        
        return {
          date: dateStr,
          day: dayOfWeekNames[index],
          sessions: sessionsByDate[dateStr],
          isWeekend
        };
      });
      
      console.log("Calculated session distribution data:", sessionData);
      setSessionData(sessionData);
    } catch (err) {
      console.error('Error fetching documents:', err);
      handleError('Failed to fetch data from Firestore. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleError = (errorMessage) => {
    // Handle error by clearing data and showing an error message
    setPlayers([]);
    setStats({
      totalPlayers: 0,
      activePlayers: 0,
      avgPlayTime: 0,
      avgLevel: 0,
      totalSessions: 0,
      sessionsPerPlayer: 0
    });
    setSessionData([]);
    setSessionDistributionData([]);
    
    setError(errorMessage || 'Failed to load player data from Firestore. Please check your connection and try again.');
  };

  const handleSearch = () => {
    if (!searchText) {
      fetchData();
      return;
    }
    
    const filtered = players.filter(player => {
      const searchLower = searchText.toLowerCase();
      const idMatch = player.id.toString().toLowerCase().includes(searchLower);
      const nameMatch = player.name && player.name.toLowerCase().includes(searchLower);
      return idMatch || nameMatch;
    });
    
    setPlayers(filtered);
  };

  // Format timestamp to readable date
  const formatTimestamp = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleString();
  };

  // Device icon helper
  const getDeviceIcon = (device) => {
    if (!device || device === 'Unknown') return <QuestionOutlined />;
    if (device.toLowerCase().includes('mobile')) return <MobileOutlined />;
    return <DesktopOutlined />;
  };

  const columns = [
    {
      title: 'Player',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <Text strong>{name || `Player ${record.id}`}</Text>
          {record.active && <Badge status="success" />}
        </Space>
      ),
      sorter: (a, b) => {
        const nameA = a.name || `Player ${a.id}`;
        const nameB = b.name || `Player ${b.id}`;
        return nameA.localeCompare(nameB);
      }
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <Text copyable>{id}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active) => (
        <Tag color={active ? 'success' : 'default'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.active === value,
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      render: level => (
        <Space>
          <TrophyOutlined />
          {level || 0}
        </Space>
      ),
      sorter: (a, b) => (a.level || 0) - (b.level || 0),
    },
    {
      title: 'Sessions',
      dataIndex: 'totalSessions',
      key: 'totalSessions',
      sorter: (a, b) => (a.totalSessions || 0) - (b.totalSessions || 0)
    },
    {
      title: 'Device',
      dataIndex: 'device',
      key: 'device',
      render: device => (
        <Space>
          {getDeviceIcon(device)}
          {device || 'Unknown'}
        </Space>
      ),
      filters: [
        { text: 'Desktop', value: 'Desktop' },
        { text: 'Mobile', value: 'Mobile' },
        { text: 'Unknown', value: 'Unknown' },
      ],
      onFilter: (value, record) => (record.device || 'Unknown') === value,
    },
    {
      title: 'Last Seen',
      dataIndex: 'lastSeen',
      key: 'lastSeen',
      render: lastSeen => formatTimestamp(lastSeen),
      sorter: (a, b) => {
        if (!a.lastSeen || !b.lastSeen) return 0;
        return a.lastSeen.seconds - b.lastSeen.seconds;
      },
      defaultSortOrder: 'descend',
    },
    {
      title: 'First Seen',
      dataIndex: 'firstSeen',
      key: 'firstSeen',
      render: firstSeen => formatTimestamp(firstSeen),
    },
  ];

  // Define the tabs items for Ant Design v5
  const tabItems = [
    {
      key: 'overview',
      label: 'Overview',
      children: (
        <>
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: 500 }}>
              Dashboard updated: {new Date().toLocaleString()}
            </Text>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              loading={loading}
              onClick={fetchData}
              size="large"
              style={{
                borderRadius: '6px',
                fontWeight: 500
              }}
            >
              Refresh Data
            </Button>
          </div>
        
          <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={8}>
              <Card 
                hoverable 
                className="stat-card"
                style={{ 
                  background: 'linear-gradient(135deg, #1890ff11 0%, #1890ff05 100%)',
                  borderTop: '3px solid #1890ff',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
                }}
              >
                <Statistic
                  title={<Text strong style={{ fontSize: 16 }}>Total Players</Text>}
                  value={stats.totalPlayers}
                  prefix={<TeamOutlined style={{ background: '#1890ff22', padding: 8, borderRadius: '50%' }} />}
                  valueStyle={{ color: '#1890ff', fontSize: 28, fontWeight: 600 }}
                />
                <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                  <RiseOutlined /> Total registered player count
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card 
                hoverable 
                className="stat-card"
                style={{ 
                  background: 'linear-gradient(135deg, #52c41a11 0%, #52c41a05 100%)',
                  borderTop: '3px solid #52c41a',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
                }}
              >
                <Statistic
                  title={<Text strong style={{ fontSize: 16 }}>Active Players</Text>}
                  value={stats.activePlayers}
                  prefix={<UserOutlined style={{ background: '#52c41a22', padding: 8, borderRadius: '50%' }} />}
                  valueStyle={{ color: '#52c41a', fontSize: 28, fontWeight: 600 }}
                  suffix={<Text type="secondary" style={{ fontSize: 16 }}>{`of ${stats.totalPlayers}`}</Text>}
                />
                <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                  <ArrowUpOutlined /> Currently active players
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card 
                hoverable 
                className="stat-card"
                style={{ 
                  background: 'linear-gradient(135deg, #722ed111 0%, #722ed105 100%)',
                  borderTop: '3px solid #722ed1',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
                }}
              >
                <Statistic
                  title={<Text strong style={{ fontSize: 16 }}>Total Sessions</Text>}
                  value={stats.totalSessions}
                  prefix={<BarChartOutlined style={{ background: '#722ed122', padding: 8, borderRadius: '50%' }} />}
                  valueStyle={{ color: '#722ed1', fontSize: 28, fontWeight: 600 }}
                />
                <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                  <RiseOutlined /> All-time gameplay sessions
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card 
                hoverable 
                className="stat-card"
                style={{ 
                  background: 'linear-gradient(135deg, #fa541c11 0%, #fa541c05 100%)',
                  borderTop: '3px solid #fa541c',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
                }}
              >
                <Statistic
                  title={<Text strong style={{ fontSize: 16 }}>Avg. Play Time</Text>}
                  value={stats.avgPlayTime}
                  prefix={<ClockCircleOutlined style={{ background: '#fa541c22', padding: 8, borderRadius: '50%' }} />}
                  valueStyle={{ color: '#fa541c', fontSize: 28, fontWeight: 600 }}
                  suffix="min"
                />
                <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                  Average time per player
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card 
                hoverable 
                className="stat-card"
                style={{ 
                  background: 'linear-gradient(135deg, #faad1411 0%, #faad1405 100%)',
                  borderTop: '3px solid #faad14',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
                }}
              >
                <Statistic
                  title={<Text strong style={{ fontSize: 16 }}>Avg. Player Level</Text>}
                  value={stats.avgLevel}
                  prefix={<TrophyOutlined style={{ background: '#faad1422', padding: 8, borderRadius: '50%' }} />}
                  valueStyle={{ color: '#faad14', fontSize: 28, fontWeight: 600 }}
                />
                <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                  Average progression level
                </Text>
              </Card>
            </Col>
          </Row>
          
          <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            <Col span={24}>
              <Card 
                title={
                  <div style={{ padding: '12px 0' }}>
                    <CalendarOutlined style={{ color: '#1890ff', marginRight: 10 }} />
                    <Text strong style={{ fontSize: 18 }}>Sessions by Day</Text>
                  </div>
                }
                className="chart-card"
                style={{ 
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
                }}
                headStyle={{ 
                  borderBottom: '1px solid #f0f0f0',
                  padding: '0 24px'
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                  Game sessions since launch (last 3 days)
                </Text>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart 
                    data={sessionData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={{ stroke: '#f0f0f0' }}
                      tickLine={false}
                      tickFormatter={(value, index) => `${value} (${sessionData[index].day})`}
                    />
                    <YAxis 
                      axisLine={{ stroke: '#f0f0f0' }}
                      tickLine={false}
                      label={{ 
                        value: 'Sessions', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fill: '#666', fontSize: 12 } 
                      }}
                    />
                    <Tooltip 
                      labelFormatter={(label, items) => {
                        const item = items[0]?.payload;
                        return item ? `${item.date} (${item.day})` : label;
                      }}
                      formatter={(value) => [`${value} sessions`, 'Sessions']}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '4px',
                        boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
                        border: 'none'
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: 15 }} />
                    <Line 
                      type="monotone" 
                      dataKey="sessions" 
                      name="Game Sessions" 
                      stroke="#1890ff" 
                      strokeWidth={3}
                      dot={{ stroke: '#1890ff', strokeWidth: 2, r: 5, fill: 'white' }}
                      activeDot={{ stroke: '#1890ff', strokeWidth: 2, r: 8, fill: 'white' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          <Row gutter={[24, 24]}>
            <Col span={16}>
              <Card 
                title={
                  <div style={{ padding: '12px 0' }}>
                    <BarChartOutlined style={{ color: '#fa8c16', marginRight: 10 }} />
                    <Text strong style={{ fontSize: 18 }}>Player Session Engagement</Text>
                  </div>
                }
                className="chart-card"
                style={{ 
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
                }}
                headStyle={{ 
                  borderBottom: '1px solid #f0f0f0',
                  padding: '0 24px'
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                  Distribution of players by number of gameplay sessions
                </Text>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={sessionDistributionData} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                    <XAxis 
                      dataKey="range" 
                      axisLine={{ stroke: '#f0f0f0' }}
                      tickLine={false}
                    />
                    <YAxis 
                      allowDecimals={false}
                      axisLine={{ stroke: '#f0f0f0' }}
                      tickLine={false}
                    />
                    <Tooltip 
                      formatter={(value, name, props) => [`${value} players (${props.payload.percentage}%)`, 'Count']} 
                      labelFormatter={(value) => `Sessions: ${value}`}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '4px',
                        boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
                        border: 'none'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: 15 }}
                      iconType="circle"
                    />
                    <Bar 
                      dataKey="count" 
                      name="Number of Players" 
                      fill="#fa8c16" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={8}>
              <Card 
                title={
                  <div style={{ padding: '12px 0' }}>
                    <MobileOutlined style={{ color: '#13c2c2', marginRight: 10 }} />
                    <Text strong style={{ fontSize: 18 }}>Device Distribution</Text>
                  </div>
                }
                className="chart-card"
                style={{ 
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
                }}
                headStyle={{ 
                  borderBottom: '1px solid #f0f0f0',
                  padding: '0 24px'
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                  Player distribution by device type
                </Text>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={players.reduce((result, player) => {
                        const device = player.device || 'Unknown';
                        const existingDevice = result.find(item => item.name === device);
                        
                        if (existingDevice) {
                          existingDevice.value++;
                        } else {
                          result.push({ name: device, value: 1 });
                        }
                        
                        return result;
                      }, [])}
                      cx="50%"
                      cy="50%"
                      labelLine={{ stroke: '#e8e8e8', strokeWidth: 1 }}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {
                        ['Desktop', 'Mobile', 'Unknown'].map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={['#1890ff', '#fa8c16', '#722ed1'][index]} 
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        ))
                      }
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} players`, name]}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '4px',
                        boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
                        border: 'none'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </>
      )
    },
    {
      key: 'list',
      label: 'Player List',
      children: (
        <Card
          style={{ 
            borderRadius: '8px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            overflow: 'hidden'
          }}
          bodyStyle={{ padding: '24px' }}
        >
          <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
            <Input 
              placeholder="Search by Player ID or Name" 
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              style={{ 
                width: 300, 
                marginRight: 12,
                borderRadius: '6px'
              }}
              prefix={<SearchOutlined style={{ color: '#1890ff' }} />}
              size="large"
            />
            <Button 
              type="primary" 
              onClick={handleSearch}
              size="large"
              style={{
                borderRadius: '6px',
                fontWeight: 500
              }}
            >
              Search
            </Button>
            <Button 
              style={{ 
                marginLeft: 12,
                borderRadius: '6px',
                fontWeight: 500
              }} 
              size="large"
              onClick={() => { setSearchText(''); fetchData(); }}
            >
              Clear
            </Button>
            
            <div style={{ marginLeft: 'auto' }}>
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                loading={loading}
                onClick={fetchData}
                size="large"
                style={{
                  borderRadius: '6px',
                  fontWeight: 500
                }}
              >
                Refresh Data
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin size="large" />
            </div>
          ) : (
            <Table 
              columns={columns} 
              dataSource={players} 
              rowKey="id"
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} players`,
                style: { marginTop: 16 }
              }}
              scroll={{ x: 'max-content' }}
              style={{ 
                borderRadius: '8px',
                overflow: 'hidden'
              }}
              rowClassName={() => 'player-table-row'}
            />
          )}
        </Card>
      )
    },
    {
      key: 'cards',
      label: 'Player Cards',
      children: (
        <div>
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Input 
              placeholder="Search by Player ID or Name" 
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              style={{ 
                width: 300,
                borderRadius: '6px'
              }}
              size="large"
              prefix={<SearchOutlined style={{ color: '#1890ff' }} />}
            />
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              loading={loading}
              onClick={fetchData}
              size="large"
              style={{
                borderRadius: '6px',
                fontWeight: 500
              }}
            >
              Refresh Data
            </Button>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin size="large" />
            </div>
          ) : (
            <Row gutter={[24, 24]}>
              {players.map(player => (
                <Col key={player.id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    hoverable
                    className="player-card"
                    title={
                      <Space style={{ height: 40, display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          icon={<UserOutlined />} 
                          style={{ 
                            backgroundColor: player.active ? '#52c41a' : '#d9d9d9',
                            marginRight: 8
                          }} 
                        />
                        <Text ellipsis style={{ maxWidth: 120, fontWeight: 500 }}>
                          {player.name || `Player ${player.id}`}
                        </Text>
                        {player.active && <Badge status="success" />}
                      </Space>
                    }
                    extra={
                      <Tag color={player.active ? 'success' : 'default'} style={{ margin: 0 }}>
                        {player.active ? 'Active' : 'Inactive'}
                      </Tag>
                    }
                    style={{ 
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
                    }}
                    headStyle={{ 
                      borderBottom: '1px solid #f0f0f0',
                      background: player.active ? '#f6ffed' : '#fafafa'
                    }}
                    bodyStyle={{ padding: '16px' }}
                  >
                    <div style={{ marginBottom: 16 }}>
                      <Text copyable type="secondary" style={{ fontSize: 13 }}>{player.id}</Text>
                    </div>
                    
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Statistic 
                          title={<Text type="secondary" style={{ fontSize: 13 }}>Level</Text>}
                          value={player.level || 0}
                          prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
                          valueStyle={{ fontSize: 18 }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic 
                          title={<Text type="secondary" style={{ fontSize: 13 }}>Sessions</Text>}
                          value={player.totalSessions || 0}
                          prefix={<BarChartOutlined style={{ color: '#722ed1' }} />}
                          valueStyle={{ fontSize: 18 }}
                        />
                      </Col>
                    </Row>
                    
                    <Divider style={{ margin: '16px 0' }} />
                    
                    <p style={{ margin: '8px 0' }}>
                      <Space>
                        {getDeviceIcon(player.device)}
                        <Text strong>Device:</Text> 
                        <Text>{player.device || 'Unknown'}</Text>
                      </Space>
                    </p>
                    
                    <p style={{ margin: '8px 0' }}>
                      <Space>
                        <CalendarOutlined style={{ color: '#1890ff' }} />
                        <Text strong>First Seen:</Text>
                        <Text>{formatTimestamp(player.firstSeen)}</Text>
                      </Space>
                    </p>
                    
                    <p style={{ margin: '8px 0' }}>
                      <Space>
                        <ClockCircleOutlined style={{ color: '#fa541c' }} />
                        <Text strong>Last Seen:</Text>
                        <Text>{formatTimestamp(player.lastSeen)}</Text>
                      </Space>
                    </p>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="player-analytics-container">
      <div className="page-header">
        <Title level={2}>
          <DashboardOutlined style={{ marginRight: 12 }} />
          Player Analytics Dashboard
        </Title>
        <Text type="secondary" style={{ fontSize: 16, marginTop: -5, display: 'block' }}>
          Real-time insights into player engagement and behavior
        </Text>
        <Divider style={{ marginTop: 12, marginBottom: 24 }} />
      </div>
      
      {error && (
        <Card style={{ marginBottom: 24, background: '#fff2f0', borderLeft: '4px solid #ff4d4f' }}>
          <Text type="danger">{error}</Text>
        </Card>
      )}
      
      <Tabs 
        defaultActiveKey="overview" 
        items={tabItems} 
        size="large"
        tabBarStyle={{ 
          marginBottom: 24,
          fontWeight: 500
        }}
      />
    </div>
  );
};

export default Players;