import { useState, useEffect } from 'react';
import { Table, Input, Select, Space, Button, DatePicker, Tag, Card, Row, Col,Tooltip  } from 'antd';
import { SearchOutlined, ReloadOutlined,ExclamationCircleOutlined  } from '@ant-design/icons';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import AdminDashboard from './AdminDashboard';
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
  const [sort, setSort] = useState('startDate,desc');

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: true,
    },
    {
      title: 'Donor',
      dataIndex: 'donorName',
      key: 'donorName',
      sorter: true,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Student',
      dataIndex: 'studentName',
      key: 'studentName',
      sorter: true,
    },
    {
      title: 'Institution',
      dataIndex: 'institutionName',
      key: 'institutionName',
    },
    {
      title: 'Monthly Amount',
      dataIndex: 'monthlyAmount',
      key: 'monthlyAmount',
      render: (amount) => `৳${amount?.toFixed(2) || '0.00'}`,
      align: 'right',
      sorter: true,
    },
    {
      title: 'Period',
      dataIndex: 'message',
      key: 'period',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const option = sponsorshipStatusOptions.find(opt => opt.value === status);
        return (
          <Tag color={option?.color || 'default'} className="flex items-center py-0.5 px-2 rounded-md">
            {option?.label || status}
          </Tag>
        );
      },
      filters: sponsorshipStatusOptions.map(opt => ({
        text: (
          <span className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: opt.color }} />
            {opt.label}
          </span>
        ),
        value: opt.value,
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => {
        const option = paymentMethodOptions.find(opt => opt.value === method);
        return (
          <Tag color={option?.color || 'default'} className="flex items-center py-0.5 px-2 rounded-md">
            {option?.label || method}
          </Tag>
        );
      },
      filters: paymentMethodOptions.map(opt => ({
        text: (
          <span className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: opt.color }} />
            {opt.label}
          </span>
        ),
        value: opt.value,
      })),
      onFilter: (value, record) => record.paymentMethod === value,
    },
  ];

  const handleClick = () => {
    navigate('/admin/sponsorships/new');
  };
