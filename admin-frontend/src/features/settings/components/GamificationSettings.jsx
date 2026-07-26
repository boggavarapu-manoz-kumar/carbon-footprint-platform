import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export const GamificationSettings = ({ onChange }) => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/admin/gamification-settings', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSettings(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => prev.map(s => s.settingKey === key ? { ...s, settingValue: value } : s));
    if (onChange) onChange();
  };

  const handleSaveLocal = () => {
    fetch('/api/v1/admin/gamification-settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      },
      body: JSON.stringify(settings)
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Settings saved successfully.");
      } else {
        alert("Failed to save settings.");
      }
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Gamification Points & Levels</h2>
          <p className="text-sm text-gray-500">Configure points rewarded for actions and level thresholds.</p>
        </div>
        <Button onClick={handleSaveLocal}>Save Gamification Settings</Button>
      </div>

      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {settings.map(setting => (
              <div key={setting.settingKey}>
                <Input
                  label={setting.settingKey.replace(/_/g, ' ')}
                  type="number"
                  value={setting.settingValue}
                  onChange={(e) => handleChange(setting.settingKey, e.target.value)}
                  helpText={`Current value: ${setting.settingValue}`}
                />
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
