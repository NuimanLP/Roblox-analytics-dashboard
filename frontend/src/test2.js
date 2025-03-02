'use client';
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig'; // Adjust the import path as needed
import { Card, Row, Col, Typography, Tag, Spin, Button, Statistic, Alert, Divider, Badge, Space, Table } from 'antd';
import { 
  UserOutlined, 
  ClockCircleOutlined, 
  CalendarOutlined,
  ReloadOutlined,
  TrophyOutlined,
  MobileOutlined,
  DesktopOutlined,
  QuestionOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

export default function SimpleTest2() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPlayers: 0,
    activePlayers: 0,
    averageLevel: 0,
    totalSessions: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "players"));
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      console.log('Fetched Documents:', docs);
      setData(docs);
      
      // Calculate statistics
      const activePlayers = docs.filter(player => player.active).length;
      const totalSessions = docs.reduce((sum, player) => sum + (player.totalSessions || 0), 0);
      const totalLevels = docs.reduce((sum, player) => sum + (player.level || 0), 0);
      const avgLevel = docs.length > 0 ? (totalLevels / docs.length).toFixed(1) : 0;
      
      setStats({
        totalPlayers: docs.length,
        activePlayers,
        averageLevel: avgLevel,
        totalSessions
      });
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to fetch data. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString();
  };

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
          <UserOutlined />
          <Text strong>{name}</Text>
          {record.active && <Badge status="success" />}
        </Space>
      ),
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
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
    },
    {
      title: 'Sessions',
      dataIndex: 'totalSessions',
      key: 'totalSessions',
      sorter: (a, b) => (a.totalSessions || 0) - (b.totalSessions || 0),
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
    },
    {
      title: 'Status',
      key: 'active',
      dataIndex: 'active',
      render: active => (
        <Tag color={active ? 'success' : 'default'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
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
  ];

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Row gutter={[16, 16]} align="middle" justify="space-between">
        <Col>
          <Title level={2}>Players Dashboard</Title>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />} 
            loading={loading}
            onClick={fetchData}
          >
            Refresh
          </Button>
        </Col>
      </Row>

      <Divider />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Players"
              value={stats.totalPlayers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Players"
              value={stats.activePlayers}
              valueStyle={{ color: '#3f8600' }}
              prefix={<UserOutlined />}
              suffix={`/ ${stats.totalPlayers}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Average Level"
              value={stats.averageLevel}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Sessions"
              value={stats.totalSessions}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Divider orientation="left">Player Details</Divider>
      
      <Card>
        <Table 
          dataSource={data} 
          columns={columns} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Divider />
      
      <Row gutter={[16, 16]}>
        {data.map(player => (
          <Col key={player.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              title={
                <Space>
                  <UserOutlined />
                  {player.name || 'Unknown Player'}
                  {player.active && <Badge status="success" />}
                </Space>
              }
              extra={<Tag color={player.active ? 'success' : 'default'}>
                {player.active ? 'Active' : 'Inactive'}
              </Tag>}
            >
              <p><strong>ID:</strong> {player.id}</p>
              <p><strong>Level:</strong> {player.level || 0}</p>
              <p><strong>Sessions:</strong> {player.totalSessions || 0}</p>
              <p><strong>Device:</strong> {player.device || 'Unknown'}</p>
              <p><strong>Mode:</strong> {player.mode || 'N/A'}</p>
              <p>
                <CalendarOutlined /> <strong>First Seen:</strong> {formatTimestamp(player.firstSeen)}
              </p>
              <p>
                <ClockCircleOutlined /> <strong>Last Seen:</strong> {formatTimestamp(player.lastSeen)}
              </p>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}