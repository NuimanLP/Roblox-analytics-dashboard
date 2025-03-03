// 'use client';
// import React, { useState, useEffect } from 'react';
// import { 
//   Card, Row, Col, Statistic, Table, Tag, Typography, Tabs, Spin, 
//   Badge, Space, Tooltip, Button, DatePicker, Select, Input, Divider,
//   Alert
// } from 'antd';
// import { 
//   UserOutlined, RocketOutlined, BarChartOutlined, 
//   ClockCircleOutlined, TabletOutlined, DesktopOutlined, 
//   ReloadOutlined, SearchOutlined, AppstoreOutlined, 
//   SyncOutlined, CheckCircleOutlined, ThunderboltOutlined
// } from '@ant-design/icons';
// import { 
//   LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
//   XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
//   Legend, ResponsiveContainer 
// } from 'recharts';
// import { collection, getDocs, query, orderBy } from 'firebase/firestore';
// import { db } from '../../firebaseConfig'; // ปรับ path ตามโครงสร้างของคุณ
// import SimpleTest from './test';

// const { Title, Text } = Typography;
// const { RangePicker } = DatePicker;
// const { Option } = Select;

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// // Helper function to get device icon
// const getDeviceIcon = (device) => {
//   if (!device) return null;
//   if (device.toLowerCase().includes('mobile')) {
//     return <TabletOutlined style={{ color: '#1890ff' }} />;
//   }
//   return <DesktopOutlined style={{ color: '#52c41a' }} />;
// };

// // Helper function to get event type icon
// const getEventIcon = (eventType) => {
//   if (!eventType) return null;
//   if (eventType === 'Join game') {
//     return <RocketOutlined style={{ color: '#1890ff' }} />;
//   } else if (eventType === 'Press Button') {
//     return <ThunderboltOutlined style={{ color: '#faad14' }} />;
//   } else if (eventType === 'Finish Obby') {
//     return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
//   }
//   return <AppstoreOutlined />;
// };

// // Helper function to format timestamp
// const formatTimestamp = (timestamp) => {
//   if (!timestamp) return 'N/A';
  
//   let date;
//   if (timestamp.seconds) {
//     date = new Date(timestamp.seconds * 1000);
//   } else {
//     date = new Date(timestamp);
//   }
  
//   return date.toLocaleString();
// };

// const SimpleTest2 = () => {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [stats, setStats] = useState({
//     totalEvents: 0,
//     uniquePlayers: 0,
//     eventsByType: {},
//     eventsByDevice: {}
//   });
//   const [hourlyData, setHourlyData] = useState([]);
//   const [eventTypeData, setEventTypeData] = useState([]);
//   const [deviceData, setDeviceData] = useState([]);
//   const [playerData, setPlayerData] = useState([]);
//   const [filteredEvents, setFilteredEvents] = useState([]);
//   const [searchText, setSearchText] = useState('');
//   const [activeTab, setActiveTab] = useState('overview');

//   useEffect(() => {
//     fetchEvents();
//   }, []);

//   const fetchEvents = async () => {
//     setLoading(true);
//     try {
//       const eventsQuery = query(collection(db, "events"), orderBy("timeStamp", "desc"));
//       const querySnapshot = await getDocs(eventsQuery);
      
//       const eventsData = [];
//       querySnapshot.forEach((doc) => {
//         eventsData.push({ id: doc.id, ...doc.data() });
//       });
      
//       console.log('Fetched events:', eventsData);
      
//       setEvents(eventsData);
//       setFilteredEvents(eventsData);
      
//       // Process data for stats and charts
//       processData(eventsData);
      
//     } catch (err) {
//       console.error('Error fetching events:', err);
//       setError('Failed to fetch events. Please check your connection and try again.');
      
