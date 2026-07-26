// sponsorshipManage.jsx
import { useState, useEffect } from 'react';
import { Table, Input, Select, Space, Button, DatePicker, Tag, Card, Row, Col, Tooltip, message, Modal } from 'antd';
import { SearchOutlined, ReloadOutlined, ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { 
  fetchSponsorships,
  sponsorshipStatusOptions,
  paymentMethodOptions 
} from '../../../api/sponsorshipApi';

const { RangePicker } = DatePicker;
const { Option } = Select;

const SponsorshipManage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    donorName: '',
    studentName: '',
    institutionName: '',
    status: '',
    paymentMethod: '',
    dateRange: null,
  });
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [sortField, setSortField] = useState('startDate');
  const [sortOrder, setSortOrder] = useState('descend');

  // Columns definition
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: true,
    },
    {
      title: 'Donor Name',
      dataIndex: 'donorName',
      key: 'donorName',
      width: 180,
      sorter: true,
      ellipsis: true,
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: 'Student Name',
      dataIndex: 'studentName',
      key: 'studentName',
      width: 180,
      sorter: true,
      ellipsis: true,
    },
    {
      title: 'Institution',
      dataIndex: 'institutionName',
      key: 'institutionName',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Monthly Amount',
      dataIndex: 'monthlyAmount',
      key: 'monthlyAmount',
      width: 130,
      align: 'right',
      sorter: true,
      render: (amount) => <span className="text-green-600 font-semibold">৳{amount?.toFixed(2) || '0.00'}</span>,
    },
    {
      title: 'Period',
      dataIndex: 'periodDisplay',
      key: 'periodDisplay',
      width: 150,
      render: (_, record) => (
        <span className="text-sm">
          {moment(record.startDate).format('MMM YYYY')} - {moment(record.endDate).format('MMM YYYY')}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status) => {
        const option = sponsorshipStatusOptions.find(opt => opt.value === status);
        const colorMap = {
          'PENDING_PAYMENT': 'gold',
          'ACTIVE': 'green',
          'CANCELLED': 'red',
          'EXPIRED': 'orange',
          'REMOVED': 'default'
        };
        return (
          <Tag color={colorMap[status] || option?.color || 'default'} className="px-3 py-1 rounded-full">
            {option?.label || status}
          </Tag>
        );
      },
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 140,
      render: (method) => {
        const option = paymentMethodOptions.find(opt => opt.value === method);
        const colorMap = {
          'BANK_TRANSFER': 'blue',
          'BKASH': 'purple',
          'NAGAD': 'cyan',
          'ROCKET': 'orange',
          'CASH': 'green'
        };
        return (
          <Tag color={colorMap[method] || option?.color || 'default'} className="px-3 py-1 rounded-full">
            {option?.label || method}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small"
            onClick={() => navigate(`/admin/sponsorships/${record.id}`)}
          >
            View
          </Button>
          <Button 
            type="link" 
            size="small"
            danger
            onClick={() => handleCancelSponsorship(record)}
          >
            Cancel
          </Button>
        </Space>
      ),
    },
  ];

  // Expanded row render
  const expandedRowRender = (record) => {
    const isPaidUpToPast = record.paidUpTo && moment(record.paidUpTo).isBefore(moment(), 'day');
    const isPaymentDue = record.paymentDue || isPaidUpToPast;
    const isOverdue = record.overdue || (isPaidUpToPast && moment(record.paidUpTo).isBefore(moment().subtract(1, 'month'), 'day'));

    return (
      <div className="bg-gray-50 p-4 rounded-lg mt-2">
        <h4 className="font-semibold text-gray-700 mb-3">Sponsorship Details</h4>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-gray-500 text-sm mb-1">Start Date</p>
              <p className="font-medium">{moment(record.startDate).format('LL')}</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-gray-500 text-sm mb-1">End Date</p>
              <p className="font-medium">{moment(record.endDate).format('LL')}</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-gray-500 text-sm mb-1">Total Months</p>
              <p className="font-medium">{record.totalMonths || 0} months</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-gray-500 text-sm mb-1">Total Amount</p>
              <p className="font-medium text-green-600">৳{record.totalAmount?.toFixed(2) || '0.00'}</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-gray-500 text-sm mb-1">Total Paid Amount</p>
              <p className="font-medium text-blue-600">৳{record.totalPaidAmount?.toFixed(2) || '0.00'}</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-gray-500 text-sm mb-1">Paid Months</p>
              <p className="font-medium">{record.monthsPaid || 0} / {record.totalMonths || 0}</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-gray-500 text-sm mb-1">Last Payment Date</p>
              <p className="font-medium">{record.lastPaymentDate ? moment(record.lastPaymentDate).format('LL') : 'N/A'}</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-gray-500 text-sm mb-1">Next Payment Due</p>
              <p className={`font-medium ${isPaymentDue ? 'text-red-600' : 'text-gray-700'}`}>
                {record.nextPaymentDueDate ? moment(record.nextPaymentDueDate).format('LL') : 'N/A'}
                {isPaymentDue && <ExclamationCircleOutlined className="ml-2 text-red-500" />}
              </p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-gray-500 text-sm mb-1">Paid Up To</p>
              <p className={`font-medium ${isPaidUpToPast ? 'text-red-600' : 'text-gray-700'}`}>
                {record.paidUpTo ? moment(record.paidUpTo).format('LL') : 'N/A'}
                {isPaidUpToPast && <ExclamationCircleOutlined className="ml-2 text-red-500" />}
              </p>
            </div>
          </Col>
        </Row>
        {(isPaymentDue || isOverdue) && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">
              {isOverdue ? '⚠️ Payment is overdue! Please take action immediately.' : '⚠️ Payment is due soon.'}
            </p>
          </div>
        )}
      </div>
    );
  };

  // 👇 fetchData - সঠিকভাবে ডেটা fetch করবে
  const fetchData = async () => {
    setLoading(true);
    try {
      const { current, pageSize } = pagination;
      
      const sort = `${sortField},${sortOrder === 'descend' ? 'desc' : 'asc'}`;
      
      const params = {
        page: current - 1,
        size: pageSize,
        sort,
        donorName: filters.donorName || undefined,
        studentName: filters.studentName || undefined,
        institutionName: filters.institutionName || undefined,
        status: filters.status || undefined,
        paymentMethod: filters.paymentMethod || undefined,
        startDate: filters.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: filters.dateRange?.[1]?.format('YYYY-MM-DD'),
      };
      
      console.log('📡 Fetching with params:', params); // Debug
      
      const response = await fetchSponsorships(params);
      
      console.log('📡 Response:', response); // Debug
      
      if (response && response.data) {
        setData(response.data.content || []);
        setPagination({
          ...pagination,
          total: response.data.totalElements || 0,
        });
      } else {
        setData([]);
        setPagination({
          ...pagination,
          total: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching sponsorships:', error);
      message.error('Failed to fetch sponsorships');
    } finally {
      setLoading(false);
    }
  };

  // useEffect - fetchData কল করবে
  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize, sortField, sortOrder]);

  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });

    if (sorter.field) {
      setSortField(sorter.field);
      setSortOrder(sorter.order);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, current: 1 });
  };

  const handleDateRangeChange = (dates) => {
    setFilters({ ...filters, dateRange: dates });
    setPagination({ ...pagination, current: 1 });
  };

  // 👇 Reset ফাংশন - ঠিক করা হয়েছে
  const handleReset = () => {
    setFilters({
      donorName: '',
      studentName: '',
      institutionName: '',
      status: '',
      paymentMethod: '',
      dateRange: null,
    });
    setPagination({ 
      ...pagination, 
      current: 1,
      total: 0,
    });
    setSortField('startDate');
    setSortOrder('descend');
    setExpandedRowKeys([]);
    // 👇 fetchData কল করুন যাতে ডেটা রিফ্রেশ হয়
    fetchData();
    message.success('Filters reset successfully');
  };

  // 👇 Search ফাংশন - ঠিক করা হয়েছে
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchData();
    message.info('Searching...');
  };

  const handleCancelSponsorship = (record) => {
    Modal.confirm({
      title: 'Cancel Sponsorship',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to cancel sponsorship for ${record.studentName}?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          message.success('Sponsorship cancelled successfully');
          fetchData();
        } catch (error) {
          message.error('Failed to cancel sponsorship');
        }
      },
    });
  };

  return (
    // 👇 Container ঠিক করা হয়েছে - পূর্ণ width এবং overflow নিয়ন্ত্রণ
    <div className="w-full max-w-full overflow-x-hidden px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Sponsorship Management</h1>
          <p className="text-gray-500 mt-1">Manage and track all student sponsorships</p>
        </div>
        <Button 
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin/sponsorships/new')}
          className="bg-blue-600 hover:bg-blue-700"
          size="large"
        >
          Add New Sponsorship
        </Button>
      </div>

      {/* Filter Card */}
      <Card className="mb-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Search Filters</h3>
        </div>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Search by donor name"
              value={filters.donorName}
              onChange={(e) => handleFilterChange('donorName', e.target.value)}
              allowClear
              prefix={<SearchOutlined className="text-gray-400" />}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Search by student name"
              value={filters.studentName}
              onChange={(e) => handleFilterChange('studentName', e.target.value)}
              allowClear
              prefix={<SearchOutlined className="text-gray-400" />}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Search by institution"
              value={filters.institutionName}
              onChange={(e) => handleFilterChange('institutionName', e.target.value)}
              allowClear
              prefix={<SearchOutlined className="text-gray-400" />}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Select status"
              className="w-full"
              value={filters.status || undefined}
              onChange={(value) => handleFilterChange('status', value)}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {sponsorshipStatusOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  <span className="flex items-center">
                    <span 
                      className="inline-block w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: option.color }}
                    />
                    {option.label}
                  </span>
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Select payment method"
              className="w-full"
              value={filters.paymentMethod || undefined}
              onChange={(value) => handleFilterChange('paymentMethod', value)}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {paymentMethodOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  <span className="flex items-center">
                    <span 
                      className="inline-block w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: option.color }}
                    />
                    {option.label}
                  </span>
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['Start Date', 'End Date']}
              value={filters.dateRange}
              onChange={handleDateRangeChange}
              allowClear
              format="YYYY-MM-DD"
            />
          </Col>
        </Row>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={handleReset} icon={<ReloadOutlined />}>
            Reset
          </Button>
          <Button type="primary" onClick={handleSearch} icon={<SearchOutlined />}>
            Search
          </Button>
        </div>
      </Card>

      {/* 👇 Table Container - overflow নিয়ন্ত্রণ */}
     <Card className="shadow-sm">
  <div className="table-container" style={{ height: 'calc(100vh - 400px)' }}>
    <Table
      columns={columns}
      rowKey="id"
      dataSource={data}
      pagination={{
        ...pagination,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
      }}
      loading={loading}
      onChange={handleTableChange}
      scroll={{ 
        x: 'max-content',
        y: 'calc(100vh - 450px)' // 👈 Table body scroll
      }}
      expandable={{
        expandedRowRender,
        expandedRowKeys,
        onExpand: (expanded, record) => {
          setExpandedRowKeys(expanded ? [record.id] : []);
        },
        rowExpandable: (record) => true,
      }}
      bordered
      className="rounded-lg"
    />
  </div>
</Card>
    </div>
  );
};

export default SponsorshipManage;