import React, { useState, useEffect } from 'react';
import { Table, Card, DatePicker, Select, Button, Space, Spin, Typography, Row, Col, message } from 'antd';
import { ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { getEvents } from '../../api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Title } = Typography;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Events = () => {
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [eventType, setEventType] = useState('all');
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    console.log('Events component: Fetching data with filters:', { eventType, dateRange });
    fetchData();
  }, [eventType, dateRange]);

  const fetchData = () => {
    setLoading(true);
    console.log('Fetching event data with filters:', { eventType, dateRange });
    
    // Simulating API call
    setTimeout(() => {
      const mockData = [];
      const eventTypes = ['Game Start', 'Level Complete', 'Item Collected', 'Enemy Defeated', 'Game Over'];
      const chartDataTemp = eventTypes.map(type => ({ name: type, count: Math.floor(Math.random() * 5000) + 1000 }));
      
      // Generate random timestamps within the last 30 days
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      for (let i = 0; i < 100; i++) {
        const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const randomTimestamp = new Date(thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime()));
        
        // Format dates for storage in MM-DD-YYYY format
        const month = String(randomTimestamp.getMonth() + 1).padStart(2, '0');
        const day = String(randomTimestamp.getDate()).padStart(2, '0');
        const year = randomTimestamp.getFullYear();
        const formattedDate = `${month}-${day}-${year}`;
        
        mockData.push({
          id: i,
          timestamp: randomTimestamp.toISOString(),
          date: formattedDate, // Store the formatted date
          eventType: randomEvent,
          playerId: `Player_${Math.floor(Math.random() * 1000)}`,
          data: JSON.stringify({
            level: Math.floor(Math.random() * 10) + 1,
            position: {
              x: Math.floor(Math.random() * 100),
              y: Math.floor(Math.random() * 100),
              z: Math.floor(Math.random() * 100)
            }
          })
        });
      }
      
      // Apply filters
      let filteredData = mockData;
      
      // Filter by event type if specified
      if (eventType !== 'all') {
        filteredData = filteredData.filter(item => item.eventType === eventType);
      }
      
      // Filter by date range if specified
      if (dateRange && dateRange[0] && dateRange[1]) {
        // Convert dates properly - Ant Design v5 uses dayjs
        const startDate = dateRange[0].startOf('day').toDate();
        const endDate = dateRange[1].endOf('day').toDate();
        
        filteredData = filteredData.filter(item => {
          const eventDate = new Date(item.timestamp);
          return eventDate >= startDate && eventDate <= endDate;
        });
        
        // Update chart data based on filtered events
        const eventCounts = {};
        eventTypes.forEach(type => eventCounts[type] = 0);
        
        filteredData.forEach(item => {
          eventCounts[item.eventType] = (eventCounts[item.eventType] || 0) + 1;
        });
        
        // Create updated chart data with counts from filtered events
        const updatedChartData = eventTypes.map(type => ({
          name: type,
          count: eventCounts[type] * 50 // Scaling for better visualization
        }));
        
        setChartData(updatedChartData);
      } else {
        setChartData(chartDataTemp);
      }
      
      setEventData(filteredData);
      console.log('Event data loaded:', { 
        filtered: filteredData.length, 
        total: mockData.length,
        dateRange: dateRange ? `${dateRange[0]?.format('MM-DD-YYYY')} to ${dateRange[1]?.format('MM-DD-YYYY')}` : 'none' 
      });
      setLoading(false);
    }, 1000);
  };

  const handleRefresh = () => {
    message.info('Refreshing data...');
    fetchData();
  };

  const handleExport = () => {
    // In a real application, this would generate a CSV or JSON file for download
    message.success('Exporting data... (This is a placeholder)');
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: text => {
        const date = new Date(text);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
      }
    },
    {
      title: 'Event Type',
      dataIndex: 'eventType',
      key: 'eventType',
      filters: [
        { text: 'Game Start', value: 'Game Start' },
        { text: 'Level Complete', value: 'Level Complete' },
        { text: 'Item Collected', value: 'Item Collected' },
        { text: 'Enemy Defeated', value: 'Enemy Defeated' },
        { text: 'Game Over', value: 'Game Over' }
      ],
      onFilter: (value, record) => record.eventType === value
    },
    {
      title: 'Player ID',
      dataIndex: 'playerId',
      key: 'playerId',
    },
    {
      title: 'Data',
      dataIndex: 'data',
      key: 'data',
      render: text => {
        try {
          const data = JSON.parse(text);
          return (
            <div>
              <p>Level: {data.level}</p>
              <p>Position: ({data.position.x}, {data.position.y}, {data.position.z})</p>
            </div>
          );
        } catch (e) {
          return text;
        }
      }
    }
  ];

  const eventOptions = [
    { value: 'all', label: 'All Events' },
    { value: 'Game Start', label: 'Game Start' },
    { value: 'Level Complete', label: 'Level Complete' },
    { value: 'Item Collected', label: 'Item Collected' },
    { value: 'Enemy Defeated', label: 'Enemy Defeated' },
    { value: 'Game Over', label: 'Game Over' }
  ];

  return (
    <div>
      <Title level={2}>Game Events Analytics</Title>
      
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Card>
            <Space style={{ marginBottom: 16 }}>
              <RangePicker 
                onChange={value => setDateRange(value)} 
                placeholder={['Start Date', 'End Date']}
              />
              <Select 
                defaultValue="all" 
                style={{ width: 180 }} 
                onChange={value => setEventType(value)}
                options={eventOptions}
              />
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={handleRefresh}
              >
                Refresh
              </Button>
              <Button 
                icon={<DownloadOutlined />} 
                onClick={handleExport}
              >
                Export Data
              </Button>
            </Space>
            
            <div className="chart-container" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#1890ff">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
      
      <Card title="Event Log" className="data-table">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <Spin />
          </div>
        ) : (
          <Table 
            columns={columns} 
            dataSource={eventData} 
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>
    </div>
  );
};

export default Events;