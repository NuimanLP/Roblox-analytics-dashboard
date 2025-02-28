import React, { useState, useEffect } from 'react';
import { Table, Card, Input, Button, Tag, Spin, Typography, Tabs, Row, Col, Statistic } from 'antd';
import { UserOutlined, SearchOutlined, ClockCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { Title } = Typography;

const Players = () => {
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [retentionData, setRetentionData] = useState([]);
  const [sessionData, setSessionData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    // Simulating API call
    setTimeout(() => {
      const mockPlayers = [];
      
      for (let i = 0; i < 100; i++) {
        mockPlayers.push({
          id: `Player_${i + 1000}`,
          firstSeen: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)).toISOString(),
          lastSeen: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
          totalSessions: Math.floor(Math.random() * 100) + 1,
          playTime: Math.floor(Math.random() * 50) + 1,
          level: Math.floor(Math.random() * 20) + 1,
          status: Math.random() > 0.2 ? 'active' : 'inactive'
        });
      }
      
      setPlayers(mockPlayers);

      // Retention data
      setRetentionData([
        { day: 'Day 1', retention: 100 },
        { day: 'Day 2', retention: 65 },
        { day: 'Day 3', retention: 50 },
        { day: 'Day 7', retention: 35 },
        { day: 'Day 14', retention: 28 },
        { day: 'Day 30', retention: 22 },
      ]);

      // Session data
      setSessionData([
        { day: 'Monday', sessions: 245, duration: 32 },
        { day: 'Tuesday', sessions: 290, duration: 28 },
        { day: 'Wednesday', sessions: 310, duration: 35 },
        { day: 'Thursday', sessions: 275, duration: 30 },
        { day: 'Friday', sessions: 400, duration: 38 },
        { day: 'Saturday', sessions: 520, duration: 45 },
        { day: 'Sunday', sessions: 480, duration: 42 },
      ]);
      
      setLoading(false);
    }, 1000);
  };

  const handleSearch = () => {
    setLoading(true);
    // Simulating search API call
    setTimeout(() => {
      if (searchText) {
        const filtered = players.filter(player => 
          player.id.toLowerCase().includes(searchText.toLowerCase())
        );
        setPlayers(filtered);
      } else {
        fetchData();
      }
      setLoading(false);
    }, 500);
  };

  const columns = [
    {
      title: 'Player ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id.localeCompare(b.id)
    },
    {
      title: 'First Seen',
      dataIndex: 'firstSeen',
      key: 'firstSeen',
      sorter: (a, b) => new Date(a.firstSeen) - new Date(b.firstSeen),
      render: text => new Date(text).toLocaleDateString()
    },
    {
      title: 'Last Seen',
      dataIndex: 'lastSeen',
      key: 'lastSeen',
      sorter: (a, b) => new Date(a.lastSeen) - new Date(b.lastSeen),
      render: text => new Date(text).toLocaleDateString()
    },
    {
      title: 'Sessions',
      dataIndex: 'totalSessions',
      key: 'totalSessions',
      sorter: (a, b) => a.totalSessions - b.totalSessions
    },
    {
      title: 'Play Time (hrs)',
      dataIndex: 'playTime',
      key: 'playTime',
      sorter: (a, b) => a.playTime - b.playTime
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      sorter: (a, b) => a.level - b.level
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
      ],
      onFilter: (value, record) => record.status === value,
      render: status => (
        <Tag color={status === 'active' ? 'green' : 'volcano'}>
          {status.toUpperCase()}
        </Tag>
      )
    }
  ];

  // Define the tabs items for Ant Design v5
  const tabItems = [
    {
      key: 'overview',
      label: 'Overview',
      children: (
        <>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Players"
                  value="24,567"
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Active Players"
                  value="1,283"
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Avg. Session Time"
                  value="47 min"
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Avg. Player Level"
                  value="8.3"
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#fa541c' }}
                />
              </Card>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Player Retention" className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={retentionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis label={{ value: 'Retention %', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="retention" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Sessions by Day" className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={sessionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="sessions" stroke="#8884d8" />
                    <Line yAxisId="right" type="monotone" dataKey="duration" stroke="#82ca9d" />
                  </LineChart>
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
        <Card>
          <div style={{ marginBottom: 16 }}>
            <Input 
              placeholder="Search by Player ID" 
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 300, marginRight: 8 }}
              prefix={<SearchOutlined />}
            />
            <Button type="primary" onClick={handleSearch}>
              Search
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => { setSearchText(''); fetchData(); }}>
              Clear
            </Button>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <Spin />
            </div>
          ) : (
            <Table 
              columns={columns} 
              dataSource={players} 
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          )}
        </Card>
      )
    }
  ];

  return (
    <div>
      <Title level={2}>Player Analytics</Title>
      <Tabs defaultActiveKey="overview" items={tabItems} />
    </div>
  );
};

export default Players;