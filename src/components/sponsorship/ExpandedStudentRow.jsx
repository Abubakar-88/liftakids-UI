import { Card, Row, Col, Tag, Tooltip } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

const ExpandedStudentRow = ({ record }) => {
  const hasSponsorships = record.sponsored && record.sponsors && record.sponsors.length > 0;

  return (
    <Card title="Student Details" size="small" style={{ margin: '10px 0' }}>
      <Row gutter={16}>
        <Col span={8}>
          <p><strong>Date of Birth:</strong> {moment(record.dob).format('LL')}</p>
          <p><strong>Age:</strong> {moment().diff(moment(record.dob), 'years')} years</p>
          <p><strong>Gender:</strong> {record.gender}</p>
        </Col>
        <Col span={8}>
          <p><strong>Guardian:</strong> {record.guardianName}</p>
          <p><strong>Contact:</strong> {record.contactNumber}</p>
          <p><strong>Address:</strong> {record.address}</p>
        </Col>
        <Col span={8}>
          <p><strong>Institution:</strong> {record.institutionName}</p>
          <p><strong>Financial Rank:</strong> {record.financial_rank}</p>
          <p>
            <strong>Status:</strong> 
            <Tag color={record.sponsored ? "green" : "orange"} style={{ marginLeft: 8 }}>
              {record.sponsored ? "Sponsored" : "Not Sponsored"}
            </Tag>
          </p>
        </Col>
      </Row>

      {/* Financial Information */}
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="Financial Information" size="small">
            <p><strong>Required Monthly Support:</strong> ৳{record.requiredMonthlySupport?.toFixed(2)}</p>
            <p><strong>Current Sponsorship Amount:</strong> ৳{record.sponsoredAmount?.toFixed(2)}</p>
            <p>
              <strong>Fully Sponsored:</strong> 
              <Tag color={record.fullySponsored ? "green" : "red"} style={{ marginLeft: 8 }}>
                {record.fullySponsored ? "Yes" : "No"}
              </Tag>
            </p>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Bio" size="small">
            <p>{record.bio || "No bio available"}</p>
          </Card>
        </Col>
      </Row>

      {/* Sponsorship Details */}
      {hasSponsorships && (
        <Card title="Active Sponsorships" size="small" style={{ marginTop: 16 }}>
          {record.sponsors.map((sponsor, index) => (
            <SponsorshipDetails key={index} sponsor={sponsor} />
          ))}
        </Card>
      )}
    </Card>
  );
};

const SponsorshipDetails = ({ sponsor }) => {
  const isPaidUpToPast = sponsor.paidUpTo && moment(sponsor.paidUpTo).isBefore(moment(), 'day');
  const isPaymentDue = sponsor.paymentDue || isPaidUpToPast;
  const isOverdue = sponsor.overdue || (isPaidUpToPast && moment(sponsor.paidUpTo).isBefore(moment().subtract(1, 'month'), 'day'));

  return (
    <Card size="small" style={{ marginBottom: 8 }}>
      <Row gutter={16}>
        <Col span={12}>
          <p><strong>Sponsor:</strong> {sponsor.donorName}</p>
          <p><strong>Monthly Amount:</strong> ৳{sponsor.monthlyAmount?.toFixed(2)}</p>
          <p><strong>Status:</strong> {sponsor.status}</p>
        </Col>
        <Col span={12}>
          <p><strong>Period:</strong> {moment(sponsor.startDate).format('MMM YYYY')} - {moment(sponsor.endDate).format('MMM YYYY')}</p>
          <p><strong>Total Amount:</strong> ৳{sponsor.totalAmount?.toFixed(2)}</p>
          <p>
            <strong>Paid Up To:</strong> 
            {sponsor.paidUpTo ? (
              <span style={{ color: isPaidUpToPast ? 'red' : 'inherit', marginLeft: 4 }}>
                {moment(sponsor.paidUpTo).format('LL')}
                {isPaidUpToPast && (
                  <Tooltip title="Payment is overdue! Paid up to date is in the past">
                    <ExclamationCircleOutlined style={{ color: 'red', marginLeft: 4 }} />
                  </Tooltip>
                )}
              </span>
            ) : 'N/A'}
          </p>
        </Col>
      </Row>
      
      <Row gutter={16} style={{ marginTop: 8 }}>
        <Col span={24}>
          <p>
            <strong>Payment Status:</strong> 
            {isPaymentDue ? (
              <Tag color="red" style={{ marginLeft: 8 }}>Payment Due</Tag>
            ) : (
              <Tag color="green" style={{ marginLeft: 8 }}>Up to Date</Tag>
            )}
            {isOverdue && <Tag color="red" style={{ marginLeft: 8 }}>Overdue</Tag>}
          </p>
        </Col>
      </Row>
    </Card>
  );
};