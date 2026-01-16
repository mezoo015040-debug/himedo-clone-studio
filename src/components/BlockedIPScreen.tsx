import { Shield, AlertTriangle } from 'lucide-react';

interface BlockedIPScreenProps {
  reason?: string | null;
}

export const BlockedIPScreen = ({ reason }: BlockedIPScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-10 h-10 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          تم حظر الوصول
        </h1>
        
        <div className="flex items-center justify-center gap-2 text-red-600 mb-4">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">IP محظور</span>
        </div>
        
        <p className="text-gray-600 mb-6">
          عذراً، تم حظر عنوان IP الخاص بك من الوصول إلى هذا الموقع.
        </p>
        
        {reason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700">
              <span className="font-medium">السبب: </span>
              {reason}
            </p>
          </div>
        )}
        
        <p className="text-sm text-gray-500">
          إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع الدعم الفني.
        </p>
      </div>
    </div>
  );
};