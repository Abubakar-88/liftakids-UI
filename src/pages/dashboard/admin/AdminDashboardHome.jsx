// AdminDashboardHome.jsx
import { Card, Row, Col, Statistic, Spin } from 'antd';
import { 
  UserOutlined, BankOutlined, TeamOutlined, 
  HeartOutlined, DollarOutlined, WalletOutlined 
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { getDashboardStats } from '../../../api/adminApi';

const AdminDashboardHome = () => {
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalInstitutions: 0,
    totalStudents: 0,
    activeSponsorships: 0,
    totalSponsorships: 0,
    totalPayments: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      console.log('📡 Fetching dashboard stats...');
      const data = await getDashboardStats();
      console.log('✅ Stats data:', data);
      
      setStats({
        totalDonors: data?.totalDonors || 0,
        totalInstitutions: data?.totalInstitutions || 0,
        totalStudents: data?.totalStudents || 0,
        activeSponsorships: data?.activeSponsorships || 0,
        totalSponsorships: data?.totalSponsorships || 0,
        totalPayments: data?.totalPayments || 0,
        totalRevenue: data?.totalRevenue || 0
      });
    } catch (error) {
      console.error('❌ Failed to fetch stats:', error);
      // Keep default values
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Welcome to Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your platform</p>
      </div>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic 
              title="Total Donors" 
              value={stats.totalDonors} 
              prefix={<UserOutlined className="text-blue-500" />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic 
              title="Total Institutions" 
              value={stats.totalInstitutions} 
              prefix={<BankOutlined className="text-green-500" />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic 
              title="Total Students" 
              value={stats.totalStudents} 
              prefix={<TeamOutlined className="text-purple-500" />}
              valueStyle={{ color: '#8b5cf6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic 
              title="Active Sponsorships" 
              value={stats.activeSponsorships} 
              prefix={<HeartOutlined className="text-red-500" />}
              valueStyle={{ color: '#ef4444' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic 
              title="Total Sponsorships" 
              value={stats.totalSponsorships} 
              prefix={<HeartOutlined className="text-pink-500" />}
              valueStyle={{ color: '#ec4899' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic 
              title="Total Payments" 
              value={stats.totalPayments} 
              prefix={<WalletOutlined className="text-orange-500" />}
              valueStyle={{ color: '#f97316' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic 
              title="Total Revenue" 
              value={stats.totalRevenue} 
              prefix={<DollarOutlined className="text-green-500" />}
              valueStyle={{ color: '#22c55e' }}
              precision={2}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboardHome;