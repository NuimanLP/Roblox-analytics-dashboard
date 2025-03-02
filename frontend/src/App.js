import React from 'react';
import { Layout, Menu, ConfigProvider } from 'antd';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  DashboardOutlined,
  BarChartOutlined,
  UserOutlined,
  WarningOutlined
} from '@ant-design/icons';
import Dashboard from './pages/Dashboard/Dashboard';
import Events from './pages/Events/Events';
import Players from './pages/Players/Players';
import SimpleTest from './test'
import './App.css';

// Import Ant Design styles
import 'antd/dist/reset.css';

const { Header, Content, Footer, Sider } = Layout;

function App() {
  const items = [
    {
      key: '1',
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: '2',
      icon: <BarChartOutlined />,
      label: <Link to="/events">Events</Link>,
    },
    {
      key: '3',
      icon: <UserOutlined />,
      label: <Link to="/players">Players</Link>,
    },
    {
      key: '4',
      icon: <WarningOutlined />,
      label: <Link to="/tests">Tests</Link>,
    }
  ];

  return (
    <ConfigProvider>
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          <Sider breakpoint="lg" collapsedWidth="0">
            <div className="logo">Roblox Analytics</div>
            <Menu
              theme="dark"
              mode="inline"
              defaultSelectedKeys={['1']}
              items={items}
            />
          </Sider>
          <Layout>
            <Header 
              style={{ 
                padding: 0, 
                background: '#fff', 
                display: 'flex', 
                alignItems: 'center',
                paddingLeft: '16px'
              }}
            >
              <h2>Roblox Game Analytics Dashboard</h2>
            </Header>
            <Content style={{ margin: '24px 16px 0' }}>
              <div style={{ padding: 24, minHeight: 360, background: '#fff' }}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/players" element={<Players />} />
                  <Route path="/tests" element={<SimpleTest />} />
                </Routes>
              </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>
              Roblox Analytics Dashboard ©{new Date().getFullYear()}
            </Footer>
          </Layout>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App;