//       // If we have the data from the documents, use that
//       if (Array.isArray(window.eventsData) && window.eventsData.length > 0) {
//         console.log('Using provided events data:', window.eventsData);
//         setEvents(window.eventsData);
//         setFilteredEvents(window.eventsData);
//         processData(window.eventsData);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const processData = (eventsData) => {
//     // Skip processing if no data
//     if (!eventsData || eventsData.length === 0) {
//       console.log('No events data to process');
//       return;
//     }
    
//     try {
//       // Calculate basic stats
//       const uniquePlayerIds = [...new Set(eventsData.map(event => event.playerId))];
      
//       // Count events by type
//       const eventsByType = {};
//       eventsData.forEach(event => {
//         const type = event.eventType || 'Unknown';
//         eventsByType[type] = (eventsByType[type] || 0) + 1;
//       });
      
//       // Count events by device
//       const eventsByDevice = {};
//       eventsData.forEach(event => {
//         const device = event.device || 'Unknown';
//         eventsByDevice[device] = (eventsByDevice[device] || 0) + 1;
//       });
      
//       setStats({
//         totalEvents: eventsData.length,
//         uniquePlayers: uniquePlayerIds.length,
//         eventsByType,
//         eventsByDevice
//       });
      
//       // Prepare data for pie charts
//       const eventTypeChartData = Object.entries(eventsByType).map(([name, value]) => ({
//         name,
//         value
//       }));
      
//       const deviceChartData = Object.entries(eventsByDevice).map(([name, value]) => ({
//         name,
//         value
//       }));
      
//       setEventTypeData(eventTypeChartData);
//       setDeviceData(deviceChartData);
      
//       // Prepare data for hourly distribution
//       const hourlyDistribution = Array(24).fill(0).map((_, i) => ({
//         hour: i.toString().padStart(2, '0'),
//         count: 0
//       }));
      
//       eventsData.forEach(event => {
//         if (event.timeStamp && event.timeStamp.seconds) {
//           const date = new Date(event.timeStamp.seconds * 1000);
//           const hour = date.getHours();
//           hourlyDistribution[hour].count += 1;
//         }
//       });
      
//       setHourlyData(hourlyDistribution);
      
//       // Prepare data for player activity
//       const playerActivity = {};
//       eventsData.forEach(event => {
//         const playerId = event.playerId || 'Unknown';
//         if (!playerActivity[playerId]) {
//           playerActivity[playerId] = {
//             playerId,
//             totalEvents: 0,
//             eventTypes: {},
//             devices: new Set(),
//             lastActive: null
//           };
//         }
        
//         playerActivity[playerId].totalEvents += 1;
        
//         const eventType = event.eventType || 'Unknown';
//         playerActivity[playerId].eventTypes[eventType] = 
//           (playerActivity[playerId].eventTypes[eventType] || 0) + 1;
        
//         if (event.device) {
//           playerActivity[playerId].devices.add(event.device);
//         }
        
//         if (event.timeStamp && event.timeStamp.seconds) {
//           const timestamp = event.timeStamp.seconds * 1000;
//           if (!playerActivity[playerId].lastActive || 
//               timestamp > playerActivity[playerId].lastActive) {
//             playerActivity[playerId].lastActive = timestamp;
//           }
//         }
//       });
      
//       const playerActivityArray = Object.values(playerActivity);
//       playerActivityArray.forEach(player => {
//         player.devices = Array.from(player.devices);
//         player.lastActive = player.lastActive ? new Date(player.lastActive) : null;
//       });
      
//       // Sort by total events
//       playerActivityArray.sort((a, b) => b.totalEvents - a.totalEvents);
      
//       setPlayerData(playerActivityArray);
      
//     } catch (err) {
//       console.error('Error processing data:', err);
//       setError('Error processing event data. Some visualizations may not be accurate.');
//     }
//   };

//   const handleSearch = (value) => {
//     setSearchText(value);
    
//     if (!value) {
//       setFilteredEvents(events);
//       return;
//     }
    
