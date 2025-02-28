import React, { useState, useEffect } from 'react';
import { Table, Card, DatePicker, Select, Button, Space, Spin, Typography, Row, Col, message } from 'antd';
import { ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { getEvents } from '../../api';

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
    console.log('Fetching event data...');
    
    // Simulating API call
    setTimeout(() => {
      const mockData = [];
      const eventTypes = ['Game Start', 'Level Complete', 'Item Collected', 'Enemy Defeated', 'Game Over'];
      const chartDataTemp = eventTypes.map(type => ({ name: type, count: Math.floor(Math.random() * 5000) + 1000 }));
      
      for (let i = 0; i < 100; i++) {
        const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        mockData.push({
          id: i,
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
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
      
      // Filter based on event type if specified
      const filteredData = eventType !== 'all' 
        ? mockData.filter(item => item.eventType === eventType)
        : mockData;
      
      setEventData(filteredData);
      setChartData(chartDataTemp);
      console.log('Event data loaded:', { filteredData, chartDataTemp });
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
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
      render: text => new Date(text).toLocaleString()
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