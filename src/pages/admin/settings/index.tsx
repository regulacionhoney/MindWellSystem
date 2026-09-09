import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tag } from "@/components/ui/tag";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/format";

export default function AdminSettingsPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-gray-500">You need to be signed in to view this page.</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Account and platform information.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={user.name} src={user.avatar} size="lg" />
              <div>
                <p className="font-semibold text-gray-900">{user.name}</p>
                <div className="mt-1">
                  <Tag>{user.role}</Tag>
                </div>
              </div>
            </div>
            <div>
              <Label>Full name</Label>
              <Input value={user.name} readOnly />
            </div>
            <div>
              <Label>Email address</Label>
              <Input value={user.email} readOnly />
            </div>
            <div>
              <Label>Member since</Label>
              <Input value={formatDate(user.created_at)} readOnly />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3 text-sm text-gray-600">
            <p>
              <span className="font-semibold text-gray-900">MindWell</span> is a mental health counseling
              platform connecting students with professional counselors.
            </p>
            <p>Students can request counseling, book appointments, read wellness resources, and receive notifications.</p>
            <p>Counselors review requests, schedule sessions, record notes, and manage follow-ups.</p>
            <p>Administrators manage users, counselors, wellness resources, and monitor platform activity.</p>
            <p className="text-xs text-gray-400">
              These settings are informational. Account changes are handled through your authentication provider.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}