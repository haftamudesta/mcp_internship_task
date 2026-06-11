import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export const AdminAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <p className="text-gray-600 mt-1">View sales and inventory analytics</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-12">
            Analytics feature coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