//     const filtered = events.filter(event => {
//       const searchLower = value.toLowerCase();
//       return (
//         (event.playerId && event.playerId.toLowerCase().includes(searchLower)) ||
//         (event.eventType && event.eventType.toLowerCase().includes(searchLower)) ||
//         (event.device && event.device.toLowerCase().includes(searchLower)) ||
//         (event.id && event.id.toLowerCase().includes(searchLower))
//       );
//     });
    
//     setFilteredEvents(filtered);
//   };

//   const columns = [
//     {
//       title: 'Event Type',
//       dataIndex: 'eventType',
//       key: 'eventType',
//       render: (text) => (
//         <Space>
//           {getEventIcon(text)}
//           {text || 'Unknown'}
//         </Space>
//       ),
//       filters: [
//         { text: 'Join game', value: 'Join game' },
//         { text: 'Press Button', value: 'Press Button' },
//         { text: 'Finish Obby', value: 'Finish Obby' }
//       ],
//       onFilter: (value, record) => record.eventType === value
//     },
//     {
//       title: 'Player ID',
//       dataIndex: 'playerId',
//       key: 'playerId',
//       render: (text) => <Text copyable>{text}</Text>
//     },
//     {
//       title: 'Device',
//       dataIndex: 'device',
//       key: 'device',
//       render: (text) => (
//         <Space>
//           {getDeviceIcon(text)}
//           {text || 'Unknown'}
//         </Space>
//       ),
//       filters: [
//         { text: 'Desktop', value: 'Desktop' },
//         { text: 'Mobile (tablet)', value: 'Mobile (tablet)' }
//       ],
//       onFilter: (value, record) => record.device === value
//     },
//     {
//       title: 'Timestamp',
//       dataIndex: 'timeStamp',
//       key: 'timeStamp',
//       render: (timestamp) => formatTimestamp(timestamp),
//       sorter: (a, b) => {
//         if (!a.timeStamp || !b.timeStamp) return 0;
//         return (a.timeStamp.seconds || 0) - (b.timeStamp.seconds || 0);
//       },
//       defaultSortOrder: 'descend'
//     },
//     {
//       title: 'Details',
//       key: 'details',
//       render: (_, record) => {
//         // Format the data field for display
//         let details = '';
        
//         if (record.data) {
//           if (Array.isArray(record.data) && record.data.length === 0) {
//             details = 'No additional data';
//           } else if (typeof record.data === 'object') {
//             details = Object.entries(record.data)
//               .filter(([_, value]) => value !== null)
//               .map(([key, value]) => `${key}: ${value}`)
//               .join(', ');
//           }
//         }
        
//         return details || 'No details';
//       }
//     }
//   ];

//   const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
//     const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
//     const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
//     const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
  
//     return (
//       <text 
//         x={x} 
//         y={y} 
//         fill="white" 
//         textAnchor="middle" 
//         dominantBaseline="central"
//       >
//         {`${(percent * 100).toFixed(0)}%`}
//       </text>
//     );
//   };

//   const tabItems = [
//     {
//       key: 'overview',
//       label: 'Overview',
//       children: (
//         <>
//           <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
//             <Button 
//               type="primary" 
//               icon={<ReloadOutlined />} 
//               loading={loading}
//               onClick={fetchEvents}
//             >
//               Refresh Data
//             </Button>
//           </div>
          
//           <Row gutter={[16, 16]}>
//             <Col xs={24} sm={12} md={6}>
//               <Card>
//                 <Statistic
//                   title="Total Events"
//                   value={stats.totalEvents}
//                   prefix={<BarChartOutlined />}
//                   valueStyle={{ color: '#1890ff' }}
//                 />
//               </Card>
//             </Col>
//             <Col xs={24} sm={12} md={6}>
//               <Card>
//                 <Statistic
//                   title="Unique Players"
//                   value={stats.uniquePlayers}
//                   prefix={<UserOutlined />}
//                   valueStyle={{ color: '#52c41a' }}
//                 />
//               </Card>
//             </Col>
//             <Col xs={24} sm={12} md={6}>
//               <Card>
//                 <Statistic
//                   title="Join Events"
//                   value={stats.eventsByType['Join game'] || 0}
//                   prefix={<RocketOutlined />}
//                   valueStyle={{ color: '#722ed1' }}
//                 />
//               </Card>
//             </Col>
//             <Col xs={24} sm={12} md={6}>
//               <Card>
//                 <Statistic
//                   title="Button Presses"
//                   value={stats.eventsByType['Press Button'] || 0}
//                   prefix={<ThunderboltOutlined />}
//                   valueStyle={{ color: '#fa8c16' }}
//                 />
//               </Card>
//             </Col>
//           </Row>
          
