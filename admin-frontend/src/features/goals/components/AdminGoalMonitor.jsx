import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Typography, Table, Spin, Badge, Button, notification } from 'antd';
import { getGoalMetrics, getAllGoals } from '../services/AdminGoalService';
import { AdminGoalDetails } from './AdminGoalDetails';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ClockCircleOutlined,
  CalendarOutlined,
  WarningOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const AdminGoalMonitor = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ['adminGoalMetrics'],
    queryFn: getGoalMetrics,
    refetchInterval: 30000 // Refresh every 30s
  });

  const { data: goalsPage, isLoading: loadingGoals } = useQuery({
    queryKey: ['adminGoals', currentPage],
    queryFn: () => getAllGoals(currentPage, 10),
    keepPreviousData: true,
  });

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'User ID',
      dataIndex: ['user', 'id'],
      key: 'userId',
      width: 100,
    },
    {
      title: 'Goal Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = status === 'COMPLETED' ? 'success' : 
                      status === 'FAILED' ? 'error' : 'processing';
        return <Badge status={color} text={status} />;
      },
    },
    {
      title: 'Progress',
      dataIndex: 'progressPercent',
      key: 'progressPercent',
      render: (percent) => `${percent || 0}%`,
    },
    {
      title: 'Target Date',
      dataIndex: 'targetDate',
      key: 'targetDate',
      render: (date) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => setSelectedGoal(record)}>
          View Details & Timeline
        </Button>
      ),
    },
  ];

  const MetricCard = ({ title, value, icon, color }) => (
    <Card bordered={false} className="shadow-sm" bodyStyle={{ padding: '20px' }}>
      <div className="flex items-center">
        <div className={`p-3 rounded-full mr-4 ${color}`}>
          {icon}
        </div>
        <div>
          <Text type="secondary" className="block text-xs uppercase font-semibold mb-1">{title}</Text>
          <Title level={3} className="m-0 leading-none">{value !== undefined ? value : <Spin size="small" />}</Title>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-6">
      <Title level={2} className="mb-6">Goal Monitoring</Title>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <MetricCard 
          title="Created Today" 
          value={metrics?.createdToday} 
          icon={<CalendarOutlined className="text-xl text-blue-600" />} 
          color="bg-blue-50" 
        />
        <MetricCard 
          title="Completed" 
          value={metrics?.completed} 
          icon={<CheckCircleOutlined className="text-xl text-green-600" />} 
          color="bg-green-50" 
        />
        <MetricCard 
          title="Failed" 
          value={metrics?.failed} 
          icon={<CloseCircleOutlined className="text-xl text-red-600" />} 
          color="bg-red-50" 
        />
        <MetricCard 
          title="Near Deadline" 
          value={metrics?.nearDeadline} 
          icon={<ClockCircleOutlined className="text-xl text-amber-600" />} 
          color="bg-amber-50" 
        />
        <MetricCard 
          title="Overdue" 
          value={metrics?.overdue} 
          icon={<WarningOutlined className="text-xl text-orange-600" />} 
          color="bg-orange-50" 
        />
      </div>

      <Card title="All Goals" className="shadow-sm" bordered={false}>
        <Table 
          dataSource={goalsPage?.content}
          columns={columns}
          rowKey="id"
          loading={loadingGoals}
          pagination={{
            current: currentPage + 1,
            pageSize: 10,
            total: goalsPage?.totalElements,
            onChange: (page) => setCurrentPage(page - 1)
          }}
        />
      </Card>

      <AdminGoalDetails 
        goal={selectedGoal} 
        visible={!!selectedGoal} 
        onClose={() => setSelectedGoal(null)} 
      />
    </div>
  );
};
