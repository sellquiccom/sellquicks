import { FileText } from 'lucide-react';

export default function OrdersPage() {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
      <div className="flex flex-col items-center gap-1 text-center">
        <FileText className="h-10 w-10 text-muted-foreground" />
        <h3 className="text-2xl font-bold tracking-tight">
          You have no orders yet
        </h3>
        <p className="text-sm text-muted-foreground">
          New orders will appear here.
        </p>
      </div>
    </div>
  );
}
