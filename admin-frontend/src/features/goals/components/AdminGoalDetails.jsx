import React from 'react';
import { Drawer, Timeline, Typography, Tag, Button, Spin, notification } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGoalTimeline, retryFailedEmail } from '../services/AdminGoalService';
import { 
  MailOutlined, 
  BellOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

export const AdminGoalDetails = ({ goal, visible, onClose }) => {
  const queryClient = useQueryClient();

  const { data: timeline, isLoading, refetch } = useQuery({
    queryKey: ['goalTimeline', goal?.id],
    queryFn: () => getGoalTimeline(goal.id),
    enabled: !!goal?.id,
  });

  const retryMutation = useMutation({
    mutationFn: retryFailedEmail,
    onSuccess: (data) => {
      notification.success({ message: 'Success', description: data.message });
      refetch();
    },
    onError: (error) => {
      notification.error({ message: 'Retry Failed', description: error.response?.data?.message || error.message });
    }
  });

  if (!goal) return null;

  return (
    <Drawer
      title={`Goal Details: ${goal.name}`}
      placement="right"
      width={600}
      onClose={onClose}
      open={visible}
    >
      <div className="mb-6">
        <Title level={5}>Goal Information</Title>
        <p><strong>Status:</strong> <Tag color={goal.status === 'FAILED' ? 'error' : 'processing'}>{goal.status}</Tag></p>
        <p><strong>Progress:</strong> {goal.progressPercent || 0}%</p>
        <p><strong>Created At:</strong> {dayjs(goal.createdAt).format('MMM D, YYYY h:mm A')}</p>
        <p><strong>Target Date:</strong> {dayjs(goal.targetDate).format('MMM D, YYYY')}</p>
      </div>

      <Title level={5} className="mb-4">Communication Timeline</Title>
      
      {isLoading ? (
        <div className="text-center p-8"><Spin /></div>
      ) : timeline?.length === 0 ? (
        <Text type="secondary">No notifications or emails sent for this goal yet.</Text>
      ) : (
        <Timeline mode="left">
          {timeline.map((event) => (
            <Timeline.Item 
              key={`${event.type}-${event.id}`}
              color={event.status === 'FAILED' ? 'red' : event.status === 'UNREAD' ? 'blue' : 'green'}
              dot={event.type === 'EMAIL' ? <MailOutlined /> : <BellOutlined />}
            >
              <div className="mb-1 flex justify-between items-start">
                <strong>{event.type === 'EMAIL' ? 'Email Sent' : 'In-App Notification'}</strong>
                <Text type="secondary" className="text-xs">{dayjs(event.timestamp).format('MMM D, YYYY h:mm A')}</Text>
              </div>
              <p className="mb-1 font-medium">{event.title}</p>
              <p className="text-sm text-gray-500 mb-2">{event.description}</p>
              
              <div className="flex items-center justify-between">
                <div>
                  <Tag color={
                    event.status === 'FAILED' ? 'error' : 
                    event.status === 'SENT' || event.status === 'READ' ? 'success' : 
                    event.status === 'QUEUED' ? 'processing' : 'default'
                  }>
                    {event.status}
                  </Tag>
                  {event.type === 'EMAIL' && (
                    <>
                      {event.opened && <Tag color="cyan">Opened</Tag>}
                      {event.clicked && <Tag color="purple">Clicked</Tag>}
                      {event.retryCount > 0 && <Tag color="warning">Retries: {event.retryCount}</Tag>}
                    </>
                  )}
                </div>
                
                {event.type === 'EMAIL' && (event.status === 'FAILED' || event.status === 'RETRIED') && (
                  <Button 
                    type="primary" 
                    danger 
                    size="small" 
                    icon={<ReloadOutlined />}
                    loading={retryMutation.isLoading}
                    onClick={() => retryMutation.mutate(event.id)}
                  >
                    Retry Email
                  </Button>
                )}
              </div>
              
              {event.errorMessage && (
                <div className="mt-2 p-2 bg-red-50 text-red-600 text-xs rounded border border-red-100 font-mono">
                  {event.errorMessage}
                </div>
              )}
            </Timeline.Item>
          ))}
        </Timeline>
      )}
    </Drawer>
  );
};
