import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Users,
  Activity
} from 'lucide-react';
import { FileService } from '../../services/fileService';
import { Statistics } from '../../types';

const StatisticsView: React.FC = () => {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await FileService.getStatistics();
      setStats(data);
    } catch (err: any) {
      console.error('Error loading statistics:', err);
      setError(err.message || 'فشل في تحميل الإحصائيات');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="mr-2">جاري تحميل الإحصائيات...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg inline-block">
          {error}
        </div>
        <button
          onClick={loadStatistics}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p>لا توجد إحصائيات متاحة</p>
      </div>
    );
  }

  const statusCards = [
    {
      title: 'إجمالي الملفات',
      value: stats.total_files,
      icon: FileText,
      bgColor: '#076653',
      textColor: '#FFFFFF'
    },
    {
      title: 'في الانتظار',
      value: stats.pending_files,
      icon: Clock,
      bgColor: '#1E40AF',
      textColor: '#FFFFFF'
    },
    {
      title: 'مقبولة',
      value: stats.approved_files,
      icon: CheckCircle,
      bgColor: '#059669',
      textColor: '#FFFFFF'
    },
    {
      title: 'مرفوضة',
      value: stats.rejected_files,
      icon: XCircle,
      bgColor: '#DC2626',
      textColor: '#FFFFFF'
    },
    {
      title: 'محفوظة',
      value: stats.on_hold_files,
      icon: AlertCircle,
      bgColor: '#D97706',
      textColor: '#FFFFFF'
    }
  ];

  const periodCards = [
    {
      title: 'هذا الشهر',
      value: stats.files_this_month,
      icon: Calendar,
      bgColor: '#7C3AED',
      textColor: '#FFFFFF'
    },
    {
      title: 'هذا العام',
      value: stats.files_this_year,
      icon: TrendingUp,
      bgColor: '#0891B2',
      textColor: '#FFFFFF'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">الإحصائيات والتقارير</h1>
          <p className="mt-2 text-gray-600">عرض شامل لإحصائيات النظام</p>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 size={24} className="text-gray-700" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="month">هذا الشهر</option>
            <option value="year">هذا العام</option>
            <option value="all">جميع الفترات</option>
          </select>
        </div>
      </div>

      {/* Status Statistics */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800">إحصائيات الحالات</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statusCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform"
                style={{
                  backgroundColor: card.bgColor,
                  color: card.textColor
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-90">{card.title}</p>
                    <p className="text-3xl font-bold">{card.value}</p>
                  </div>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <Icon size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Period Statistics */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800">إحصائيات الفترات</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {periodCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform"
                style={{
                  backgroundColor: card.bgColor,
                  color: card.textColor
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-90">{card.title}</p>
                    <p className="text-3xl font-bold">{card.value}</p>
                  </div>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <Icon size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="p-6 rounded-lg shadow-lg border border-gray-200 bg-white">
          <h3 className="text-lg font-bold mb-4 text-gray-800">توزيع الحالات</h3>
          <div className="space-y-3">
            {statusCards.slice(1).map((card, index) => {
              const percentage = stats.total_files > 0 ? (card.value / stats.total_files * 100).toFixed(1) : 0;
              return (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-700">{card.title}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: card.bgColor
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Summary */}
        <div className="p-6 rounded-lg shadow-lg border border-gray-200 bg-white">
          <h3 className="text-lg font-bold mb-4 text-gray-800">ملخص النشاط</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2">
                <Activity size={20} className="text-gray-600" />
                <span className="text-gray-700">معدل الموافقة</span>
              </div>
              <span className="font-bold text-gray-800">
                {stats.total_files > 0 ? ((stats.approved_files / stats.total_files) * 100).toFixed(1) : 0}%
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2">
                <Users size={20} className="text-gray-600" />
                <span className="text-gray-700">الملفات المعلقة</span>
              </div>
              <span className="font-bold text-gray-800">
                {stats.pending_files + stats.on_hold_files}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2">
                <TrendingUp size={20} className="text-gray-600" />
                <span className="text-gray-700">النمو الشهري</span>
              </div>
              <span className="font-bold text-gray-800">
                +{stats.files_this_month}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsView;