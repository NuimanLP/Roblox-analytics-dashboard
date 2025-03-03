import React, { useState, useEffect } from 'react';
import { Table, Card, DatePicker, Select, Button, Space, Spin, Typography, Row, Col, message, Statistic, Badge, Divider, Tag } from 'antd';
import { 
  ReloadOutlined, 
  DownloadOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  MobileOutlined,
  DesktopOutlined,
  QuestionOutlined,
  UserOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Configure dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Helper function to get device icon
const getDeviceIcon = (device) => {
  if (!device) return <QuestionOutlined />;
  if (device.toLowerCase().includes('mobile')) {
    return <MobileOutlined style={{ color: '#1890ff' }} />;
  }
  return <DesktopOutlined style={{ color: '#52c41a' }} />;
};

// Helper function to get event type icon
const getEventIcon = (eventType) => {
  if (!eventType) return null;
  if (eventType === 'Join game') {
    return <RocketOutlined style={{ color: '#1890ff' }} />;
  } else if (eventType === 'Press Button') {
    return <ThunderboltOutlined style={{ color: '#faad14' }} />;
  } else if (eventType === 'Finish Obby') {
    return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
  } else if (eventType === 'Leave Game') {
    return <StopOutlined style={{ color: '#f5222d' }} />;
  }
  return <QuestionOutlined />;
};

// Helper function to format timestamp
const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  let date;
  if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else {
    date = new Date(timestamp);
  }
  
  return date.toLocaleString();
};

