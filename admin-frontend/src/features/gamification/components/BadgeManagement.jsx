import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Form, Input, Select, InputNumber, Tag, Space, message, Popconfirm, Card, Typography, Upload } from 'antd';
import { Plus, Edit, Trash2, Award, Upload as UploadIcon } from 'lucide-react';
import ImgCrop from 'antd-img-crop';
import { badgeService } from '../api/badgeService';

const { Title } = Typography;
const { Option } = Select;

const RULE_TYPES = [
  'STREAK',
  'ACTIVITY_COUNT',
  'GOAL_CREATED',
  'GOAL_COMPLETED',
  'CARBON_REDUCED',
  'RECOMMENDATION_FOLLOWED',
  'LEADERBOARD_RANK'
];

export const BadgeManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const imageUrlValue = Form.useWatch('imageUrl', form);
  const [uploading, setUploading] = useState(false);

  const { data: badges, isLoading } = useQuery({
    queryKey: ['adminBadges'],
    queryFn: badgeService.getAllBadges
  });

  const createMutation = useMutation({
    mutationFn: badgeService.createBadge,
    onSuccess: () => {
      message.success('Badge created successfully');
      queryClient.invalidateQueries(['adminBadges']);
      handleCloseModal();
    },
    onError: () => message.error('Failed to create badge')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => badgeService.updateBadge(id, data),
    onSuccess: () => {
      message.success('Badge updated successfully');
      queryClient.invalidateQueries(['adminBadges']);
      handleCloseModal();
    },
    onError: () => message.error('Failed to update badge')
  });

  const deleteMutation = useMutation({
    mutationFn: badgeService.deleteBadge,
    onSuccess: () => {
      message.success('Badge deleted successfully');
      queryClient.invalidateQueries(['adminBadges']);
    },
    onError: () => message.error('Failed to delete badge')
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => badgeService.updateBadgeStatus(id, status),
    onSuccess: () => {
      message.success('Badge status updated');
      queryClient.invalidateQueries(['adminBadges']);
    },
    onError: () => message.error('Failed to update status')
  });

  const handleOpenModal = (badge = null) => {
    setEditingBadge(badge);
    if (badge) {
      form.setFieldsValue(badge);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingBadge(null);
    form.resetFields();
  };

  const handleSubmit = (values) => {
    const payload = {
      ...values,
      criteria: values.criteria || '{}'
    };

    if (editingBadge) {
      updateMutation.mutate({ id: editingBadge.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleCustomRequest = async ({ file, onSuccess, onError }) => {
    try {
      setUploading(true);
      const url = await badgeService.uploadBadgeImage(file);
      form.setFieldsValue({ imageUrl: url });
      onSuccess("ok");
      message.success("Image uploaded successfully");
    } catch (error) {
      onError(error);
      message.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const toggleStatus = (record) => {
    const newStatus = record.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    statusMutation.mutate({ id: record.id, status: newStatus });
  };

  const columns = [
    {
      title: 'Badge',
      key: 'badge',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          {record.imageUrl ? (
            <img src={record.imageUrl} alt={record.name} className="w-10 h-10 object-contain rounded-md bg-gray-50" />
          ) : (
            <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center">
              <Award className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <div>
            <div className="font-semibold text-gray-900">{record.name}</div>
            <div className="text-xs text-gray-500 max-w-[200px] truncate">{record.description}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Rule / Target',
      key: 'rule',
      render: (_, record) => (
        <div>
          <Tag color="blue">{record.ruleType}</Tag>
          {record.ruleTarget > 0 && <span className="text-gray-500 ml-2">Target: {record.ruleTarget}</span>}
        </div>
      )
    },
    {
      title: 'Points',
      dataIndex: 'points',
      key: 'points',
      render: (val) => <span className="font-medium text-amber-600">+{val || 0} XP</span>
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.status === 'ACTIVE' ? 'success' : 'error'} className="cursor-pointer" onClick={() => toggleStatus(record)}>
          {record.status || 'UNKNOWN'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<Edit className="w-4 h-4" />} onClick={() => handleOpenModal(record)} />
          <Popconfirm
            title="Delete this badge?"
            description="Are you sure you want to permanently delete this badge?"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<Trash2 className="w-4 h-4" />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} style={{ margin: 0 }}>Gamification Badges</Title>
          <p className="text-gray-500 mt-1">Manage badges, achievements, and scoring rules</p>
        </div>
        <Button 
          type="primary" 
          icon={<Plus className="w-4 h-4" />} 
          size="large"
          className="bg-primary-600"
          onClick={() => handleOpenModal()}
        >
          Create Badge
        </Button>
      </div>

      <Card className="shadow-sm border-gray-200">
        <Table 
          columns={columns} 
          dataSource={badges} 
          rowKey="id" 
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingBadge ? "Edit Badge" : "Create New Badge"}
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="name" label="Badge Name" rules={[{ required: true }]}>
              <Input placeholder="e.g. Tree Hugger" />
            </Form.Item>
            <Form.Item name="ruleType" label="Rule Type" rules={[{ required: true }]}>
              <Select placeholder="Select a rule type">
                {RULE_TYPES.map(type => <Option key={type} value={type}>{type}</Option>)}
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="Describe how to earn this badge..." />
          </Form.Item>

          <div className="grid grid-cols-3 gap-4">
            <Form.Item name="ruleTarget" label="Target Value">
              <InputNumber className="w-full" min={0} placeholder="e.g. 50" />
            </Form.Item>
            <Form.Item name="points" label="Points/XP Reward">
              <InputNumber className="w-full" min={0} placeholder="e.g. 100" />
            </Form.Item>
            <Form.Item name="category" label="Category">
              <Input placeholder="e.g. TRANSPORT" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="imageUrl" label="Badge Image">
              <ImgCrop rotationSlider cropShape="round" quality={0.6}>
                <Upload
                  customRequest={handleCustomRequest}
                  listType="picture-card"
                  maxCount={1}
                  showUploadList={false}
                >
                  {imageUrlValue ? (
                    <img src={imageUrlValue} alt="badge" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <UploadIcon className="w-5 h-5 text-gray-400 mb-2" />
                      <div className="text-xs text-gray-500">{uploading ? 'Uploading...' : 'Upload'}</div>
                    </div>
                  )}
                </Upload>
              </ImgCrop>
            </Form.Item>
            <Form.Item name="icon" label="Lucide Icon (Fallback)">
              <Input placeholder="e.g. TreePine" />
            </Form.Item>
          </div>

          <Form.Item name="criteria" label="Criteria JSON (Optional)">
            <Input.TextArea rows={2} placeholder='{"category": "TRANSPORT"}' />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={createMutation.isPending || updateMutation.isPending}
              className="bg-primary-600"
            >
              {editingBadge ? 'Update Badge' : 'Create Badge'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
