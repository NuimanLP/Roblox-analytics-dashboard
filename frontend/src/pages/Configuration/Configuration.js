import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Switch, 
  InputNumber, 
  Select, 
  Collapse, 
  Divider, 
  message, 
  Typography,
  Space,
  Alert,
  Spin 
} from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Configuration = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Define the collapse items
  const collapseItems = [
    {
      key: 'game',
      label: 'Game Settings',
      children: (
        <>
          <Form.Item 
            label="Game ID" 
            name="gameId"
            rules={[{ required: true, message: 'Please enter your game ID' }]}
          >
            <Input disabled />
          </Form.Item>
          
          <Form.Item 
            label="API Key" 
            name="apiKey"
            rules={[{ required: true, message: 'Please enter your API key' }]}
            extra="This key is used to authenticate API requests"
          >
            <Input.Password />
          </Form.Item>
          
          <Form.Item 
            label="Data Retention Period (days)" 
            name="dataRetentionDays"
            rules={[{ required: true, message: 'Please enter data retention period' }]}
          >
            <InputNumber min={1} max={365} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item 
            label="Data Sampling Rate (%)" 
            name="samplingRate"
            rules={[{ required: true, message: 'Please enter sampling rate' }]}
            extra="Percentage of events to capture (lower values reduce data volume)"
          >
            <InputNumber min={1} max={100} style={{ width: '100%' }} />
          </Form.Item>
        </>
      )
    },
    {
      key: 'events',
      label: 'Event Tracking Settings',
      children: (
        <>
          <Form.Item label="Capture Player Join Events" name="capturePlayerJoin" valuePropName="checked">
            <Switch />
          </Form.Item>
          
          <Form.Item label="Capture Player Leave Events" name="capturePlayerLeave" valuePropName="checked">
            <Switch />
          </Form.Item>
          
          <Form.Item label="Capture Game Start Events" name="captureGameStart" valuePropName="checked">
            <Switch />
          </Form.Item>
          
          <Form.Item label="Capture Game End Events" name="captureGameEnd" valuePropName="checked">
            <Switch />
          </Form.Item>
          
          <Form.Item label="Capture Custom Events" name="captureCustomEvents" valuePropName="checked">
            <Switch />
          </Form.Item>
          
          <Form.Item 
            label="Max Events Per Minute" 
            name="maxEventsPerMinute"
            rules={[{ required: true, message: 'Please enter max events per minute' }]}
            extra="Limit the number of events that can be sent per minute"
          >
            <InputNumber min={1000} max={50000} step={1000} style={{ width: '100%' }} />
          </Form.Item>
        </>
      )
    },
    {
      key: 'players',
      label: 'Player Tracking Settings',
      children: (
        <>
          <Form.Item label="Track Device Information" name="trackDeviceInfo" valuePropName="checked">
            <Switch />
          </Form.Item>
          
          <Form.Item label="Track Player Location" name="trackLocation" valuePropName="checked">
            <Switch />
          </Form.Item>
          
          <Form.Item label="Track Playtime" name="trackPlaytime" valuePropName="checked">
            <Switch />
          </Form.Item>
          
          <Form.Item 
            label="Player ID Type" 
            name="playerIdType"
            rules={[{ required: true, message: 'Please select player ID type' }]}
          >
            <Select>
              <Select.Option value="anonymous">Anonymous ID</Select.Option>
              <Select.Option value="roblox">Roblox ID</Select.Option>
              <Select.Option value="custom">Custom ID</Select.Option>
            </Select>
          </Form.Item>
        </>
      )
    },
    {
      key: 'dashboard',
      label: 'Dashboard Settings',
      children: (
        <>
          <Form.Item 
            label="Auto-refresh Interval (minutes)" 
            name="refreshInterval"
            rules={[{ required: true, message: 'Please enter refresh interval' }]}
          >
            <InputNumber min={1} max={60} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item label="Dashboard Theme" name="theme">
            <Select>
              <Select.Option value="light">Light</Select.Option>
              <Select.Option value="dark">Dark</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item 
            label="Public Access" 
            name="publicAccess" 
            valuePropName="checked"
            extra="If enabled, the dashboard will be accessible without login"
          >
            <Switch />
          </Form.Item>
        </>
      )
    }
  ];

  useEffect(() => {
    // Simulating API call to get configuration
    setTimeout(() => {
      form.setFieldsValue({
        // Game Settings
        gameId: '12345678',
        apiKey: 'sk_test_*************',
        dataRetentionDays: 90,
        samplingRate: 100,
        
        // Event Settings
        capturePlayerJoin: true,
        capturePlayerLeave: true,
        captureGameStart: true,
        captureGameEnd: true,
        captureCustomEvents: true,
        maxEventsPerMinute: 5000,
        
        // Player Tracking Settings
        trackDeviceInfo: true,
        trackLocation: false,
        trackPlaytime: true,
        playerIdType: 'anonymous',
        
        // Dashboard Settings
        refreshInterval: 5,
        theme: 'light',
        publicAccess: true
      });
      setLoading(false);
    }, 1000);
  }, [form]);

  const handleSave = values => {
    setSaving(true);
    // Simulating API call to save configuration
    setTimeout(() => {
      console.log('Saving configuration:', values);
      message.success('Configuration saved successfully!');
      setSaving(false);
    }, 2000);
  };

  const handleReset = () => {
    form.resetFields();
    message.info('Form reset to last saved values');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Loading configuration...</p>
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>Dashboard Configuration</Title>
      
      <Alert
        message="Configuration Access"
        description="This page allows you to configure analytics settings for your Roblox game. Changes will take effect immediately."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />
      
      <Card className="config-form">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{}}
        >
          <Collapse 
            defaultActiveKey={['game', 'events', 'players', 'dashboard']}
            items={collapseItems}
          />
          
          <Divider />
          
          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SaveOutlined />}
                loading={saving}
              >
                Save Configuration
              </Button>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleReset}
              >
                Reset
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Configuration;