const Events = () => {
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState([]);
  // const [playerData, setPlayerData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [eventType, setEventType] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    uniquePlayers: 0,
    eventsByType: {},
    eventsByDevice: {}
  });
  const [eventOptions, setEventOptions] = useState([
    { value: 'all', label: 'All Events' }
  ]);

  useEffect(() => {
    console.log('Events component: Fetching data');
    fetchData();
  }, []);

  // Apply filters locally after data is fetched
  useEffect(() => {
    if (eventData.length > 0) {
      applyFilters();
    }
  }, [eventType, dateRange]);
  
  // Configure date formatting and timezone for the DatePicker
  const dateFormat = 'MM/DD/YYYY';
  // Set timezone to local for consistency with Firestore timestamps
  dayjs.tz.setDefault(dayjs.tz.guess());

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch players data first
      const playersQuery = query(collection(db, "players"));
      const playersSnapshot = await getDocs(playersQuery);
      
      const players = {};
      playersSnapshot.forEach((doc) => {
        players[doc.id] = { id: doc.id, ...doc.data() };
      });
      
      console.log('Fetched players from Firestore:', players);
      // setPlayerData(players);
      
      // Fetch events data
      const eventsQuery = query(collection(db, "events"), orderBy("timeStamp", "desc"));
      const eventsSnapshot = await getDocs(eventsQuery);
      
      const eventsData = [];
      eventsSnapshot.forEach((doc) => {
        const eventData = { id: doc.id, ...doc.data() };
        
        // Enrich event data with player info if available
        if (eventData.playerId && players[eventData.playerId]) {
          eventData.playerInfo = players[eventData.playerId];
        }
        
        eventsData.push(eventData);
      });
      
      console.log('Fetched events from Firestore:', eventsData);
      setEventData(eventsData);
      
      // Process initial data 
      processData(eventsData);
      
      // Initial filtering
      applyFilters();
      
    } catch (err) {
      console.error('Error fetching data from Firestore:', err);
      setError('Failed to fetch data from Firestore. Please check your connection and try again.');
      setEventData([]);
      // setPlayerData([]);
      setChartData([]);
      setDeviceData([]);
      setHourlyData([]);
    } finally {
      setLoading(false);
    }
  };

  const processData = (eventsData) => {
    // Skip processing if no data
    if (!eventsData || eventsData.length === 0) {
      console.log('No events data to process');
      return;
    }
    
    try {
      // Calculate basic stats
      const uniquePlayerIds = [...new Set(eventsData.map(event => event.playerId))];
      
      // Count events by type and collect unique event types
      const eventsByType = {};
      const uniqueEventTypes = new Set();
      
      eventsData.forEach(event => {
        const type = event.eventType || 'Unknown';
        eventsByType[type] = (eventsByType[type] || 0) + 1;
        uniqueEventTypes.add(type);
      });
      
      // Update event options from actual data
      const dynamicEventOptions = [{ value: 'all', label: 'All Events' }];
      uniqueEventTypes.forEach(type => {
        dynamicEventOptions.push({ value: type, label: type });
      });
      
      setEventOptions(dynamicEventOptions);
      
      // Count events by device
      const eventsByDevice = {};
      eventsData.forEach(event => {
        const device = event.device || 'Unknown';
        eventsByDevice[device] = (eventsByDevice[device] || 0) + 1;
      });
      
      setStats({
        totalEvents: eventsData.length,
        uniquePlayers: uniquePlayerIds.length,
        eventsByType,
        eventsByDevice
      });
      
      // Prepare data for pie charts
      const eventTypeChartData = Object.entries(eventsByType).map(([name, value]) => ({
        name,
        count: value
      }));
      
      const deviceChartData = Object.entries(eventsByDevice).map(([name, value]) => ({
        name,
        value
      }));
      
      setChartData(eventTypeChartData);
      setDeviceData(deviceChartData);
      
      // Prepare data for hourly distribution
      const hourlyDistribution = Array(24).fill(0).map((_, i) => ({
        hour: i.toString().padStart(2, '0'),
        count: 0
      }));
      
      eventsData.forEach(event => {
        if (event.timeStamp && event.timeStamp.seconds) {
          const date = new Date(event.timeStamp.seconds * 1000);
          const hour = date.getHours();
          hourlyDistribution[hour].count += 1;
        }
      });
      
      setHourlyData(hourlyDistribution);
      
    } catch (err) {
      console.error('Error processing data:', err);
      setError('Error processing event data. Some visualizations may not be accurate.');
    }
  };
  
  const applyFilters = () => {
    if (!eventData || eventData.length === 0) return;
    
    try {
      let filteredData = [...eventData];
      
      // Filter by event type if specified
      if (eventType !== 'all') {
        filteredData = filteredData.filter(item => item.eventType === eventType);
      }
      
      // Filter by date range if specified
      if (dateRange && dateRange[0] && dateRange[1]) {
        // Convert the selected dates to UNIX timestamps (seconds)
        const startTimestamp = Math.floor(dateRange[0].startOf('day').valueOf() / 1000);
        const endTimestamp = Math.floor(dateRange[1].endOf('day').valueOf() / 1000);
        
        console.log('Filtering by date range:', {
          startDate: dateRange[0].format(dateFormat),
          endDate: dateRange[1].format(dateFormat),
          startTimestamp: startTimestamp,
          endTimestamp: endTimestamp,
          startFormatted: new Date(startTimestamp * 1000).toLocaleString(),
          endFormatted: new Date(endTimestamp * 1000).toLocaleString()
        });
        
        // Filter events by comparing Firestore timestamps
        filteredData = filteredData.filter(item => {
          if (!item.timeStamp || !item.timeStamp.seconds) return false;
          const eventTimestamp = item.timeStamp.seconds;
          return eventTimestamp >= startTimestamp && eventTimestamp <= endTimestamp;
        });
      }
      
      // Process the filtered data for charts
      processData(filteredData);
      
    } catch (err) {
      console.error('Error applying filters:', err);
      setError('Error applying filters. Try refreshing the data.');
    }
  };

  const handleRefresh = () => {
    message.info('Refreshing data from Firestore...');
    fetchData();
  };

  const handleExport = () => {
    message.success('Exporting event data...');
    
    // Create downloadable JSON
    const dataStr = JSON.stringify(eventData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'event_data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const columns = [
    {
      title: 'Event Type',
      dataIndex: 'eventType',
      key: 'eventType',
      render: (text) => (
        <Space>
          {getEventIcon(text)}
          {text || 'Unknown'}
        </Space>
      ),
      filters: eventOptions.filter(opt => opt.value !== 'all').map(opt => ({ 
        text: opt.label, 
        value: opt.value 
      })),
      onFilter: (value, record) => record.eventType === value
    },
    {
      title: 'Player',
      dataIndex: 'playerId',
      key: 'playerId',
      render: (text, record) => {
        if (record.playerInfo) {
          return (
            <Space>
              <UserOutlined style={{ color: record.playerInfo.active ? '#52c41a' : '#d9d9d9' }} />
              <Text copyable>
                {record.playerInfo.name || `Player ${text}`}
              </Text>
              {record.playerInfo.active && <Badge status="success" />}
            </Space>
          );
        }
        return <Text copyable>{text}</Text>;
      }
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
        { text: 'Mobile (tablet)', value: 'Mobile (tablet)' }
      ],
      onFilter: (value, record) => record.device === value
    },
    {
      title: 'Timestamp',
      dataIndex: 'timeStamp',
      key: 'timeStamp',
      render: timestamp => formatTimestamp(timestamp),
      sorter: (a, b) => {
        if (!a.timeStamp || !b.timeStamp) return 0;
        return (a.timeStamp.seconds || 0) - (b.timeStamp.seconds || 0);
      },
      defaultSortOrder: 'descend'
    },
    {
      title: 'Details',
      key: 'details',
      render: (_, record) => {
        // Format the data field for display
        let details = '';
        
        if (record.data) {
          if (Array.isArray(record.data) && record.data.length === 0) {
            details = 'No additional data';
          } else if (typeof record.data === 'object') {
            details = Object.entries(record.data)
              .filter(([_, value]) => value !== null)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ');
          }
        }
        
        return details || 'No details';
      }
    }
  ];

  // Event options are now dynamically generated from data

  return (
    <div className="event-analytics-container">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <BarChartOutlined style={{ marginRight: 12 }} />
          Game Events Analytics
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Track and analyze player actions and game events in real-time
        </Text>
        <Divider style={{ marginTop: 12, marginBottom: 24 }} />
      </div>
      
      {error && (
        <Card 
          style={{ 
            marginBottom: 24, 
            background: '#fff2f0', 
            borderLeft: '4px solid #ff4d4f',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
          }}
        >
          <Text type="danger">{error}</Text>
        </Card>
      )}
      
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
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
              title={<Text strong style={{ fontSize: 16 }}>Total Events</Text>}
              value={stats.totalEvents}
              prefix={<BarChartOutlined style={{ background: '#1890ff22', padding: 8, borderRadius: '50%' }} />}
              valueStyle={{ color: '#1890ff', fontSize: 28, fontWeight: 600 }}
            />
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              All recorded game events
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
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
              title={<Text strong style={{ fontSize: 16 }}>Unique Players</Text>}
              value={stats.uniquePlayers}
              prefix={<UserOutlined style={{ background: '#52c41a22', padding: 8, borderRadius: '50%' }} />}
              valueStyle={{ color: '#52c41a', fontSize: 28, fontWeight: 600 }}
            />
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              Players generating events
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
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
              title={<Text strong style={{ fontSize: 16 }}>Join Events</Text>}
              value={stats.eventsByType['Join game'] || 0}
              prefix={<RocketOutlined style={{ background: '#722ed122', padding: 8, borderRadius: '50%' }} />}
              valueStyle={{ color: '#722ed1', fontSize: 28, fontWeight: 600 }}
            />
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              Game sessions started
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable 
            className="stat-card"
            style={{ 
              background: 'linear-gradient(135deg, #fa8c1611 0%, #fa8c1605 100%)',
              borderTop: '3px solid #fa8c16',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
            }}
          >
            <Statistic
              title={<Text strong style={{ fontSize: 16 }}>Button Presses</Text>}
              value={stats.eventsByType['Press Button'] || 0}
              prefix={<ThunderboltOutlined style={{ background: '#fa8c1622', padding: 8, borderRadius: '50%' }} />}
              valueStyle={{ color: '#fa8c16', fontSize: 28, fontWeight: 600 }}
            />
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
              Interaction events
            </Text>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card
            style={{ 
              borderRadius: '8px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
            }}
          >
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16 
            }}>
              <Space size="large" style={{ marginBottom: 10 }}>
                <div>
                  <Text strong style={{ marginRight: 8 }}>Date Range:</Text>
                  <RangePicker 
                    onChange={value => setDateRange(value)} 
                    placeholder={['Start Date', 'End Date']}
                    format={dateFormat}
                    allowClear={true}
                    defaultValue={[
                      dayjs('03/01/2025', dateFormat),
                      dayjs('03/03/2025', dateFormat)
                    ]}
                    style={{ width: 270 }}
                  />
                </div>
                <div>
                  <Text strong style={{ marginRight: 8 }}>Event Type:</Text>
                  <Select 
                    defaultValue="all" 
                    style={{ width: 180 }} 
                    onChange={value => setEventType(value)}
                    options={eventOptions}
                  />
                </div>
              </Space>
              
              <Space style={{ marginBottom: 10 }}>
                <Button 
                  type="primary" 
                  icon={<ReloadOutlined />} 
                  onClick={handleRefresh}
                  loading={loading}
                  size="large"
                  style={{ fontWeight: 500, borderRadius: 6 }}
                >
                  Refresh Data
                </Button>
                <Button 
                  icon={<DownloadOutlined />} 
                  onClick={handleExport}
                  disabled={eventData.length === 0}
                  size="large"
                  style={{ fontWeight: 500, borderRadius: 6 }}
                >
                  Export Data
                </Button>
              </Space>
            </div>
            
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div className="chart-container" style={{ height: 320, padding: '20px 10px' }}>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ fontSize: 16, display: 'flex', alignItems: 'center' }}>
                      <BarChartOutlined style={{ color: '#1890ff', marginRight: 8 }} /> Events by Type
                    </Text>
                    <Text type="secondary" style={{ fontSize: 13 }}>Distribution of event types in selected period</Text>
                  </div>
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={{ stroke: '#f0f0f0' }}
                        tickLine={false}
                      />
                      <YAxis 
                        allowDecimals={false} 
                        axisLine={{ stroke: '#f0f0f0' }}
                        tickLine={false}
                      />
                      <Tooltip 
                        formatter={(value, name) => [`${value} events`, 'Count']} 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          borderRadius: '4px',
                          boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
                          border: 'none'
                        }}
                      />
                      <Legend iconType="circle" />
                      <Bar 
                        dataKey="count" 
                        name="Number of Events" 
                        fill="#1890ff"
                        radius={[4, 4, 0, 0]}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="chart-container" style={{ height: 320, padding: '20px 10px' }}>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ fontSize: 16, display: 'flex', alignItems: 'center' }}>
                      <MobileOutlined style={{ color: '#722ed1', marginRight: 8 }} /> Device Distribution
                    </Text>
                    <Text type="secondary" style={{ fontSize: 13 }}>Proportion of events by device type</Text>
                  </div>
                  <ResponsiveContainer width="100%" height="85%">
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        labelLine={{ stroke: '#e8e8e8', strokeWidth: 1 }}
                        outerRadius={90}
                        innerRadius={40}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        paddingAngle={2}
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {deviceData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value} events`, name]} 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          borderRadius: '4px',
                          boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
                          border: 'none'
                        }}
                      />
                      <Legend iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Col>
            </Row>
            
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col xs={24}>
                <div style={{ padding: '10px 10px 20px' }}>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ fontSize: 16, display: 'flex', alignItems: 'center' }}>
                      <ClockCircleOutlined style={{ color: '#13c2c2', marginRight: 8 }} /> Events Distribution by Hour
                    </Text>
                    <Text type="secondary" style={{ fontSize: 13 }}>Hourly activity pattern across 24-hour period</Text>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={hourlyData} barSize={16}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                      <XAxis 
                        dataKey="hour" 
                        axisLine={{ stroke: '#f0f0f0' }}
                        tickLine={false}
                        label={{ 
                          value: 'Hour of Day (24-hour format)', 
                          position: 'insideBottom', 
                          offset: -5,
                          style: { fill: '#666', fontSize: 12 }
                        }} 
                      />
                      <YAxis 
                        allowDecimals={false}
                        axisLine={{ stroke: '#f0f0f0' }}
                        tickLine={false}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value} events`, 'Count']} 
                        labelFormatter={(label) => `Hour: ${label}:00 - ${label}:59`}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          borderRadius: '4px',
                          boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
                          border: 'none'
                        }}
                      />
                      <Legend 
                        iconType="circle"
                        wrapperStyle={{ paddingTop: 15 }}
                      />
                      <Bar 
                        dataKey="count" 
                        name="Number of Events" 
                        fill="#13c2c2"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <BarChartOutlined style={{ color: '#1890ff', marginRight: 10 }} />
            <Text strong style={{ fontSize: 18 }}>Event Log</Text>
          </div>
        }
        style={{ 
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        }}
        className="data-table"
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">Loading event data...</Text>
            </div>
          </div>
        ) : eventData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Text type="secondary" style={{ fontSize: 16 }}>No event data found</Text>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">Try changing your filters or refreshing the data</Text>
            </div>
          </div>
        ) : (
          <Table 
            columns={columns} 
            dataSource={eventData} 
            rowKey="id"
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} events`,
              style: { marginTop: 16 }
            }}
            rowClassName={() => 'event-table-row'}
            expandable={{
              expandedRowRender: (record) => {
                return (
                  <div style={{ padding: '16px 0' }}>
                    <Row gutter={[24, 16]}>
                      <Col span={12}>
                        <Card 
                          size="small" 
                          title={
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <BarChartOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                              <Text strong>Event Details</Text>
                            </div>
                          } 
                          style={{ 
                            borderRadius: 8,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                          }}
                        >
                          <p><Text strong>Event ID:</Text> <Text copyable>{record.id}</Text></p>
                          {record.data && typeof record.data === 'object' && !Array.isArray(record.data) && Object.keys(record.data).length > 0 && (
                            <div>
                              <Text strong>Event Data:</Text>
                              <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                                {Object.entries(record.data).map(([key, value]) => (
                                  <li key={key}>
                                    <Text strong>{key}:</Text> {value !== null ? String(value) : 'null'}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </Card>
                      </Col>
                      
                      {record.playerInfo && (
                        <Col span={12}>
                          <Card 
                            size="small" 
                            title={
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <UserOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                                <Text strong>Player Details</Text>
                              </div>
                            } 
                            style={{ 
                              borderRadius: 8,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}
                            extra={
                              <Tag color={record.playerInfo.active ? 'success' : 'default'}>
                                {record.playerInfo.active ? 'Active' : 'Inactive'}
                              </Tag>
                            }
                          >
                            <Row gutter={[16, 8]}>
                              <Col span={12}>
                                <Text strong>Level:</Text> {record.playerInfo.level || 0}
                              </Col>
                              <Col span={12}>
                                <Text strong>Sessions:</Text> {record.playerInfo.totalSessions || 0}
                              </Col>
                              <Col span={24}>
                                <Text strong>Device:</Text> {record.playerInfo.device || 'Unknown'}
                              </Col>
                              <Col span={24}>
                                <Text strong>First Seen:</Text> {formatTimestamp(record.playerInfo.firstSeen)}
                              </Col>
                              <Col span={24}>
                                <Text strong>Last Seen:</Text> {formatTimestamp(record.playerInfo.lastSeen)}
                              </Col>
                            </Row>
                          </Card>
                        </Col>
                      )}
                    </Row>
                  </div>
                );
              }
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default Events;