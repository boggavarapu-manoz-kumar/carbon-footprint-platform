import React, { useState } from 'react';
import { Form, Input, Button, Select, Upload, message, Typography, Divider, Space, Modal } from 'antd';
import { UploadOutlined, BuildOutlined, GlobalOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { adminAxios as api } from '../../../core/api';

const { Title, Text } = Typography;
const { Option } = Select;

export const CreateOrganizationForm = ({ onSubmit }) => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            // Sanitize logo field because backend expects a String URL, not an AntD Upload object
            const payload = { ...values };
            if (payload.logo && typeof payload.logo === 'object') {
                delete payload.logo;
            }

            const response = await api.post('/super-admin/organizations', payload);
            const data = response.data;
            
            Modal.success({
                title: 'Organization Workspace Created!',
                width: 540,
                content: (
                    <div className="mt-4 text-left space-y-3">
                        <p className="text-gray-600">Organization <strong>{data.name}</strong> (Code: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 font-mono">{data.organizationCode}</code>) was successfully provisioned.</p>
                        <div className="bg-slate-50 p-3 rounded border border-slate-200 text-sm">
                            <div><strong>Admin Email:</strong> {data.adminEmail || payload.adminEmail}</div>
                            {data.tempPassword && (
                                <div className="mt-1"><strong>Temporary Password:</strong> <code className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono font-bold">{data.tempPassword}</code></div>
                            )}
                        </div>
                        {data.inviteLink && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded">
                                <div className="text-xs text-blue-700 font-semibold mb-1">Direct Activation Link:</div>
                                <Input.Search
                                    readOnly
                                    value={data.inviteLink}
                                    enterButton="Copy Link"
                                    onSearch={() => {
                                        navigator.clipboard.writeText(data.inviteLink);
                                        message.success('Activation link copied to clipboard!');
                                    }}
                                />
                            </div>
                        )}
                    </div>
                ),
                onOk() {
                    navigate(`/organizations`);
                    if (onSubmit) onSubmit(data);
                }
            });
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to create organization.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <div className="text-center mb-8">
                <Title level={3}>Create Organization Workspace</Title>
                <Text type="secondary">
                    Set up a dedicated workspace for your company. This will not affect your personal carbon footprint account.
                </Text>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                requiredMark="optional"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                        name="name"
                        label="Company Name"
                        rules={[{ required: true, message: 'Please enter company name' }]}
                    >
                        <Input placeholder="Acme Corp" prefix={<BuildOutlined className="text-gray-400" />} />
                    </Form.Item>

                    <Form.Item
                        name="industry"
                        label="Industry"
                        rules={[{ required: true, message: 'Please select an industry' }]}
                    >
                        <Select placeholder="Select industry">
                            <Option value="Technology">Technology</Option>
                            <Option value="Manufacturing">Manufacturing</Option>
                            <Option value="Finance">Finance</Option>
                            <Option value="Retail">Retail</Option>
                            <Option value="Other">Other</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="companySize"
                        label="Company Size"
                        rules={[{ required: true, message: 'Please select company size' }]}
                    >
                        <Select placeholder="Number of employees">
                            <Option value="1-10">1-10</Option>
                            <Option value="11-50">11-50</Option>
                            <Option value="51-200">51-200</Option>
                            <Option value="201-500">201-500</Option>
                            <Option value="500+">500+</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="country"
                        label="Country"
                        rules={[{ required: true, message: 'Please enter country' }]}
                    >
                        <Input placeholder="United States" prefix={<GlobalOutlined className="text-gray-400" />} />
                    </Form.Item>

                    <Form.Item
                        name="timezone"
                        label="Timezone"
                        rules={[{ required: true, message: 'Please select timezone' }]}
                    >
                        <Select placeholder="Select timezone">
                            <Option value="UTC-8">Pacific Time (PT)</Option>
                            <Option value="UTC-5">Eastern Time (ET)</Option>
                            <Option value="UTC+0">Greenwich Mean Time (GMT)</Option>
                            <Option value="UTC+5.5">India Standard Time (IST)</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="logo"
                        label="Company Logo"
                    >
                        <Upload name="logo" listType="picture" maxCount={1} beforeUpload={() => false}>
                            <Button icon={<UploadOutlined />}>Click to upload</Button>
                        </Upload>
                    </Form.Item>
                </div>

                <Divider orientation="left">Administrator Details</Divider>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                        name="adminName"
                        label="Admin Full Name"
                        rules={[{ required: true, message: 'Please enter the admin name' }]}
                    >
                        <Input placeholder="John Doe" />
                    </Form.Item>

                    <Form.Item
                        name="adminEmail"
                        label="Admin Email"
                        rules={[
                            { required: true, message: 'Please enter the admin email' },
                            { type: 'email', message: 'Please enter a valid email address' }
                        ]}
                    >
                        <Input placeholder="admin@example.com" />
                    </Form.Item>
                </div>

                <Divider />

                <div className="bg-blue-50 p-4 rounded-md mb-6 border border-blue-100">
                    <Text className="text-blue-800 font-medium">Administrator Notice</Text>
                    <p className="text-blue-600 text-sm mt-1 mb-0">
                        By creating this organization, an email invitation will be sent to the assigned Admin. They will need to set their password to activate the account.
                    </p>
                </div>

                <Form.Item className="mb-0 text-right">
                    <Space>
                        <Button onClick={() => form.resetFields()}>Clear</Button>
                        <Button type="primary" htmlType="submit" loading={loading} size="large">
                            Create Organization
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    );
};