//           <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
//             <Col xs={24} md={12}>
//               <Card title="Events by Type" className="chart-container">
//                 <ResponsiveContainer width="100%" height={300}>
//                   <PieChart>
//                     <Pie
//                       data={eventTypeData}
//                       cx="50%"
//                       cy="50%"
//                       labelLine={false}
//                       label={renderCustomizedLabel}
//                       outerRadius={100}
//                       fill="#8884d8"
//                       dataKey="value"
//                     >
//                       {eventTypeData.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                       ))}
//                     </Pie>
//                     <RechartsTooltip formatter={(value, name) => [`${value} events`, name]} />
//                     <Legend />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </Card>
//             </Col>
//             <Col xs={24} md={12}>
//               <Card title="Events by Device" className="chart-container">
//                 <ResponsiveContainer width="100%" height={300}>
//                   <PieChart>
//                     <Pie
//                       data={deviceData}
//                       cx="50%"
//                       cy="50%"
//                       labelLine={false}
//                       label={renderCustomizedLabel}
//                       outerRadius={100}
//                       fill="#8884d8"
//                       dataKey="value"
//                     >
//                       {deviceData.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                       ))}
//                     </Pie>
//                     <RechartsTooltip formatter={(value, name) => [`${value} events`, name]} />
//                     <Legend />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </Card>
//             </Col>
//           </Row>
          
//           <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
//             <Col xs={24}>
//               <Card title="Events Distribution by Hour" className="chart-container">
//                 <ResponsiveContainer width="100%" height={300}>
//                   <BarChart data={hourlyData}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="hour" />
//                     <YAxis allowDecimals={false} />
//                     <RechartsTooltip formatter={(value) => [`${value} events`, 'Count']} />
//                     <Legend />
//                     <Bar dataKey="count" name="Number of Events" fill="#1890ff" />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </Card>
//             </Col>
//           </Row>
          
//           <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
//             <Col xs={24}>
//               <Card title="Player Activity">
//                 <Table
//                   dataSource={playerData}
//                   rowKey="playerId"
//                   pagination={{ pageSize: 5 }}
//                   columns={[
//                     {
//                       title: 'Player ID',
//                       dataIndex: 'playerId',
//                       key: 'playerId',
//                       render: (text) => <Text copyable>{text}</Text>
//                     },
//                     {
//                       title: 'Total Events',
//                       dataIndex: 'totalEvents',
//                       key: 'totalEvents',
//                       sorter: (a, b) => a.totalEvents - b.totalEvents,
//                       defaultSortOrder: 'descend'
//                     },
//                     {
//                       title: 'Events Breakdown',
//                       key: 'eventBreakdown',
//                       render: (_, record) => (
//                         <>
//                           {Object.entries(record.eventTypes).map(([type, count]) => (
//                             <Tag color={type === 'Join game' ? 'blue' : type === 'Press Button' ? 'orange' : 'green'} key={type}>
//                               {type}: {count}
//                             </Tag>
//                           ))}
//                         </>
//                       )
//                     },
//                     {
//                       title: 'Devices',
//                       dataIndex: 'devices',
//                       key: 'devices',
//                       render: (devices) => (
//                         <>
//                           {devices.map(device => (
//                             <Tag color={device.includes('Mobile') ? 'cyan' : 'lime'} key={device}>
//                               {getDeviceIcon(device)} {device}
//                             </Tag>
//                           ))}
//                         </>
//                       )
//                     },
//                     {
//                       title: 'Last Active',
//                       dataIndex: 'lastActive',
//                       key: 'lastActive',
//                       render: (date) => date ? date.toLocaleString() : 'N/A',
//                       sorter: (a, b) => {
//                         if (!a.lastActive || !b.lastActive) return 0;
//                         return a.lastActive.getTime() - b.lastActive.getTime();
//                       }
//                     }
//                   ]}
//                 />
//               </Card>
//             </Col>
//           </Row>
//         </>
//       )
//     },
//     {
//       key: 'events',
//       label: 'Event Log',
//       children: (
//         <>
//           <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
//             <Input.Search
//               placeholder="Search events"
//               onSearch={handleSearch}
//               onChange={(e) => handleSearch(e.target.value)}
//               style={{ width: 300 }}
//               allowClear
//             />
            