const expandedRowRender = (record) => {
  const isPaidUpToPast = record.paidUpTo && moment(record.paidUpTo).isBefore(moment(), 'day');
  const isPaymentDue = record.paymentDue || isPaidUpToPast;
  const isOverdue = record.overdue || (isPaidUpToPast && moment(record.paidUpTo).isBefore(moment().subtract(1, 'month'), 'day'));

  return (
    <Card title="Sponsorship Details" size="small">
      <Row gutter={16}>
        <Col span={8}>
          <p><strong>Start Date:</strong> {moment(record.startDate).format('LL')}</p>
          <p><strong>End Date:</strong> {moment(record.endDate).format('LL')}</p>
          <p><strong>Total Months:</strong> {record.totalMonths}</p>
        </Col>
        <Col span={8}>
          <p><strong>Last Paid Amount:</strong> ৳{record.totalAmount?.toFixed(2) || '0.00'}</p>
          <p><strong>Total Paid Amount:</strong> ৳{record.totalPaidAmount?.toFixed(2) || '0.00'}</p>
          <p><strong>Total Payments:</strong> {record.totalPayments || 0}</p>
          <p><strong>Total Paid Months:</strong> {record.monthsPaid || 0}</p> 
        </Col>
        <Col span={8}>
          <p><strong>Last Payment Date:</strong> {record.lastPaymentDate ? moment(record.lastPaymentDate).format('LL') : 'N/A'}</p>
          <p>
            <strong>Next Payment Due: </strong> 
            {record.nextPaymentDueDate ? (
              <span style={{ color: isPaymentDue ? 'red' : 'inherit' }}>
                {moment(record.nextPaymentDueDate).format('LL')}
                {isPaymentDue && (
                  <Tooltip title="Payment is due">
                    <ExclamationCircleOutlined style={{ color: 'red', marginLeft: 8 }} />
                  </Tooltip>
                )}
              </span>
            ) : 'N/A'}
          </p>
          <p>
            <strong>Paid Up To: </strong> 
            {record.paidUpTo ? (
              <span style={{ color: isPaidUpToPast ? 'red' : 'inherit' }}>
                {moment(record.paidUpTo).format('LL')}
                {isPaidUpToPast && (
                  <Tooltip title="Payment is overdue! Paid up to date is in the past">
                    <ExclamationCircleOutlined style={{ color: 'red', marginLeft: 8 }} />
                  </Tooltip>
                )}
              </span>
            ) : 'N/A'}
          </p>
        </Col>
      </Row>
      <Row gutter={16} className="mt-2">
        <Col span={24}>
          <p>
            <strong>Payment Status:</strong> 
            {isPaymentDue ? (
              <Tag color="red" className="ml-2">Payment Due</Tag>
            ) : (
              <Tag color="green" className="ml-2">Up to Date</Tag>
            )}
            {isOverdue && <Tag color="red" className="ml-2">Overdue</Tag>}
          </p>
        </Col>
      </Row>
    </Card>
  );
};

  const fetchData = async () => {
    setLoading(true);
    try {
      const { current, pageSize } = pagination;
      const params = {
        page: current - 1,
        size: pageSize,
        sort,
        ...filters,
        startDate: filters.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: filters.dateRange?.[1]?.format('YYYY-MM-DD'),
      };
const { dateRange, ...restParams } = params;
    const response = await fetchSponsorships(restParams);
      setData(response.data.content);
      setPagination({
        ...pagination,
        total: response.data.totalElements,
      });
    } catch (error) {
      console.error('Error fetching sponsorships:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize, sort, filters]);

  const handleTableChange = (newPagination, _, sorter) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });

    if (sorter.field) {
      const direction = sorter.order === 'descend' ? 'desc' : 'asc';
      setSort(`${sorter.field},${direction}`);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleDateRangeChange = (dates) => {
    setFilters({ ...filters, dateRange: dates });
  };

  const handleReset = () => {
    setFilters({
      donorName: '',
      studentName: '',
      institutionName: '',
      status: '',
      paymentMethod: '',
      dateRange: null,
    });
    setPagination({ ...pagination, current: 1 });
  };

  const handleExpand = (expanded, record) => {
    setExpandedRowKeys(expanded ? [record.id] : []);
  };

  return (
    <AdminDashboard>
      <div className="sponsorship-management p-4">
        <h1 className="text-2xl font-bold my-8">Sponsorship Management</h1>
        
        <div className="flex justify-end">
          <button
            onClick={handleClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
          >
            <FaPlus className="mr-2" /> Add Student Sponsor
          </button>
        </div>

        <Card 
          title="Sponsorship Search" 
          className="mb-4"
          extra={
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={fetchData}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Search
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                Reset
              </Button>
            </Space>
          }
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8} lg={6} className="mb-3">
              <Input
                placeholder="Search by donor name"
                value={filters.donorName}
                onChange={(e) => handleFilterChange('donorName', e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} className="mb-3">
              <Input
                placeholder="Search by student name"
                value={filters.studentName}
                onChange={(e) => handleFilterChange('studentName', e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} className="mb-3">
              <Input
                placeholder="Search by institution"
                value={filters.institutionName}
                onChange={(e) => handleFilterChange('institutionName', e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} className="mb-3">
              <Select
                placeholder="Select status"
                className="w-full"
                popupClassName="status-filter-dropdown"
                value={filters.status}
                onChange={(value) => handleFilterChange('status', value)}
                allowClear
                optionLabelProp="label"
              >
                {sponsorshipStatusOptions.map(option => (
                  <Option 
                    key={option.value} 
                    value={option.value}
                    label={
                      <span className="flex items-center">
                        <span 
                          className="inline-block w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: option.color }}
                        />
                        {option.label}
                      </span>
                    }
                  >
                    <div className="flex items-center">
                      <span 
                        className="inline-block w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: option.color }}
                      />
                      {option.label}
                    </div>
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} className="mb-3">
              <Select
                placeholder="Select payment method"
                className="w-full"
                popupClassName="payment-method-dropdown"
                value={filters.paymentMethod}
                onChange={(value) => handleFilterChange('paymentMethod', value)}
                allowClear
                optionLabelProp="label"
              >
                {paymentMethodOptions.map(option => (
                  <Option 
                    key={option.value} 
                    value={option.value}
                    label={
                      <span className="flex items-center">
                        <span 
                          className="inline-block w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: option.color }}
                        />
                        {option.label}
                      </span>
                    }
                  >
                    <div className="flex items-center">
                      <span 
                        className="inline-block w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: option.color }}
                      />
                      {option.label}
                    </div>
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} className="mb-3">
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['Start Date', 'End Date']}
                value={filters.dateRange}
                onChange={handleDateRangeChange}
                allowClear
              />
            </Col>
          </Row>
        </Card>

        <Table
          columns={columns}
          rowKey="id"
          dataSource={data}
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: true }}
          expandable={{
            expandedRowRender,
            expandedRowKeys,
            onExpand: handleExpand,
          }}
          bordered
        />
      </div>
    </AdminDashboard>
  );
};

export default SponsorshipManage;