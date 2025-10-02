
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function SuperAdminSettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Settings</CardTitle>
        <CardDescription>
          Manage global settings for the entire platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-20">
          <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-2xl font-bold tracking-tight">
              Settings Coming Soon
            </h3>
            <p className="text-sm text-muted-foreground">
              This section is under construction.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

    