//             <Select
//               placeholder="Filter by event type"
//               style={{ width: 200 }}
//               allowClear
//               onChange={(value) => handleSearch(value || '')}
//             >
//               <Option value="Join game">Join game</Option>
//               <Option value="Press Button">Press Button</Option>
//               <Option value="Finish Obby">Finish Obby</Option>
//             </Select>
            
//             <div style={{ marginLeft: 'auto' }}>
//               <Button 
//                 type="primary" 
//                 icon={<ReloadOutlined />} 
//                 loading={loading}
//                 onClick={fetchEvents}
//               >
//                 Refresh
//               </Button>
//             </div>
//           </div>
          
//           {loading ? (
//             <div style={{ textAlign: 'center', padding: 20 }}>
//               <Spin size="large" />
//             </div>
//           ) : (
//             <Table
//               columns={columns}
//               dataSource={filteredEvents}
//               rowKey="id"
//               pagination={{ pageSize: 10 }}
//               scroll={{ x: 'max-content' }}
//               onChange={(pagination, filters, sorter) => {
//                 console.log('Table params:', pagination, filters, sorter);
//               }}
//               expandable={{
//                 expandedRowRender: (record) => {
//                   return (
//                     <div style={{ padding: '8px 0' }}>
//                       <p><strong>Event ID:</strong> {record.id}</p>
//                       {record.data && typeof record.data === 'object' && !Array.isArray(record.data) && Object.keys(record.data).length > 0 && (
//                         <div>
//                           <strong>Event Data:</strong>
//                           <ul style={{ marginBottom: 0 }}>
//                             {Object.entries(record.data).map(([key, value]) => (
//                               <li key={key}>{key}: {value !== null ? String(value) : 'null'}</li>
//                             ))}
//                           </ul>
//                         </div>
//                       )}
//                     </div>
//                   );
//                 }
//               }}
//             />
//           )}
//         </>
//       )
//     }
//   ];

//   // Load fake events data from the uploaded document for testing
//   useEffect(() => {
//     // This will run if the component is mounted but fetchEvents failed
//     if (!window.eventsData && window.document) {
//       try {
//         const content = document.querySelector('pre')?.textContent;
//         if (content) {
//           const eventsData = JSON.parse(content);
//           window.eventsData = eventsData;
//           console.log('Loaded events data from document:', eventsData);
//         }
//       } catch (err) {
//         console.error('Error parsing document content:', err);
//       }
//     }
//   }, []);

//   return (
//     <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
//       <Title level={2}>Game Events Dashboard</Title>
      
//       {error && (
//         <Alert
//           message="Error"
//           description={error}
//           type="error"
//           showIcon
//           style={{ marginBottom: 16 }}
//           closable
//         />
//       )}
      
//       <Tabs 
//         activeKey={activeTab} 
//         onChange={setActiveTab} 
//         items={tabItems}
//         animated
//       />
//     </div>
//   );
// };

// export default SimpleTest2;